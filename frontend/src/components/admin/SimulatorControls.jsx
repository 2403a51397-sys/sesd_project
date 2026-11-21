import React, { useState } from 'react';
import { Play, RotateCcw, Flame, UserPlus, UserMinus, Cpu } from 'lucide-react';
import { api } from '../../services/api';

export default function SimulatorControls({ onStateMutated }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [activeStrategy, setActiveStrategy] = useState('timeBucket');

  const triggerSurge = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.simulateSurge();
      setMsg({ type: 'surge', text: res.message });
      if (onStateMutated) onStateMutated();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const triggerReset = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.simulateReset();
      setMsg({ type: 'reset', text: res.message });
      if (onStateMutated) onStateMutated();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const triggerCheckIn = async () => {
    try {
      await api.checkIn('SIMULATION');
      setMsg({ type: 'info', text: 'Simulated 1 check-in event. Live count incremented.' });
      if (onStateMutated) onStateMutated();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const triggerCheckOut = async () => {
    try {
      await api.checkOut();
      setMsg({ type: 'info', text: 'Simulated 1 check-out event. Live count decremented.' });
      if (onStateMutated) onStateMutated();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleStrategyToggle = async (strategy) => {
    try {
      const res = await api.setStrategy(strategy);
      setActiveStrategy(strategy);
      setMsg({ type: 'strategy', text: res.message });
      if (onStateMutated) onStateMutated();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 flex items-center gap-1.5 font-mono">
            <Play className="w-3.5 h-3.5" /> Dynamic Live Simulator
          </span>
          <h3 className="text-xl font-black text-slate-900 font-display">
            Interactive Floor Load &amp; Concurrency Sandbox
          </h3>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-mono font-bold border border-emerald-200">
          Sandbox Active
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-5">
        Simulate real-world gym foot traffic on the fly to test concurrency defense, crowd level categorization, and ML strategy switching.
      </p>

      {/* Simulator Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={triggerCheckIn}
          disabled={loading}
          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-800 flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer"
        >
          <UserPlus className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">+1 Check-In</span>
          <span className="text-[10px] text-slate-400 font-mono">Step Count Up</span>
        </button>

        <button
          onClick={triggerCheckOut}
          disabled={loading}
          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 text-slate-700 hover:text-amber-800 flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer"
        >
          <UserMinus className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">-1 Check-Out</span>
          <span className="text-[10px] text-slate-400 font-mono">Step Count Down</span>
        </button>

        <button
          onClick={triggerSurge}
          disabled={loading}
          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 text-slate-700 hover:text-rose-800 flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer"
        >
          <Flame className="w-5 h-5 text-rose-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Simulate Surge</span>
          <span className="text-[10px] text-slate-400 font-mono">Trigger 88% Rush</span>
        </button>

        <button
          onClick={triggerReset}
          disabled={loading}
          className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-400 hover:bg-slate-100 text-slate-700 hover:text-slate-900 flex flex-col items-center justify-center gap-1.5 transition-all group cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 text-purple-600 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-xs font-bold">Reset Occupancy</span>
          <span className="text-[10px] text-slate-400 font-mono">Restore Baseline</span>
        </button>
      </div>

      {/* Strategy Switcher */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-700" />
          <span className="text-xs font-bold text-slate-700">Prediction Engine Strategy:</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStrategyToggle('timeBucket')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStrategy === 'timeBucket'
                ? 'bg-[#0e6245] text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Time-Bucket Moving Avg
          </button>
          <button
            onClick={() => handleStrategyToggle('regression')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStrategy === 'regression'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            Polynomial Regression
          </button>
        </div>
      </div>

      {msg && (
        <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
          <span>{msg.text}</span>
        </div>
      )}
    </div>
  );
}
