import React, { useState, useEffect } from 'react';
import './CompanyDetailModal.css';
import { companiesAPI } from '../services/api';

export const CompanyDetailModal = ({ isOpen, onClose, company, userId, isDirector, onCompanyUpdated, onShowToast }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (company) {
      setFormData({ ...company });
      setError('');
    }
  }, [company]);

  const canEdit = company && (isDirector || company.userId === userId);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleToggle = (fieldName) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.companyName?.trim()) {
      setError('Company Name is required.');
      return;
    }

    setLoading(true);
    try {
      const response = await companiesAPI.updateCompany(
        formData.id,
        userId,
        isDirector,
        {
          companyName: formData.companyName,
          region: formData.region,
          link: formData.link,
          emails: formData.emails,
          painPoints: formData.painPoints,
          exactNeeds: formData.exactNeeds,
          buyingTrigger: formData.buyingTrigger,
          bestPitchAngle: formData.bestPitchAngle,
          whyStrongFit: formData.whyStrongFit,
          isEmailSent: formData.isEmailSent,
          status: formData.status,
        }
      );

      if (response.success) {
        onCompanyUpdated();
        onShowToast('Company updated successfully.', 'success');
        onClose();
      } else {
        setError(response.message || 'Error updating company.');
      }
    } catch (err) {
      setError('Error updating company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await companiesAPI.deleteCompany(company.id, userId, isDirector);

      if (response.success) {
        onCompanyUpdated();
        onShowToast('Company deleted successfully.', 'success');
        onClose();
      } else {
        setError(response.message || 'Error deleting company.');
      }
    } catch (err) {
      setError('Error deleting company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !company) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="detail-modal-header">
          <h2>Company Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSave} className="detail-modal-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName || ''}
                  onChange={handleInputChange}
                  disabled={!canEdit || loading}
                  placeholder="Enter company name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="region">Region</label>
                <input
                  type="text"
                  id="region"
                  name="region"
                  value={formData.region || ''}
                  onChange={handleInputChange}
                  disabled={!canEdit || loading}
                  placeholder="Enter region"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="link">Company Link</label>
                <input
                  type="url"
                  id="link"
                  name="link"
                  value={formData.link || ''}
                  onChange={handleInputChange}
                  disabled={!canEdit || loading}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="emails">Email Addresses</label>
                <textarea
                  id="emails"
                  name="emails"
                  value={formData.emails || ''}
                  onChange={handleInputChange}
                  disabled={!canEdit || loading}
                  placeholder="Enter emails separated by commas or semicolons"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Sales Information */}
          <div className="form-section">
            <h3>Sales Information</h3>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="painPoints">Pain Points</label>
                <textarea
                  id="painPoints"
                  name="painPoints"
                  value={formData.painPoints || ''}
                  onChange={handleInputChange}
                  disabled={!canEdit || loading}
                  placeholder="Describe the company's pain points"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="exactNeeds">Exact Needs</label>
                <textarea
                  id="exactNeeds"
                  name="exactNeeds"
                  value={formData.exactNeeds || ''}
                  onChange={handleInputChange}
                  disabled={!canEdit || loading}
                  placeholder="Describe their exact needs"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="buyingTrigger">Buying Trigger</label>
                <textarea
                  id="buyingTrigger"
                  name="buyingTrigger"
                  value={formData.buyingTrigger || ''}
                  onChange={handleInputChange}
                  disabled={!canEdit || loading}
                  placeholder="What triggers their buying decision"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="bestPitchAngle">Best Pitch Angle</label>
                <textarea
                  id="bestPitchAngle"
                  name="bestPitchAngle"
                  value={formData.bestPitchAngle || ''}
                  onChange={handleInputChange}
                  disabled={!canEdit || loading}
                  placeholder="Your best pitch angle for this company"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="whyStrongFit">Why Strong Fit</label>
                <textarea
                  id="whyStrongFit"
                  name="whyStrongFit"
                  value={formData.whyStrongFit || ''}
                  onChange={handleInputChange}
                  disabled={!canEdit || loading}
                  placeholder="Why your solution is a strong fit"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="form-section">
            <h3>Status</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Email Sent</label>
                <div className="toggle-group">
                  <button
                    type="button"
                    className={`toggle-button ${formData.isEmailSent ? 'active' : ''}`}
                    onClick={() => handleToggle('isEmailSent')}
                    disabled={!canEdit || loading}
                  >
                    <span className={`toggle-indicator ${formData.isEmailSent ? 'yes' : 'no'}`}>
                      {formData.isEmailSent ? 'Yes' : 'No'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <div className="toggle-group">
                  <button
                    type="button"
                    className={`toggle-button ${formData.status ? 'active' : ''}`}
                    onClick={() => handleToggle('status')}
                    disabled={!canEdit || loading}
                  >
                    <span className={`toggle-indicator ${formData.status ? 'active-status' : 'inactive-status'}`}>
                      {formData.status ? 'Active' : 'Inactive'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            {canEdit && (
              <>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="button button-danger"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Delete Company
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
