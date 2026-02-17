import React, { useEffect, useState } from "react";
import { reinsuranceAPI } from "../../services/api";

const AllocationTable = ({ policyId }) => {
  const [allocations, setAllocations] = useState([]);
  const [retainedAmount, setRetainedAmount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const res = await reinsuranceAPI.getRiskAllocations(policyId);
        if (res.data.length > 0) {
          setAllocations(res.data[0].allocations);
          setRetainedAmount(res.data[0].retainedAmount);
        } else {
          setAllocations([]);
          setRetainedAmount(0);
        }
      } catch (err) {
        setError("Failed to load allocations");
      }
    };

    if (policyId) fetchAllocations();
  }, [policyId]);

  const validateAllocations = () => {
    return allocations.some(
      (a) => a.allocatedAmount > a.treatyId?.treatyLimit
    );
  };

  if (!policyId)
    return (
      <p className="text-slate-400 mt-6">
        Select a policy to view allocations.
      </p>
    );

  if (error)
    return (
      <p className="text-red-400 font-medium mt-6">
        {error}
      </p>
    );

  return (
    <div className="mt-10 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">

      {/* Title */}
      <h3 className="text-2xl font-semibold text-white mb-6">
        Risk Allocation Table
      </h3>

      {/* Validation Warning */}
      {validateAllocations() && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
          One or more allocations exceed treaty limits!
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-sm text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4 text-left">Reinsurer</th>
              <th className="px-6 py-4 text-left">Treaty</th>
              <th className="px-6 py-4 text-right">Allocated Amount</th>
              <th className="px-6 py-4 text-right">Allocated %</th>
              <th className="px-6 py-4 text-right">Treaty Limit</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {allocations.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-slate-500"
                >
                  No allocations found
                </td>
              </tr>
            ) : (
              allocations.map((a, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-800/50 transition"
                >
                  <td className="px-6 py-4 text-white">
                    {a.reinsurerId?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {a.treatyId?.treatyName || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-white">
                    ₹{a.allocatedAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {a.allocatedPercentage}%
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400">
                    ₹{a.treatyId?.treatyLimit?.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Retained Amount */}
      <div className="mt-6 text-lg">
        <span className="text-slate-400">
          Retained Amount:
        </span>{" "}
        <span className="font-semibold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          ₹{retainedAmount.toLocaleString()}
        </span>
      </div>

    </div>
  );
};

export default AllocationTable;
