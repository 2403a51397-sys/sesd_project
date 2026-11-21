import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  Clock, 
  Settings, 
  Megaphone, 
  Send, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../../services/api';

export default function AnalyticsDashboard({ onCapacityChanged }) {
  const [analytics, setAnalytics] = useState(null);
  const [members, setMembers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [capacityInput, setCapacityInput] = useState(100);
  const [capacityMsg, setCapacityMsg] = useState(null);

  // Announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState('NORMAL');
  const [annMsg, setAnnMsg] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, membersRes, annRes] = await Promise.all([
        api.getAnalytics(),
        api.listMembers(),
        api.getAnnouncements(),
      ]);
      setAnalytics(analyticsRes.data);
      setCapacityInput(analyticsRes.data.kpis.maxCapacity);
      setMembers(membersRes.data);
      setAnnouncements(annRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateCapacity = async (e) => {
    e.preventDefault();
    setCapacityMsg(null);
    try {
      const res = await api.updateCapacity(parseInt(capacityInput, 10));
      setCapacityMsg({ type: 'success', text: res.message });
      if (onCapacityChanged) onCapacityChanged();
      loadData();
    } catch (err) {
      setCapacityMsg({ type: 'error', text: err.message });
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    setAnnMsg(null);
    try {
      await api.createAnnouncement({
        title: annTitle,
        content: annContent,
        priority: annPriority,
      });
      setAnnMsg({ type: 'success', text: 'Announcement broadcasted!' });
      setAnnTitle('');
      setAnnContent('');
      loadData();
    } catch (err) {
      setAnnMsg({ type: 'error', text: err.message });
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};

  return (
    <div className="space-y-6">
      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-emerald-100 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">
              Total Members
            </span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 font-display">{kpis.totalRegisteredMembers}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active accounts on platform</span>
        </div>

        <div className="bg-white border border-emerald-100 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">
              Total Logged Visits
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 font-display">
            {kpis.totalVisitsLogged.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Sessions recorded over 28 days</span>
        </div>

        <div className="bg-white border border-emerald-100 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">
              Floor Utilization
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 font-display">{kpis.utilizationRate}%</p>
          <span className="text-[11px] text-slate-400 mt-1 block font-mono">
            {kpis.currentOccupancy} / {kpis.maxCapacity} floor capacity
          </span>
        </div>

        <div className="bg-white border border-emerald-100 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">
              Peak Rush Hour
            </span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-base font-black text-slate-900 leading-tight mt-1 font-display">
            {analytics?.peakHourLabel}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Highest concurrency window</span>
        </div>
      </div>

      {/* Weekly Traffic Distribution & Capacity Governance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Traffic Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase font-black text-emerald-700 font-mono tracking-wider">
                Aggregated Traffic
              </span>
              <h3 className="text-lg font-black text-slate-900 font-display">
                Daily Attendance Across the Week
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Historical 4-Week Average</span>
          </div>

          <div className="h-48 flex items-end gap-3 pt-6 pb-2 border-b border-slate-200">
            {analytics?.weeklyTraffic.map((day) => {
              const maxAvg = 3500;
              const height = Math.max(15, Math.min(100, (day.totalVisits / maxAvg) * 100));

              return (
                <div key={day.dayOfWeek} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                    {day.totalVisits}
                  </span>
                  <div
                    style={{ height: `${height}%` }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-emerald-700 to-teal-500 transition-all group-hover:brightness-110 shadow-xs"
                  />
                  <span className="text-xs font-bold text-slate-600 mt-2">
                    {day.dayName.substring(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Capacity Governance Control */}
        <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-emerald-700" />
              <span className="text-[10px] uppercase font-black text-emerald-700 font-mono tracking-wider">
                Facility Sliders
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2 font-display">
              Calibrate Floor Capacity
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Dynamically calibrate total gym capacity. All live gauges and percentage indicators recalculate immediately.
            </p>

            <form onSubmit={handleUpdateCapacity} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Maximum Floor Capacity (Persons):
                </label>
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={capacityInput}
                  onChange={(e) => setCapacityInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#0e6245] hover:bg-[#0b5037] text-white transition-all shadow-sm cursor-pointer"
              >
                Apply Capacity Change
              </button>
            </form>

            {capacityMsg && (
              <div
                className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 font-medium ${
                  capacityMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {capacityMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{capacityMsg.text}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Announcements & Member Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post Announcement */}
        <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-5 h-5 text-emerald-700" />
            <h3 className="text-lg font-black text-slate-900 font-display">
              Broadcast Facility Notice
            </h3>
          </div>

          <form onSubmit={handlePostAnnouncement} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Announcement Title (e.g., Extended Operating Hours)"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
              />
            </div>
            <div>
              <textarea
                placeholder="Announcement content..."
                rows="2"
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
              />
            </div>
            <div className="flex items-center justify-between">
              <select
                value={annPriority}
                onChange={(e) => setAnnPriority(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none font-medium"
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="URGENT">Urgent Notice</option>
              </select>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#0e6245] hover:bg-[#0b5037] text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Post Notice
              </button>
            </div>
          </form>

          {annMsg && (
            <div className="mt-2 text-xs text-emerald-700 font-bold">{annMsg.text}</div>
          )}

          {/* List recent announcements */}
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 max-h-40 overflow-y-auto">
            {announcements.map((a) => (
              <div key={a.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{a.title}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase font-mono ${
                      a.priority === 'URGENT'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {a.priority}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">{a.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Member Directory */}
        <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 font-display">
              <Users className="w-5 h-5 text-emerald-700" />
              Member Directory
            </h3>
            <span className="text-xs font-bold text-slate-500 font-mono">{members.length} users</span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {members.map((m) => (
              <div key={m.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{m.full_name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{m.email}</p>
                </div>
                <span
                  className={`text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-full border ${
                    m.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                      : m.role === 'trainer'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {m.role === 'client' ? 'Customer' : m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
