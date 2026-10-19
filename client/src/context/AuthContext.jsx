import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

const defaultUser = {
  name: 'Study Mate',
  email: 'vault@learnvault.local',
  role: 'admin',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(defaultUser);
  const [token, setToken] = useState(localStorage.getItem('learnvault_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('learnvault_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res?.user) setUser(res.user);
        } catch {
          // Keep defaultUser
        }
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('learnvault_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('learnvault_token');
    setToken(null);
    setUser(null);
  };

  const quickLogin = async (type) => {
    if (type === 'admin') {
      await login('admin@learnvault.local', 'adminpassword123');
    } else {
      await login('friend@learnvault.local', 'friendpassword123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        quickLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
