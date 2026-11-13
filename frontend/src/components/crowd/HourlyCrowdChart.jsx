import React, { useState, useEffect } from 'react';
import { BarChart3, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

const DAYS = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
  { id: 0, label: 'Sun' },
];

export default function HourlyCrowdChart() {
  const currentDayOfWeek = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(currentDayOfWeek);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredSlot, setHoveredSlot] = useState(null);

  useEffect(() => {
    async function loadForecast() {
      setLoading(true);
      try {
        const res = await api.getPredictedCrowd(selectedDay);
        setForecast(res.data);
      } catch (err) {
        console.error('Failed to load forecast:', err);
      } finally {
        setLoading(false);
      }
    }
    loadForecast();
  }, [selectedDay]);

  const getBarColor = (pct) => {
    if (pct >= 80) return 'from-rose-600 to-rose-400';
    if (pct >= 50) return 'from-amber-600 to-amber-400';
    return 'from-emerald-600 to-teal-400';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Predictive Intelligence</span>
            {forecast?.strategyUsed && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono flex items-center gap-1 border border-slate-700">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                {forecast.strategyUsed}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Predicted Crowd by Hour
          </h3>
        </div>

        {/* Day of Week Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          {DAYS.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDay(d.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedDay === d.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div>
          {/* Bar Chart Container */}
          <div className="h-60 flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 border-b border-slate-800 relative">
            {/* 50% and 80% threshold guide lines */}
            <div className="absolute inset-x-0 bottom-[50%] border-b border-dashed border-slate-700/60 pointer-events-none flex justify-end">
              <span className="text-[10px] text-amber-400/70 mr-1 -mt-4">50% Medium</span>
            </div>
            <div className="absolute inset-x-0 bottom-[80%] border-b border-dashed border-rose-500/30 pointer-events-none flex justify-end">
              <span className="text-[10px] text-rose-400/70 mr-1 -mt-4">80% High</span>
            </div>

            {forecast?.predictions.map((p) => {
              const heightPct = Math.max(12, Math.min(100, p.occupancyPercentage));
              const isHovered = hoveredSlot?.hour === p.hour;

              return (
                <div
                  key={p.hour}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  onMouseEnter={() => setHoveredSlot(p)}
                  onMouseLeave={() => setHoveredSlot(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 bg-slate-950 text-white border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] whitespace-nowrap shadow-xl pointer-events-none">
                      <p className="font-bold">{p.timeLabel}</p>
                      <p className="text-slate-300">
                        {p.occupancyPercentage}% full (~{p.predictedOccupancy} people)
                      </p>
                    </div>
                  )}

                  {/* The Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-md bg-gradient-to-t ${getBarColor(p.occupancyPercentage)} transition-all duration-300 group-hover:brightness-125 ${isHovered ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                  />
                  
                  {/* Hour label below */}
                  <span className="text-[10px] text-slate-400 mt-2 font-mono group-hover:text-white">
                    {p.hour}h
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Low (&lt;50%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Medium (50-80%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> High (&gt;80%)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Hover over bars to inspect hourly headcounts
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
