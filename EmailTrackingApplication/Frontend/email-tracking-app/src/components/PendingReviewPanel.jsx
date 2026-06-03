import React, { useState } from 'react';
import './PendingReviewPanel.css';
import { CompanyDetailModal } from './CompanyDetailModal';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const PendingReviewPanel = ({ records, userId, isDirector, onRefresh, onShowToast }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleUpdated = () => {
    setSelected(null);
    onRefresh();
  };

  return (
    <div className="pending-review-panel">
      <div className="prp-header" onClick={() => setCollapsed(v => !v)}>
        <div className="prp-title">
          <span className="prp-icon">🔔</span>
          <strong>{records.length} record{records.length !== 1 ? 's' : ''} awaiting your review</strong>
        </div>
        <span className="prp-toggle">{collapsed ? '▼ Show' : '▲ Hide'}</span>
      </div>

      {!collapsed && (
        <div className="prp-list">
          {records.map(r => (
            <div key={r.id} className="prp-row" onClick={() => setSelected(r)}>
              <span className={`prp-type-badge ${r.recordType === 'Agent' ? 'prp-agent' : 'prp-client'}`}>
                {r.recordType}
              </span>
              <span className="prp-name">{r.companyName}</span>
              <span className="prp-meta">by {r.username}</span>
              <span className="prp-time">{timeAgo(r.updatedAt)}</span>
              <span className="prp-action">Review →</span>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <CompanyDetailModal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          company={selected}
          userId={userId}
          isDirector={isDirector}
          onCompanyUpdated={handleUpdated}
          onShowToast={onShowToast}
          recordType={selected.recordType}
        />
      )}
    </div>
  );
};
