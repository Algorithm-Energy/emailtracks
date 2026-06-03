import React, { useState } from 'react';
import './ProspectTable.css';
import { ProspectDetailModal } from './ProspectDetailModal';

const STATUS_CLASS = {
  'First Meeting':         'ps-first-meeting',
  'Demo & Materials Sent': 'ps-demo',
  'Follow-up':             'ps-followup',
  'Proposal Sent':         'ps-proposal',
  'Contract Sent':         'ps-contract-sent',
  'Contract Signed':       'ps-contract-signed',
  'Lost':                  'ps-lost',
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
};

const isOverdue = (date) => date && new Date(date) < new Date();

export const ProspectTable = ({ prospects, userId, isDirector, users, onRefresh, onShowToast }) => {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="table-container">
        {prospects.length === 0 ? (
          <div className="empty-state">
            <p>No prospects yet. Add your first prospect to get started!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="company-table">
              <colgroup>
                <col style={{ width: '18%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '14%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Prospect</th>
                  <th>Contact Person</th>
                  <th className="col-status">Source</th>
                  <th className="col-status">Pipeline Status</th>
                  <th className="col-owner">Assigned To</th>
                  <th className="col-owner">Next Action</th>
                  <th className="col-owner">Created By</th>
                </tr>
              </thead>
              <tbody>
                {prospects.map((p) => (
                  <tr key={p.id} className="clickable-row" onClick={() => setSelected(p)}>
                    <td className="company-name-cell">
                      <div>{p.prospectName}</div>
                      <span className={`prospect-type-badge ${p.prospectType === 'Agent' ? 'pt-agent' : 'pt-direct'}`}>
                        {p.prospectType || 'Direct Client'}
                      </span>
                    </td>
                    <td>{p.contactPerson || '—'}</td>
                    <td className="status-cell">
                      {p.source
                        ? <span className="source-badge">{p.source}</span>
                        : <span style={{ color: '#bbb' }}>—</span>}
                      {p.referredBy && (
                        <div className="referred-by-text">via {p.referredBy}</div>
                      )}
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${STATUS_CLASS[p.status] ?? 'ps-first-meeting'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="owner-cell">{p.assignedToUsername || '—'}</td>
                    <td className={`owner-cell ${isOverdue(p.nextActionDate) ? 'overdue-date' : ''}`}>
                      {formatDate(p.nextActionDate)}
                    </td>
                    <td className="owner-cell">{p.createdByUsername || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <ProspectDetailModal
          isOpen={!!selected}
          prospect={selected}
          userId={userId}
          isDirector={isDirector}
          users={users}
          onClose={() => setSelected(null)}
          onUpdated={() => { setSelected(null); onRefresh(); }}
          onShowToast={onShowToast}
        />
      )}
    </>
  );
};
