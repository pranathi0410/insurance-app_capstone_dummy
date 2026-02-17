import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  let menuItems = [];
  if (user?.role === 'ADMIN') {
    menuItems.push({ label: 'Users List', path: '/admin', icon: '⚙️' });
    menuItems.push({ label: 'Audit Logs', path: '/admin/audit-logs', icon: '📜' });
    menuItems.push({ label: 'Policies', path: '/policy', icon: '📋' });
    menuItems.push({ label: 'Claims', path: '/claims', icon: '💼' });
    menuItems.push({ label: 'Reinsurance', path: '/reinsurance', icon: '🔄' });
  } else if (user?.role === 'UNDERWRITER') {
    menuItems.push({ label: 'Policies', path: '/policy', icon: '📋' });
  } else if (user?.role === 'CLAIMS_ADJUSTER') {
    menuItems.push({ label: 'Policies', path: '/policy', icon: '📋' });
    menuItems.push({ label: 'Claims', path: '/claims', icon: '💼' });
  } else if (user?.role === 'REINSURANCE_MANAGER') {
    menuItems.push({ label: 'Policies', path: '/policy', icon: '📋' });
    menuItems.push({ label: 'Reinsurance', path: '/reinsurance', icon: '🔄' });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
  <nav className="bg-slate-950 border-b border-white/5 shadow-md sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="text-lg font-bold text-white tracking-wide">
              Insure<span className="text-indigo-400">Sphere</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-white">
                {user?.username}
              </div>
              <div className="text-xs text-slate-400">
                {user?.role?.replace(/_/g, ' ')}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:opacity-90 transition-all"
            >
              Logout
            </button>
          </div>

          {/* Mobile Button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-3 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="w-full mt-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:opacity-90 transition-all"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
