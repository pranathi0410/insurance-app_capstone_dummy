import React, { useState, useEffect } from 'react';
import TreatyList from './TreatyList';
import AllocationTable from './AllocationTable';
import AllocationSummary from './AllocationSummary';
import { policyAPI, reinsuranceAPI } from '../../services/api';
import AddReinsurerModal from './AddReinsurerModal';

const ReinsuranceDashboard = () => {
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReinsurerModal, setShowReinsurerModal] = useState(false);
  const [reinsurerSuccess, setReinsurerSuccess] = useState('');
  const [reinsurerError, setReinsurerError] = useState('');

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await policyAPI.getPolicies();
        setPolicies(res.data.filter(p => p.status === 'ACTIVE'));
      } catch (err) {
        setError('Failed to load policies');
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  const handleCreateReinsurer = async (data) => {
    setReinsurerError('');
    setReinsurerSuccess('');
    try {
      await reinsuranceAPI.createReinsurer(data);
      setReinsurerSuccess('Reinsurer created successfully!');
    } catch (err) {
      setReinsurerError(err.response?.data?.message || 'Failed to create reinsurer');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-200 p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">
          Reinsurance Dashboard
        </h2>

        <button
          onClick={() => setShowReinsurerModal(true)}
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-medium hover:opacity-90 transition"
        >
          Add Reinsurer
        </button>
      </div>

      <AddReinsurerModal
        isOpen={showReinsurerModal}
        onClose={() => setShowReinsurerModal(false)}
        onCreate={handleCreateReinsurer}
      />

      {/* Success / Error */}
      {reinsurerSuccess && (
        <div className="mb-4 p-3 rounded-lg bg-green-900/40 border border-green-500 text-green-400">
          {reinsurerSuccess}
        </div>
      )}

      {reinsurerError && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-500 text-red-400">
          {reinsurerError}
        </div>
      )}

      {/* Policy Selector Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 mb-8 shadow-lg backdrop-blur">
        <label
          htmlFor="policySelect"
          className="block text-sm font-medium text-slate-400 mb-2"
        >
          Select Active Policy
        </label>

        <select
          id="policySelect"
          value={selectedPolicyId}
          onChange={e => setSelectedPolicyId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        >
          <option value="">-- Select Policy --</option>
          {policies.map(p => (
            <option key={p._id} value={p._id}>
              {p.policyNumber}
            </option>
          ))}
        </select>

        <p className="text-sm text-slate-400 mt-4">
          Select a policy to view allocations and summary.
        </p>
      </div>

      {/* Allocation Components */}
      <AllocationTable policyId={selectedPolicyId} />
      <AllocationSummary policyId={selectedPolicyId} />

      {/* Treaty Section */}
      <div className="mt-12">
        <h3 className="text-2xl font-semibold text-white mb-4">
          Reinsurance Treaties
        </h3>

        <TreatyList />
      </div>

      {/* Loading & Error */}
      {loading && (
        <div className="mt-6 text-slate-400">
          Loading policies...
        </div>
      )}

      {error && (
        <div className="mt-6 text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};

export default ReinsuranceDashboard;
