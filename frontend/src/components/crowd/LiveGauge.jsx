import React, { useState } from 'react';
import { Users, LogIn, LogOut, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export default function LiveGauge({ crowdData, onRefresh, userStatus, onStatusChange }) {
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!crowdData) {
    return (
      <div className="bg-white border border-emerald-100 rounded-3xl p-6 animate-pulse text-center shadow-sm">
        <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto mb-4"></div>
        <div className="w-32 h-32 rounded-full border-4 border-slate-200 mx-auto"></div>
      </div>
    );
  }

  const { currentOccupancy, maxCapacity, occupancyPercentage, crowdLevel } = crowdData;

  // Gauge SVG computation
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, occupancyPercentage) / 100) * circumference;

  let strokeColor = '#0e6245'; // Forest Emerald
  let glowColor = 'rgba(14, 98, 69, 0.15)';
  let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';

  if (crowdLevel === 'HIGH') {
    strokeColor = '#e11d48'; // Rose
    glowColor = 'rgba(225, 29, 72, 0.15)';
    badgeBg = 'bg-rose-50 text-rose-800 border-rose-200';
  } else if (crowdLevel === 'MEDIUM') {
    strokeColor = '#d97706'; // Amber
    glowColor = 'rgba(217, 119, 6, 0.15)';
    badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
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
    <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
      {/* Background radial glow */}
      <div 
        className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 opacity-60 transition-all duration-700"
        style={{ backgroundColor: glowColor }}
      />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 font-mono">
            Real-Time Occupancy
          </span>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 font-display">
            Live Gym Floor
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
          </h2>
        </div>
        <button
          onClick={onRefresh}
          title="Refresh Live Count"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Circular Gauge */}
      <div className="flex flex-col items-center justify-center my-4 relative z-10">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#e2e8f0"
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
            <span className="text-4xl font-black text-slate-900 tracking-tight font-display">
              {occupancyPercentage}%
            </span>
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              {currentOccupancy} / {maxCapacity}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`mt-3 px-3.5 py-1 rounded-full text-xs font-black border uppercase tracking-wider font-mono ${badgeBg}`}>
          {crowdLevel} DENSITY LEVEL
        </div>
      </div>

      {/* Check-In / Check-Out Actions */}
      <div className="mt-6 pt-5 border-t border-slate-100 relative z-10">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <span>Your Floor State:</span>
          <span className={`font-bold ${userStatus?.isCheckedIn ? 'text-emerald-700' : 'text-slate-400'}`}>
            {userStatus?.isCheckedIn ? '● Currently on Gym Floor' : '○ Not Checked In'}
          </span>
        </div>

        {userStatus?.isCheckedIn ? (
          <button
            onClick={handleCheckOut}
            disabled={actionLoading}
            className="w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {actionLoading ? 'Recording Check-Out...' : 'Complete Workout & Check Out'}
          </button>
        ) : (
          <button
            onClick={handleCheckIn}
            disabled={actionLoading}
            className="w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider bg-[#0e6245] hover:bg-[#0b5037] text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {actionLoading ? 'Recording Check-In...' : 'Check In at Fitness Center'}
          </button>
        )}

        {feedback && (
          <div className={`mt-3 p-3 rounded-2xl text-xs flex items-center gap-2 font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
