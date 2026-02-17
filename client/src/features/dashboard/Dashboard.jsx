import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { policyAPI, claimAPI, adminAPI } from '../../services/api';
import ExposureDashboard from './ExposureDashboard';
import ClaimsRatioChart from './ClaimsRatioChart';
import RiskDistributionChart from './RiskDistributionChart';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ policies: 0, claims: 0, users: 0, loading: true });
  const [lob, setLob] = useState('ALL');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [policiesRes, claimsRes, usersRes] = await Promise.all([
          policyAPI.getPolicies(),
          claimAPI.getClaims(),
          adminAPI.getUsers()
        ]);
        setStats({
          policies: policiesRes.data.length,
          claims: claimsRes.data.length,
          users: usersRes.data.length,
          loading: false
        });
      } catch (err) {
        console.error(err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ label, value, icon }) => (
    <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl rounded-2xl p-6 hover:scale-[1.02] transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-2">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="text-4xl opacity-70">{icon}</div>
      </div>
    </div>
  );

  const role = user?.role;

  const renderDashboard = () => {
    switch (role) {
      case 'ADMIN':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">Admin Dashboard</h2>
            <p className="text-slate-400 mb-6">Manage users, roles, and system configuration.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Total Users" value={stats.loading ? '...' : stats.users} icon="👥" />
              <StatCard label="Total Policies" value={stats.loading ? '...' : stats.policies} icon="📋" />
              <StatCard label="Total Claims" value={stats.loading ? '...' : stats.claims} icon="💼" />
            </div>
          </div>
        );
      case 'UNDERWRITER':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">Underwriter Dashboard</h2>
            <p className="text-slate-400 mb-6">Create and approve policies. View analytics below.</p>
            <StatCard label="Total Policies" value={stats.loading ? '...' : stats.policies} icon="📋" />
          </div>
        );
      case 'CLAIMS_ADJUSTER':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">Claims Adjuster Dashboard</h2>
            <p className="text-slate-400 mb-6">Review and settle claims. Analytics below.</p>
            <div className="mt-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <ClaimsRatioChart filterLob={lob} />
            </div>
          </div>
        );
      case 'REINSURANCE_MANAGER':
        return (
          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">Reinsurance Manager Dashboard</h2>
            <p className="text-slate-400 mb-6">Manage treaties and validate allocations.</p>
            <div className="mt-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <RiskDistributionChart />
            </div>
          </div>
        );
      default:
        return (
          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">User Dashboard</h2>
            <p className="text-slate-400">Welcome to the Insurance Platform.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-10 top-20 left-10"></div>
      <div className="absolute w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-10 bottom-20 right-10"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">
            Welcome back, <span className="text-indigo-400">{user?.username}</span> 👋
          </h1>
          <p className="text-slate-400 mt-3">
            Smart Insurance & Reinsurance Management Platform
          </p>
        </div>

        {renderDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
