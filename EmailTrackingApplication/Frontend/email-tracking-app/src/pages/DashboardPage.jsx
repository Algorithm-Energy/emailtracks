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
        showToast('Error loading companies.', 'error');
      }
    } catch (err) {
      showToast('Error loading companies.', 'error');
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
    showToast('Company added successfully!', 'success');
  };

  const handleCompanyUpdated = () => {
    fetchCompanies();
  };

  const handleCompanyDeleted = () => {
    fetchCompanies();
  };

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
              <button className={`tab ${selectedTab === 'Company' ? 'active' : ''}`} onClick={() => { setSelectedTab('Company'); }}>
                Company
              </button>
              <button className={`tab ${selectedTab === 'Client' ? 'active' : ''}`} onClick={() => { setSelectedTab('Client'); }}>
                Client
              </button>
            </div>
            <span className="company-count">{companies.length} record(s)</span>
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
            companies={companies}
            userId={user?.userId}
            isDirector={user?.isDirector}
            onCompanyUpdated={handleCompanyUpdated}
            onCompanyDeleted={handleCompanyDeleted}
            onShowToast={showToast}
          />
        )}
      </main>

      <AddCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={user?.userId}
        onCompanyAdded={handleAddCompany}
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
