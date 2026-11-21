import React, { useState } from 'react';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import SimulatorControls from '../components/admin/SimulatorControls';
import UserManagement from '../components/admin/UserManagement';
import { Sliders, Users, BarChart3, ShieldCheck } from 'lucide-react';

export default function AdminDashboard({ onStateMutated }) {
  const [adminTab, setAdminTab] = useState('governance');

  return (
    <div className="space-y-6">
      {/* Admin Subtabs Switcher */}
      <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-emerald-100 shadow-sm max-w-lg">
        <button
          type="button"
          onClick={() => setAdminTab('governance')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminTab === 'governance'
              ? 'bg-[#0e6245] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Facility Governance &amp; Simulator</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('users')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            adminTab === 'users'
              ? 'bg-[#0e6245] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User &amp; Coach Approvals</span>
        </button>
      </div>

      {adminTab === 'governance' && (
        <div className="space-y-6">
          {/* Interactive Simulation Sandbox for Presentations */}
          <SimulatorControls onStateMutated={onStateMutated} />

          {/* Analytics & Facility Governance */}
          <AnalyticsDashboard onCapacityChanged={onStateMutated} />
        </div>
      )}

      {adminTab === 'users' && (
        <UserManagement />
      )}
    </div>
  );
}
