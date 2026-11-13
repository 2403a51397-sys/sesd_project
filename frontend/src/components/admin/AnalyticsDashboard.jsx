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
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};

  return (
    <div className="space-y-6">
      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-400">Total Members</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white">{kpis.totalRegisteredMembers}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active registered accounts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-400">Total Visits</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white">{kpis.totalVisitsLogged.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Logged sessions over 28 days</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-400">Current Utilization</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white">{kpis.utilizationRate}%</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {kpis.currentOccupancy} of {kpis.maxCapacity} floor capacity
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-400">Peak Rush Hour</span>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-lg font-bold text-white leading-tight mt-1">{analytics?.peakHourLabel}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Highest concurrency window</span>
        </div>
      </div>

      {/* Weekly Traffic Distribution & Capacity Governance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Traffic Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400">Aggregated Trends</span>
              <h3 className="text-lg font-bold text-white">Daily Attendance Across the Week</h3>
            </div>
            <span className="text-xs text-slate-400">Historical 4-Week Average</span>
          </div>

          <div className="h-48 flex items-end gap-3 pt-6 pb-2 border-b border-slate-800">
            {analytics?.weeklyTraffic.map((day) => {
              const maxAvg = 3500;
              const height = Math.max(15, Math.min(100, (day.totalVisits / maxAvg) * 100));

              return (
                <div key={day.dayOfWeek} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                    {day.totalVisits}
                  </span>
                  <div
                    style={{ height: `${height}%` }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-purple-600 to-indigo-400 transition-all group-hover:brightness-125"
                  />
                  <span className="text-xs font-semibold text-slate-400 mt-2">
                    {day.dayName.substring(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Capacity Governance Control */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-purple-400" />
              <span className="text-xs uppercase font-bold text-purple-400">Facility Controls</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Adjust Floor Capacity</h3>
            <p className="text-xs text-slate-400 mb-4">
              Dynamically calibrate total gym capacity. All live gauges and percentage indicators recalculate immediately.
            </p>

            <form onSubmit={handleUpdateCapacity} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Maximum Floor Capacity (Persons):
                </label>
                <input
                  type="number"
                  min="20"
                  max="500"
                  value={capacityInput}
                  onChange={(e) => setCapacityInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md"
              >
                Apply Capacity Change
              </button>
            </form>

            {capacityMsg && (
              <div className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${capacityMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {capacityMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{capacityMsg.text}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Announcements & Member Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post Announcement */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Broadcast Announcement</h3>
          </div>

          <form onSubmit={handlePostAnnouncement} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Announcement Title (e.g., Holiday Operating Hours)"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <textarea
                placeholder="Announcement content..."
                rows="2"
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <select
                value={annPriority}
                onChange={(e) => setAnnPriority(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="URGENT">Urgent Notice</option>
              </select>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all shadow-md"
              >
                <Send className="w-3.5 h-3.5" /> Post
              </button>
            </div>
          </form>

          {annMsg && (
            <div className="mt-2 text-xs text-emerald-400 font-semibold">{annMsg.text}</div>
          )}

          {/* List recent announcements */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 max-h-40 overflow-y-auto">
            {announcements.map((a) => (
              <div key={a.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{a.title}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${a.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                    {a.priority}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{a.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Member Roster */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Registered Member Directory
            </h3>
            <span className="text-xs text-slate-400">{members.length} users</span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
            {members.map((m) => (
              <div key={m.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{m.full_name}</p>
                  <p className="text-[11px] text-slate-400">{m.email}</p>
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${m.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
