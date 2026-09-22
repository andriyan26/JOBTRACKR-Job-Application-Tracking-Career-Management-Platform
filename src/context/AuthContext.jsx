import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCurrentUser,
  loginUser,
  registerUser,
  setCurrentUser,
  updateUserProfile,
  importSyncCode
} from '../services/storageService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setUser] = useState(() => getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setUser(user);
    setIsAuthenticated(!!user);
  }, []);

  const login = (email, password) => {
    const res = loginUser(email, password);
    if (res.success) {
      setUser(res.user);
      setIsAuthenticated(true);
    }
    return res;
  };

  const register = (name, email, password) => {
    const res = registerUser(name, email, password);
    if (res.success) {
      setUser(res.user);
      setIsAuthenticated(true);
    }
    return res;
  };

  const loginWithSyncCode = (syncCode) => {
    const res = importSyncCode(syncCode);
    if (res.success) {
      setUser(res.user);
      setIsAuthenticated(true);
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const switchUser = (userId) => {
    setCurrentUser(userId);
    const user = getCurrentUser();
    setUser(user);
    setIsAuthenticated(true);
  };

  const updateProfile = (data) => {
    if (!currentUser) return null;
    const updated = updateUserProfile(currentUser.id, data);
    if (updated) {
      setUser(updated);
    }
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        register,
        loginWithSyncCode,
        logout,
        switchUser,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
