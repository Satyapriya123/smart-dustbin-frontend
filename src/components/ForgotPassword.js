import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSendOTP = (e) => {
    e.preventDefault();
    alert("OTP sent to " + email);
    setStep(2);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (otp === "1234") { // Mock OTP verification
      setStep(3);
    } else {
      alert("Invalid OTP! Try 1234 for demo.");
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    alert("Password successfully reset!");
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Password Recovery</h2>
        <p style={styles.subtitle}>
          {step === 1 ? "Enter your email to receive an OTP." : step === 2 ? "Enter the OTP sent to your email." : "Create your new secure password."}
        </p>

        {step === 1 && (
          <form onSubmit={handleSendOTP} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required placeholder="Enter registered email" />
            </div>
            <button type="submit" style={styles.btn}>Send OTP Verification</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>6-Digit OTP</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} style={styles.input} required placeholder="Enter OTP" maxLength="6" />
            </div>
            <button type="submit" style={styles.btn}>Verify OTP</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={styles.input} required placeholder="Enter new password" />
            </div>
            <button type="submit" style={styles.btn}>Reset & Login</button>
          </form>
        )}
        
        <div style={styles.footerContainer}>
          <span onClick={() => navigate('/')} style={styles.linkTextBold}>⬅ Return to Login</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', fontFamily: "'Inter', sans-serif" },
  card: { backgroundColor: '#1e293b', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' },
  title: { color: '#f8fafc', margin: '0 0 10px 0', fontSize: '1.5rem', textAlign: 'center' },
  subtitle: { color: '#94a3b8', margin: '0 0 30px 0', fontSize: '0.9rem', textAlign: 'center', lineHeight: '1.5' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' },
  input: { padding: '12px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0f172a', color: '#fff', fontSize: '1rem', outline: 'none', textAlign: 'center' },
  btn: { padding: '14px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  footerContainer: { marginTop: '25px', textAlign: 'center' },
  linkTextBold: { color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', transition: 'color 0.2s' }
};
export default ForgotPassword;