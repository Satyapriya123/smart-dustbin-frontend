import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';

// Security Wrapper: Kicks unauthenticated users back to login on refresh
const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem('role');
  
  // If no role exists in memory (e.g., hard refresh cleared it), kick to login
  if (!role) return <Navigate to="/" />;
  
  // If they try to access a dashboard they don't have permission for, kick to login
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />;
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Secure Dashboard Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/superadmin" element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;