import React, { useState } from 'react';
import './AddCompanyModal.css';
import { prospectsAPI } from '../services/api';

const SOURCES = ['Referral', 'Outreach', 'Inbound', 'Event', 'Other'];

export const AddProspectModal = ({ isOpen, onClose, userId, users, onProspectAdded }) => {
  const [form, setForm] = useState({
    prospectName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    prospectType: 'Direct Client',
    referredBy: '',
    source: '',
    assignedToUserId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.prospectName.trim()) { setError('Prospect name is required.'); return; }

    setLoading(true);
    try {
      const response = await prospectsAPI.addProspect(userId, {
        prospectName:    form.prospectName.trim(),
        contactPerson:   form.contactPerson  || null,
        contactEmail:    form.contactEmail   || null,
        contactPhone:    form.contactPhone   || null,
        prospectType:    form.prospectType   || 'Direct Client',
        referredBy:      form.referredBy     || null,
        source:          form.source         || null,
        assignedToUserId: form.assignedToUserId ? Number(form.assignedToUserId) : null,
      });

      if (response.success) {
        onProspectAdded(response.data);
        setForm({ prospectName: '', contactPerson: '', contactEmail: '', contactPhone: '', prospectType: 'Direct Client', referredBy: '', source: '', assignedToUserId: '' });
      } else {
        setError(response.message || 'Error adding prospect.');
      }
    } catch {
      setError('Error adding prospect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Prospect</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Prospect Name *</label>
            <input name="prospectName" value={form.prospectName} onChange={handleChange} placeholder="Company or person name" disabled={loading} />
          </div>

          <div className="form-group">
            <label>Contact Person</label>
            <input name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="Name of contact" disabled={loading} />
          </div>

          <div className="form-group">
            <label>Contact Email</label>
            <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="email@example.com" disabled={loading} />
          </div>

          <div className="form-group">
            <label>Contact Phone</label>
            <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="+1 234 567 8900" disabled={loading} />
          </div>

          <div className="form-group">
            <label>Prospect Type</label>
            <select name="prospectType" value={form.prospectType} onChange={handleChange} disabled={loading} style={{ padding: '12px 14px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}>
              <option value="Direct Client">Direct Client</option>
              <option value="Agent">Agent</option>
            </select>
          </div>

          <div className="form-group">
            <label>Referred By</label>
            <input name="referredBy" value={form.referredBy} onChange={handleChange} placeholder="Name of referrer (optional)" disabled={loading} />
          </div>

          <div className="form-group">
            <label>Source</label>
            <select name="source" value={form.source} onChange={handleChange} disabled={loading} style={{ padding: '12px 14px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}>
              <option value="">— Select source —</option>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Assigned To</label>
            <select name="assignedToUserId" value={form.assignedToUserId} onChange={handleChange} disabled={loading} style={{ padding: '12px 14px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit' }}>
              <option value="">— Unassigned —</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="button button-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Prospect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
