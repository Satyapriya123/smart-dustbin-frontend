import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SuperAdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRole, setNewRole] = useState("user");
    const navigate = useNavigate();
    const API_URL = "https://smart-dustbin-backend-rzjf.onrender.com/api/superadmin";

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/all-users`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Error fetching users. Check Render backend.");
        }
    };

    const handleRoleChange = async (userId, role) => {
        try {
            await fetch(`${API_URL}/change-role/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newRole: role })
            });
            fetchUsers();
        } catch (error) {
            alert("Error updating role");
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/add-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole })
            });
            if (response.ok) {
                setNewEmail("");
                setNewPassword("");
                fetchUsers();
                alert("Account created successfully.");
            } else {
                alert("Failed to create account. User may already exist.");
            }
        } catch (error) {
            alert("Network error. Backend may still be deploying.");
        }
    };

    const handleApproveUser = async (userId) => {
        try {
            await fetch(`${API_URL}/approve-user/${userId}`, { method: "PUT" });
            fetchUsers();
        } catch (error) {
            alert("Error approving user");
        }
    };

    const handleLogout = () => {
        try {
            localStorage.clear();
            sessionStorage.clear();
        } catch (e) {
            console.warn("Storage clear blocked by browser context.");
        }
        window.location.href = "/";
    };

    return (
        <div style={styles.layout}>
            <div style={styles.navbar}>
                <h2 style={styles.navTitle}>SYSTEM OVERRIDE <span style={styles.accent}>{"// SUPERADMIN"}</span></h2>
                <button onClick={handleLogout} style={styles.logoutBtn}>[ TERMINATE SESSION ]</button>
            </div>

            <div style={styles.container}>
                <div style={styles.card}>
                    <h3 style={styles.cardHeader}>&gt; INITIALIZE_NEW_ACCOUNT</h3>
                    <form onSubmit={handleAddUser} style={styles.formGroup}>
                        <input 
                            type="text" placeholder="Username / Email" value={newEmail} 
                            onChange={(e) => setNewEmail(e.target.value)} style={styles.input} required 
                        />
                        <input 
                            type="password" placeholder="Password" value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} style={styles.input} required 
                        />
                        <select value={newRole} onChange={(e) => setNewRole(e.target.value)} style={styles.select}>
                            <option value="user">Citizen / Standard</option>
                            <option value="admin">System Admin</option>
                            <option value="superadmin">Superadmin</option>
                        </select>
                        <button type="submit" style={styles.actionBtn}>EXECUTE_CREATION</button>
                    </form>
                </div>

                <div style={styles.card}>
                    <h3 style={styles.cardHeader}>&gt; ACTIVE_REGISTRATIONS_DATABASE</h3>
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>IDENTIFIER</th>
                                    <th style={styles.th}>ACCESS_LEVEL / DETAILS</th>
                                    <th style={styles.th}>SYSTEM_MODIFICATION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Pending Approvals Section */}
                                {users.filter(u => u.status === 'pending').map(user => (
                                    <tr key={user._id} style={styles.tr}>
                                        <td style={styles.td}>
                                            {user.email} <br/>
                                            <span style={{fontSize: '0.75rem', color: '#f59e0b', fontWeight: 'bold'}}>PENDING APPROVAL</span>
                                        </td>
                                        <td style={styles.td}>
                                            Name: {user.name || 'N/A'}<br/>
                                            Phone: {user.phone || 'N/A'}<br/>
                                            Zone: {user.address || 'N/A'}
                                        </td>
                                        <td style={styles.td}>
                                            <button 
                                                onClick={() => handleApproveUser(user._id)} 
                                                style={{...styles.actionBtn, backgroundColor: '#3b82f6', padding: '6px 12px', fontSize: '0.8rem'}}
                                            >
                                                APPROVE_ACCOUNT
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {/* Approved Active Users Section */}
                                {users.filter(u => u.status !== 'pending').map(user => (
                                    <tr key={user._id} style={styles.tr}>
                                        <td style={styles.td}>{user.email}</td>
                                        <td style={styles.td}>
                                            <span style={user.role === 'superadmin' ? styles.badgeSuper : user.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}>
                                                {user.role ? user.role.toUpperCase() : 'USER'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <select 
                                                defaultValue={user.role || 'user'} 
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                style={styles.inlineSelect}
                                            >
                                                <option value="user">USER</option>
                                                <option value="admin">ADMIN</option>
                                                <option value="superadmin">SUPERADMIN</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    layout: { minHeight: "100vh", backgroundColor: "#09090b", color: "#e4e4e7", fontFamily: "'Courier New', Courier, monospace" },
    navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 30px", backgroundColor: "#18181b", borderBottom: "1px solid #27272a" },
    navTitle: { margin: 0, fontSize: "1.2rem", fontWeight: "bold", letterSpacing: "1px" },
    accent: { color: "#10b981" },
    logoutBtn: { backgroundColor: "transparent", color: "#ef4444", border: "1px solid #ef4444", padding: "8px 15px", cursor: "pointer", fontWeight: "bold", transition: "0.2s" },
    container: { padding: "30px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "25px" },
    card: { backgroundColor: "#18181b", padding: "25px", borderRadius: "4px", border: "1px solid #27272a", boxShadow: "0 4px 6px rgba(0,0,0,0.3)" },
    cardHeader: { margin: "0 0 20px 0", color: "#10b981", fontSize: "1rem", letterSpacing: "0.5px" },
    formGroup: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "15px", alignItems: "center" },
    input: { padding: "10px", backgroundColor: "#09090b", border: "1px solid #3f3f46", color: "#10b981", outline: "none", width: "100%" },
    select: { padding: "10px", backgroundColor: "#09090b", border: "1px solid #3f3f46", color: "#10b981", outline: "none", cursor: "pointer" },
    inlineSelect: { padding: "6px", backgroundColor: "#09090b", border: "1px solid #3f3f46", color: "#e4e4e7", outline: "none", cursor: "pointer", fontSize: "0.85rem" },
    actionBtn: { backgroundColor: "#10b981", color: "#000", border: "none", padding: "10px 20px", fontWeight: "bold", cursor: "pointer", height: "100%" },
    tableWrapper: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
    th: { padding: "12px", borderBottom: "1px solid #3f3f46", color: "#a1a1aa", fontSize: "0.85rem" },
    tr: { transition: "background-color 0.2s" },
    td: { padding: "12px", borderBottom: "1px solid #27272a", fontSize: "0.95rem" },
    badgeSuper: { backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "4px 8px", borderRadius: "3px", fontSize: "0.75rem", border: "1px solid #ef4444" },
    badgeAdmin: { backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", padding: "4px 8px", borderRadius: "3px", fontSize: "0.75rem", border: "1px solid #3b82f6" },
    badgeUser: { backgroundColor: "rgba(161, 161, 170, 0.1)", color: "#a1a1aa", padding: "4px 8px", borderRadius: "3px", fontSize: "0.75rem", border: "1px solid #52525b" },
};

export default SuperAdminDashboard;