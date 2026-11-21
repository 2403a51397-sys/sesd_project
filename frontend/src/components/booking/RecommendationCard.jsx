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
    <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Sparkles className="w-4 h-4" />
        </span>
        <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 font-mono">
          AI Smart Recommendation
        </span>
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-1 font-display">
        Best Time to Visit Planner
      </h3>
      <p className="text-xs text-slate-500 mb-5">
        Specify your preferred training window, and our predictive neural algorithm will recommend the quietest hour with direct booking.
      </p>

      {/* Control Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1 flex items-center gap-1 font-mono">
            <Calendar className="w-3 h-3 text-emerald-700" /> Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-emerald-700" /> Start Window
          </label>
          <select
            value={startHour}
            onChange={(e) => setStartHour(parseInt(e.target.value, 10))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          >
            {Array.from({ length: 16 }, (_, i) => i + 6).map((h) => (
              <option key={h} value={h}>
                {h % 12 === 0 ? 12 : h % 12}:00 {h >= 12 ? 'PM' : 'AM'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-600 block mb-1 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 text-emerald-700" /> End Window
          </label>
          <select
            value={endHour}
            onChange={(e) => setEndHour(parseInt(e.target.value, 10))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          >
            {Array.from({ length: 16 }, (_, i) => i + 7)
              .filter((h) => h > startHour)
              .map((h) => (
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
        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4 text-emerald-700" />
        {loading ? 'Analyzing Historical Variance...' : 'Calculate Optimal Visit Hour'}
      </button>

      {/* Result Card */}
      {recommendation && (
        <div className="mt-5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1 font-mono">
                <ThumbsUp className="w-3.5 h-3.5" />
                Predicted Lowest Crowd Slot
              </div>
              <h4 className="text-lg font-black text-slate-900 font-display">
                {recommendation.recommendedSlot.startHour % 12 === 0 ? 12 : recommendation.recommendedSlot.startHour % 12}:00{' '}
                {recommendation.recommendedSlot.startHour >= 12 ? 'PM' : 'AM'} &ndash;{' '}
                {recommendation.recommendedSlot.endHour % 12 === 0 ? 12 : recommendation.recommendedSlot.endHour % 12}:00{' '}
                {recommendation.recommendedSlot.endHour >= 12 ? 'PM' : 'AM'}
              </h4>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Predicted: <b className="text-slate-900 font-mono">{recommendation.recommendedSlot.predictedOccupancy} people</b> ({recommendation.recommendedSlot.occupancyRatio} capacity) &bull; Available seats: <b className="text-emerald-700 font-mono">{recommendation.recommendedSlot.availableSeats}</b>
              </p>
            </div>

            <div>
              {bookedStatus ? (
                <div className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-1.5 border border-emerald-300">
                  <Check className="w-4 h-4" />
                  Slot Booked!
                </div>
              ) : (
                <button
                  onClick={() => handleBookSlot(recommendation.recommendedSlot.slotId)}
                  disabled={bookingLoading || recommendation.recommendedSlot.availableSeats <= 0}
                  className="px-4 py-2.5 rounded-xl bg-[#0e6245] hover:bg-[#0b5037] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <span>{bookingLoading ? 'Reserving...' : '1-Click Reserve'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
