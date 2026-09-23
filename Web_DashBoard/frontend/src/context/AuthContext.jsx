import React, { createContext, useContext, useState, useCallback } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

const DEMO_USERS = {
  admin: {
    id: 'USR-ADMIN-001',
    name: 'Admin User',
    email: 'admin@farmtrace.io',
    role: 'admin',
    organization: 'FarmTrace Logistics',
    avatar: 'AU',
    permissions: ['fleet', 'telemetry', 'alerts', 'security', 'settings', 'simulation'],
    lastLogin: new Date().toISOString(),
  },
  driver: {
    id: 'USR-DRV-001',
    name: 'Rajesh Kumar',
    email: 'rajesh@farmtrace.io',
    role: 'driver',
    organization: 'FarmTrace Logistics',
    avatar: 'RK',
    phone: '+91 9876543210',
    vehicle: 'JH10AB1234',
    truckId: 'FT-TRK-001',
    lastLogin: new Date().toISOString(),
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ft_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();
      if (result.success) {
        const userData = { ...result.data, lastLogin: new Date().toISOString() };
        setUser(userData);
        localStorage.setItem('ft_user', JSON.stringify(userData));
        localStorage.setItem('ft_role', userData.role);
        localStorage.setItem('token', result.token);
        return userData;
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        const userData = { ...result.data, lastLogin: new Date().toISOString() };
        setUser(userData);
        localStorage.setItem('ft_user', JSON.stringify(userData));
        localStorage.setItem('ft_role', userData.role);
        localStorage.setItem('token', result.token);
        return userData;
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (err) {
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('ft_user');
    localStorage.removeItem('ft_role');
    localStorage.removeItem('token');
  }, []);

  const isAdmin = user?.role === 'admin';
  const isDriver = user?.role === 'driver';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, isDriver, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
