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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const canEdit = (company) => isDirector || company.userId === userId;

  const parseEmails = (emailString) => {
    if (!emailString) return [];
    return emailString.split(/[,;]/).map((email) => email.trim()).filter((email) => email);
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
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Region</th>
                  <th>Contacts</th>
                  <th>Email Sent</th>
                  <th>Status</th>
                  {isDirector && <th>Owner</th>}
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr
                    key={company.id}
                    className="clickable-row"
                    onClick={() => handleRowClick(company)}
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
                      <div className="email-count-badge">
                        {parseEmails(company.emails).length} contact(s)
                      </div>
                    </td>
                    <td className="email-sent-cell">
                      <span className={`toggle-badge ${company.isEmailSent ? 'yes' : 'no'}`}>
                        {company.isEmailSent ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td className="status-cell">
                      <span className={`status-toggle ${company.status ? 'active' : 'inactive'}`}>
                        {company.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isDirector && (
                      <td className="owner-cell">{company.username}</td>
                    )}
                  </tr>
                ))}
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
