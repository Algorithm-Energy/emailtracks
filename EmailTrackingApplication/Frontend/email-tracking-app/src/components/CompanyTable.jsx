import React, { useState, useEffect } from 'react';
import './CompanyTable.css';
import { CompanyDetailModal } from './CompanyDetailModal';

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
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const parseEmails = (emailString) => {
    if (!emailString) return [];
    return emailString.split(/[,;]/).map((e) => e.trim()).filter((e) => e);
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-pending';
    return 'status-' + status.toLowerCase().replace(/\s+/g, '-');
  };

  const getApprovalClass = (status) => {
    if (!status) return 'status-unapproved';
    const adminStatus = status === 1 ? 'approved' : 'unapproved';
    return 'status-' + adminStatus;
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

  useEffect(() => {
    // Reset to page 1 when the company list or rows per page changes
    setPage(1);
  }, [companies, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(companies.length / rowsPerPage));
  if (page > totalPages) setPage(totalPages);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedCompanies = companies.slice(startIndex, endIndex);

  return (
    <>
      <div className="table-container">
        {companies.length === 0 ? (
          <div className="empty-state">
            <p>No {recordType.toLowerCase()}s found. Add your first {recordType.toLowerCase()} to get started!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="company-table">
              <colgroup>
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>{recordType} Name</th>
                  <th>Region</th>
                  <th className="col-contacts">Contacts</th>
                  <th className="col-status">Status</th>
                  <th className="col-owner">Prospector</th>
                  <th className="col-owner">Admin Approval</th>
                </tr>
              </thead>
              <tbody>
                {displayedCompanies.map((company) => {
                  const emails = parseEmails(company.emails);
                  return (
                    <tr
                      key={company.id}
                      className={Number(company.userId) === Number(userId) || isDirector ? "clickable-row" : "non-clickable-row"}
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
                        <span className={`status-badge ${getApprovalClass(company.isApproved)}`}>
                          
                          {getApprovalClass(company.isApproved) === 'status-approved' ? 'Approved' : 'Under Review'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
            {companies.length > 0 && (
              <div className="pagination-container">
                <div className="pagination-info">
                  Showing {Math.min(startIndex + 1, companies.length)}-{Math.min(endIndex, companies.length)} of {companies.length}
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
