import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, LogIn } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    try {
      const user = await login(formData.email, formData.password);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/driver/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-main)' }}>
      {/* Left side: Branding / Hero */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: 'white', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="hide-on-mobile">
        <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'white', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
          <Leaf size={32} />
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '0 0 16px 0', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Intelligent Cold-Chain Traceability.</h1>
        <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', lineHeight: 1.6, margin: 0 }}>
          FarmTrace secures agricultural supply chains using real-time IoT telemetry, distributed tamper detection, and cryptographic data integrity.
        </p>
      </div>

      {/* Right side: Login Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div className="show-on-mobile" style={{ display: 'none', marginBottom: '32px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Leaf size={24} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>FarmTrace</h1>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Welcome back</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '0 0 32px 0' }}>Sign in to continue.</p>

          {error && <div style={{ padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>{error}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-input" placeholder="name@farmtrace.io" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className="form-input" placeholder="••••••••" />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isLoggingIn} style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
              {isLoggingIn ? 'Signing in...' : (
                <>
                  <LogIn size={18} /> Sign In
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div style={{ marginTop: '32px', padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>Demo Credentials</h3>
            <div style={{ display: 'grid', gap: '8px', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--bg-main)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Admin</span>
                <span style={{ fontWeight: 500 }}>test@gmail.com / test</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--bg-main)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Driver</span>
                <span style={{ fontWeight: 500 }}>driver@farmtrace.io / driver</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign up</Link>
          </div>

          <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Smart India Hackathon 2026 Prototype v2.1.0
          </div>
        </div>
      </div>
    </div>
  );
}
