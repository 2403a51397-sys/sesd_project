import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('fitsphere_user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('fitsphere_token') || localStorage.getItem('fitcrowd_token') || null;
  });

  const [loading, setLoading] = useState(true);

  const saveSession = (jwtToken, userData) => {
    localStorage.setItem('fitsphere_token', jwtToken);
    localStorage.setItem('fitcrowd_token', jwtToken);
    localStorage.setItem('fitsphere_auth', 'true');
    localStorage.setItem('fitsphere_user_profile', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const clearSession = () => {
    localStorage.removeItem('fitsphere_token');
    localStorage.removeItem('fitcrowd_token');
    localStorage.removeItem('fitsphere_auth');
    localStorage.removeItem('fitsphere_user_profile');
    setToken(null);
    setUser(null);
  };

  // Restore session from token on mount
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getMe();
          if (res?.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('fitsphere_user_profile', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid, logging out.');
          clearSession();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const loginWithEmail = async (email, password) => {
    const res = await api.login(email, password);
    const { token: jwtToken, user: userData } = res.data;
    saveSession(jwtToken, userData);
    return { token: jwtToken, user: userData };
  };

  const loginAsDemoRole = async (role) => {
    const res = await api.loginDemo(role);
    const { token: jwtToken, user: userData } = res.data;
    saveSession(jwtToken, userData);
    return { token: jwtToken, user: userData };
  };

  const signInWithGoogle = async (selectedRole = 'client') => {
    try {
      const res = await api.socialLogin('google', selectedRole);
      const { token: jwtToken, user: userData } = res.data;
      saveSession(jwtToken, userData);
      return { token: jwtToken, user: userData };
    } catch (err) {
      // Fallback to demo login if backend social endpoint fails
      return await loginAsDemoRole(selectedRole);
    }
  };

  const signInWithFacebook = async (selectedRole = 'client') => {
    try {
      const res = await api.socialLogin('facebook', selectedRole);
      const { token: jwtToken, user: userData } = res.data;
      saveSession(jwtToken, userData);
      return { token: jwtToken, user: userData };
    } catch (err) {
      // Fallback
      return await loginAsDemoRole(selectedRole);
    }
  };

  const registerWithEmail = async (payload) => {
    const res = await api.register(payload);
    const { token: jwtToken, user: userData, message } = res.data;
    saveSession(jwtToken, userData);
    return { token: jwtToken, user: userData, message };
  };

  const logout = () => {
    clearSession();
  };

  const isAdmin = user?.role === 'admin';
  const isTrainer = user?.role === 'trainer';
  const isClient = user?.role === 'client' || user?.role === 'member';
  const isPendingTrainer = isTrainer && user?.is_active === false;

  return (
    <AuthContext.Provider
      value={{
        user,
        userData: user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        isTrainer,
        isClient,
        isPendingTrainer,
        login: loginWithEmail,
        loginWithEmail,
        loginAsDemoRole,
        signInWithGoogle,
        signInWithFacebook,
        register: registerWithEmail,
        registerWithEmail,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
