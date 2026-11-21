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
    if (pct >= 80) return 'from-rose-500 to-rose-600';
    if (pct >= 50) return 'from-amber-400 to-amber-500';
    return 'from-emerald-500 to-[#0e6245]';
  };

  return (
    <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 font-mono">
              Predictive Intelligence
            </span>
            {forecast?.strategyUsed && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-800 font-mono font-bold flex items-center gap-1 border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                {forecast.strategyUsed}
              </span>
            )}
          </div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 font-display">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            Predicted Floor Density by Hour
          </h3>
        </div>

        {/* Day of Week Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto">
          {DAYS.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDay(d.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDay === d.id
                  ? 'bg-[#0e6245] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div>
          {/* Bar Chart Container */}
          <div className="h-60 flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 border-b border-slate-200 relative">
            {/* 50% and 80% threshold guide lines */}
            <div className="absolute inset-x-0 bottom-[50%] border-b border-dashed border-amber-300 pointer-events-none flex justify-end">
              <span className="text-[10px] text-amber-700 font-mono font-bold mr-1 -mt-4">50% Medium</span>
            </div>
            <div className="absolute inset-x-0 bottom-[80%] border-b border-dashed border-rose-300 pointer-events-none flex justify-end">
              <span className="text-[10px] text-rose-700 font-mono font-bold mr-1 -mt-4">80% High</span>
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
                    <div className="absolute -top-12 z-20 bg-slate-900 text-white rounded-xl px-2.5 py-1 text-[11px] whitespace-nowrap shadow-xl pointer-events-none animate-fade-in font-mono">
                      <p className="font-bold">{p.timeLabel}</p>
                      <p className="text-emerald-300">
                        {p.occupancyPercentage}% full (~{p.predictedOccupancy} people)
                      </p>
                    </div>
                  )}

                  {/* The Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-lg bg-gradient-to-t ${getBarColor(p.occupancyPercentage)} transition-all duration-300 group-hover:brightness-110 ${
                      isHovered ? 'ring-2 ring-emerald-700 ring-offset-2' : ''
                    }`}
                  />
                  
                  {/* Hour label below */}
                  <span className="text-[10px] text-slate-500 mt-2 font-mono group-hover:text-slate-900 font-bold">
                    {p.hour}h
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Low (&lt;50%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium (50-80%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> High (&gt;80%)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Hover over bars to inspect hourly capacity headcounts
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
