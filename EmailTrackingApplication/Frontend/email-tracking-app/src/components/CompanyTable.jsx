import React, { useState, useEffect } from 'react';
import './CompanyTable.css';
import { CompanyDetailModal } from './CompanyDetailModal';

const SORT_KEYS = {
  'Client Name':    'companyName',
  'Region':         'region',
  'Status':         'status',
  'Prospector':     'username',
  'Admin Approval': 'isApproved',
  'Date Added':     'createdAt',
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

export const CompanyTable = ({
  companies,
  userId,
  isDirector,
  onCompanyUpdated,
  onCompanyDeleted,
  onShowToast,
  recordType = 'Client',
}) => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [companies, rowsPerPage]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const sortedCompanies = [...companies].sort((a, b) => {
    if (!sortCol) return 0;
    const key = SORT_KEYS[sortCol];
    const av = (a[key] ?? '').toString().toLowerCase();
    const bv = (b[key] ?? '').toString().toLowerCase();
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const arrow = (col) => sortCol === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const totalPages = Math.max(1, Math.ceil(sortedCompanies.length / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedCompanies = sortedCompanies.slice(startIndex, endIndex);

  const parseEmails = (emailString) => {
    if (!emailString) return [];
    return emailString.split(/[,;]/).map((e) => e.trim()).filter((e) => e);
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-pending';
    return 'status-' + status.toLowerCase().replace(/\s+/g, '-');
  };

  const getApprovalClass = (isApproved, isReadyForReview) => {
    if (isApproved === 1) return 'status-approved';
    if (isReadyForReview) return 'status-ready-for-review';
    return 'status-unapproved';
  };

  const getApprovalLabel = (isApproved, isReadyForReview) => {
    if (isApproved === 1) return 'Approved';
    if (isReadyForReview) return 'Ready for Review';
    return 'Not Submitted';
  };

  const handleRowClick = (company) => {
    setSelectedCompany(company);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCompany(null);
  };

  const handleCompanyUpdated = () => {
    onCompanyUpdated();
    handleCloseDetailModal();
  };

  return (
    <>
      <div className="table-container">
        {companies.length === 0 ? (
          <div className="empty-state">
            <p>No {recordType.toLowerCase()}s found. Add your first {recordType.toLowerCase()} to get started!</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="company-table">
                <colgroup>
                  <col />
                  <col />
                  <col />
                  <col />
                  <col />
                  <col />
                  <col style={{ width: '110px' }} />
                </colgroup>
                <thead>
                  <tr>
                    {['Client Name', 'Region'].map(col => (
                      <th key={col} className="sortable-th" onClick={() => handleSort(col)}>{col}{arrow(col)}</th>
                    ))}
                    <th className="col-contacts">Contacts</th>
                    {['Status', 'Prospector', 'Admin Approval', 'Date Added'].map(col => (
                      <th key={col} className="col-status sortable-th" onClick={() => handleSort(col)}>{col}{arrow(col)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedCompanies.map((company) => {
                    const emails = parseEmails(company.emails);
                    return (
                      <tr
                        key={company.id}
                        className={Number(company.userId) === Number(userId) || isDirector ? 'clickable-row' : 'non-clickable-row'}
                        onClick={
                          Number(company.userId) === Number(userId) || isDirector
                            ? () => handleRowClick(company)
                            : undefined
                        }
                      >
                        <td className="company-name-cell">
                          {company.link ? (
                            <a
                              href={company.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="company-link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {company.companyName}
                            </a>
                          ) : (
                            company.companyName
                          )}
                        </td>

                        <td>{company.region}</td>

                        <td className="contacts-cell">
                          <div className="email-count-badge-wrapper">
                            <div className="email-count-badge">
                              {emails.length} contact{emails.length !== 1 ? 's' : ''}
                            </div>
                            {emails.length > 0 && (
                              <div className="email-tooltip">
                                {emails.map((email, i) => (
                                  <span key={i} className="email-tooltip-item">{email}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="status-cell">
                          <span className={`status-badge ${getStatusClass(company.status)}`}>
                            {company.status || 'Pending'}
                          </span>
                        </td>

                        <td className="owner-cell">{company.username || '—'}</td>

                        <td className="status-cell">
                          <span className={`status-badge ${getApprovalClass(company.isApproved, company.isReadyForReview)}`}>
                            {getApprovalLabel(company.isApproved, company.isReadyForReview)}
                          </span>
                        </td>

                        <td className="owner-cell" style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
                          {formatDate(company.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pagination-container">
              <div className="pagination-info">
                Showing {Math.min(startIndex + 1, sortedCompanies.length)}–{Math.min(endIndex, sortedCompanies.length)} of {sortedCompanies.length}
              </div>
              <div className="pagination-controls">
                <label className="rows-label">Rows:</label>
                <select className="rows-select" value={rowsPerPage} onChange={(e) => setRowsPerPage(Number(e.target.value))}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <button className="page-button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                  Prev
                </button>
                <span className="page-indicator">Page {page} of {totalPages}</span>
                <button className="page-button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <CompanyDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        company={selectedCompany}
        userId={userId}
        isDirector={isDirector}
        onCompanyUpdated={handleCompanyUpdated}
        onShowToast={onShowToast}
        recordType={recordType}
      />
    </>
  );
};
