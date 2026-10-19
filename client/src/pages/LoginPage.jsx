import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Shield, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const LoginPage = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (role) => {
    try {
      setLoading(true);
      setError(null);
      await quickLogin(role);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 mx-auto flex items-center justify-center text-white shadow-md mb-3">
            <BookOpen className="w-7 h-7 text-purple-100" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Learn<span className="text-purple-600">Vault</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Private Learning &amp; Knowledge Management Repository
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@learnvault.local"
                  className="w-full pl-3.5 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to LearnVault'}
            </button>
          </form>

          {/* Quick Login Presets for Private Pair-Learning */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 text-center">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              One-Click Private Access
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuick('admin')}
                disabled={loading}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-purple-200 bg-slate-50 hover:bg-slate-100 text-purple-800 text-xs font-semibold transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin Login</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuick('friend')}
                disabled={loading}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <User className="w-3.5 h-3.5 text-purple-600" />
                <span>Friend Login</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-3">
              Private study repository for pair learning. No social media or public registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
