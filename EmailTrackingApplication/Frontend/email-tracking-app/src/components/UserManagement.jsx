import React, { useState, useEffect } from 'react';
import './UserManagement.css';
import { adminUsersAPI } from '../services/api';

const BLANK_FORM = { username: '', email: '', password: '', isDirector: false };

export const UserManagement = ({ userId, onShowToast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(BLANK_FORM);
  const [addError, setAddError] = useState('');
  const [resetPwd, setResetPwd] = useState({});      // { [id]: newPassword }
  const [editRow, setEditRow] = useState(null);       // id being edited inline

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminUsersAPI.getAllUsers(userId, true);
      if (res.success) setUsers(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError('');
    if (!addForm.username.trim() || !addForm.password.trim()) {
      setAddError('Username and password are required.'); return;
    }
    try {
      const res = await adminUsersAPI.createUser(userId, true, addForm);
      if (res.success) {
        onShowToast('User created successfully.', 'success');
        setShowAddForm(false);
        setAddForm(BLANK_FORM);
        fetchUsers();
      } else {
        setAddError(res.message || 'Error creating user.');
      }
    } catch { setAddError('Error creating user.'); }
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await adminUsersAPI.toggleActive(userId, true, id);
      if (res.success) { onShowToast(res.message, 'success'); fetchUsers(); }
      else onShowToast(res.message || 'Error updating user.', 'error');
    } catch { onShowToast('Error updating user.', 'error'); }
  };

  const handleResetPassword = async (id) => {
    const pwd = resetPwd[id]?.trim();
    if (!pwd) { onShowToast('Enter a new password first.', 'error'); return; }
    try {
      const res = await adminUsersAPI.resetPassword(userId, true, id, pwd);
      if (res.success) {
        onShowToast('Password reset successfully.', 'success');
        setResetPwd(p => ({ ...p, [id]: '' }));
      } else onShowToast(res.message || 'Error resetting password.', 'error');
    } catch { onShowToast('Error resetting password.', 'error'); }
  };

  const handleRoleToggle = async (user) => {
    try {
      const res = await adminUsersAPI.updateUser(userId, true, user.id, {
        username: user.username, email: user.email, isDirector: !user.isDirector,
      });
      if (res.success) { onShowToast('Role updated.', 'success'); fetchUsers(); }
      else onShowToast(res.message || 'Error updating role.', 'error');
    } catch { onShowToast('Error updating role.', 'error'); }
  };

  if (loading) return <div className="um-loading"><div className="spinner" /><p>Loading users…</p></div>;

  return (
    <div className="user-management">
      <div className="um-header">
        <h2>User Management</h2>
        <button className="add-company-button" onClick={() => setShowAddForm(v => !v)}>
          {showAddForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showAddForm && (
        <form className="um-add-form" onSubmit={handleAdd}>
          <div className="um-add-grid">
            <div className="form-group">
              <label>Username *</label>
              <input value={addForm.username} onChange={e => setAddForm(p => ({ ...p, username: e.target.value }))} placeholder="username" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} placeholder="user@example.com" />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" value={addForm.password} onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))} placeholder="password" />
            </div>
            <div className="form-group um-role-group">
              <label>Role</label>
              <label className="um-toggle-label">
                <input type="checkbox" checked={addForm.isDirector} onChange={e => setAddForm(p => ({ ...p, isDirector: e.target.checked }))} />
                Admin
              </label>
            </div>
          </div>
          {addError && <div className="error-message">{addError}</div>}
          <button type="submit" className="button button-primary">Create User</button>
        </form>
      )}

      <div className="table-container" style={{ marginTop: 20 }}>
        <table className="company-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th className="col-status">Role</th>
              <th className="col-status">Status</th>
              <th className="col-owner">Reset Password</th>
              <th className="col-owner">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="company-name-cell">{u.username}</td>
                <td style={{ fontSize: 13, color: '#555' }}>{u.email || '—'}</td>
                <td className="status-cell">
                  <span
                    className={`status-badge ${u.isDirector ? 'status-approved' : 'status-unapproved'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRoleToggle(u)}
                    title="Click to toggle role"
                  >
                    {u.isDirector ? 'Admin' : 'Employee'}
                  </span>
                </td>
                <td className="status-cell">
                  <span className={`status-badge ${u.isActive ? 'status-email-sent' : 'status-inactive'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="owner-cell">
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="password"
                      className="um-pwd-input"
                      placeholder="New password"
                      value={resetPwd[u.id] || ''}
                      onChange={e => setResetPwd(p => ({ ...p, [u.id]: e.target.value }))}
                    />
                    <button className="button button-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleResetPassword(u.id)}>Reset</button>
                  </div>
                </td>
                <td className="owner-cell">
                  <button
                    className={`button ${u.isActive ? 'button-danger' : 'button-success'}`}
                    style={{ padding: '6px 14px', fontSize: 12 }}
                    onClick={() => handleToggleActive(u.id)}
                  >
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
