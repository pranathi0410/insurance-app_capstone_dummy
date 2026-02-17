import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { claimAPI } from '../../services/api';
import ClaimActions from './ClaimActions';

const ClaimDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchClaim = async () => {
    try {
      const res = await claimAPI.getClaimById(id);
      setClaim(res.data);
    } catch (err) {
      setError('Failed to load claim details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaim();
    // eslint-disable-next-line
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-slate-400">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-red-400">
        {error}
      </div>
    );

  if (!claim)
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-slate-400">
        Claim not found
      </div>
    );

  const getStatusBadge = (status) => {
    const colors = {
      SUBMITTED: 'bg-blue-600',
      IN_REVIEW: 'bg-orange-500',
      APPROVED: 'bg-green-600',
      REJECTED: 'bg-red-600',
      SETTLED: 'bg-purple-600'
    };

    return (
      <span
        className={`px-4 py-1 rounded-full text-xs font-semibold text-white ${colors[status] || 'bg-slate-600'}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">

      {/* Back Button */}
      <button
        onClick={() => navigate('/claims')}
        className="mb-6 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition"
      >
        ← Back to Claims
      </button>

      {/* Main Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl mb-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            Claim Details
          </h2>
          {getStatusBadge(claim.status)}
        </div>

        {/* Grid Layout */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Left Column */}
          <div className="space-y-6">
            <Detail label="Claim Number" value={claim.claimNumber} />

            <Detail
              label="Related Policy"
              value={claim.policyId?.policyNumber || '-'}
            />

            <Detail
              label="Claim Amount"
              value={`₹${claim.claimAmount?.toFixed(2) || 0}`}
              highlight="text-red-400"
            />

            <Detail
              label="Incident Date"
              value={
                claim.incidentDate
                  ? new Date(claim.incidentDate).toLocaleDateString()
                  : '-'
              }
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Detail
              label="Approved Amount"
              value={
                claim.approvedAmount
                  ? `₹${claim.approvedAmount.toFixed(2)}`
                  : 'Pending'
              }
              highlight="text-green-400"
            />

            <Detail
              label="Reported Date"
              value={
                claim.reportedDate
                  ? new Date(claim.reportedDate).toLocaleDateString()
                  : '-'
              }
            />

            <Detail
              label="Handled By"
              value={claim.handledBy?.username || '-'}
            />
          </div>
        </div>

        {/* Remarks */}
        {claim.remarks && (
          <div className="mt-8">
            <label className="block text-slate-400 text-sm mb-2">
              Remarks
            </label>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-300 leading-relaxed">
              {claim.remarks}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <ClaimActions claim={claim} refresh={fetchClaim} />
    </div>
  );
};

/* Reusable Detail Component */
const Detail = ({ label, value, highlight }) => (
  <div>
    <label className="block text-slate-400 text-sm mb-2">
      {label}
    </label>
    <div
      className={`bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-medium ${highlight || ''
        }`}
    >
      {value}
    </div>
  </div>
);

export default ClaimDetails;
