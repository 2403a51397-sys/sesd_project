import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import MemberDashboard from './pages/MemberDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/common/Navbar';
import { api } from './services/api';

export default function App() {
  const { user, isAuthenticated, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('live');
  const [liveCrowd, setLiveCrowd] = useState(null);

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        liveCrowd={liveCrowd}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'admin' && isAdmin ? (
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
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <p>FitCrowd – Smart Fitness Center Visit Planner & Load Balancer</p>
        <p className="mt-1 text-[11px] text-slate-400">
          Software Engineering & System Design Academic Capstone Project • 2026
        </p>
      </footer>
    </div>
  );
}
