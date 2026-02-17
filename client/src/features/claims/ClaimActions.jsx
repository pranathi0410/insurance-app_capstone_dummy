import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { claimAPI } from '../../services/api';

const ClaimActions = ({ claim, refresh }) => {
  const { user } = useAuth();
  const [actionError, setActionError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState(
    claim.approvedAmount || claim.claimAmount
  );

  const canReview = user?.role === 'CLAIMS_ADJUSTER';
  const canApprove = user?.role === 'CLAIMS_ADJUSTER';
  const canReject = user?.role === 'CLAIMS_ADJUSTER';
  const canSettle = user?.role === 'CLAIMS_ADJUSTER';

  const handleReview = async () => {
    setActionError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      await claimAPI.reviewClaim(claim._id);
      setSuccessMsg('Claim moved to In Review status');
      setTimeout(() => refresh(), 1000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to review claim');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      await claimAPI.approveClaim(claim._id, {
        approvedAmount: parseFloat(approvedAmount),
      });
      setSuccessMsg('Claim approved successfully');
      setTimeout(() => refresh(), 1000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve claim');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (window.confirm('Are you sure you want to reject this claim?')) {
      setActionError('');
      setSuccessMsg('');
      setIsLoading(true);
      try {
        await claimAPI.rejectClaim(claim._id);
        setSuccessMsg('Claim rejected');
        setTimeout(() => refresh(), 1000);
      } catch (err) {
        setActionError(err.response?.data?.message || 'Failed to reject claim');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSettle = async () => {
    if (window.confirm('Mark this claim as settled?')) {
      setActionError('');
      setSuccessMsg('');
      setIsLoading(true);
      try {
        await claimAPI.settleClaim(claim._id);
        setSuccessMsg('Claim settled successfully');
        setTimeout(() => refresh(), 1000);
      } catch (err) {
        setActionError(err.response?.data?.message || 'Failed to settle claim');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!canReview && !canApprove && !canReject && !canSettle) {
    return (
      <div className="mt-8 bg-amber-900/30 border border-amber-600 text-amber-300 p-4 rounded-xl">
        You do not have permission to manage claims.
      </div>
    );
  }

  return (
    <div className="mt-10">

      {/* Error */}
      {actionError && (
        <div className="mb-4 bg-red-900/30 border border-red-600 text-red-300 p-4 rounded-xl">
          {actionError}
        </div>
      )}

      {/* Success */}
      {successMsg && (
        <div className="mb-4 bg-green-900/30 border border-green-600 text-green-300 p-4 rounded-xl">
          {successMsg}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">

        <h3 className="text-xl font-semibold text-white mb-6">
          Claim Actions ⚙️
        </h3>

        {/* SUBMITTED → Review */}
        {claim.status === 'SUBMITTED' && canReview && (
          <button
            onClick={handleReview}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-medium transition disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Move to Review'}
          </button>
        )}

        {/* IN_REVIEW → Approve / Reject */}
        {claim.status === 'IN_REVIEW' && canApprove && (
          <div className="space-y-5">

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Approved Amount (₹)
                <span className="ml-2 text-xs text-slate-500">
                  Max: ₹{claim.claimAmount}
                </span>
              </label>
              <input
                type="number"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                max={claim.claimAmount}
                className="w-48 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring
                           focus:border-blue-500 transition"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium transition disabled:opacity-50"
              >
                {isLoading ? 'Approving...' : 'Approve Claim'}
              </button>

              <button
                onClick={handleReject}
                disabled={isLoading}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Reject Claim'}
              </button>
            </div>
          </div>
        )}

        {/* APPROVED → Settle */}
        {claim.status === 'APPROVED' && canSettle && (
          <button
            onClick={handleSettle}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Mark as Settled'}
          </button>
        )}

        {/* Final States */}
        {(claim.status === 'REJECTED' || claim.status === 'SETTLED') && (
          <div className="inline-block bg-slate-700 text-slate-200 px-5 py-2 rounded-xl text-sm font-medium">
            {claim.status === 'REJECTED'
              ? 'Claim Rejected'
              : 'Claim Settled'}
          </div>
        )}

      </div>
    </div>
  );
};

export default ClaimActions;
