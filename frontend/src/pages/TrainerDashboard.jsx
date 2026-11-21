import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Dumbbell, 
  Calendar, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Plus, 
  ChevronRight,
  TrendingUp,
  Target
} from 'lucide-react';

export default function TrainerDashboard({ liveCrowd }) {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('clients');
  const [selectedClient, setSelectedClient] = useState(null);
  const [planSuccess, setPlanSuccess] = useState('');

  const [clients, setClients] = useState([
    {
      id: 1,
      name: 'Kundan Saduyashwanth',
      email: 'client@fitsphere.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
      goal: 'Hypertrophy & Strength',
      level: 'Level 4 Athlete',
      streak: '5 Days',
      compliance: '94%',
      lastSession: 'Today, 08:30 AM',
      currentPlan: 'Push-Pull-Legs Split',
    },
    {
      id: 2,
      name: 'Alex Chen',
      email: 'alex@fitcrowd.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      goal: 'Endurance & Stamina',
      level: 'Level 3 Member',
      streak: '3 Days',
      compliance: '88%',
      lastSession: 'Yesterday, 05:00 PM',
      currentPlan: 'HIIT Conditioning',
    },
    {
      id: 3,
      name: 'Sarah Connor',
      email: 'sarah.c@fitsphere.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
      goal: 'Kinematic Rehab',
      level: 'Level 5 Athlete',
      streak: '8 Days',
      compliance: '98%',
      lastSession: '2 days ago',
      currentPlan: 'Functional Core & Mobility',
    },
  ]);

  const [plans, setPlans] = useState([
    {
      title: 'Neural Hypertrophy Split',
      focus: 'Chest & Delts',
      exercises: ['Incline Dumbbell Press (4x10)', 'Lateral Raises (3x15)', 'Cable Flys (3x12)'],
    },
    {
      title: 'Kinematic Leg Power',
      focus: 'Posterior Chain',
      exercises: ['Barbell Back Squats (5x5)', 'Romanian Deadlifts (4x8)', 'Standing Calf Raises (4x15)'],
    },
    {
      title: 'Core & Kinetic Stability',
      focus: 'Functional Conditioning',
      exercises: ['Plank Holds (3x60s)', 'Hanging Leg Raises (4x12)', 'Ab Rollouts (3x10)'],
    },
  ]);

  const [newPlan, setNewPlan] = useState({
    title: '',
    focus: '',
    exercises: '',
  });

  const handleAddPlan = (e) => {
    e.preventDefault();
    if (!newPlan.title || !newPlan.focus) return;
    setPlans([
      ...plans,
      {
        title: newPlan.title,
        focus: newPlan.focus,
        exercises: newPlan.exercises.split(',').map((x) => x.trim()),
      },
    ]);
    setNewPlan({ title: '', focus: '', exercises: '' });
    setPlanSuccess('New workout plan assigned successfully!');
    setTimeout(() => setPlanSuccess(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Coach Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0c5338] via-[#09462f] to-[#063322] rounded-3xl p-6 sm:p-8 text-white shadow-emerald-card relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center overflow-hidden shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="Trainer" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="text-2xl font-black font-display">FS</div>
              )}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-mono font-bold tracking-wider uppercase mb-1">
                <Sparkles className="w-3 h-3" />
                VERIFIED HEAD COACH &bull; FITSPHERE AGENT
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display">
                {user?.fullName || user?.name || 'Coach Marcus Vance'}
              </h1>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Manage assigned client athletes, prescribe training splits, and monitor floor density in real time.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 text-center min-w-[90px]">
              <div className="text-xl font-black font-mono">3</div>
              <div className="text-[10px] text-emerald-200 font-bold">Active Clients</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 text-center min-w-[90px]">
              <div className="text-xl font-black font-mono">94%</div>
              <div className="text-[10px] text-emerald-200 font-bold">Avg Adherence</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 text-center min-w-[90px]">
              <div className="text-xl font-black font-mono">{liveCrowd?.occupancyRatio || '28%'}</div>
              <div className="text-[10px] text-emerald-200 font-bold">Floor Density</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub navigation tabs */}
      <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-emerald-100 shadow-sm max-w-md">
        <button
          onClick={() => setActiveSubTab('clients')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'clients'
              ? 'bg-[#0e6245] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Client Athletes</span>
        </button>
        <button
          onClick={() => setActiveSubTab('plan-builder')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'plan-builder'
              ? 'bg-[#0e6245] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Plan Builder</span>
        </button>
        <button
          onClick={() => setActiveSubTab('schedule')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'schedule'
              ? 'bg-[#0e6245] text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Floor Schedule</span>
        </button>
      </div>

      {/* Subtab 1: Client Athletes */}
      {activeSubTab === 'clients' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 font-display">
                    Assigned Athlete Roster
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time kinematics, streak tracking, and attendance records.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {clients.length} Active Athletes
                </span>
              </div>

              <div className="space-y-3">
                {clients.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedClient(c)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedClient?.id === c.id
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {c.level}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{c.goal}</p>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                          <span>Streak: <b className="text-slate-700">{c.streak}</b></span>
                          <span>&bull;</span>
                          <span>Last: <b className="text-slate-700">{c.lastSession}</b></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-700 font-mono">
                        {c.compliance}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Adherence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Client Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-black text-slate-900 font-display">
                Athlete Diagnostics
              </h3>

              {selectedClient ? (
                <div className="space-y-4">
                  <div className="text-center pb-4 border-b border-slate-100">
                    <img
                      src={selectedClient.avatar}
                      alt={selectedClient.name}
                      className="w-16 h-16 rounded-3xl mx-auto mb-2 object-cover border-2 border-emerald-500 shadow-md"
                    />
                    <h4 className="font-bold text-slate-900">{selectedClient.name}</h4>
                    <p className="text-xs text-slate-500">{selectedClient.email}</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Current Split:</span>
                      <span className="font-bold text-slate-800">{selectedClient.currentPlan}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Primary Goal:</span>
                      <span className="font-bold text-slate-800">{selectedClient.goal}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Weekly Consistency:</span>
                      <span className="font-bold text-emerald-600">{selectedClient.compliance}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSubTab('plan-builder')}
                    className="w-full py-2.5 rounded-xl bg-[#0e6245] hover:bg-[#0b5037] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Dumbbell className="w-3.5 h-3.5" />
                    <span>Assign Custom Routine</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <Users className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">Click any athlete on the roster to inspect kinematic logs and update prescription.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Plan Builder */}
      {activeSubTab === 'plan-builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-emerald-600" />
              <span>Prescribe Training Routine</span>
            </h3>

            {planSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{planSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddPlan} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Plan Title</label>
                <input
                  type="text"
                  required
                  value={newPlan.title}
                  onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                  placeholder="e.g. Metabolic Conditioning Phase II"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kinematic Focus Area</label>
                <input
                  type="text"
                  required
                  value={newPlan.focus}
                  onChange={(e) => setNewPlan({ ...newPlan, focus: e.target.value })}
                  placeholder="e.g. Anterior Chain / Quadriceps"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Exercises (Comma separated sets &amp; reps)
                </label>
                <textarea
                  rows={3}
                  required
                  value={newPlan.exercises}
                  onChange={(e) => setNewPlan({ ...newPlan, exercises: e.target.value })}
                  placeholder="e.g. Barbell Back Squats (4x8), Bulgarian Split Squats (3x12), Leg Press (3x15)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0e6245] hover:bg-[#0b5037] text-white font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Save &amp; Broadcast Plan to Athletes</span>
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 font-display">
              Active Prescription Library
            </h3>
            <div className="space-y-3">
              {plans.map((p, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {p.focus}
                    </span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    {p.exercises.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Schedule & Floor Traffic */}
      {activeSubTab === 'schedule' && (
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 font-display">
                Floor Congestion &amp; Coaching Windows
              </h3>
              <p className="text-xs text-slate-500">
                FitSphere AI live occupancy syncs automatically to advise prime 1-on-1 coaching hours.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-700 font-mono">
                Live Capacity: {liveCrowd?.currentOccupancy || 0}/{liveCrowd?.maxCapacity || 100}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                Optimal Coaching Window
              </div>
              <div className="text-lg font-black text-emerald-900 font-mono">
                11:00 AM &ndash; 03:00 PM
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">Average load &lt; 35% capacity</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <div className="text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
                Moderate Traffic Window
              </div>
              <div className="text-lg font-black text-amber-900 font-mono">
                06:30 AM &ndash; 09:00 AM
              </div>
              <p className="text-[11px] text-amber-700 mt-1">Morning early-bird wave (~65%)</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
              <div className="text-rose-800 text-xs font-bold uppercase tracking-wider mb-1">
                Congested Peak Window
              </div>
              <div className="text-lg font-black text-rose-900 font-mono">
                05:30 PM &ndash; 08:30 PM
              </div>
              <p className="text-[11px] text-rose-700 mt-1">High congestion: Racks &amp; free weights queued</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
