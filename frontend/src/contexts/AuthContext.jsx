import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const adminStatus = localStorage.getItem('isAdmin') === 'true';
      if (token) {
        setIsAuthenticated(true);
        setIsAdmin(adminStatus);
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (token, adminStatus) => {
    localStorage.setItem('token', token);
    localStorage.setItem('isAdmin', adminStatus);
    setIsAuthenticated(true);
    setIsAdmin(adminStatus);
  };

  const logout = () => {
    try {
      localStorage.clear(); // Clear all items from localStorage
      console.log('Logged out, localStorage cleared');
      setIsAuthenticated(false);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);