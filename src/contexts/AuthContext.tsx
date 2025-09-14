import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyAdminOTP } from '../utils/database';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, otp: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  const login = async (email: string, otp: string): Promise<boolean> => {
    const isValid = await verifyAdminOTP(email.toLowerCase(), otp);
    if (isValid) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};