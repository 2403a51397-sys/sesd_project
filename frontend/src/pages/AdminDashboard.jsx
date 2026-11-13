import React from 'react';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import SimulatorControls from '../components/admin/SimulatorControls';

export default function AdminDashboard({ onStateMutated }) {
  return (
    <div className="space-y-6">
      {/* Interactive Simulation Sandbox for Presentations */}
      <SimulatorControls onStateMutated={onStateMutated} />

      {/* Analytics & Facility Governance */}
      <AnalyticsDashboard onCapacityChanged={onStateMutated} />
    </div>
  );
}
