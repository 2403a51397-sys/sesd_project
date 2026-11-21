import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, ArrowRight, ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function RegisterPage({ onNavigateLogin, onPendingTrainer }) {
  const { registerWithEmail, signInWithGoogle, signInWithFacebook } = useAuth();
  const [step, setStep] = useState(1);
  const [socialProvider, setSocialProvider] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    phone: '',
    address: '',
    gender: 'male',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('A valid email address is required');
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.gender) {
      setError('Please select your biomechanical avatar');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await registerWithEmail({
        email: formData.email,
        password: formData.password,
        fullName: formData.name,
        role: formData.role,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
      });

      if (formData.role === 'trainer') {
        onPendingTrainer();
      }
    } catch (err) {
      setError(err?.message || 'Registration failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf6f0] flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-xl">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <button
            type="button"
            onClick={onNavigateLogin}
            className="inline-flex items-center gap-2.5 mb-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#0e6245] flex items-center justify-center shadow-md text-white font-mono font-black text-sm group-hover:scale-105 transition-transform">
              FS
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight font-display">
              FitSphere <span className="text-emerald-600">AI</span>
            </span>
          </button>
          <p className="text-xs text-slate-500 font-semibold">
            {step === 1
              ? 'Create your athlete or coach credentials'
              : 'Personalize your biomechanical profile avatar'}
          </p>
        </div>

        {/* Card Body */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-[0_20px_50px_rgba(14,90,60,0.1)] p-8 sm:p-10 space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black font-mono ${
                  step === 1 ? 'bg-[#0e6245] text-white' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                1
              </span>
              <span className="text-xs font-bold text-slate-700">Account Details</span>
            </div>
            <div className="h-0.5 w-12 bg-slate-200">
              <div
                className={`h-full bg-emerald-600 transition-all ${
                  step === 2 ? 'w-full' : 'w-0'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black font-mono ${
                  step === 2 ? 'bg-[#0e6245] text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                2
              </span>
              <span className="text-xs font-bold text-slate-700">Biomechanical Avatar</span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold leading-relaxed flex items-start gap-2 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Step 1: Form Inputs */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Role Toggle */}
              <div>
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                  I am registering as
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => updateField('role', 'client')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      formData.role === 'client'
                        ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>👤 Customer / Athlete</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('role', 'trainer')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      formData.role === 'trainer'
                        ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>🏋️ Agent / Coach</span>
                  </button>
                </div>
                {formData.role === 'trainer' && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl mt-2 font-medium">
                    Note: Trainer accounts require administrator verification and approval before full platform access is enabled.
                  </p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1 font-mono">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-600/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/60 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1 font-mono">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-emerald-600/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/60 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1 font-mono">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-emerald-600/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="Min 8 chars"
                      className="w-full pl-10 pr-9 py-3 rounded-2xl bg-slate-50/60 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1 font-mono">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-emerald-600/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/60 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1 font-mono">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-emerald-600/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/60 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1 font-mono">
                    City / Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-emerald-600/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/60 border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Continue button */}
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 rounded-2xl bg-[#0e6245] hover:bg-[#0b5037] active:bg-[#083e2a] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/15 hover:shadow-emerald-900/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span>Continue to Avatar Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Or Social Sign up */}
              <div className="pt-2">
                <div className="relative flex items-center justify-center mb-3">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono shrink-0">
                    Or 1-click sign up with
                  </span>
                  <div className="border-t border-slate-200 w-full" />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={async () => {
                      setError('');
                      setSocialProvider('google');
                      try {
                        await signInWithGoogle(formData.role);
                      } catch (err) {
                        setError(err?.message || 'Google sign-up failed.');
                      } finally {
                        setSocialProvider(null);
                      }
                    }}
                    disabled={loading || !!socialProvider}
                    className="py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    {socialProvider === 'google' ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    ) : (
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setError('');
                      setSocialProvider('facebook');
                      try {
                        await signInWithFacebook(formData.role);
                      } catch (err) {
                        setError(err?.message || 'Facebook sign-up failed.');
                      } finally {
                        setSocialProvider(null);
                      }
                    }}
                    disabled={loading || !!socialProvider}
                    className="py-2.5 px-3 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
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
            </div>
          )}

          {/* Step 2: Biomechanical Avatar Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-900 font-display">
                  Select Profile Biomechanic Archetype
                </h3>
                <p className="text-xs text-slate-500">
                  Calibrates your motion tracking and kinematic load calculations.
                </p>
              </div>

              {/* Avatar Selector Cards */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => updateField('gender', 'male')}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${
                    formData.gender === 'male'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-md scale-102'
                      : 'border-slate-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl shadow-inner">
                    🏃‍♂️
                  </div>
                  <span className="text-xs font-black text-slate-800">Male Athlete</span>
                  <span className="text-[10px] text-slate-400 font-medium">Kinematic Model A</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateField('gender', 'female')}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${
                    formData.gender === 'female'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-md scale-102'
                      : 'border-slate-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-2xl shadow-inner">
                    🏃‍♀️
                  </div>
                  <span className="text-xs font-black text-slate-800">Female Athlete</span>
                  <span className="text-[10px] text-slate-400 font-medium">Kinematic Model B</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateField('gender', 'athlete')}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 cursor-pointer ${
                    formData.gender === 'athlete'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-md scale-102'
                      : 'border-slate-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl shadow-inner">
                    ⚡
                  </div>
                  <span className="text-xs font-black text-slate-800">Elite / Hybrid</span>
                  <span className="text-[10px] text-slate-400 font-medium">Dynamic Model C</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-2xl bg-[#0e6245] hover:bg-[#0b5037] active:bg-[#083e2a] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/15 hover:shadow-emerald-900/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {loading
                      ? 'Registering Account...'
                      : formData.role === 'trainer'
                      ? 'Submit Trainer Application'
                      : 'Complete FitSphere Registration'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Back to Login */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-semibold">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateLogin}
                className="text-emerald-700 hover:text-emerald-800 font-black hover:underline transition-colors cursor-pointer"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
