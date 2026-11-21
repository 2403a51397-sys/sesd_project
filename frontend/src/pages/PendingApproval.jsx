import React from 'react';
import { Clock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PendingApproval({ onBackToLogin }) {
  return (
    <div className="min-h-screen bg-[#edf6f0] flex items-center justify-center p-4 sm:p-6 font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-[0_20px_50px_rgba(14,90,60,0.1)] p-8 text-center space-y-6">
          {/* Pulsing Alert Icon */}
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200/80 flex items-center justify-center mx-auto text-amber-600 shadow-inner">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 text-amber-800 text-[10px] font-black uppercase tracking-wider font-mono mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              STATUS: PENDING ADMIN APPROVAL
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
              Trainer Account Under Review
            </h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">
              Your application for the <b className="text-slate-800">FitSphere Trainer Portal</b> has been received. Our administrators review credentials to maintain platform standards.
            </p>
          </div>

          {/* Process Checklist */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2">
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider font-mono">
              Approval Process
            </h4>
            <ul className="text-xs text-slate-600 space-y-2 list-none">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Trainer profile registered in database</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Admin reviews coaching credentials</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] shrink-0 font-mono">
                  3
                </span>
                <span>Instant access unlocked to Trainer Portal</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-3.5 rounded-2xl bg-[#0e6245] hover:bg-[#0b5037] text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-slate-400 font-medium">
              Want to test approval as admin? Log in with <b className="text-slate-700">admin@fitsphere.com</b> to approve accounts in the User Management tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
