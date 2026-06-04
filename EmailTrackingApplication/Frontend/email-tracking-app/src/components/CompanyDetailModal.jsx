import React, { useState, useEffect } from 'react';
import './CompanyDetailModal.css';
import { companiesAPI } from '../services/api';
import { authUtils } from '../services/authUtils';
import { ActivityTimeline } from './ActivityTimeline';

export const CompanyDetailModal = ({ isOpen, onClose, company, userId, isDirector, onCompanyUpdated, onShowToast, recordType= 'Client' }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (company) {
      setFormData({ ...company });
      setError('');
      console.log('Loaded company data into form:', company);
    }
  }, [company]);

  const canEdit = company && (isDirector || company.userId === userId);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.companyName?.trim()) {
      setError(`${recordType} Name is required.`);
      return;
    }

    setLoading(true);
    try {
      const response = await companiesAPI.updateCompany(
        formData.id,
        userId,
        isDirector,
        {
          companyName:    formData.companyName,
          region:         formData.region,
          link:           formData.link,
          emails:         formData.emails,
          status:         formData.status,
          painPoints:     formData.painPoints,
          exactNeeds:     formData.exactNeeds,
          buyingTrigger:  formData.buyingTrigger,
          bestPitchAngle: formData.bestPitchAngle,
          whyStrongFit:   formData.whyStrongFit,
          emailSub:       formData.emailSub,
          emailBody:      formData.emailBody,
        }
      );

      if (response.success) {
        onCompanyUpdated();
        onShowToast(`${recordType} updated successfully.`, 'success');
        onClose();
      } else {
        setError(response.message || `Error updating ${recordType.toLowerCase()}.`);
      }
    } catch (err) {
      setError(`Error updating ${recordType.toLowerCase()}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this ${recordType.toLowerCase()}? This action cannot be undone.`))
      return;

    setLoading(true);
    try {
      const response = await companiesAPI.deleteCompany(company.id, userId, isDirector);
      if (response.success) {
        onCompanyUpdated();
        onShowToast(`${recordType} deleted successfully.`, 'success');
        onClose();
      } else {
        setError(response.message || `Error deleting ${recordType.toLowerCase()}.`);
      }
    } catch (err) {
      setError(`Error deleting ${recordType.toLowerCase()}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproved = async () => {
    if (!window.confirm(`Are you sure you want to approve this ${recordType.toLowerCase()}?`))
      return;

    setLoading(true);
    try {
      const status = formData.isApproved === 1 ? 0 : 1;
      const response = await companiesAPI.approveCompany(company.id, userId, isDirector, status);
      if (response.success) {
        onCompanyUpdated();
        onShowToast(`${recordType} approved successfully.`, 'success');
        onClose();
      } else {
        setError(response.message || `Error approving ${recordType.toLowerCase()}.`);
      }
    } catch (err) {
      setError(`Error approving ${recordType.toLowerCase()}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };
  const handleFlagForReview = async () => {
    setLoading(true);
    try {
      const response = await companiesAPI.flagForReview(company.id, userId);
      if (response.success) {
        onCompanyUpdated();
        const action = formData.isReadyForReview ? 'flag reverted.' : 'flagged for admin review.';
        onShowToast(`${recordType} ${action}`, 'success');
        onClose();
      } else {
        setError(response.message || `Error flagging ${recordType.toLowerCase()} for review.`);
      }
    } catch (err) {
      setError(`Error flagging ${recordType.toLowerCase()} for review. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleFlagForReviewreverted = async () => {
    setLoading(true);
    try {
      const response = await companiesAPI.flagForRevertedReview(company.id, userId, isDirector);
      if (response.success) {
        onCompanyUpdated();
        const action = formData.isReadyForReview ? 'flag reverted.' : 'flagged for admin review.';
        onShowToast(`${recordType} ${action}`, 'success');
        onClose();
      } else {
        setError(response.message || `Error flagging ${recordType.toLowerCase()} for review.`);
      }
    } catch (err) {
      setError(`Error flagging ${recordType.toLowerCase()} for review. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !company) return null;

  const fmtDt = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="detail-modal-header">
          <h2>{recordType} Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="record-meta">
          <span className="record-meta-item">Added: <strong>{fmtDt(company.createdAt)}</strong></span>
          <span className="record-meta-item">Last updated: <strong>{fmtDt(company.updatedAt)}</strong></span>
          {company.username && <span className="record-meta-item">Prospector: <strong>{company.username}</strong></span>}
        </div>

        <form onSubmit={handleSave} className="detail-modal-form">

          {/* ── Basic Information ── */}
          <div className="form-section">
            <h3>Basic Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="companyName">{recordType} Name</label>
                <input
                  type="text" id="companyName" name="companyName"
                  value={formData.companyName || ''}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder={`Enter ${recordType} name`}
                />
              </div>
              <div className="form-group">
                <label htmlFor="region">Region</label>
                <input
                  type="text" id="region" name="region"
                  value={formData.region || ''}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter region"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="link">{recordType} Link</label>
                <input
                  type="text" id="link" name="link"
                  value={formData.link || ''}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="emails">Email Addresses</label>
                <textarea
                  id="emails" name="emails"
                  value={formData.emails || ''}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter emails separated by commas or semicolons"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="status">Status</label>
                <select
                  id="status" name="status"
                  value={formData.status || 'Pending'}  
                  onChange={handleInputChange}
                  disabled={loading || formData.isApproved === 1 ? false : true}
                  className="status-select"
                >
                  <option value="Pending">Pending</option>
                  <option value="Email Sent">Email Sent</option>
                  <option value="First Follow-up email sent">First Follow-up email sent</option>
                  <option value="Second Follow-up email sent">Second Follow-up email sent</option>
                  <option value="Interested">Interested</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Sales Information ── */}
          <div className="form-section">
            <h3>Sales Information</h3>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="painPoints">Pain Points</label>
                <textarea
                  id="painPoints" name="painPoints"
                  value={formData.painPoints || ''}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Describe the client's pain points"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="exactNeeds">Exact Needs</label>
                <textarea
                  id="exactNeeds" name="exactNeeds"
                  value={formData.exactNeeds || ''}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Describe their exact needs"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="buyingTrigger">Buying Trigger</label>
                <textarea
                  id="buyingTrigger" name="buyingTrigger"
                  value={formData.buyingTrigger || ''}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="What triggers their buying decision"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="bestPitchAngle">Best Pitch Angle</label>
                <textarea
                  id="bestPitchAngle" name="bestPitchAngle"
                  value={formData.bestPitchAngle || ''}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Your best pitch angle for this client"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="whyStrongFit">Why Strong Fit</label>
                <textarea
                  id="whyStrongFit" name="whyStrongFit"
                  value={formData.whyStrongFit || ''}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Why your solution is a strong fit"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* ── Email ── */}
          <div className="form-section">
            <h3>Email</h3>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="emailSub">Subject</label>
                <input
                  type="text" id="emailSub" name="emailSub"
                  value={formData.emailSub || ''}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter email subject"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="emailBody">Email Body</label>
                <textarea
                  id="emailBody" name="emailBody"
                  value={formData.emailBody || ''}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Write your email body here..."
                  rows="6"
                />
              </div>
            </div>
          </div>

          {/* ── Activity History ── */}
          <div className="form-section">
            <h3>Activity History</h3>
            <ActivityTimeline entityType="Company" entityId={company?.id} userId={userId} />
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* ── Action Buttons ── */}
          <div className="modal-actions">
            <button type="button" className="button button-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            {canEdit && (
              <>
                {isDirector && (
                    <>
                      {company.isReadyForReview && company.isApproved !== 1 && (
                        <button
                          type="button"
                          className="button button-flag-revert"
                          onClick={handleFlagForReviewreverted}
                          disabled={loading}
                        >
                          ↩ Revert Flag
                        </button>
                      )}
                      {

                      company.isReadyForReview &&(
                      <button
                        type="button"
                        className="button button-success"
                        onClick={handleApproved}
                        disabled={loading}
                      >
                        {formData.isApproved === 1 ? 'Unapprove' : 'Approve'}
                      </button>
)
                      }
                    </>
                )}
                {!isDirector && formData.isApproved !== 1 && (
                  formData.isReadyForReview
                    ? <button type="button" className="button button-flag-revert" onClick={handleFlagForReview} disabled={loading}>
                        ↩ Revert Flag
                      </button>
                    : <button type="button" className="button button-flag" onClick={handleFlagForReview} disabled={loading}>
                        🚩 Flag for Review
                      </button>
                )}
                <button type="submit" className="button button-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="button button-danger" onClick={handleDelete} disabled={loading}>
                  Delete {recordType}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
