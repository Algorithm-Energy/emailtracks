import React, { useState, useEffect } from 'react';
import './CompanyDetailModal.css';
import { prospectsAPI } from '../services/api';
import { ActivityTimeline } from './ActivityTimeline';

const STATUSES = [
  'First Meeting',
  'Demo & Materials Sent',
  'Follow-up',
  'Proposal Sent',
  'Contract Sent',
  'Contract Signed',
  'Lost',
];

const SOURCES = ['Referral', 'Outreach', 'Inbound', 'Event', 'Other'];

const toInputDate = (isoDate) => {
  if (!isoDate) return '';
  return new Date(isoDate).toISOString().split('T')[0];
};

export const ProspectDetailModal = ({
  isOpen, prospect, userId, isDirector, users,
  onClose, onUpdated, onShowToast,
}) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (prospect) {
      setForm({
        ...prospect,
        nextActionDate: toInputDate(prospect.nextActionDate),
      });
      setError('');
    }
  }, [prospect]);

  if (!isOpen || !prospect) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.prospectName?.trim()) { setError('Prospect name is required.'); return; }

    setLoading(true);
    try {
      const response = await prospectsAPI.updateProspect(prospect.id, userId, {
        prospectName:    form.prospectName,
        contactPerson:   form.contactPerson   || null,
        contactEmail:    form.contactEmail    || null,
        contactPhone:    form.contactPhone    || null,
        prospectType:    form.prospectType    || 'Direct Client',
        referredBy:      form.referredBy      || null,
        source:          form.source          || null,
        status:          form.status,
        notes:           form.notes           || null,
        nextAction:      form.nextAction      || null,
        nextActionDate:  form.nextActionDate  || null,
        assignedToUserId: form.assignedToUserId ? Number(form.assignedToUserId) : null,
        clearAssignedTo:     !form.assignedToUserId,
        clearNextActionDate: !form.nextActionDate,
      });
      if (response.success) {
        onShowToast('Prospect updated successfully.', 'success');
        onUpdated();
      } else {
        setError(response.message || 'Error updating prospect.');
      }
    } catch {
      setError('Error updating prospect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this prospect? This cannot be undone.')) return;
    setLoading(true);
    try {
      const response = await prospectsAPI.deleteProspect(prospect.id, userId, isDirector);
      if (response.success) {
        onShowToast('Prospect deleted.', 'success');
        onUpdated();
      } else {
        setError(response.message || 'Error deleting prospect.');
      }
    } catch {
      setError('Error deleting prospect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fmtDt = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="detail-modal-header">
          <h2>Prospect Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="record-meta">
          <span className="record-meta-item">Added: <strong>{fmtDt(prospect.createdAt)}</strong></span>
          <span className="record-meta-item">Last updated: <strong>{fmtDt(prospect.updatedAt)}</strong></span>
          {prospect.createdByUsername && <span className="record-meta-item">Created by: <strong>{prospect.createdByUsername}</strong></span>}
        </div>

        <form onSubmit={handleSave} className="detail-modal-form">

          {/* ── Basic Info ── */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Prospect Name *</label>
                <input name="prospectName" value={form.prospectName || ''} onChange={handleChange} disabled={loading} placeholder="Company or person name" />
              </div>
              <div className="form-group">
                <label>Contact Person</label>
                <input name="contactPerson" value={form.contactPerson || ''} onChange={handleChange} disabled={loading} placeholder="Name of contact" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Contact Email</label>
                <input name="contactEmail" value={form.contactEmail || ''} onChange={handleChange} disabled={loading} placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input name="contactPhone" value={form.contactPhone || ''} onChange={handleChange} disabled={loading} placeholder="+1 234 567 8900" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Prospect Type</label>
                <select name="prospectType" value={form.prospectType || 'Direct Client'} onChange={handleChange} disabled={loading} className="status-select">
                  <option value="Direct Client">Direct Client</option>
                  <option value="Agent">Agent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Referred By</label>
                <input name="referredBy" value={form.referredBy || ''} onChange={handleChange} disabled={loading} placeholder="Name of referrer (optional)" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Source</label>
                <select name="source" value={form.source || ''} onChange={handleChange} disabled={loading} className="status-select">
                  <option value="">— Select source —</option>
                  {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Assigned To</label>
                <select name="assignedToUserId" value={form.assignedToUserId || ''} onChange={handleChange} disabled={loading} className="status-select">
                  <option value="">— Unassigned —</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Pipeline ── */}
          <div className="form-section">
            <h3>Pipeline</h3>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Status</label>
                <select name="status" value={form.status || 'First Meeting'} onChange={handleChange} disabled={loading} className="status-select">
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Notes</label>
                <textarea name="notes" value={form.notes || ''} onChange={handleChange} disabled={loading} placeholder="Meeting notes, context, anything relevant..." rows="4" />
              </div>
            </div>
          </div>

          {/* ── Next Steps ── */}
          <div className="form-section">
            <h3>Next Steps</h3>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Next Action</label>
                <input name="nextAction" value={form.nextAction || ''} onChange={handleChange} disabled={loading} placeholder="e.g. Send revised proposal, Schedule demo call" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Next Action Date</label>
                <input type="date" name="nextActionDate" value={form.nextActionDate || ''} onChange={handleChange} disabled={loading} />
              </div>
              <div className="form-group" />
            </div>
          </div>

          {/* ── Activity History ── */}
          <div className="form-section">
            <h3>Activity History</h3>
            <ActivityTimeline entityType="Prospect" entityId={prospect?.id} userId={userId} />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="button button-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            {isDirector && (
              <button type="button" className="button button-danger" onClick={handleDelete} disabled={loading}>
                Delete Prospect
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
