import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@distronix.in' && password === 'admin123') {
      localStorage.setItem('email', email);
      localStorage.setItem('name', 'System Admin');
      localStorage.setItem('role', 'admin');
      navigate('/admin');
    } else if (email.includes('@') && password.length > 3) {
      localStorage.setItem('email', email);
      localStorage.setItem('name', email.split('@')[0]);
      localStorage.setItem('role', 'citizen');
      navigate('/user');
    } else {
      setError('Invalid credentials. Citizens can use any valid email.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🌐 Smart Dustbin Network</h2>
        <p style={styles.subtitle}>Centralized IoT Management Portal</p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required placeholder="Enter your email" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required placeholder="Enter password" />
          </div>
          <button type="submit" style={styles.btn}>Secure Login</button>
        </form>
        
        <div style={styles.demoHints}>
          <strong>Demo Access:</strong><br/>
          Admin: admin@distronix.in / admin123<br/>
          Citizen: Any email / Any password
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', fontFamily: "'Inter', sans-serif" },
  card: { backgroundColor: '#1e293b', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' },
  title: { color: '#f8fafc', margin: '0 0 10px 0', fontSize: '1.5rem', textAlign: 'center' },
  subtitle: { color: '#94a3b8', margin: '0 0 30px 0', fontSize: '0.9rem', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' },
  input: { padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0f172a', color: '#fff', fontSize: '1rem', outline: 'none' },
  btn: { padding: '14px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  error: { backgroundColor: 'rgba(225, 29, 72, 0.1)', color: '#f43f5e', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', textAlign: 'center', marginBottom: '20px' },
  demoHints: { marginTop: '30px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', color: '#64748b', fontSize: '0.8rem', textAlign: 'center', lineHeight: '1.6' }
};

export default Login;