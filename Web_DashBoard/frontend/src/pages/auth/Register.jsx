import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, UserPlus } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    setError('');
    
    try {
      await register(formData);
      navigate(formData.role === 'admin' ? '/admin/dashboard' : '/driver/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-main)' }}>
      {/* Left side: Branding / Hero */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: 'white', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="hide-on-mobile">
        <div style={{ width: 64, height: 64, borderRadius: '16px', background: 'white', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
          <Leaf size={32} />
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '0 0 16px 0', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Join FarmTrace.</h1>
        <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', lineHeight: 1.6, margin: 0 }}>
          Create an account to manage logistics, monitor telemetry, and secure your agricultural supply chain.
        </p>
      </div>

      {/* Right side: Register Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div className="show-on-mobile" style={{ display: 'none', marginBottom: '32px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Leaf size={24} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>FarmTrace</h1>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Create an account</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '0 0 32px 0' }}>Sign up to access the dashboard.</p>

          {error && <div style={{ padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>{error}</div>}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input" placeholder="John Doe" />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-input" placeholder="name@farmtrace.io" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className="form-input" placeholder="••••••••" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="form-input" style={{ width: '100%', padding: '10px' }}>
                <option value="admin">Administrator</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isRegistering} style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
              {isRegistering ? 'Creating account...' : (
                <>
                  <UserPlus size={18} /> Sign Up
                </>
              )}
            </button>
          </form>
          
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
