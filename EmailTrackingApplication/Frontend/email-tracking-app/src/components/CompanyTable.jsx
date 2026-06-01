import React, { useState } from 'react';
import './CompanyTable.css';
import { CompanyDetailModal } from './CompanyDetailModal';

export const CompanyTable = ({
  companies,
  userId,
  isDirector,
  onCompanyUpdated,
  onCompanyDeleted,
  onShowToast,
}) => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); console.log('Rendering CompanyTable with companies:', companies);
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

  return (
    <>
      <div className="table-container">
        {companies.length === 0 ? (
          <div className="empty-state">
            <p>No companies found. Add your first company to get started!</p>
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
                  <th>Company Name</th>
                  <th>Region</th>
                  <th className="col-contacts">Contacts</th>
                  <th className="col-status">Status</th>
                  <th className="col-owner">Prospector</th>
                  <th className="col-owner">Admin Approval</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => {
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
      </div>

      <CompanyDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        company={selectedCompany}
        userId={userId}
        isDirector={isDirector}
        onCompanyUpdated={handleCompanyUpdated}
        onShowToast={onShowToast}
      />
    </>
  );
};
