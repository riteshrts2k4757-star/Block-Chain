import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, LogIn, Mail, Lock, ShieldCheck } from 'lucide-react';

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
      navigate(user.role === 'admin' ? '/admin/telemetry' : '/driver/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      background: 'url(/auth-bg.jpg) center/cover no-repeat fixed',
      position: 'relative'
    }}>
      {/* Dark overlay for better readability */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
        zIndex: 0
      }}></div>

      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        display: 'flex', 
        width: '100%',
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px' 
      }}>
        
        <div style={{
          display: 'flex',
          maxWidth: '1000px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          
          {/* Left side: Branding Info */}
          <div className="hide-on-mobile" style={{ 
            flex: 1, 
            padding: '60px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            color: 'white',
            background: 'linear-gradient(to right, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.4))'
          }}>
            <div>
              <div style={{ 
                width: 56, height: 56, 
                borderRadius: '16px', 
                background: 'linear-gradient(135deg, var(--primary), var(--info))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                marginBottom: '32px',
                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
              }}>
                <Leaf size={28} color="white" />
              </div>
              <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 16px 0', lineHeight: 1.1, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                Intelligent<br/>Cold-Chain<br/>Traceability.
              </h1>
              <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6, margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                Securing agricultural supply chains using real-time IoT telemetry, distributed tamper detection, and cryptographic data integrity.
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '40px' }}>
              <ShieldCheck size={24} color="var(--primary)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 500, opacity: 0.8 }}>End-to-End Encrypted Data Pipeline</span>
            </div>
          </div>

          {/* Right side: Login Form */}
          <div style={{ 
            flex: 1, 
            background: 'var(--bg-card)', 
            padding: '60px 48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div className="show-on-mobile" style={{ display: 'none', marginBottom: '32px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Leaf size={24} />
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>FarmTrace</h1>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Welcome back</h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: 0 }}>Enter your details to access the dashboard.</p>
            </div>

            {error && (
              <div style={{ padding: '16px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
                <ShieldCheck size={18} /> {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    style={{
                      width: '100%', padding: '14px 16px 14px 44px',
                      background: 'var(--bg-main)', border: '1px solid var(--border)',
                      borderRadius: '12px', fontSize: '1rem',
                      transition: 'all 0.2s ease', outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    placeholder="name@farmtrace.io" 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    style={{
                      width: '100%', padding: '14px 16px 14px 44px',
                      background: 'var(--bg-main)', border: '1px solid var(--border)',
                      borderRadius: '12px', fontSize: '1rem',
                      transition: 'all 0.2s ease', outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoggingIn} style={{ 
                width: '100%', padding: '14px', marginTop: '8px',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                color: 'white', border: 'none', borderRadius: '12px',
                fontSize: '1rem', fontWeight: 600, cursor: isLoggingIn ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
                transition: 'transform 0.1s, box-shadow 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isLoggingIn ? 'Authenticating...' : (
                  <>
                    <LogIn size={18} /> Sign In Securely
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Request Access</Link>
            </div>

            {/* Quick Demo Credentials */}
            <div style={{ marginTop: '40px', padding: '16px', background: 'var(--bg-main)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 12px 0', letterSpacing: '0.05em' }}>Demo Access</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Admin</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>test@gmail.com / test</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Driver</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>driver@farmtrace.io / driver</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
