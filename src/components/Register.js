import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('https://smart-dustbin-backend-rzjf.onrender.com/api/superadmin/register-request', formData);
      alert(`Registration submitted for ${formData.name}. Awaiting admin approval.`);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.error || "Registration failed. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Register for the Smart Dustbin Network</p>
        
        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.inputGroup}><label style={styles.label}>Full Name</label><input type="text" name="name" onChange={handleChange} style={styles.input} required placeholder="John Doe" /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Email Address</label><input type="email" name="email" onChange={handleChange} style={styles.input} required placeholder="john@example.com" /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Phone Number</label><input type="tel" name="phone" onChange={handleChange} style={styles.input} required placeholder="+91 9876543210" /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Address / Zone</label><input type="text" name="address" onChange={handleChange} style={styles.input} required placeholder="Kolkata Sector 5" /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Password</label><input type="password" name="password" onChange={handleChange} style={styles.input} required placeholder="Create a password" /></div>
          <button type="submit" style={styles.btn} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Registration'}</button>
        </form>
        
        <div style={styles.footerContainer}>
          <span style={styles.footerText}>Already have an account? </span><span onClick={() => navigate('/')} style={styles.linkTextBold}>Return to Login</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: "'Inter', sans-serif" },
  card: { backgroundColor: '#1e293b', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '450px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' },
  title: { color: '#f8fafc', margin: '0 0 10px 0', fontSize: '1.5rem', textAlign: 'center' },
  subtitle: { color: '#94a3b8', margin: '0 0 30px 0', fontSize: '0.9rem', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0f172a', color: '#fff', fontSize: '0.95rem', outline: 'none' },
  btn: { padding: '14px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  footerContainer: { marginTop: '25px', textAlign: 'center' },
  footerText: { color: '#94a3b8', fontSize: '0.9rem' },
  linkTextBold: { color: '#10b981', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }
};
export default Register;