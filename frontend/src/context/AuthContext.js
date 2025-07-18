import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      console.log('Initializing user from localStorage:', userData);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userData) => {
    console.log('Logging in user with data:', userData);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

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
      'l3_approver': 4
    };
    
    const hasPermission = roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    console.log(`Checking permission: ${userRole} >= ${requiredRole} = ${hasPermission}`);
    return hasPermission;
  };

  const canApproveLevel = (level) => {
    const userRole = getUserRole().toLowerCase();
    return userRole === `l${level}_approver`;
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'submitter': 'Expense Submitter',
      'l1_approver': 'Regional Manager',
      'l2_approver': 'Admin',
      'l3_approver': 'Finance Manager'
    };
    return roleNames[role] || role;
  };

  const value = {
    user,
    isAuthenticated,
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