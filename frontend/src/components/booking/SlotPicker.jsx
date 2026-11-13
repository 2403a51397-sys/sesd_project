import React, { useState, useEffect } from 'react';
import { Calendar, Users, Check, X, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function SlotPicker() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [slots, setSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSlotId, setActionSlotId] = useState(null);
  const [message, setMessage] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [slotsRes, bookingsRes] = await Promise.all([
        api.getSlots(selectedDate),
        api.getMyBookings(),
      ]);
      setSlots(slotsRes.data);
      setMyBookings(bookingsRes.data);
    } catch (err) {
      console.error('Failed to load slots/bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handleBook = async (slotId) => {
    setActionSlotId(slotId);
    setMessage(null);
    try {
      await api.bookSlot(slotId);
      setMessage({ type: 'success', text: 'Workout slot successfully reserved!' });
      await loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Booking failed' });
    } finally {
      setActionSlotId(null);
    }
  };

  const handleCancel = async (bookingId) => {
    setMessage(null);
    try {
      await api.cancelBooking(bookingId);
      setMessage({ type: 'success', text: 'Reservation cancelled. Capacity restored.' });
      await loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Cancellation failed' });
    }
  };

  const isSlotBookedByUser = (slotId) => {
    return myBookings.some((b) => b.slotId === slotId && b.status === 'BOOKED');
  };

  return (
    <div className="space-y-6">
      {/* Date Header & Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Capacity Management</span>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Reserve Workout Slot
          </h3>
          <p className="text-xs text-slate-400">
            Select an hourly slot. Real-time capacity enforcement prevents gym floor overcrowding.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">Choose Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'}`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Slots Grid */}
      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {slots.map((slot) => {
            const booked = isSlotBookedByUser(slot.id);
            const full = slot.isFull;

            return (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl border transition-all ${
                  booked
                    ? 'bg-emerald-950/30 border-emerald-500/40 ring-1 ring-emerald-500/30'
                    : full
                    ? 'bg-slate-900/50 border-slate-800/80 opacity-60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {slot.timeLabel}
                  </span>
                  {booked ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      Booked
                    </span>
                  ) : full ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                      Full
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                      {slot.availableSeats} left
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-3">
                  <div
                    style={{ width: `${slot.occupancyPercentage}%` }}
                    className={`h-full ${slot.occupancyPercentage >= 80 ? 'bg-rose-500' : slot.occupancyPercentage >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {slot.currentBookings} / {slot.maxCapacity}
                  </span>

                  {booked ? (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Reserved
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBook(slot.id)}
                      disabled={full || actionSlotId === slot.id}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all shadow-sm"
                    >
                      {actionSlotId === slot.id ? 'Booking...' : full ? 'Full' : 'Book'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User's Upcoming Bookings */}
      {myBookings.filter((b) => b.status === 'BOOKED').length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl mt-6">
          <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            Your Confirmed Reservations
          </h4>
          <div className="divide-y divide-slate-800">
            {myBookings
              .filter((b) => b.status === 'BOOKED')
              .map((b) => (
                <div key={b.bookingId} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{b.date} • {b.timeLabel}</p>
                    <span className="text-[11px] text-slate-400">Status: Confirmed ({b.status})</span>
                  </div>
                  <button
                    onClick={() => handleCancel(b.bookingId)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
