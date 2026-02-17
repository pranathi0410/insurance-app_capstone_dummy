import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../../services/api';

const RiskDistributionChart = () => {
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        const res = await dashboardAPI.getReinsurerRiskDistribution();
        setDistribution(res.data);
      } catch (err) {
        setError('Failed to load risk distribution data');
      } finally {
        setLoading(false);
      }
    };
    fetchDistribution();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-1/3"></div>
          <div className="h-4 bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-800 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-red-500/30 text-red-400 rounded-2xl p-6">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">

      <h3 className="text-xl font-semibold text-white mb-6">
        Risk Distribution by Reinsurer 🔄
      </h3>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-sm text-slate-300">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4 text-left">
                Reinsurer
              </th>
              <th className="px-6 py-4 text-right">
                Total Allocated
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {distribution.length > 0 ? (
              distribution.map((row, idx) => (
                <tr
                  key={row._id}
                  className="hover:bg-slate-800/50 transition"
                >
                  <td className="px-6 py-4 text-white font-medium">
                    {row._id}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    ₹{row.totalAllocated?.toFixed(2) || 0}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="2"
                  className="px-6 py-6 text-center text-slate-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default RiskDistributionChart;
