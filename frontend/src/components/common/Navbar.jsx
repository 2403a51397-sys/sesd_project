import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart3, 
  CalendarCheck, 
  ShieldAlert, 
  Clock, 
  LogOut, 
  Menu, 
  X,
  Users,
  Dumbbell,
  Sparkles,
  ShoppingBag,
  ShoppingCart
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export default function Navbar({ activeTab, setActiveTab, liveCrowd }) {
  const { user, isAdmin, isTrainer, logout } = useAuth();
  const { totals, setIsCartOpen } = useShop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getStatusColor = (level) => {
    switch (level) {
      case 'HIGH': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return { label: 'Admin', class: 'bg-purple-100 text-purple-800 border-purple-200' };
    }
    if (role === 'trainer') {
      return { label: 'Coach / Agent', class: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    return { label: 'Customer', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  const roleBadge = getRoleBadge(user?.role);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab(isTrainer ? 'trainer' : isAdmin ? 'admin' : 'live')}
          >
            <div className="w-10 h-10 rounded-2xl bg-[#0e6245] flex items-center justify-center text-white font-black text-sm tracking-wider font-mono shadow-md group-hover:scale-105 transition-transform">
              FS
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5 font-display">
                FitSphere{' '}
                <span className="text-emerald-700 font-extrabold text-xs px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 font-mono">
                  AI
                </span>
              </span>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold font-mono">
                Neural Fitness Platform
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {isTrainer ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('trainer')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'trainer'
                      ? 'bg-[#0e6245] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Coach Workspace
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('live')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'live'
                      ? 'bg-[#0e6245] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Floor Crowd Status
                </button>
              </>
            ) : isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-[#0e6245] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  Administrator Suite
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('live')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'live'
                      ? 'bg-[#0e6245] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Live Floor View
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('live')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'live'
                      ? 'bg-[#0e6245] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Live &amp; Predictions
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('booking')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'booking'
                      ? 'bg-[#0e6245] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  Book Slots
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-[#0e6245] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  My Visits
                </button>
              </>
            )}

            {/* Pro Shop Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('store')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'store'
                  ? 'bg-[#0e6245] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Pro Shop
            </button>
          </nav>

          {/* User Profile & Live Density Badge */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart Trigger with live count */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              title="Shopping Bag"
              className="relative p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              {totals.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-black flex items-center justify-center shadow-sm animate-pulse">
                  {totals.itemCount}
                </span>
              )}
            </button>
            {liveCrowd && (
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${getStatusColor(
                  liveCrowd.crowdLevel
                )}`}
              >
                <span className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
                <span className="font-mono">
                  {liveCrowd.crowdLevel} DENSITY ({liveCrowd.occupancyPercentage}%)
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center overflow-hidden shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-xs text-emerald-800">
                    {(user?.fullName || user?.name || 'U').charAt(0)}
                  </span>
                )}
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.fullName || user?.name}
                </p>
                <span
                  className={`text-[9px] uppercase font-mono font-black px-1.5 py-0.2 rounded border ${roleBadge.class}`}
                >
                  {roleBadge.label}
                </span>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" />
              {totals.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                  {totals.itemCount}
                </span>
              )}
            </button>
            {liveCrowd && (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getStatusColor(
                  liveCrowd.crowdLevel
                )}`}
              >
                {liveCrowd.occupancyPercentage}%
              </span>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-white border-b border-emerald-100 space-y-1">
          {isTrainer ? (
            <>
              <button
                type="button"
                onClick={() => { setActiveTab('trainer'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
                  activeTab === 'trainer' ? 'bg-[#0e6245] text-white' : 'text-slate-700'
                }`}
              >
                <Users className="w-4 h-4" /> Coach Workspace
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('live'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
                  activeTab === 'live' ? 'bg-[#0e6245] text-white' : 'text-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Floor Crowd Status
              </button>
            </>
          ) : isAdmin ? (
            <>
              <button
                type="button"
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
                  activeTab === 'admin' ? 'bg-[#0e6245] text-white' : 'text-slate-700'
                }`}
              >
                <ShieldAlert className="w-4 h-4" /> Admin Suite
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('live'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
                  activeTab === 'live' ? 'bg-[#0e6245] text-white' : 'text-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Live Floor
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setActiveTab('live'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
                  activeTab === 'live' ? 'bg-[#0e6245] text-white' : 'text-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Live Crowd &amp; Predictions
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('booking'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
                  activeTab === 'booking' ? 'bg-[#0e6245] text-white' : 'text-slate-700'
                }`}
              >
                <CalendarCheck className="w-4 h-4" /> Book Workout Slots
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
                  activeTab === 'history' ? 'bg-[#0e6245] text-white' : 'text-slate-700'
                }`}
              >
                <Clock className="w-4 h-4" /> My Visit History
              </button>
            </>
          )}

          {/* Mobile Pro Shop link */}
          <button
            type="button"
            onClick={() => { setActiveTab('store'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
              activeTab === 'store' ? 'bg-[#0e6245] text-white' : 'text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" /> Pro Shop &amp; Nutrition
            </span>
            {totals.itemCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-mono font-bold">
                {totals.itemCount} in bag
              </span>
            )}
          </button>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs font-medium text-slate-700">
              {user?.fullName || user?.name} ({roleBadge.label})
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-xs text-rose-600 font-bold px-2 py-1 rounded-lg hover:bg-rose-50"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
