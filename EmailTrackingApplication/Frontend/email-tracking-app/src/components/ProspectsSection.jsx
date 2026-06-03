import React, { useState, useEffect } from 'react';
import { ProspectTable } from './ProspectTable';
import { AddProspectModal } from './AddProspectModal';
import { prospectsAPI } from '../services/api';
import { exportToCSV } from '../services/csvExport';

export const ProspectsSection = ({ user, onShowToast }) => {
  const [prospects, setProspects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProspects();
    fetchUsers();
  }, []);

  const fetchProspects = async () => {
    setLoading(true);
    try {
      const response = await prospectsAPI.getProspects(user.userId);
      if (response.success) setProspects(response.data);
      else onShowToast('Error loading prospects.', 'error');
    } catch {
      onShowToast('Error loading prospects.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await prospectsAPI.getUsers(user.userId);
      if (response.success) setUsers(response.data);
    } catch {}
  };

  const handleExportCSV = () => {
    exportToCSV(
      ['Prospect', 'Type', 'Contact Person', 'Email', 'Phone', 'Source', 'Referred By', 'Status', 'Assigned To', 'Next Action', 'Next Action Date', 'Created By', 'Date Added', 'Last Updated'],
      filteredProspects.map(p => [
        p.prospectName, p.prospectType, p.contactPerson, p.contactEmail, p.contactPhone,
        p.source, p.referredBy, p.status, p.assignedToUsername, p.nextAction,
        p.nextActionDate ? new Date(p.nextActionDate).toLocaleDateString() : '',
        p.createdByUsername,
        p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '',
        p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '',
      ]),
      'Prospects_export'
    );
  };

  const handleProspectAdded = (newProspect) => {
    setProspects((prev) => [newProspect, ...prev]);
    onShowToast('Prospect added successfully!', 'success');
    setIsModalOpen(false);
  };

  const filteredProspects = prospects.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return [p.prospectName, p.contactPerson, p.source, p.status, p.assignedToUsername, p.createdByUsername]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q);
  });

  return (
    <>
      <div className="dashboard-toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search prospects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="company-count">
            Showing {filteredProspects.length} of {prospects.length} record(s)
          </span>
        </div>
        <div className="toolbar-actions">
          <button className="export-button" onClick={handleExportCSV}>↓ Export CSV</button>
          <button className="add-company-button" onClick={() => setIsModalOpen(true)}>+ Add Prospect</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading prospects...</p>
        </div>
      ) : (
        <ProspectTable
          prospects={filteredProspects}
          userId={user.userId}
          isDirector={user.isDirector}
          users={users}
          onRefresh={fetchProspects}
          onShowToast={onShowToast}
        />
      )}

      <AddProspectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={user.userId}
        users={users}
        onProspectAdded={handleProspectAdded}
      />
    </>
  );
};
