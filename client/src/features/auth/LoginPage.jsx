import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { authAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await authAPI.login(username, password);

      const userObj = {
        ...res.data.user,
        _id: res.data.user.id
      };

      login(userObj, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-72 h-72 bg-indigo-600 rounded-full blur-3xl opacity-20 top-10 left-10"></div>
      <div className="absolute w-72 h-72 bg-cyan-500 rounded-full blur-3xl opacity-20 bottom-10 right-10"></div>

      <div className="w-full max-w-md relative z-10">

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white tracking-wide">
            Insure<span className="text-indigo-500">Sphere</span>
          </h1>
          <p className="text-slate-400 mt-3 text-sm">
            Smart Insurance & Reinsurance Platform
          </p>
        </div>

        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-8">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Username */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900/70 text-white border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900/70 text-white border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-8">
          © 2026 InsureSphere. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
