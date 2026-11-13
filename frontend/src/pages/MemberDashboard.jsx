import React, { useState, useEffect } from 'react';
import LiveGauge from '../components/crowd/LiveGauge';
import HourlyCrowdChart from '../components/crowd/HourlyCrowdChart';
import RecommendationCard from '../components/booking/RecommendationCard';
import SlotPicker from '../components/booking/SlotPicker';
import { api } from '../services/api';
import { Megaphone, History, Clock } from 'lucide-react';

export default function MemberDashboard({ activeTab, liveCrowd, onRefreshLive }) {
  const [userStatus, setUserStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
          <Megaphone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Notice: {announcements[0].title}
            </span>
            <p className="text-xs text-slate-300 mt-0.5">{announcements[0].content}</p>
          </div>
        </div>
      )}

      {/* Tab: Live & Predictions */}
      {activeTab === 'live' && (
        <div className="space-y-6">
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
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Your Gym Visit Log</h3>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Complete record of your physical check-ins and session durations.
          </p>

          {historyLoading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
              <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">No past visits recorded yet.</p>
              <p className="text-xs text-slate-400 mt-1">Check in at the gym to start tracking your sessions.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {history.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Check-in: {item.check_in_time}</p>
                    <p className="text-[11px] text-slate-400">
                      Check-out: {item.check_out_time || 'In Progress (Active Session)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400">
                      {item.duration_minutes ? `${item.duration_minutes} mins` : 'Active'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{item.check_in_type}</span>
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
