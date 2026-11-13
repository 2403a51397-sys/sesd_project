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
    <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-purple-400 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5" /> Academic Evaluation Controls
          </span>
          <h3 className="text-lg font-bold text-white">Live System Demonstration Sandbox</h3>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
          Demo Mode
        </span>
      </div>

      <p className="text-xs text-slate-300 mb-5">
        Simulate real-world conditions on the fly to showcase concurrency, crowd level categorization, and ML strategy switching to your examination committee.
      </p>

      {/* Simulator Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={triggerCheckIn}
          disabled={loading}
          className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-400 flex flex-col items-center justify-center gap-1.5 transition-all group"
        >
          <UserPlus className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">+1 Check-In</span>
          <span className="text-[10px] text-slate-400">Step Count Up</span>
        </button>

        <button
          onClick={triggerCheckOut}
          disabled={loading}
          className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-200 hover:text-amber-400 flex flex-col items-center justify-center gap-1.5 transition-all group"
        >
          <UserMinus className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">-1 Check-Out</span>
          <span className="text-[10px] text-slate-400">Step Count Down</span>
        </button>

        <button
          onClick={triggerSurge}
          disabled={loading}
          className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 text-slate-200 hover:text-rose-400 flex flex-col items-center justify-center gap-1.5 transition-all group"
        >
          <Flame className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Simulate Surge</span>
          <span className="text-[10px] text-slate-400">Trigger 88% Rush</span>
        </button>

        <button
          onClick={triggerReset}
          disabled={loading}
          className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-600 text-slate-200 hover:text-white flex flex-col items-center justify-center gap-1.5 transition-all group"
        >
          <RotateCcw className="w-5 h-5 text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-xs font-bold">Reset Occupancy</span>
          <span className="text-[10px] text-slate-400">Restore Baseline</span>
        </button>
      </div>

      {/* Strategy Switcher */}
      <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-300">Prediction Engine Strategy:</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStrategyToggle('timeBucket')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeStrategy === 'timeBucket' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'}`}
          >
            Time-Bucket Moving Avg
          </button>
          <button
            onClick={() => handleStrategyToggle('regression')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeStrategy === 'regression' ? 'bg-purple-500 text-white shadow-md' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'}`}
          >
            Polynomial Regression
          </button>
        </div>
      </div>

      {msg && (
        <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-purple-500/30 text-xs font-mono text-purple-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
          <span>{msg.text}</span>
        </div>
      )}
    </div>
  );
}
