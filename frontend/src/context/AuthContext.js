import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validate token and initialize user
  const validateToken = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      setIsLoading(false);
      return;
    }

    try {
      // Try to get current user profile to validate token
      const response = await authAPI.getProfile();
      if (response.data.success) {
        const userData = response.data.data;
        console.log('Token validated, user data:', userData);
      setUser(userData);
      setIsAuthenticated(true);
        // Update localStorage with fresh user data
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error('Invalid token response');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize user from localStorage
  useEffect(() => {
    validateToken();
  }, []);

  const login = (userData, token) => {
    console.log('Logging in user with data:', userData);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Refresh token periodically
  useEffect(() => {
    if (isAuthenticated && user) {
      const refreshInterval = setInterval(async () => {
        try {
          const response = await authAPI.getProfile();
          if (response.data.success) {
            const userData = response.data.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('Token refreshed successfully');
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          // Don't logout on refresh failure, just log the error
        }
      }, 5 * 60 * 1000); // Refresh every 5 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated, user]);

  const getUserRole = () => {
    const role = (user?.role || 'submitter').toUpperCase();
    console.log('Current user role:', role);
    return role;
  };

  const hasPermission = (requiredRole) => {
    const userRole = getUserRole().toLowerCase();
    const roleHierarchy = {
      'submitter': 1,
      'l1_approver': 2,
      'l2_approver': 3,
      'l3_approver': 4,
      'l4_approver': 5
    };
    
    const hasPermission = roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    console.log(`Checking permission: ${userRole} >= ${requiredRole} = ${hasPermission}`);
    return hasPermission;
  };

  const canApproveLevel = (level) => {
    const userRole = getUserRole().toLowerCase();
    // L4 Approver cannot approve any level
    if (userRole === 'l4_approver') {
      return false;
    }
    return userRole === `l${level}_approver`;
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'submitter': 'Expense Submitter',
      'l1_approver': 'Regional Manager',
      'l2_approver': 'Admin',
      'l3_approver': 'Finance Manager',
      'l4_approver': 'L4 Approver'
    };
    return roleNames[role] || role;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getUserRole,
    hasPermission,
    canApproveLevel,
    getRoleDisplayName
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 