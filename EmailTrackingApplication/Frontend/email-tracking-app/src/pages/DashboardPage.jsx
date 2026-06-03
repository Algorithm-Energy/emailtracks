import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import { CompanyTable } from '../components/CompanyTable';
import { AddCompanyModal } from '../components/AddCompanyModal';
import { ProspectsSection } from '../components/ProspectsSection';
import { PendingReviewPanel } from '../components/PendingReviewPanel';
import { UserManagement } from '../components/UserManagement';
import { Toast, useToast } from '../components/Toast';
import { companiesAPI } from '../services/api';
import { authUtils } from '../services/authUtils';
import { exportToCSV } from '../services/csvExport';

export const DashboardPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [selectedTab, setSelectedTab] = useState('Client');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewCounts, setReviewCounts] = useState({ client: 0, agent: 0 });
  const [pendingReview, setPendingReview] = useState([]);
  const [showUserMgmt, setShowUserMgmt] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchCompanies();
    if (user.isDirector) {
      fetchReviewCounts();
      fetchPendingReview();
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && selectedTab !== 'Prospects') fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await companiesAPI.getCompanies(user.userId, user.isDirector, selectedTab);
      if (response.success) setCompanies(response.data);
      else showToast(`Error loading ${selectedTab.toLowerCase()}s.`, 'error');
    } catch { showToast(`Error loading ${selectedTab.toLowerCase()}s.`, 'error'); }
    finally { setLoading(false); }
  };

  const fetchReviewCounts = async () => {
    try {
      const res = await companiesAPI.getReviewCounts(user.userId);
      if (res.success) setReviewCounts(res.data);
    } catch {}
  };

  const fetchPendingReview = async () => {
    try {
      const res = await companiesAPI.getPendingReview(user.userId);
      if (res.success) setPendingReview(res.data);
    } catch {}
  };

  const refreshAdminData = () => {
    if (user.isDirector) { fetchReviewCounts(); fetchPendingReview(); }
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

  const handleCompanyUpdated = () => { fetchCompanies(); refreshAdminData(); };
  const handleCompanyDeleted = () => { fetchCompanies(); refreshAdminData(); };

  const filteredCompanies = companies.filter((company) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return [company.companyName, company.region, company.link, company.emails, company.username, company.status]
      .filter(Boolean).join(' ').toLowerCase().includes(query);
  });

  const modalControl = () => {
    const userCompanyCount = companies.filter(cc => cc.userId === user.userId && cc.isApproved == 0).length;
    if (!user.isDirector && userCompanyCount >= 3) {
      showToast(`You already have 3 ${selectedTab.toLowerCase()} records under review.`, 'error');
      return;
    }
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    exportToCSV(
      ['Name', 'Region', 'Emails', 'Status', 'Admin Approval', 'Prospector', 'Date Added', 'Last Updated'],
      filteredCompanies.map(c => [
        c.companyName, c.region, c.emails, c.status,
        c.isApproved === 1 ? 'Approved' : c.isReadyForReview ? 'Ready for Review' : 'Not Submitted',
        c.username,
        c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
        c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : '',
      ]),
      `${selectedTab}s_export`
    );
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Dashboard</h1>
            <p className="welcome-message">
              Welcome, <strong>{user?.username}</strong>
              {user?.isDirector && <span className="director-badge">Admin</span>}
            </p>
          </div>
          <div className="header-actions">
            {user?.isDirector && (
              <button className="manage-users-button" onClick={() => setShowUserMgmt(v => !v)}>
                {showUserMgmt ? '← Back to Dashboard' : '⚙ Manage Users'}
              </button>
            )}
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {showUserMgmt ? (
        <main className="dashboard-main">
          <UserManagement userId={user.userId} onShowToast={showToast} />
        </main>
      ) : (
        <main className="dashboard-main">
          {user?.isDirector && pendingReview.length > 0 && (
            <PendingReviewPanel
              records={pendingReview}
              userId={user.userId}
              isDirector={user.isDirector}
              onRefresh={handleCompanyUpdated}
              onShowToast={showToast}
            />
          )}

          <div className="dashboard-toolbar">
            <div className="toolbar-left">
              <div className="tabs">
                <button className={`tab ${selectedTab === 'Client' ? 'active' : ''}`} onClick={() => { setSelectedTab('Client'); setSearchQuery(''); }}>
                  Client
                  {user?.isDirector && reviewCounts.client > 0 && (
                    <span className="tab-badge">{reviewCounts.client}</span>
                  )}
                </button>
                <button className={`tab ${selectedTab === 'Agent' ? 'active' : ''}`} onClick={() => { setSelectedTab('Agent'); setSearchQuery(''); }}>
                  Agent
                  {user?.isDirector && reviewCounts.agent > 0 && (
                    <span className="tab-badge">{reviewCounts.agent}</span>
                  )}
                </button>
                <button className={`tab ${selectedTab === 'Prospects' ? 'active' : ''}`} onClick={() => { setSelectedTab('Prospects'); setSearchQuery(''); }}>
                  Prospects
                </button>
              </div>
              {selectedTab !== 'Prospects' && (
                <>
                  <div className="search-box">
                    <input type="text" className="search-input" placeholder={`Search ${selectedTab}s...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <span className="company-count">Showing {filteredCompanies.length} of {companies.length} record(s)</span>
                </>
              )}
            </div>
            <div className="toolbar-actions">
              {selectedTab !== 'Prospects' && (
                <>
                  <button className="export-button" onClick={handleExportCSV}>↓ Export CSV</button>
                  <button className="add-company-button" onClick={modalControl}>+ Add {selectedTab}</button>
                </>
              )}
            </div>
          </div>

          {selectedTab === 'Prospects' ? (
            <ProspectsSection user={user} onShowToast={showToast} />
          ) : loading ? (
            <div className="loading-state"><div className="spinner"></div><p>Loading {selectedTab.toLowerCase()}s...</p></div>
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
      )}

      <AddCompanyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userId={user?.userId} onCompanyAdded={handleAddCompany} recordType={selectedTab} />

      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} duration={toast.duration} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
};
