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
