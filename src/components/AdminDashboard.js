import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminDashboard = () => {
  const [dustbins, setDustbins] = useState([]);
  const [tickets, setTickets] = useState([]); 
  const [activeTab, setActiveTab] = useState('maintenance'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [kpiFilter, setKpiFilter] = useState('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setIsSyncing(true);
    
    // 1. Fetch telemetry data INDEPENDENTLY
    try {
      const binRes = await axios.get('https://YOUR-BACKEND-NAME.onrender.com/api/dustbins');
      setDustbins(binRes.data);
    } catch (error) {
      console.error("Error fetching telemetry:", error);
    }

    // 2. Fetch live ticket data INDEPENDENTLY
    try {
      const ticketRes = await axios.get('https://YOUR-BACKEND-NAME.onrender.com/api/tickets/admin-dashboard/get-all');
      setTickets(ticketRes.data);
    } catch (error) {
      console.error("Error fetching admin tickets:", error);
    }
    
    setTimeout(() => setIsSyncing(false), 500);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // --- Admin Ticket Action Handler ---
  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      await axios.put(`https://YOUR-BACKEND-NAME.onrender.com/api/tickets/${ticketId}/status`, { status: newStatus });
      fetchData(); // Refresh the list instantly to show the new status
    } catch (error) {
      console.error("Error updating ticket status", error);
      alert("Failed to update ticket status.");
    }
  };

  // --- KPI Calculations ---
  const totalBins = dustbins.length;
  const criticalBins = dustbins.filter(b => b.fillLevel > 80).length;
  const offlineBins = dustbins.filter(b => b.status !== 'online').length;
  const avgFill = totalBins ? Math.round(dustbins.reduce((acc, curr) => acc + curr.fillLevel, 0) / totalBins) : 0;

  // --- Multi-Layer Filtering ---
  const filteredBins = dustbins.filter(bin => {
    const matchesSearch = bin.binId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (bin.address && bin.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || bin.status === filterStatus;
    let matchesKpi = true;
    if (kpiFilter === 'critical') matchesKpi = bin.fillLevel > 80;
    if (kpiFilter === 'offline') matchesKpi = bin.status !== 'online';
    if (kpiFilter === 'aboveAvg') matchesKpi = bin.fillLevel >= avgFill;
    return matchesSearch && matchesStatus && matchesKpi;
  });

  const handleKpiClick = (type) => {
    setKpiFilter(kpiFilter === type ? 'all' : type);
    setFilterStatus('all');
  };

  // --- PDF/CSV Generators ---
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Environmental Compliance & Hardware Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    const tableData = filteredBins.map(bin => [bin.binId, bin.address || 'Unassigned', `${bin.fillLevel || 0}%`, bin.status.toUpperCase(), bin.updatedAt ? new Date(bin.updatedAt).toLocaleString() : 'N/A']);
    doc.autoTable({ startY: 30, head: [['Hardware ID', 'Zone', 'Fill Level', 'Status', 'Last Sync']], body: tableData, theme: 'grid', headStyles: { fillColor: [15, 23, 42] } });
    doc.save(`IoT_Report_${new Date().getTime()}.pdf`);
  };

  const generateCSV = () => {
    const headers = "Hardware ID,Zone,Fill Level (%),Status,Last Sync\n";
    const rows = filteredBins.map(b => `${b.binId},${b.address || 'Unassigned'},${b.fillLevel || 0},${b.status},${b.updatedAt || 'N/A'}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Telemetry_Export_${new Date().getTime()}.csv`;
    link.click();
  };

  const trendData = [ { time: '00:00', fill: 15 }, { time: '04:00', fill: 20 }, { time: '08:00', fill: 45 }, { time: '12:00', fill: 60 }, { time: '16:00', fill: 85 }, { time: '20:00', fill: 40 }, { time: '24:00', fill: 25 } ];
  const criticalLocations = dustbins.filter(b => b.fillLevel > 80 && b.location).map(b => [b.location.lat, b.location.lng]);
  const optimizedRoute = criticalLocations.length > 0 ? [[22.5726, 88.3639], ...criticalLocations] : [];

  // --- View 1: Real-Time Telemetry ---
  const renderTelemetry = () => (
    <div style={styles.fadeAnim}>
      <div style={styles.kpiRow}>
        <div className="kpi-card" onClick={() => handleKpiClick('all')} style={{...styles.card, borderTop: '4px solid #4f46e5', outline: kpiFilter === 'all' ? '2px solid #4f46e5' : 'none'}}>
          <h3 style={styles.cardTitle}>Total Fleet</h3><p style={styles.cardValue}>{totalBins}</p>
        </div>
        <div className="kpi-card" onClick={() => handleKpiClick('critical')} style={{...styles.card, borderTop: '4px solid #e11d48', outline: kpiFilter === 'critical' ? '2px solid #e11d48' : 'none'}}>
          <h3 style={styles.cardTitle}>Critical (Click to Filter)</h3><p style={styles.cardValue}>{criticalBins}</p>
        </div>
        <div className="kpi-card" onClick={() => handleKpiClick('offline')} style={{...styles.card, borderTop: '4px solid #f59e0b', outline: kpiFilter === 'offline' ? '2px solid #f59e0b' : 'none'}}>
          <h3 style={styles.cardTitle}>Offline (Click to Filter)</h3><p style={styles.cardValue}>{offlineBins}</p>
        </div>
        <div className="kpi-card" onClick={() => handleKpiClick('aboveAvg')} style={{...styles.card, borderTop: '4px solid #10b981', outline: kpiFilter === 'aboveAvg' ? '2px solid #10b981' : 'none'}}>
          <h3 style={styles.cardTitle}>Above Avg Fleet Fill</h3><p style={styles.cardValue}>{avgFill}%</p>
        </div>
      </div>

      <div style={styles.filterRow}>
        <input type="text" placeholder="ðŸ” Search Hardware ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
        <select value={filterStatus} onChange={(e) => {setFilterStatus(e.target.value); setKpiFilter('all');}} style={styles.selectInput}>
          <option value="all">All Network Statuses</option>
          <option value="online">ðŸŸ¢ Online</option>
          <option value="offline">ðŸ”´ Offline</option>
          <option value="maintenance">ðŸŸ¡ Maintenance</option>
        </select>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeaderContainer}>
          <h3 style={styles.tableHeader}>Active Sensor Database</h3>
          <button onClick={fetchData} style={styles.syncBtn}>{isSyncing ? 'â³ Syncing...' : 'ðŸ”„ Sync Now'}</button>
        </div>
        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.th}>Hardware ID</th><th style={styles.th}>Zone Assignment</th><th style={styles.th}>Capacity</th><th style={styles.th}>Network</th><th style={styles.th}>Last Packet</th>
              </tr>
            </thead>
            <tbody>
              {filteredBins.length > 0 ? filteredBins.map((bin) => (
                <tr key={bin.binId} style={styles.tableRow}>
                  <td style={styles.tdBold}>{bin.binId}</td>
                  <td style={styles.td}>{bin.address || 'Unassigned'}</td>
                  <td style={styles.td}>
                    <div style={styles.progressWrapper}><div style={{...styles.progressBar, width: `${bin.fillLevel || 0}%`, backgroundColor: bin.fillLevel > 80 ? '#e11d48' : bin.fillLevel > 50 ? '#f59e0b' : '#10b981'}}></div></div>
                    <span style={styles.progressText}>{bin.fillLevel || 0}%</span>
                  </td>
                  <td style={styles.td}><span style={{...styles.statusBadge, backgroundColor: bin.status === 'online' ? '#dcfce7' : '#fee2e2', color: bin.status === 'online' ? '#166534' : '#991b1b'}}>{bin.status === 'online' ? 'ACTIVE' : 'OFFLINE'}</span></td>
                  <td style={styles.tdTime}>{bin.updatedAt ? new Date(bin.updatedAt).toLocaleString() : 'No Data'}</td>
                </tr>
              )) : (
                <tr><td colSpan="5" style={{padding: '30px', textAlign: 'center', color: '#64748b'}}>No hardware matches your active filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // --- View 2: Analytics & Reports ---
  const renderDashboard = () => (
    <div style={styles.fadeAnim}>
      <div style={styles.kpiRow}>
        <div style={{...styles.card, flex: 2, padding: '25px'}}>
          <h3 style={styles.tableHeader}>24-Hour Predictive Fill Trend</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '220px', gap: '15px', marginTop: '25px' }}>
            {trendData.map((data, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>{data.fill}%</span>
                <div style={{ width: '100%', maxWidth: '45px', backgroundColor: data.fill > 80 ? '#e11d48' : '#3b82f6', height: `${data.fill}%`, borderRadius: '6px 6px 0 0', transition: 'height 1s ease-in-out' }}></div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '10px', fontWeight: '600' }}>{data.time}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{...styles.card, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px'}}>
          <div>
            <h3 style={styles.tableHeader}>Automated Export Engine</h3>
            <p style={{fontSize: '0.85rem', color: '#64748b', marginTop: '10px'}}>Generate compliance reports based on your current telemetry filters.</p>
          </div>
          <button onClick={generatePDF} style={{...styles.actionBtn, backgroundColor: '#e11d48'}}>ðŸ“„ Generate PDF Report</button>
          <button onClick={generateCSV} style={{...styles.actionBtn, backgroundColor: '#10b981'}}>ðŸ“Š Export CSV Data</button>
        </div>
      </div>
    </div>
  );

  // --- View 3: Fleet Location & Dynamic Route ---
  const renderFleetLocation = () => (
    <div style={styles.fadeAnim}>
      <div style={styles.kpiRow}>
        <div style={{...styles.card, flex: 2, padding: 0, height: '500px', overflow: 'hidden'}}>
          <MapContainer center={[22.5726, 88.3639]} zoom={12} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {dustbins.map(bin => bin.location && (
              <Marker key={bin.binId} position={[bin.location.lat, bin.location.lng]}>
                <Popup><b>{bin.binId}</b><br/>Fill: {bin.fillLevel}%</Popup>
              </Marker>
            ))}
            {optimizedRoute.length > 1 && <Polyline positions={optimizedRoute} color="#e11d48" weight={4} dashArray="10, 10" />}
          </MapContainer>
        </div>
        <div style={{...styles.card, flex: 1}}>
          <h3 style={styles.tableHeader}>Optimized Dispatch Route</h3>
          <p style={{fontSize: '0.9rem', color: '#64748b'}}>Automated pathing connects the central depot to all hardware exceeding 80% capacity.</p>
          <ul style={{paddingLeft: '20px', color: '#0f172a'}}>
            <li><b>Start:</b> Central Depot</li>
            {dustbins.filter(b => b.fillLevel > 80).map(b => <li key={b.binId} style={{marginTop: '10px'}}>{b.binId} - {b.address} ({b.fillLevel}%)</li>)}
          </ul>
        </div>
      </div>
    </div>
  );

  // --- View 4: Maintenance Hub & Live Tickets ---
  const renderMaintenanceHub = () => (
    <div style={styles.fadeAnim}>
      <div style={{...styles.card, marginBottom: '25px'}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={styles.tableHeader}>Live Service & Support Tickets</h3>
            <p style={{fontSize: '0.85rem', color: '#64748b'}}>Manage and update tickets raised by citizens and field technicians.</p>
          </div>
          <button onClick={fetchData} style={styles.syncBtn}>{isSyncing ? 'â³ Syncing...' : 'ðŸ”„ Sync Now'}</button>
        </div>
        
        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.th}>Ticket ID</th>
                <th style={styles.th}>Hardware</th>
                <th style={styles.th}>Issue Detected</th>
                <th style={styles.th}>Reporter Email</th>
                <th style={styles.th}>Current Status</th>
                <th style={styles.th}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? tickets.map((t, i) => (
                <tr key={i} style={styles.tableRow}>
                  <td style={styles.tdBold}>{t._id ? t._id.substring(t._id.length - 6).toUpperCase() : 'N/A'}</td>
                  <td style={styles.td}>{t.binId}</td>
                  <td style={{...styles.td, color: '#e11d48', fontWeight: 'bold'}}>{t.issue}</td>
                  <td style={styles.tdTime}>{t.raisedBy}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge, 
                      backgroundColor: t.status === 'Resolved' ? '#dcfce7' : t.status === 'In Progress' ? '#dbeafe' : '#fef3c7', 
                      color: t.status === 'Resolved' ? '#166534' : t.status === 'In Progress' ? '#1e40af' : '#92400e'
                    }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {t.status !== 'Resolved' ? (
                      <div style={{display: 'flex', gap: '8px'}}>
                        {t.status === 'Pending Review' && (
                          <button onClick={() => handleUpdateTicketStatus(t._id, 'In Progress')} style={{...styles.actionBtnSmall, backgroundColor: '#3b82f6'}}>Mark In Progress</button>
                        )}
                        <button onClick={() => handleUpdateTicketStatus(t._id, 'Resolved')} style={{...styles.actionBtnSmall, backgroundColor: '#10b981'}}>Resolve</button>
                      </div>
                    ) : (
                      <span style={{color: '#94a3b8', fontSize: '0.85rem'}}>Closed</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{padding: '30px', textAlign: 'center', color: '#64748b'}}>No active tickets in the database.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .kpi-card { transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .kpi-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important; }
      `}</style>
      
      <nav style={styles.sidebar}>
        <div style={styles.sidebarHeader}><h2 style={styles.brand}>âš™ï¸ IoT Command</h2></div>
        <ul style={styles.navList}>
          <li style={activeTab === 'telemetry' ? styles.navItemActive : styles.navItem} onClick={() => setActiveTab('telemetry')}>ðŸ“¡ Real-Time Telemetry</li>
          <li style={activeTab === 'dashboard' ? styles.navItemActive : styles.navItem} onClick={() => setActiveTab('dashboard')}>ðŸ“Š Analytics & Reports</li>
          <li style={activeTab === 'fleet' ? styles.navItemActive : styles.navItem} onClick={() => setActiveTab('fleet')}>ðŸ“ GPS Route Optimization</li>
          <li style={activeTab === 'maintenance' ? styles.navItemActive : styles.navItem} onClick={() => setActiveTab('maintenance')}>ðŸ”§ Maintenance Hub</li>
        </ul>
      </nav>

      <main style={styles.mainContent}>
        <header style={styles.topHeader}>
          <div>
            <h1 style={styles.pageTitle}>
              {activeTab === 'telemetry' ? 'Hardware Telemetry' : activeTab === 'dashboard' ? 'Analytics Engine' : activeTab === 'fleet' ? 'Fleet Dispatch Routes' : 'Maintenance & Support'}
            </h1>
            <p style={styles.subtitle}>Secured connection to MongoDB Backend</p>
          </div>
          <div style={styles.userControls}>
            <div style={styles.avatar}>A</div>
            <div style={styles.userInfo}><span style={styles.userName}>System Admin</span><span style={styles.userRole}>Level-2 Access</span></div>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </header>
        
        {activeTab === 'telemetry' && renderTelemetry()}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'fleet' && renderFleetLocation()}
        {activeTab === 'maintenance' && renderMaintenanceHub()}
      </main>
    </div>
  );
};

// --- Premium Styles Object ---
const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif" },
  fadeAnim: { animation: 'fadeIn 0.4s ease-in-out' },
  sidebar: { width: '260px', backgroundColor: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, boxShadow: '4px 0 10px rgba(0,0,0,0.1)' },
  sidebarHeader: { padding: '25px 20px', borderBottom: '1px solid #1e293b' },
  brand: { margin: 0, fontSize: '1.3rem', fontWeight: '700', letterSpacing: '0.5px' },
  navList: { listStyle: 'none', padding: '15px 0', margin: 0 },
  navItem: { padding: '15px 25px', color: '#94a3b8', cursor: 'pointer', borderLeft: '4px solid transparent', transition: 'all 0.2s', fontSize: '0.95rem' },
  navItemActive: { padding: '15px 25px', color: '#fff', backgroundColor: '#1e293b', cursor: 'pointer', borderLeft: '4px solid #3b82f6', fontWeight: '600', fontSize: '0.95rem' },
  mainContent: { flexGrow: 1, padding: '40px', overflowY: 'auto' },
  topHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', flexWrap: 'wrap', gap: '20px' },
  pageTitle: { margin: 0, fontSize: '2rem', color: '#0f172a', fontWeight: '700' },
  subtitle: { margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' },
  userControls: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '50px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  avatar: { width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  userInfo: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '0.9rem', fontWeight: 'bold', color: '#0f172a' },
  userRole: { fontSize: '0.75rem', color: '#64748b' },
  logoutBtn: { padding: '8px 16px', backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
  kpiRow: { display: 'flex', gap: '25px', marginBottom: '30px', flexWrap: 'wrap' },
  card: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02), 0 10px 15px rgba(0,0,0,0.03)', flex: 1, minWidth: '200px' },
  cardTitle: { margin: '0 0 12px 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' },
  cardValue: { margin: 0, fontSize: '2.5rem', fontWeight: '800', color: '#0f172a' },
  filterRow: { display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' },
  searchInput: { flexGrow: 1, minWidth: '300px', padding: '12px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' },
  selectInput: { padding: '12px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#fff', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500' },
  actionBtn: { padding: '12px 20px', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  actionBtnSmall: { padding: '6px 12px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.75rem', transition: 'opacity 0.2s' },
  tableCard: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflow: 'hidden' },
  tableHeaderContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px', borderBottom: '1px solid #f1f5f9' },
  tableHeader: { margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: '700' },
  syncBtn: { padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  tableResponsive: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  tableHeadRow: { backgroundColor: '#f8fafc' },
  th: { padding: '18px 25px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #e2e8f0', fontWeight: '700' },
  tableRow: { borderBottom: '1px solid #f1f5f9' },
  tdBold: { padding: '18px 25px', fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' },
  td: { padding: '18px 25px', color: '#475569', fontSize: '0.95rem' },
  tdTime: { padding: '18px 25px', color: '#94a3b8', fontSize: '0.85rem' },
  progressWrapper: { width: '100%', backgroundColor: '#f1f5f9', borderRadius: '50px', height: '10px', marginBottom: '8px', overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: '50px', transition: 'width 0.8s ease' },
  progressText: { fontSize: '0.85rem', fontWeight: '700', color: '#334155' },
  statusBadge: { padding: '6px 14px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '800' }
};

export default AdminDashboard;