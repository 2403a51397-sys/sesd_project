import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, Check, ArrowRight, ThumbsUp } from 'lucide-react';
import { api } from '../../services/api';

export default function RecommendationCard({ onBookSuccess }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [startHour, setStartHour] = useState(17);
  const [endHour, setEndHour] = useState(20);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookedStatus, setBookedStatus] = useState(false);

  const handleGetRecommendation = async () => {
    setLoading(true);
    setBookedStatus(false);
    try {
      const res = await api.getRecommendation(date, startHour, endHour);
      setRecommendation(res.data);
    } catch (err) {
      alert(err.message || 'Failed to fetch recommendation');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (slotId) => {
    if (!slotId) return;
    setBookingLoading(true);
    try {
      await api.bookSlot(slotId);
      setBookedStatus(true);
      if (onBookSuccess) onBookSuccess();
    } catch (err) {
      alert(err.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Sparkles className="w-4 h-4" />
        </span>
        <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Smart Recommendation</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-1">
        Best Time to Visit Planner
      </h3>
      <p className="text-xs text-slate-400 mb-5">
        Specify your preferred training window, and our predictive algorithm will recommend the quietest hour.
      </p>

      {/* Control Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Earliest Start
          </label>
          <select
            value={startHour}
            onChange={(e) => setStartHour(parseInt(e.target.value, 10))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map((h) => (
              <option key={h} value={h}>
                {h % 12 === 0 ? 12 : h % 12}:00 {h >= 12 ? 'PM' : 'AM'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Latest Finish
          </label>
          <select
            value={endHour}
            onChange={(e) => setEndHour(parseInt(e.target.value, 10))}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {[8,9,10,11,12,13,14,15,16,17,18,19,20,21,22].filter(h => h > startHour).map((h) => (
              <option key={h} value={h}>
                {h % 12 === 0 ? 12 : h % 12}:00 {h >= 12 ? 'PM' : 'AM'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleGetRecommendation}
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? 'Evaluating Forecasts...' : 'Find Lowest Crowd Slot'}
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Recommendation Results */}
      {recommendation && (
        <div className="mt-5 p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" /> Optimal Pick
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              {recommendation.recommendedSlot.crowdLevel} CROWD
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-lg font-extrabold text-white">
                {recommendation.recommendedSlot.timeLabel}
              </h4>
              <p className="text-xs text-slate-400">
                Projected {recommendation.recommendedSlot.occupancyPercentage}% full (~{recommendation.recommendedSlot.predictedOccupancy} people)
              </p>
            </div>

            {recommendation.recommendedSlot.slotId && (
              <div>
                {bookedStatus ? (
                  <span className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Slot Reserved!
                  </span>
                ) : (
                  <button
                    onClick={() => handleBookSlot(recommendation.recommendedSlot.slotId)}
                    disabled={bookingLoading || recommendation.recommendedSlot.isFull}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md disabled:opacity-50"
                  >
                    {bookingLoading ? 'Reserving...' : recommendation.recommendedSlot.isFull ? 'Slot Full' : 'Book Recommended Slot'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
