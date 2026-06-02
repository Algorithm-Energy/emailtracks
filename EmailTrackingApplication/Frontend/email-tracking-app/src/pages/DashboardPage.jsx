import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import { CompanyTable } from '../components/CompanyTable';
import { AddCompanyModal } from '../components/AddCompanyModal';
import { Toast, useToast } from '../components/Toast';
import { companiesAPI } from '../services/api';
import { authUtils } from '../services/authUtils';

export const DashboardPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [selectedTab, setSelectedTab] = useState('Company');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCompanies();
  }, [user, navigate]);

  useEffect(() => {
      if (user) fetchCompanies();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTab]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await companiesAPI.getCompanies(user.userId, user.isDirector, selectedTab);
      if (response.success) {
        setCompanies(response.data);
      } else {
        showToast(`Error loading ${selectedTab.toLowerCase()}s.`, 'error');
      }
    } catch (err) {
      showToast(`Error loading ${selectedTab.toLowerCase()}s.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authUtils.removeUser();
    onLogout();
    navigate('/login');
  };

  const handleAddCompany = (newCompany) => {
    if (!newCompany || newCompany.recordType !== selectedTab) return;
    setCompanies((prev) => [...prev, newCompany]);
    showToast(`${selectedTab} added successfully!`, 'success');
  };

  const handleCompanyUpdated = () => {
    fetchCompanies();
  };

  const handleCompanyDeleted = () => {
    fetchCompanies();
  };

  const filteredCompanies = companies.filter((company) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    const values = [
      company.companyName,
      company.region,
      company.link,
      company.emails,
      company.username,
      company.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return values.includes(query);
  });

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Dashboard</h1>
            <p className="welcome-message">
              Welcome, <strong>{user?.username}</strong>
              {user?.isDirector && <span className="director-badge">Director</span>}
            </p>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-toolbar">
          <div className="toolbar-left">
            <div className="tabs">
              <button className={`tab ${selectedTab === 'Company' ? 'active' : ''}`} onClick={() => { setSelectedTab('Company'); setSearchQuery(''); }}>
                Company
              </button>
              <button className={`tab ${selectedTab === 'Client' ? 'active' : ''}`} onClick={() => { setSelectedTab('Client'); setSearchQuery(''); }}>
                Client
              </button>
            </div>
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder={`Search ${selectedTab}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <span className="company-count">
              Showing {filteredCompanies.length} of {companies.length} record(s)
            </span>
          </div>
          <button
            className="add-company-button"
            onClick={() => setIsModalOpen(true)}
          >
            + Add {selectedTab}
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading companies...</p>
          </div>
        ) : (
          <CompanyTable
            companies={filteredCompanies}
            userId={user?.userId}
            isDirector={user?.isDirector}
            onCompanyUpdated={handleCompanyUpdated}
            onCompanyDeleted={handleCompanyDeleted}
            onShowToast={showToast}
            recordType={selectedTab}
          />
        )}
      </main>

      <AddCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={user?.userId}
        onCompanyAdded={handleAddCompany}
        recordType={selectedTab}
      />

      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};
