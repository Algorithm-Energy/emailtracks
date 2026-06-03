import React, { useState, useEffect } from 'react';
import './ActivityTimeline.css';
import { companiesAPI } from '../services/api';

const formatDateTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const ActivityTimeline = ({ entityType, entityId, userId }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await companiesAPI.getActivityLog(entityType, entityId, userId);
        if (res.success) setEntries(res.data);
      } catch {}
      finally { setLoading(false); }
    };
    if (entityId) fetch();
  }, [entityType, entityId]);

  if (loading) return <div className="timeline-loading">Loading history…</div>;
  if (entries.length === 0) return <div className="timeline-empty">No activity recorded yet.</div>;

  return (
    <div className="activity-timeline">
      {entries.map((e) => (
        <div key={e.id} className="timeline-entry">
          <div className="timeline-dot" />
          <div className="timeline-body">
            <span className="timeline-action">{e.action}</span>
            <span className="timeline-meta">by <strong>{e.username}</strong> · {formatDateTime(e.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
