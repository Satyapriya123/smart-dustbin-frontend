import React, { useEffect, useState } from "react";

const SuperAdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const API_URL = "https://smart-dustbin-backend-rzjf.onrender.com/api/superadmin";

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/all-users`);
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users");
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await fetch(`${API_URL}/change-role/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newRole })
            });
            alert("User role updated successfully!");
            fetchUsers(); // Refresh the list
        } catch (error) {
            alert("Error updating role");
        }
    };

    return (
        <div style={{ padding: "20px", color: "white", backgroundColor: "#1a1a2e", minHeight: "100vh" }}>
            <h2>Superadmin Control Panel</h2>
            <p>Manage all system users and roles.</p>
            <table style={{ width: "100%", textAlign: "left", marginTop: "20px", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid #444" }}>
                        <th style={{ padding: "10px" }}>Email/Username</th>
                        <th style={{ padding: "10px" }}>Current Role</th>
                        <th style={{ padding: "10px" }}>Change Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id} style={{ borderBottom: "1px solid #333" }}>
                            <td style={{ padding: "10px" }}>{user.email}</td>
                            <td style={{ padding: "10px" }}>{user.role}</td>
                            <td style={{ padding: "10px" }}>
                                <select 
                                    defaultValue={user.role} 
                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                    style={{ padding: "5px", background: "#333", color: "white", border: "1px solid #555" }}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Superadmin</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SuperAdminDashboard;
