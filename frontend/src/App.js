import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExpenseForm from './pages/ExpenseForm';
import Approval from './pages/Approval';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';
import CreateSite from './pages/CreateSite';
import CreateCategory from './pages/CreateCategory';
import CreateUser from './pages/CreateUser';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import BudgetAlerts from './pages/BudgetAlerts';
import Help from './pages/Help';
import NavBar from './components/NavBar';
import TestSubmit from './components/TestSubmit';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import './App.css';
import ManageUsers from './pages/ManageUsers';
import EditUser from './pages/EditUser';

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login while saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function Layout() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const hideNav = !isAuthenticated || location.pathname === '/login';

  return (
    <>
      {!hideNav && <NavBar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <Navigate to="/dashboard" replace />
          </PrivateRoute>
        } />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="/submit-expense" element={
          <PrivateRoute>
            <ExpenseForm />
          </PrivateRoute>
        } />
        
        <Route path="/expense-form" element={
          <PrivateRoute>
            <Navigate to="/submit-expense" replace />
          </PrivateRoute>
        } />
        
        <Route path="/test-submit" element={
          <PrivateRoute>
            <TestSubmit />
          </PrivateRoute>
        } />
        
        <Route path="/approval" element={
          <PrivateRoute>
            <Approval />
          </PrivateRoute>
        } />
        
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminPanel />
          </PrivateRoute>
        } />
        
        <Route path="/create-site" element={
          <PrivateRoute>
            <CreateSite />
          </PrivateRoute>
        } />
        
        <Route path="/create-category" element={
          <PrivateRoute>
            <CreateCategory />
          </PrivateRoute>
        } />
        
        <Route path="/create-user" element={
          <PrivateRoute>
            <CreateUser />
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        
        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />
        
        <Route path="/reports" element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        } />
        
        <Route path="/budget-alerts" element={
          <PrivateRoute>
            <BudgetAlerts />
          </PrivateRoute>
        } />
        
        <Route path="/help" element={
          <PrivateRoute>
            <Help />
          </PrivateRoute>
        } />

        <Route path="/manage-users" element={
          <PrivateRoute>
            <ManageUsers />
          </PrivateRoute>
        } />
        
        <Route path="/edit-user/:userId" element={
          <PrivateRoute>
            <EditUser />
          </PrivateRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Layout />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
