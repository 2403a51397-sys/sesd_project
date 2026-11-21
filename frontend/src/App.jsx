import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PendingApproval from './pages/PendingApproval';
import MemberDashboard from './pages/MemberDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import ShopView from './components/shop/ShopView';
import Navbar from './components/common/Navbar';
import { api } from './services/api';

export default function App() {
  const { user, isAuthenticated, loading, isAdmin, isTrainer, isPendingTrainer, logout } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register' | 'pending'
  const [activeTab, setActiveTab] = useState('live');
  const [liveCrowd, setLiveCrowd] = useState(null);

  // Set default active tab based on role upon authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'trainer') {
        setActiveTab('trainer');
      } else if (user.role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('live');
      }
    }
  }, [isAuthenticated, user?.role]);

  const refreshLiveCrowd = async () => {
    try {
      const res = await api.getLiveCrowd();
      setLiveCrowd(res.data);
    } catch (err) {
      console.error('Failed to fetch live crowd:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshLiveCrowd();
      // Poll every 30 seconds for live counter updates
      const interval = setInterval(refreshLiveCrowd, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#edf6f0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#0e6245] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500 font-mono tracking-wider uppercase">Loading FitSphere...</p>
        </div>
      </div>
    );
  }

  // Not Authenticated flow
  if (!isAuthenticated) {
    if (authView === 'register') {
      return (
        <RegisterPage
          onNavigateLogin={() => setAuthView('login')}
          onPendingTrainer={() => setAuthView('pending')}
        />
      );
    }
    if (authView === 'pending') {
      return <PendingApproval onBackToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onNavigateRegister={() => setAuthView('register')} />;
  }

  // Pending Trainer Approval guard
  if (isPendingTrainer) {
    return <PendingApproval onBackToLogin={logout} />;
  }

  return (
    <div className="min-h-screen bg-[#edf6f0] text-slate-800 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        liveCrowd={liveCrowd}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'store' ? (
          <ShopView />
        ) : activeTab === 'trainer' && isTrainer ? (
          <TrainerDashboard liveCrowd={liveCrowd} />
        ) : activeTab === 'admin' && isAdmin ? (
          <AdminDashboard onStateMutated={refreshLiveCrowd} />
        ) : (
          <MemberDashboard
            activeTab={activeTab}
            liveCrowd={liveCrowd}
            onRefreshLive={refreshLiveCrowd}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-100 bg-white/80 py-6 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-4 h-4 rounded-md bg-[#0e6245] flex items-center justify-center text-[9px] text-white font-mono font-bold">
            FS
          </div>
          <span className="font-bold text-slate-800">FitSphere AI</span>
          <span>&bull;</span>
          <span>Neural Fitness &amp; Wellness Ecosystem</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Smart Load Balancing, Biomechanics &amp; Algorithmic Peak-Shift Planner &bull; 2026
        </p>
      </footer>
    </div>
  );
}
