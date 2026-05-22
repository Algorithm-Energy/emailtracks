const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  getCompanies: async (userId, isDirector) => {
    console.log('Fetching companies with userId:', userId, 'isDirector:', isDirector);
    const response = await fetch(`${API_BASE_URL}/companies`, {
      headers: {
        'userId': userId,
        'isDirector': isDirector,
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

  checkDuplicate: async (userId, companyName) => {
    const response = await fetch(`${API_BASE_URL}/companies/check-duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'userId': userId,
      },
      body: JSON.stringify({ companyName }),
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
};
