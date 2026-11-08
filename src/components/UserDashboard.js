import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [dustbins, setDustbins] = useState([]);
  const [selectedArea, setSelectedArea] = useState('All Areas');
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ binId: '', issue: 'Overflowing / Needs Pickup', description: '' });
  const [alert, setAlert] = useState({ show: false, message: '' });
  const [isSyncing, setIsSyncing] = useState(false); 
  
  const navigate = useNavigate();
  
  // STRICT FILTER: Pulls the exact email saved during the user's login. 
  // If no email is found, defaults to a safe string to prevent app crashes.
  const userEmail = localStorage.getItem('email') || 'session_expired@citizen.com';
  const userName = localStorage.getItem('name') || 'Citizen User';

  const fetchData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const binRes = await axios.get('https://YOUR-BACKEND-NAME.onrender.com/api/dustbins');
      setDustbins(binRes.data);
      
      // The backend automatically filters and returns ONLY tickets matching this specific user's email
      const ticketRes = await axios.get(`https://YOUR-BACKEND-NAME.onrender.com/api/tickets/user-dashboard/get/${userEmail}`);
      setTickets(ticketRes.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
    setTimeout(() => setIsSyncing(false), 500);
  }, [userEmail]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const triggerAlert = (message) => {
    setAlert({ show: true, message });
    setTimeout(() => setAlert({ show: false, message: '' }), 3000);
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!newTicket.binId) return triggerAlert('Please select a Hardware ID.');
    
    try {
      const res = await axios.post('https://YOUR-BACKEND-NAME.onrender.com/api/tickets/raise', {
        binId: newTicket.binId,
        issue: newTicket.issue,
        description: newTicket.description,
        raisedBy: userEmail // Hard-links the ticket to this specific user in MongoDB
      });

      setTickets([res.data, ...tickets]); 
      setNewTicket({ binId: '', issue: 'Overflowing / Needs Pickup', description: '' });
      triggerAlert('Ticket registered successfully!');
    } catch (error) {
      triggerAlert('Database Error: Could not raise ticket.');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm("Are you sure you want to withdraw this ticket? This action cannot be undone.")) return;
    try {
      await axios.delete(`https://YOUR-BACKEND-NAME.onrender.com/api/tickets/${ticketId}`);
      setTickets(tickets.filter(t => t._id !== ticketId)); 
      triggerAlert('Ticket withdrawn successfully.');
    } catch (error) {
      triggerAlert('Database Error: Could not delete ticket.');
    }
  };

  const uniqueAreas = ['All Areas', ...new Set(dustbins.map(b => b.address).filter(Boolean))];
  const filteredBins = selectedArea === 'All Areas' ? dustbins : dustbins.filter(b => b.address === selectedArea);

  const renderMapArea = () => (
    <div style={styles.fadeAnim}>
      <div style={styles.filterRow}>
        <div style={styles.filterBadge}>ðŸ“ Area Filter</div>
        <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} style={styles.selectInput}>
          {uniqueAreas.map((area, idx) => <option key={idx} value={area}>{area}</option>)}
        </select>
        <div style={{marginLeft: 'auto', display: 'flex', gap: '15px'}}>
          <span style={styles.legend}><span style={{...styles.dot, backgroundColor: '#10b981'}}></span> Available</span>
          <span style={styles.legend}><span style={{...styles.dot, backgroundColor: '#f59e0b'}}></span> Nearing Capacity</span>
          <span style={styles.legend}><span style={{...styles.dot, backgroundColor: '#e11d48'}}></span> Critical/Full</span>
        </div>
      </div>

      <div style={styles.mapCard}>
        <MapContainer center={[22.5726, 88.3639]} zoom={12} style={{ height: "550px", width: "100%" }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {filteredBins.map(bin => bin.location && (
            <Marker key={bin.binId} position={[bin.location.lat, bin.location.lng]}>
              <Popup>
                <div style={{textAlign: 'center', fontFamily: 'Inter'}}>
                  <strong style={{color: '#0f172a', fontSize: '1.1rem'}}>{bin.binId}</strong><br/>
                  <span style={{color: '#64748b'}}>{bin.address}</span><br/><br/>
                  <div style={{fontWeight: 'bold', color: bin.fillLevel > 80 ? '#e11d48' : '#10b981'}}>Fill Level: {bin.fillLevel || 0}%</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );

  const renderTickets = () => (
    <div style={styles.fadeAnim}>
      <div style={styles.ticketGrid}>
        
        <div style={styles.card}>
          <h3 style={styles.cardHeader}>ðŸ› ï¸ Raise a Service Ticket</h3>
          <p style={{color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px'}}>Report physical damage, overflow, or network drops.</p>
          <form onSubmit={handleTicketSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Select Hardware ID</label>
              <select style={styles.input} value={newTicket.binId} onChange={(e) => setNewTicket({...newTicket, binId: e.target.value})} required>
                <option value="">-- Choose Terminal --</option>
                {dustbins.map(b => <option key={b.binId} value={b.binId}>{b.binId} - {b.address}</option>)}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Issue Category</label>
              <select style={styles.input} value={newTicket.issue} onChange={(e) => setNewTicket({...newTicket, issue: e.target.value})}>
                <option value="Overflowing / Needs Pickup">Overflowing / Needs Pickup</option>
                <option value="Physical Damage / Vandalism">Physical Damage / Vandalism</option>
                <option value="Sensor Malfunction">Sensor Malfunction / Appears Offline</option>
                <option value="Other">Other / General Maintenance</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Additional Details (Optional)</label>
              <textarea style={{...styles.input, minHeight: '100px', resize: 'vertical'}} placeholder="Describe the problem..." value={newTicket.description} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}></textarea>
            </div>
            <button type="submit" style={styles.submitBtn}>Submit Ticket</button>
          </form>
        </div>

        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={styles.cardHeader}>ðŸ“¡ Live Status Tracker</h3>
            <button 
              onClick={fetchData} 
              style={{
                padding: '6px 12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', 
                border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', cursor: 'pointer', 
                fontSize: '0.8rem', fontWeight: 'bold', transition: 'all 0.2s'
              }}
            >
              {isSyncing ? 'â³ Syncing...' : 'ðŸ”„ Sync Now'}
            </button>
          </div>
          
          <div style={styles.ticketList}>
            {tickets.length > 0 ? tickets.map((ticket, index) => (
              <div key={index} style={styles.ticketItem}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span style={{fontWeight: 'bold', color: '#e2e8f0'}}>{ticket._id ? ticket._id.substring(ticket._id.length - 6).toUpperCase() : 'TK-PEND'} <span style={{color: '#64748b', fontWeight: 'normal'}}>| {ticket.binId}</span></span>
                  <span style={{fontSize: '0.85rem', color: '#94a3b8'}}>{new Date(ticket.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div style={{color: '#94a3b8', fontSize: '0.95rem', marginBottom: '15px'}}>{ticket.issue}</div>
                <div style={styles.trackerBar}>
                  <div style={{
                    ...styles.trackerProgress, 
                    width: ticket.status === 'Resolved' ? '100%' : ticket.status === 'In Progress' ? '50%' : '15%',
                    backgroundColor: ticket.status === 'Resolved' ? '#10b981' : ticket.status === 'In Progress' ? '#3b82f6' : '#f59e0b'
                  }}></div>
                </div>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px'}}>
                  <div style={{display: 'flex', gap: '15px', fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase'}}>
                    <span style={{color: ticket.status === 'Pending Review' ? '#f59e0b' : '#64748b'}}>Pending</span>
                    <span style={{color: ticket.status === 'In Progress' ? '#3b82f6' : '#64748b'}}>In Progress</span>
                    <span style={{color: ticket.status === 'Resolved' ? '#10b981' : '#64748b'}}>Resolved</span>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteTicket(ticket._id)}
                    style={{
                      padding: '6px 12px', backgroundColor: 'rgba(225, 29, 72, 0.1)', color: '#f43f5e', 
                      border: '1px solid rgba(225, 29, 72, 0.3)', borderRadius: '6px', cursor: 'pointer', 
                      fontSize: '0.75rem', fontWeight: 'bold', transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(225, 29, 72, 0.2)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(225, 29, 72, 0.1)'}
                  >
                    ðŸ—‘ï¸ Withdraw
                  </button>
                </div>
              </div>
            )) : <p style={{color: '#64748b', fontSize: '0.9rem'}}>No tickets raised yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { transform: translate(-50%, -20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>
      
      {alert.show && <div style={styles.toastAlert}>âœ… {alert.message}</div>}

      <nav style={styles.sidebar}>
        <div style={styles.sidebarHeader}><h2 style={styles.brand}>ðŸŒ Public Portal</h2></div>
        <ul style={styles.navList}>
          <li style={activeTab === 'map' ? styles.navItemActive : styles.navItem} onClick={() => setActiveTab('map')}>ðŸ“ Interactive Area Map</li>
          <li style={activeTab === 'tickets' ? styles.navItemActive : styles.navItem} onClick={() => setActiveTab('tickets')}>ðŸŽ« Support & Tickets</li>
        </ul>
      </nav>

      <main style={styles.mainContent}>
        <header style={styles.topHeader}>
          <div>
            <h1 style={styles.pageTitle}>{activeTab === 'map' ? 'Area-Wise Terminal Network' : 'Service & Ticketing Hub'}</h1>
            <p style={styles.subtitle}>Smart Dustbin Community Network</p>
          </div>
          
          <div style={styles.userControls}>
            <div style={styles.avatar}>ðŸ‘¤</div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{userName}</span>
              <span style={styles.userRole} title={userEmail}>{userEmail.length > 20 ? userEmail.substring(0, 17) + '...' : userEmail}</span>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </header>
        
        {activeTab === 'map' && renderMapArea()}
        {activeTab === 'tickets' && renderTickets()}
      </main>
    </div>
  );
};

const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#090e17', fontFamily: "'Inter', 'Segoe UI', sans-serif" }, 
  fadeAnim: { animation: 'fadeIn 0.4s ease-in-out' },
  toastAlert: { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: '50px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)', zIndex: 9999, animation: 'slideDown 0.3s ease-out' },
  sidebar: { width: '260px', backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', color: '#fff', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.05)' },
  sidebarHeader: { padding: '30px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  brand: { margin: 0, fontSize: '1.4rem', fontWeight: '800', letterSpacing: '1px', background: 'linear-gradient(90deg, #3b82f6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  navList: { listStyle: 'none', padding: '15px 0', margin: 0 },
  navItem: { padding: '15px 25px', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.95rem', fontWeight: '500' },
  navItemActive: { padding: '15px 25px', color: '#fff', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRight: '4px solid #3b82f6', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '700' },
  mainContent: { flexGrow: 1, padding: '40px', overflowY: 'auto' },
  topHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', flexWrap: 'wrap', gap: '20px' },
  pageTitle: { margin: 0, fontSize: '2rem', color: '#f8fafc', fontWeight: '700' },
  subtitle: { margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' },
  userControls: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '10px 20px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.05)' },
  avatar: { width: '35px', height: '35px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  userInfo: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '0.9rem', fontWeight: 'bold', color: '#e2e8f0' },
  userRole: { fontSize: '0.75rem', color: '#64748b' },
  logoutBtn: { padding: '8px 16px', backgroundColor: 'rgba(225, 29, 72, 0.1)', color: '#f43f5e', border: '1px solid rgba(225, 29, 72, 0.2)', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: 'all 0.2s' },
  filterRow: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '15px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' },
  filterBadge: { backgroundColor: '#3b82f6', color: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold' },
  selectInput: { padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.95rem', cursor: 'pointer', minWidth: '200px' },
  legend: { display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' },
  dot: { width: '10px', height: '10px', borderRadius: '50%' },
  mapCard: { borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
  ticketGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' },
  card: { backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: '35px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' },
  cardHeader: { margin: '0', fontSize: '1.3rem', color: '#f8fafc', fontWeight: '700' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.85rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', backgroundColor: 'rgba(15, 23, 42, 0.6)', color: '#fff', fontSize: '0.95rem', transition: 'border-color 0.2s' },
  submitBtn: { marginTop: '10px', padding: '15px', background: 'linear-gradient(90deg, #3b82f6, #2563eb)', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' },
  ticketList: { display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' },
  ticketItem: { backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' },
  trackerBar: { width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50px', height: '6px', overflow: 'hidden' },
  trackerProgress: { height: '100%', borderRadius: '50px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }
};

export default UserDashboard;