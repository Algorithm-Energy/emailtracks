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

const PROSPECT_SORT_KEYS = {
  'Prospect':        'prospectName',
  'Source':          'source',
  'Pipeline Status': 'status',
  'Assigned To':     'assignedToUsername',
  'Next Action':     'nextActionDate',
  'Created By':      'createdByUsername',
  'Date Added':      'createdAt',
};

export const ProspectTable = ({ prospects, userId, isDirector, users, onRefresh, onShowToast }) => {
  const [selected, setSelected] = useState(null);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const sortedProspects = [...prospects].sort((a, b) => {
    if (!sortCol) return 0;
    const key = PROSPECT_SORT_KEYS[sortCol];
    const av = (a[key] ?? '').toString().toLowerCase();
    const bv = (b[key] ?? '').toString().toLowerCase();
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const arrow = (col) => sortCol === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

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
                <col style={{ width: '17%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '100px' }} />
              </colgroup>
              <thead>
                <tr>
                  <th className="sortable-th" onClick={() => handleSort('Prospect')}>Prospect{arrow('Prospect')}</th>
                  <th>Contact Person</th>
                  {['Source','Pipeline Status','Assigned To','Next Action','Created By','Date Added'].map(col => (
                    <th key={col} className="col-status sortable-th" onClick={() => handleSort(col)}>{col}{arrow(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedProspects.map((p) => (
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
                    <td className="owner-cell" style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
                      {formatDate(p.createdAt)}
                    </td>
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
