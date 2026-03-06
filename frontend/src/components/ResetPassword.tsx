
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useResetPassword } from '../features/authentication/useResetPassword';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const { resetPassword, isPending } = useResetPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }
    resetPassword({ token, password, passwordConfirm });
  };

  return (
    <div className="min-h-screen flex overflow-hidden font-['Plus_Jakarta_Sans']">
      {/* Left Pane: Gradient */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-700">
        <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-indigo-500/10 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-400/10 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4"></div>

        <div className="relative z-10 p-20 flex flex-col justify-between h-full w-full">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/20">
                <i className="fas fa-heartbeat text-2xl"></i>
              </div>
              <span className="text-3xl font-black text-white tracking-tight">HealthSync</span>
            </div>
            <div className="max-w-xl">
              <h1 className="text-6xl font-black text-white leading-[1.1] mb-8">
                New <br />
                <span className="text-indigo-400">Password.</span>
              </h1>
              <p className="text-indigo-100/70 text-xl leading-relaxed font-medium">
                Choose a strong password to keep your account and medical data secure.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="fas fa-shield-alt text-indigo-300 text-xl"></i>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Password Requirements</p>
              <p className="text-indigo-200/60 text-xs mt-1 font-medium">Minimum 8 characters. Use a mix of letters and numbers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 md:p-20 bg-white">
        <div className="max-w-md w-full">
          <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <i className="fas fa-heartbeat text-xl"></i>
            </div>
            <span className="text-2xl font-black text-slate-900">HealthSync</span>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Reset Password</h2>
            <p className="text-slate-500 font-medium">Enter your new password below.</p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold border border-rose-100 mb-8 flex items-center gap-3">
              <i className="fas fa-info-circle"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
              <div className="relative group">
                <i className="fas fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none font-semibold text-slate-700 transition-all"
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative group">
                <i className="fas fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"></i>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white outline-none font-semibold text-slate-700 transition-all"
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-indigo-100 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              Set New Password
              <i className="fas fa-arrow-right text-xs opacity-50"></i>
            </button>
          </form>

          <div className="mt-10 text-center">
            <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2">
              <i className="fas fa-arrow-left text-xs"></i>
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
