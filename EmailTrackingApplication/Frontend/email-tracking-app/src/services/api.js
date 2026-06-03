// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// const API_BASE_URL = 'http://localhost:5000/apiEmail';
const API_BASE_URL = '/EmailTrackingApp/apiEmail';

export const authAPI = {
  login: async (usernameOrEmail, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    return response.json();
  },
};

export const companiesAPI = {
  getCompanies: async (userId, isDirector, recordType = 'Client') => {
    
    const response = await fetch(`${API_BASE_URL}/companies`, {
      headers: {
        'userId': userId,
        'isDirector': isDirector,
        'recordType': recordType,
      },
    });
    return response.json();
  },

  addCompany: async (userId, companyData) => {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'userId': userId,
      },
      body: JSON.stringify(companyData),
    });
    return response.json();
  },

  updateCompany: async (companyId, userId, isDirector, companyData) => {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'userId': userId,
        'isDirector': isDirector,
      },
      body: JSON.stringify(companyData),
    });
    return response.json();
  },

  deleteCompany: async (companyId, userId, isDirector) => {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      method: 'DELETE',
      headers: {
        'userId': userId,
        'isDirector': isDirector,
      },
    });
    return response.json();
  },

  checkDuplicate: async (userId, companyName, recordType) => {
    const response = await fetch(`${API_BASE_URL}/companies/check-duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'userId': userId,
      },
      body: JSON.stringify({ companyName, recordType }),
    });
    return response.json();
  },

  updateStatus: async (companyId, userId, isDirector, status) => {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'userId': userId,
        'isDirector': isDirector,
      },
      body: JSON.stringify({ status }),
    });
    return response.json();
  },

  markAsPending: async (companyId, userId, isDirector) => {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/mark-as-pending`, {
      method: 'PUT',
      headers: {
        'userId': userId,
        'isDirector': isDirector,
      },
    });
    return response.json();
  },

  getActivityLog: async (entityType, entityId, userId) => {
    const response = await fetch(`${API_BASE_URL}/activitylog?entityType=${entityType}&entityId=${entityId}`, {
      headers: { 'userId': userId },
    });
    return response.json();
  },

  getReviewCounts: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/companies/review-counts`, {
      headers: { 'userId': userId },
    });
    return response.json();
  },

  getPendingReview: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/companies/pending-review`, {
      headers: { 'userId': userId, 'isDirector': 'true' },
    });
    return response.json();
  },

  flagForReview: async (companyId, userId) => {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/flag-for-review`, {
      method: 'PUT',
      headers: {
        'userId': userId,
        'isDirector': 'false',
      },
    });
    return response.json();
  },

  approveCompany: async (companyId, userId, isDirector, status) => {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'userId': userId,
        'isDirector': isDirector,
      },
      body: JSON.stringify({ status }),
    });
    return response.json();
  },
};

export const adminUsersAPI = {
  getAllUsers: async (userId, isDirector) => {
    const response = await fetch(`${API_BASE_URL}/users/all`, {
      headers: { 'userId': userId, 'isDirector': isDirector },
    });
    return response.json();
  },
  createUser: async (userId, isDirector, data) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'userId': userId, 'isDirector': isDirector },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  updateUser: async (userId, isDirector, id, data) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'userId': userId, 'isDirector': isDirector },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  toggleActive: async (userId, isDirector, id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/toggle-active`, {
      method: 'PUT',
      headers: { 'userId': userId, 'isDirector': isDirector },
    });
    return response.json();
  },
  resetPassword: async (userId, isDirector, id, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/reset-password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'userId': userId, 'isDirector': isDirector },
      body: JSON.stringify({ newPassword }),
    });
    return response.json();
  },
};

export const prospectsAPI = {
  getProspects: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/prospects`, {
      headers: { 'userId': userId },
    });
    return response.json();
  },

  addProspect: async (userId, data) => {
    const response = await fetch(`${API_BASE_URL}/prospects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'userId': userId },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateProspect: async (prospectId, userId, data) => {
    const response = await fetch(`${API_BASE_URL}/prospects/${prospectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'userId': userId },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteProspect: async (prospectId, userId, isDirector) => {
    const response = await fetch(`${API_BASE_URL}/prospects/${prospectId}`, {
      method: 'DELETE',
      headers: { 'userId': userId, 'isDirector': isDirector },
    });
    return response.json();
  },

  getUsers: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: { 'userId': userId },
    });
    return response.json();
  },
};
