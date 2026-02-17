import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { claimAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const ClaimsList = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await claimAPI.getClaims();
        setClaims(res.data);
      } catch (err) {
        setError('Failed to load claims.');
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      SUBMITTED: 'bg-blue-600',
      IN_REVIEW: 'bg-orange-500',
      APPROVED: 'bg-green-600',
      REJECTED: 'bg-red-600',
      SETTLED: 'bg-purple-600'
    };
    return colors[status] || 'bg-slate-600';
  };

  const filteredClaims =
    filter === 'ALL' ? claims : claims.filter(c => c.status === filter);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this claim?')) return;
    try {
      await claimAPI.deleteClaim(id);
      setClaims(claims.filter(c => c._id !== id));
    } catch {
      setError('Failed to delete claim.');
    }
  };

  if (loading)
    return (
      <div className="p-6 text-slate-400">Loading claims...</div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">
          Claims Management
        </h2>

        {user?.role !== 'ADMIN' && (
          <Link
            to="/claims/create"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold shadow-lg hover:opacity-90 transition"
          >
            File New Claim
          </Link>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700 text-red-400 rounded-xl">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="ALL">All Claims</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SETTLED">Settled</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">

        {filteredClaims.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No claims found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="px-6 py-4 text-left">Claim Number</th>
                <th className="px-6 py-4 text-left">Policy</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-left">Reported Date</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredClaims.map((claim, index) => (
                <tr
                  key={claim._id}
                  className={`border-b border-slate-800 ${
                    index % 2 === 0 ? 'bg-slate-900' : 'bg-slate-850'
                  } hover:bg-slate-800 transition`}
                >
                  <td className="px-6 py-4 text-white font-medium">
                    {claim.claimNumber}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {claim.policyId?.policyNumber || '-'}
                  </td>

                  <td className="px-6 py-4 text-right text-cyan-400 font-semibold">
                    ₹{claim.claimAmount?.toFixed(2) || 0}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 text-xs font-semibold text-white rounded-full ${getStatusColor(claim.status)}`}
                    >
                      {claim.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-400">
                    {claim.reportedDate
                      ? new Date(claim.reportedDate).toLocaleDateString()
                      : '-'}
                  </td>

                  <td className="px-6 py-4">
                    <Link
                      to={`/claims/${claim._id}`}
                      className="text-indigo-400 hover:text-indigo-300 font-medium mr-4"
                    >
                      View Details
                    </Link>

                    {user?.role === 'CLAIMS_ADJUSTER' && (
                      <button
                        onClick={() => handleDelete(claim._id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs transition"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClaimsList;
