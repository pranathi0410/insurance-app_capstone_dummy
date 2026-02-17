import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { policyAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const PolicyList = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await policyAPI.getPolicies();
        setPolicies(res.data);
      } catch (err) {
        setError('Failed to load policies.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  const getStatusBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case 'DRAFT':
        return `${base} bg-yellow-500/20 text-yellow-400`;
      case 'SUBMITTED':
        return `${base} bg-blue-500/20 text-blue-400`;
      case 'ACTIVE':
        return `${base} bg-green-500/20 text-green-400`;
      case 'SUSPENDED':
        return `${base} bg-orange-500/20 text-orange-400`;
      case 'EXPIRED':
        return `${base} bg-red-500/20 text-red-400`;
      default:
        return `${base} bg-slate-700 text-slate-400`;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    try {
      await policyAPI.deletePolicy(id);
      setPolicies(policies.filter(p => p._id !== id));
    } catch (err) {
      setError('Failed to delete policy.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-400 p-8">
        Loading policies...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Policies</h2>

        {user?.role === 'UNDERWRITER' && (
          <Link
            to="/policy/create"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 transition"
          >
            Create New Policy
          </Link>
        )}
      </div>

      {/* Total Count */}
      <div className="mb-6 text-indigo-400 font-semibold">
        Total Policies: {policies.length}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Table Container */}
      {policies.length === 0 ? (
        <div className="p-8 text-center backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl text-slate-400">
          No policies found.{' '}
          <Link to="/policy/create" className="text-indigo-400 hover:text-indigo-300">
            Create one
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-lg">
          <table className="w-full text-left">
            <thead className="border-b border-white/10 text-slate-400 text-sm">
              <tr>
                <th className="px-6 py-4">Policy Number</th>
                <th className="px-6 py-4">Insured Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Premium</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {policies.map(policy => (
                <tr
                  key={policy._id}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="px-6 py-4 text-white">
                    {policy.policyNumber}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {policy.insuredName}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    {policy.lineOfBusiness}
                  </td>

                  <td className="px-6 py-4 text-slate-300">
                    ₹{policy.premium?.toFixed(2) || 0}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className={getStatusBadge(policy.status)}>
                      {policy.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <Link
                      to={`/policy/${policy._id}`}
                      className="text-indigo-400 hover:text-indigo-300 mr-4"
                    >
                      View
                    </Link>

                    {user?.role === 'UNDERWRITER' && (
                      <button
                        onClick={() => handleDelete(policy._id)}
                        className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                      >
                        Delete
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default PolicyList;
