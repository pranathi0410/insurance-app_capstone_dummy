import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { policyAPI } from '../../services/api';
import PolicyActions from './PolicyActions';
import AllocationTable from '../reinsurance/AllocationTable';
import AllocationSummary from '../reinsurance/AllocationSummary';

const PolicyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPolicy = async () => {
    try {
      const res = await policyAPI.getPolicyById(id);
      setPolicy(res.data);
    } catch (err) {
      setError('Failed to load policy details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
    // eslint-disable-next-line
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-10 text-white">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-10 text-red-400">
        {error}
      </div>
    );

  if (!policy)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black p-10 text-white">
        Policy not found
      </div>
    );

  const InfoBox = ({ label, value }) => (
    <div>
      <label className="block text-sm text-slate-400 mb-2">
        {label}
      </label>
      <div className="bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg">
        {value || '-'}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black px-6 py-12">

      <div className="max-w-6xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate('/policy')}
          className="mb-8 px-5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition"
        >
          ← Back to Policies
        </button>

        {/* Main Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-10 shadow-2xl mb-10">

          <h2 className="text-3xl font-bold text-white mb-8">
            Policy Details
          </h2>

          {/* Grid Layout */}
          <div className="grid md:grid-cols-2 gap-8">

            <div className="space-y-6">
              <InfoBox label="Policy Number" value={policy.policyNumber} />
              <InfoBox label="Insured Name" value={policy.insuredName} />
              <InfoBox label="Insured Type" value={policy.insuredType} />
              <InfoBox label="Line of Business" value={policy.lineOfBusiness} />
            </div>

            <div className="space-y-6">
              <InfoBox
                label="Status"
                value={
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-sm font-semibold">
                    {policy.status}
                  </span>
                }
              />
              <InfoBox
                label="Sum Insured"
                value={`₹${policy.sumInsured?.toFixed(2) || 0}`}
              />
              <InfoBox
                label="Premium"
                value={`₹${policy.premium?.toFixed(2) || 0}`}
              />
              <InfoBox
                label="Retention Limit"
                value={`₹${policy.retentionLimit?.toFixed(2) || 0}`}
              />
            </div>

          </div>

          {/* Dates Section */}
          <div className="grid md:grid-cols-2 gap-8 mt-10">
            <InfoBox
              label="Effective From"
              value={
                policy.effectiveFrom
                  ? new Date(policy.effectiveFrom).toLocaleDateString()
                  : '-'
              }
            />
            <InfoBox
              label="Effective To"
              value={
                policy.effectiveTo
                  ? new Date(policy.effectiveTo).toLocaleDateString()
                  : '-'
              }
            />
          </div>

        </div>

        {/* Policy Actions */}
        <div className="mb-10">
          <PolicyActions policy={policy} refresh={fetchPolicy} />
        </div>

        {/* Allocation Section (Only if ACTIVE) */}
        {policy.status === 'ACTIVE' && (
          <div className="space-y-10">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-xl">
              <AllocationTable policyId={policy._id} />
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-xl">
              <AllocationSummary policyId={policy._id} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PolicyDetails;
