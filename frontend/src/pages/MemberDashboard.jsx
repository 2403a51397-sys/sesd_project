import React, { useState, useEffect } from 'react';
import LiveGauge from '../components/crowd/LiveGauge';
import HourlyCrowdChart from '../components/crowd/HourlyCrowdChart';
import RecommendationCard from '../components/booking/RecommendationCard';
import SlotPicker from '../components/booking/SlotPicker';
import { api } from '../services/api';
import { Megaphone, History, Clock, Sparkles, Droplets, Dumbbell, Flame, CheckCircle2 } from 'lucide-react';

export default function MemberDashboard({ activeTab, liveCrowd, onRefreshLive }) {
  const [userStatus, setUserStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState(5);

  const loadStatusAndAnnouncements = async () => {
    try {
      const [statusRes, annRes] = await Promise.all([
        api.getMyStatus(),
        api.getAnnouncements(),
      ]);
      setUserStatus(statusRes.data);
      setAnnouncements(annRes.data);
    } catch (err) {
      console.error('Failed to load status/announcements:', err);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.getMyHistory();
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to load visit history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadStatusAndAnnouncements();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Announcement Notification Banner if any */}
      {announcements.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 flex items-start gap-3 shadow-xs">
          <Megaphone className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block font-mono">
              Notice: {announcements[0].title}
            </span>
            <p className="text-xs text-slate-600 mt-0.5">{announcements[0].content}</p>
          </div>
        </div>
      )}

      {/* Tab: Live & Predictions */}
      {activeTab === 'live' && (
        <div className="space-y-6">
          {/* Top Quick Stats Pill Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-4 border border-emerald-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  AI Daily Biomechanics Tip
                </span>
                <p className="text-xs font-bold text-slate-800 leading-snug">
                  Tempo 3-1-1 on bench press activates 22% higher pectoralis recruitment.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-emerald-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Workout Streak
                </span>
                <p className="text-sm font-black text-slate-900 font-display">
                  5 Days Consistent &bull; <span className="text-emerald-700 text-xs font-bold">+150 XP</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-emerald-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 shrink-0">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    H2O Hydro Tracker
                  </span>
                  <p className="text-xs font-bold text-slate-800">
                    {waterGlasses} / 8 Glasses Hydrated
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWaterGlasses((v) => Math.min(8, v + 1))}
                className="px-2.5 py-1 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold cursor-pointer"
              >
                +1 Glass
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <LiveGauge
                crowdData={liveCrowd}
                onRefresh={onRefreshLive}
                userStatus={userStatus}
                onStatusChange={loadStatusAndAnnouncements}
              />
            </div>
            <div className="lg:col-span-2">
              <RecommendationCard onBookSuccess={onRefreshLive} />
            </div>
          </div>

          <HourlyCrowdChart />
        </div>
      )}

      {/* Tab: Book Slots */}
      {activeTab === 'booking' && (
        <SlotPicker />
      )}

      {/* Tab: My Visit History */}
      {activeTab === 'history' && (
        <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-emerald-700" />
            <h3 className="text-lg font-black text-slate-900 font-display">
              Your Gym Visit Log
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Complete record of your physical check-ins and session durations.
          </p>

          {historyLoading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
              <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">No past visits recorded yet.</p>
              <p className="text-xs text-slate-400 mt-1">Check in on the live gym floor to start tracking your sessions.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Check-in: {item.check_in_time}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Check-out: {item.check_out_time || 'In Progress (Active Session)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700 font-mono">
                      {item.duration_minutes ? `${item.duration_minutes} mins` : 'Active'}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">{item.check_in_type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
