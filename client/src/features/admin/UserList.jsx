import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

/* ===========================
   USER FORM (DARK MODAL)
=========================== */

const UserForm = ({ user, onSave, onClose }) => {
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'UNDERWRITER',
    status: user?.status || 'ACTIVE',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (user) delete payload.password;
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-950 border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl text-white"
      >
        <h3 className="text-xl font-semibold mb-6">
          {user ? 'Edit User' : 'Create New User'}
        </h3>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">

          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            disabled={!!user}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none"
          />

          {!user && (
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none"
            />
          )}

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none"
          >
            <option value="ADMIN">Admin</option>
            <option value="UNDERWRITER">Underwriter</option>
            <option value="CLAIMS_ADJUSTER">Claims Adjuster</option>
            <option value="REINSURANCE_MANAGER">Reinsurance Manager</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 transition"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ===========================
   USER LIST (DARK TABLE)
=========================== */

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (form) => {
    if (editUser) {
      await adminAPI.updateUser(editUser._id, form);
    } else {
      await adminAPI.createUser(form);
    }
    await fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    await adminAPI.deleteUser(id);
    setUsers(users.filter(u => u._id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-400 p-8">
        Loading users...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-8">

      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">User Management</h2>
        <p className="text-slate-400">Manage system users and roles</p>
      </div>

      <button
        onClick={() => { setEditUser(null); setShowForm(true); }}
        className="mb-6 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 transition"
      >
        + Create User
      </button>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
        <table className="w-full text-left">
          <thead className="border-b border-white/10 text-slate-400 text-sm">
            <tr>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition">
                <td className="px-6 py-4 font-medium text-white">
                  {user.username}
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-indigo-400 text-sm">
                  {user.role.replace(/_/g, ' ')}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.status === 'ACTIVE'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button
                    onClick={() => { setEditUser(user); setShowForm(true); }}
                    className="px-3 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-slate-400 text-sm">
        Total users: {users.length}
      </div>

      {showForm && (
        <UserForm
          user={editUser}
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}

    </div>
  );
};

export default UserList;
