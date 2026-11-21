import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage({ onNavigateRegister }) {
  const { loginWithEmail, loginAsDemoRole, signInWithGoogle, signInWithFacebook } = useAuth();
  const [role, setRole] = useState('client');
  const [email, setEmail] = useState('client@fitsphere.com');
  const [password, setPassword] = useState('client123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialProvider, setSocialProvider] = useState(null);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setError('');
    if (selectedRole === 'admin') {
      setEmail('admin@fitsphere.com');
      setPassword('admin123');
    } else if (selectedRole === 'trainer') {
      setEmail('trainer@fitsphere.com');
      setPassword('trainer123');
    } else {
      setEmail('client@fitsphere.com');
      setPassword('client123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password, role);
    } catch (err) {
      setError(
        err?.message ||
        'Unable to sign in. Please check your credentials or use the 1-click Demo buttons below.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoRole) => {
    setError('');
    setLoading(true);
    try {
      await loginAsDemoRole(demoRole);
    } catch (err) {
      setError(err?.message || 'Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSocialProvider('google');
    try {
      await signInWithGoogle(role);
    } catch (err) {
      setError(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setSocialProvider(null);
    }
  };

  const handleFacebookLogin = async () => {
    setError('');
    setSocialProvider('facebook');
    try {
      await signInWithFacebook(role);
    } catch (err) {
      setError(err?.message || 'Facebook sign-in failed. Please try again.');
    } finally {
      setSocialProvider(null);
    }
  };

  const portalLabel =
    role === 'admin'
      ? 'ADMINISTRATOR PORTAL'
      : role === 'trainer'
      ? 'TRAINER PORTAL'
      : 'CUSTOMER PORTAL';

  return (
    <div className="min-h-screen bg-[#edf6f0] flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(14,90,60,0.12)] border border-emerald-100/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Hero Pane - FitSphere Gradient */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#0c5338] via-[#09462f] to-[#063322] p-8 sm:p-10 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Glowing gradient backdrops */}
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute right-10 bottom-24 w-40 h-40 rounded-full border border-emerald-400/10 pointer-events-none" />

          {/* Brand header */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black text-sm tracking-wider font-mono group-hover:scale-105 transition-transform shadow-inner">
                FS
              </div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-display">
                FitSphere{' '}
                <span className="text-emerald-400 font-extrabold text-xs px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/30">
                  AI
                </span>
              </span>
            </div>
          </div>

          {/* Center Callout */}
          <div className="my-10 lg:my-0 relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/25 text-[10px] font-black uppercase tracking-widest text-emerald-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SMART FITNESS &amp; COACHING
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white leading-[1.15] tracking-tight font-display">
              Fitness ecosystem.
              <br />
              <span className="text-emerald-300">Simplified.</span>
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/80 font-medium leading-relaxed max-w-md">
              Raise requests, track workouts, follow biomechanics, and get AI-guided training and client approvals from one clean workspace.
            </p>
          </div>

          {/* Bottom 3 Metric Highlights */}
          <div className="relative z-10 grid grid-cols-3 gap-3 pt-6 border-t border-emerald-400/20">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-3.5 text-left hover:bg-white/15 transition-colors">
              <div className="text-base sm:text-lg font-black text-white font-mono">24/7</div>
              <div className="text-[10px] text-emerald-200/90 font-bold leading-tight mt-0.5">
                AI Support
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-3.5 text-left hover:bg-white/15 transition-colors">
              <div className="text-base sm:text-lg font-black text-white font-mono">AI</div>
              <div className="text-[10px] text-emerald-200/90 font-bold leading-tight mt-0.5">
                Powered
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-3.5 text-left hover:bg-white/15 transition-colors">
              <div className="text-base sm:text-lg font-black text-white font-mono">Fast</div>
              <div className="text-[10px] text-emerald-200/90 font-bold leading-tight mt-0.5">
                Approvals
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="lg:col-span-6 p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md mx-auto space-y-6">
            {/* Title & Portal Badge */}
            <div>
              <span className="text-[10px] font-black text-emerald-600 tracking-widest uppercase font-mono block mb-1">
                {portalLabel}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
                Sign in
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Access your FitSphere workspace.
              </p>
            </div>

            {/* 3-Way Portal Selector Pills */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === 'admin'
                    ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('trainer')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === 'trainer'
                    ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Agent</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('client')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === 'client'
                    ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Customer</span>
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold leading-relaxed flex items-start gap-2 animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                  Email or username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-emerald-600/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com or username"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/60 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider font-mono">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-600/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-50/60 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#0e6245] hover:bg-[#0b5037] active:bg-[#083e2a] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/15 hover:shadow-emerald-900/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{loading ? 'Signing In...' : 'Sign in'}</span>
              </button>
            </form>

            {/* Social Authentication Options: Google & Facebook */}
            <div className="space-y-3">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono shrink-0">
                  Or continue with social
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Google Sign-in */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading || !!socialProvider}
                  className="w-full py-3 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs transition-all flex items-center justify-center gap-2.5 shadow-xs hover:border-slate-300 cursor-pointer disabled:opacity-60"
                >
                  {socialProvider === 'google' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  <span>Google</span>
                </button>

                {/* Facebook Sign-in */}
                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  disabled={loading || !!socialProvider}
                  className="w-full py-3 px-3 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] active:bg-[#1465ce] text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60"
                >
                  {socialProvider === 'facebook' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  <span>Facebook</span>
                </button>
              </div>
            </div>

            {/* Quick Demo 1-Click Credentials */}
            <div className="pt-2 border-t border-slate-100 text-center space-y-2.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">
                QUICK DEMO CREDENTIALS
              </span>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-black text-slate-700 hover:text-emerald-800 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>👑 Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('trainer')}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-black text-slate-700 hover:text-emerald-800 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>🏋️ Agent / Trainer</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('client')}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-black text-slate-700 hover:text-emerald-800 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>👤 Customer</span>
                </button>
              </div>
            </div>

            {/* Register link */}
            <div className="pt-1 text-center">
              <p className="text-xs text-slate-500 font-semibold">
                New to FitSphere?{' '}
                <button
                  type="button"
                  onClick={onNavigateRegister}
                  className="text-emerald-700 hover:text-emerald-800 font-black hover:underline transition-colors cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
