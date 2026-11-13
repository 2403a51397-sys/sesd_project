import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Dumbbell, 
  BarChart3, 
  CalendarCheck, 
  ShieldAlert, 
  Clock, 
  LogOut, 
  Menu, 
  X,
  UserCheck
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, liveCrowd }) {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getStatusColor = (level) => {
    switch (level) {
      case 'HIGH': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('live')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Fit<span className="text-emerald-400">Crowd</span>
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Smart Planner</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'live' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Live & Predictions
            </button>

            <button
              onClick={() => setActiveTab('booking')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'booking' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              Book Slots
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'history' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              My Visits
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'admin' 
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Admin Suite
              </button>
            )}
          </nav>

          {/* User & Live Badge */}
          <div className="hidden md:flex items-center gap-4">
            {liveCrowd && (
              <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(liveCrowd.crowdLevel)}`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                <span>{liveCrowd.crowdLevel} CROWD ({liveCrowd.occupancyPercentage}%)</span>
              </div>
            )}

            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <div className="text-right">
                <p className="text-sm font-medium text-white leading-none">{user?.fullName}</p>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${isAdmin ? 'text-purple-400' : 'text-emerald-400'}`}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {liveCrowd && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusColor(liveCrowd.crowdLevel)}`}>
                {liveCrowd.occupancyPercentage}%
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-slate-900 border-b border-slate-800 space-y-1">
          <button
            onClick={() => { setActiveTab('live'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 ${activeTab === 'live' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300'}`}
          >
            <BarChart3 className="w-4 h-4" /> Live Crowd & Predictions
          </button>
          <button
            onClick={() => { setActiveTab('booking'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 ${activeTab === 'booking' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300'}`}
          >
            <CalendarCheck className="w-4 h-4" /> Book Workout Slots
          </button>
          <button
            onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 ${activeTab === 'history' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300'}`}
          >
            <Clock className="w-4 h-4" /> My Visit History
          </button>
          {isAdmin && (
            <button
              onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 ${activeTab === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'text-slate-300'}`}
            >
              <ShieldAlert className="w-4 h-4" /> Admin Analytics & Controls
            </button>
          )}
          <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-300">{user?.fullName} ({user?.role})</span>
            </div>
            <button
              onClick={logout}
              className="text-xs text-rose-400 font-semibold px-2 py-1 rounded hover:bg-rose-500/10"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
