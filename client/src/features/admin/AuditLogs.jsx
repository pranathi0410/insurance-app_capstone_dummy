import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAuditLogs();
      setLogs(res.data || []);
    } catch (err) {
      setError('Failed to load audit logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filterEntity && log.entityType !== filterEntity) return false;
    if (filterAction && log.action !== filterAction) return false;
    return true;
  });

  const formatDate = (date) => new Date(date).toLocaleString();

  const getActionBadge = (action) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (action) {
      case 'CREATE':
        return `${base} bg-green-500/20 text-green-400`;
      case 'UPDATE':
        return `${base} bg-blue-500/20 text-blue-400`;
      case 'DELETE':
        return `${base} bg-red-500/20 text-red-400`;
      case 'APPROVE':
        return `${base} bg-purple-500/20 text-purple-400`;
      default:
        return `${base} bg-slate-700 text-slate-400`;
    }
  };

  const getEntityBadge = (entity) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (entity) {
      case 'POLICY':
        return `${base} bg-blue-500/20 text-blue-400`;
      case 'CLAIM':
        return `${base} bg-orange-500/20 text-orange-400`;
      case 'TREATY':
        return `${base} bg-green-500/20 text-green-400`;
      case 'USER':
        return `${base} bg-red-500/20 text-red-400`;
      default:
        return `${base} bg-slate-700 text-slate-400`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-400 p-8">
        Loading audit logs...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-8">

      {/* Force dropdown options styling */}
      <style>
        {`
          select option {
            background-color: #0f172a;
            color: white;
          }
        `}
      </style>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Audit Logs</h2>
        <p className="text-slate-400">
          Complete history of all system changes and actions performed by users.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm text-slate-400 mb-2">
            Filter by Entity Type
          </label>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-indigo-500 outline-none appearance-none"
          >
            <option value="">All Types</option>
            <option value="POLICY">Policy</option>
            <option value="CLAIM">Claim</option>
            <option value="TREATY">Treaty</option>
            <option value="USER">User</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">
            Filter by Action
          </label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-indigo-500 outline-none appearance-none"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="APPROVE">Approve</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-lg">

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No audit logs found
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="border-b border-white/10 text-slate-400 text-sm">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Entity Type</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Performed By</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log, index) => (
                <tr
                  key={index}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="px-6 py-4 text-slate-300 text-sm">
                    {formatDate(log.performedAt)}
                  </td>

                  <td className="px-6 py-4">
                    <span className={getEntityBadge(log.entityType)}>
                      {log.entityType}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={getActionBadge(log.action)}>
                      {log.action}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-300 text-sm">
                    {log.performedBy?.username || 'System'}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <details className="cursor-pointer">
                      <summary className="text-indigo-400 hover:text-indigo-300">
                        View
                      </summary>

                      <div className="mt-3 bg-slate-900 border border-slate-700 rounded-lg p-4 text-xs font-mono max-h-64 overflow-y-auto">
                        {log.oldValue && (
                          <div className="mb-4">
                            <div className="text-red-400 mb-1">Old:</div>
                            <pre className="whitespace-pre-wrap break-words">
                              {JSON.stringify(log.oldValue, null, 2)}
                            </pre>
                          </div>
                        )}

                        {log.newValue && (
                          <div>
                            <div className="text-green-400 mb-1">New:</div>
                            <pre className="whitespace-pre-wrap break-words">
                              {JSON.stringify(log.newValue, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 text-slate-400 text-sm">
        Showing {filteredLogs.length} of {logs.length} logs
      </div>

    </div>
  );
};

export default AuditLogs;
