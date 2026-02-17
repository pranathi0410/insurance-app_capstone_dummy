import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { policyAPI } from '../../services/api';

const PolicyActions = ({ policy, refresh }) => {
  const { user } = useAuth();
  const [actionError, setActionError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check permissions
  const canSubmit = user?.role === 'UNDERWRITER';
  const canApprove = user?.role === 'UNDERWRITER';

  const handleApprove = async () => {
    setActionError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      await policyAPI.approvePolicy(policy._id);
      setSuccessMsg('Policy approved successfully. Risk allocation has been auto-calculated.');
      setTimeout(() => refresh(), 1000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve policy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setActionError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      await policyAPI.submitPolicy(policy._id);
      setSuccessMsg('Policy submitted for approval.');
      setTimeout(() => refresh(), 1000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to submit policy');
    } finally {
      setIsLoading(false);
    }
  };

  // No permission
  if (!canSubmit && !canApprove) {
    return (
      <div className="mt-10 bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-xl backdrop-blur-lg">
        <p className="text-sm">
          You do not have permission to manage policies. Only Underwriters can create and approve policies.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10">

      {/* Error Message */}
      {actionError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl">
          {actionError}
        </div>
      )}

      {/* Success Message */}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
          {successMsg}
        </div>
      )}

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">

        <h3 className="text-xl font-semibold text-white mb-6">
          Policy Actions 📋
        </h3>

        {/* Draft → Submit */}
        {policy.status === 'DRAFT' && canSubmit && (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-6 py-3 rounded-xl font-medium text-white transition
              bg-gradient-to-r from-indigo-500 to-cyan-500
              hover:opacity-90
              ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            {isLoading ? 'Submitting...' : 'Submit for Approval'}
          </button>
        )}

        {/* Submitted → Approve */}
        {policy.status === 'SUBMITTED' && canApprove && (
          <button
            onClick={handleApprove}
            disabled={isLoading}
            className={`px-6 py-3 rounded-xl font-medium text-white transition
              bg-gradient-to-r from-emerald-500 to-teal-500
              hover:opacity-90
              ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            {isLoading ? 'Approving...' : 'Approve Policy & Allocate Risk'}
          </button>
        )}

        {/* Active Status */}
        {policy.status === 'ACTIVE' && (
          <div className="inline-block px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500">
            ✓ Policy Active & Risk Allocated
          </div>
        )}

        {/* Informational Messages */}
        {policy.status === 'DRAFT' && !canSubmit && (
          <p className="text-sm text-slate-400 italic mt-4">
            Policy is in draft. Only Underwriters can submit it for approval.
          </p>
        )}

        {policy.status === 'SUBMITTED' && !canApprove && (
          <p className="text-sm text-slate-400 italic mt-4">
            Policy is awaiting Underwriter approval. Risk allocation will occur when approved.
          </p>
        )}

      </div>
    </div>
  );
};

export default PolicyActions;
