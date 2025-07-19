import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Expense API calls
export const expenseAPI = {
  create: (data) => api.post('/expenses/create', data),
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/expenses/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getPendingApprovals: () => api.get('/expenses/pending'),
  approveExpense: (id, data) => api.put(`/expenses/${id}/approve`, data),
  rejectExpense: (id, data) => api.put(`/expenses/${id}/approve`, data),
  getAll: () => api.get('/expenses'),
  getById: (id) => api.get(`/expenses/${id}`),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// Dashboard API calls
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getStats: (params) => api.get('/dashboard/expense-stats', { params }),
  getBudgetOverview: () => api.get('/dashboard/budget-overview'),
  getPendingApprovals: () => api.get('/dashboard/pending-approvals'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
};

// User API calls
export const userAPI = {
  createUser: (data) => api.post('/users/create', data),
  getUsers: () => api.get('/users/all'),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  changePassword: (id, data) => api.post(`/users/${id}/change-password`, data),
};

// Site API calls
export const siteAPI = {
  getAll: () => api.get('/sites/all'),
  getById: (id) => api.get(`/sites/${id}`),
  create: (data) => api.post('/sites/create', data),
  update: (id, data) => api.put(`/sites/${id}`, data),
  delete: (id) => api.delete(`/sites/${id}`),
  updateBudget: (id, data) => api.put(`/sites/${id}/budget`, data),
  getBudgetAlerts: () => api.get('/sites/budget-alerts'),
};

// Notification API calls
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data) => api.put('/notifications/preferences', data),
  sendCustom: (data) => api.post('/notifications/send', data),
};

// Report API calls
export const reportAPI = {
  getExpenseSummary: (params) => api.get('/reports/expense-summary', { params }),
  getExpenseDetails: (params) => api.get('/reports/expense-details', { params }),
  getBudgetUtilization: (params) => api.get('/reports/budget-utilization', { params }),
  getVehicleKM: (params) => api.get('/reports/vehicle-km', { params }),
  getApprovalAnalytics: (params) => api.get('/reports/approval-analytics', { params }),
};

// Category API calls
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

// Approval API calls
export const approvalAPI = {
  getPending: () => api.get('/expenses/pending')
};

export default api; 