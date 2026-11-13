import React, { useState } from 'react';
import { Users, LogIn, LogOut, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export default function LiveGauge({ crowdData, onRefresh, userStatus, onStatusChange }) {
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!crowdData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse text-center">
        <div className="h-4 bg-slate-800 rounded w-1/3 mx-auto mb-4"></div>
        <div className="w-32 h-32 rounded-full border-4 border-slate-800 mx-auto"></div>
      </div>
    );
  }

  const { currentOccupancy, maxCapacity, occupancyPercentage, crowdLevel } = crowdData;

  // Gauge SVG computation
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, occupancyPercentage) / 100) * circumference;

  let strokeColor = '#10b981'; // emerald
  let glowColor = 'rgba(16, 185, 129, 0.2)';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

  if (crowdLevel === 'HIGH') {
    strokeColor = '#f43f5e'; // rose
    glowColor = 'rgba(244, 63, 94, 0.2)';
    badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else if (crowdLevel === 'MEDIUM') {
    strokeColor = '#f59e0b'; // amber
    glowColor = 'rgba(245, 158, 11, 0.2)';
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }

  const handleCheckIn = async () => {
    setActionLoading(true);
    setFeedback(null);
    try {
      await api.checkIn('MANUAL_APP');
      setFeedback({ type: 'success', message: 'Checked in successfully! Have a great workout.' });
      onRefresh();
      onStatusChange();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setFeedback(null);
    try {
      await api.checkOut();
      setFeedback({ type: 'success', message: 'Checked out successfully. Session recorded!' });
      onRefresh();
      onStatusChange();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      {/* Background radial glow */}
      <div 
        className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 opacity-40 transition-all duration-700"
        style={{ backgroundColor: glowColor }}
      />

      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Real-Time Occupancy</span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Live Gym Floor
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h2>
        </div>
        <button
          onClick={onRefresh}
          title="Refresh Live Count"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Circular Gauge */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#1e293b"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={strokeColor}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center stats */}
          <div className="absolute flex flex-col items-center text-center">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {occupancyPercentage}%
            </span>
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
              <Users className="w-3.5 h-3.5" />
              {currentOccupancy} / {maxCapacity}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`mt-3 px-3.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${badgeBg}`}>
          {crowdLevel} CROWD LEVEL
        </div>
      </div>

      {/* Check-In / Check-Out Actions */}
      <div className="mt-6 pt-5 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span>Your Workout State:</span>
          <span className={`font-semibold ${userStatus?.isCheckedIn ? 'text-emerald-400' : 'text-slate-400'}`}>
            {userStatus?.isCheckedIn ? ' Currently on Gym Floor' : ' Not Checked In'}
          </span>
        </div>

        {userStatus?.isCheckedIn ? (
          <button
            onClick={handleCheckOut}
            disabled={actionLoading}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {actionLoading ? 'Recording Check-Out...' : 'Complete Workout & Check Out'}
          </button>
        ) : (
          <button
            onClick={handleCheckIn}
            disabled={actionLoading}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {actionLoading ? 'Recording Check-In...' : 'Check In at Fitness Center'}
          </button>
        )}

        {feedback && (
          <div className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
