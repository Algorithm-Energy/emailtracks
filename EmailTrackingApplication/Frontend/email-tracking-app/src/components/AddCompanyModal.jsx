import React, { useState } from 'react';
import './AddCompanyModal.css';
import { companiesAPI } from '../services/api';
import { authUtils } from '../services/authUtils';

export const AddCompanyModal = ({ isOpen, onClose, userId, onCompanyAdded, recordType= 'Client' }) => {
  const currentUser = authUtils.getUser();
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    companyName: '',
    region: '',
    link: '',
    emails: [],
  });
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      addEmail();
    }
  };

  const addEmail = () => {
    const email = emailInput.trim();
    
    if (!email) {
      setEmailError('');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      return;
    }

    if (formData.emails.includes(email)) {
      setEmailError('Email already added');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      emails: [...prev.emails, email],
    }));
    setEmailInput('');
    setEmailError('');
  };

  const removeEmail = (emailToRemove) => {
    setFormData((prev) => ({
      ...prev,
      emails: prev.emails.filter((email) => email !== emailToRemove),
    }));
    setEmailError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.companyName.trim()) {
      setError(`${recordType} Name is required.`);
      return;
    }
    if (!formData.region.trim()) {
      setError('Region is required.');
      return;
    }
    if (formData.emails.length === 0) {
      setError('Please enter at least one valid email address.');
      return;
    }

    setLoading(true);

    try {
      // Check for duplicate
      const duplicateCheck = await companiesAPI.checkDuplicate(userId, formData.companyName, recordType);
      if (duplicateCheck.data.exists) {
        setError(`This ${recordType.toLowerCase()} already exists.`);
        setLoading(false);
        return;
      }

      // Add client - convert emails array to comma-separated string for API
      const response = await companiesAPI.addCompany(userId, {
        username: formData.username,
        companyName: formData.companyName,
        region: formData.region,
        link: formData.link || null,
        emails: formData.emails.join(', '),
        recordType: recordType,
      });

      if (response.success) {
        response.data.username = formData.username;
        onCompanyAdded(response.data);
        setFormData({
          username: currentUser?.username || '',
          companyName: '',
          region: '',
          link: '',
          emails: [],
        });
        setEmailInput('');
        onClose();
      } else {
        setError(response.message || `Error adding ${recordType.toLowerCase()}.`);
      }
    } catch (err) {
      setError(`Error adding ${recordType.toLowerCase()}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add {recordType}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              disabled={true}
              placeholder="Your username"
            />
            <small>Automatically filled with your current username</small>
          </div>

          <div className="form-group">
            <label htmlFor="companyName">{recordType} Name *</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder={`Enter ${recordType} name`}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="region">Region *</label>
            <input
              type="text"
              id="region"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              placeholder="Enter region"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="link">{recordType} Link</label>
            <input
              type="text"
              id="link"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              placeholder={`Enter ${recordType} link (optional)`}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="emails">Relevant Persons Emails *</label>
            <div className="email-input-container">
              <input
                type="email"
                id="emails"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                placeholder="Enter email and press Tab to add"
                disabled={loading}
              />
            </div>
            {emailError && <div className="email-error">{emailError}</div>}
            
            <div className="email-cards">
              {formData.emails.map((email) => (
                <div key={email} className="email-card">
                  <span className="email-text">{email}</span>
                  <button
                    type="button"
                    className="email-remove-btn"
                    onClick={() => removeEmail(email)}
                    disabled={loading}
                    title="Remove email"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <small>Press Tab after entering an email to add it</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
