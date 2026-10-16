import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../services/types';
import { storage } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  loginAsDemo: (role: UserRole) => boolean;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  resetDemoData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return storage.getCurrentUser() || storage.getUsers().find(u => u.role === 'entrepreneur') || null;
  });

  useEffect(() => {
    const user = storage.getCurrentUser() || storage.getUsers().find(u => u.role === 'entrepreneur') || null;
    if (user && !storage.getCurrentUser()) {
      storage.setCurrentUser(user);
    }
    setCurrentUser(user);
  }, []);

  const loginAsDemo = (targetRole: UserRole): boolean => {
    const users = storage.getUsers();
    const matchedUser = users.find(u => u.role === targetRole);
    if (matchedUser) {
      storage.setCurrentUser(matchedUser);
      setCurrentUser(matchedUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    storage.setCurrentUser(null);
    setCurrentUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return currentUser.permissions.includes(permission);
  };

  const resetDemoData = () => {
    storage.initIfEmpty(true);
    setCurrentUser(storage.getCurrentUser());
  };

  const role: UserRole = currentUser ? currentUser.role : 'public';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isAuthenticated: !!currentUser,
        loginAsDemo,
        logout,
        hasPermission,
        resetDemoData
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
