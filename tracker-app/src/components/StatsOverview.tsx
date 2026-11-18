import React from 'react';
import { 
  Building, 
  Send, 
  Award, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { UniversityApplication } from '../types';

interface StatsOverviewProps {
  applications: UniversityApplication[];
  preferredCurrency?: string;
  rates?: Record<string, number>;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ 
  applications,
  preferredCurrency = 'USD',
  rates = {},
}) => {
  const total = applications.length;
  const submitted = applications.filter(
    (a) => a.status === 'Submitted' || a.status === 'Interview' || a.status === 'Admitted' || a.status === 'Waitlisted' || a.status === 'Rejected'
  ).length;
  const admitted = applications.filter((a) => a.status === 'Admitted').length;
  const dreamCount = applications.filter((a) => a.tier === 'Dream').length;
  const targetCount = applications.filter((a) => a.tier === 'Target').length;
  const safeCount = applications.filter((a) => a.tier === 'Safe').length;

  // Total application fees converted to preferredCurrency
  const totalFeeConverted = applications.reduce((sum, a) => {
    if (!a.applicationFee) return sum;
    const rateApp = rates[a.currency] || 1;
    const rateTarget = rates[preferredCurrency] || 1;
    const converted = (a.applicationFee / rateApp) * rateTarget;
    return sum + converted;
  }, 0);

  // Deadlines in next 14 days
  const upcomingDeadlines = applications.filter((a) => {
    if (!a.deadline) return false;
    const diff = Math.ceil((new Date(a.deadline).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 14 && a.status !== 'Submitted' && a.status !== 'Admitted';
  }).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 my-6">
      {/* 1. Total Apps */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
          <Building className="w-4 h-4 text-sky-500" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-slate-800">{total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Universities</div>
        </div>
      </div>

      {/* 2. Submitted */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Submitted</span>
          <Send className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-indigo-600">{submitted}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {total > 0 ? `${Math.round((submitted / total) * 100)}% sent` : '0%'}
          </div>
        </div>
      </div>

      {/* 3. Admits */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Admits</span>
          <Award className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black text-emerald-600">{admitted}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {admitted > 0 ? '🎉 Congratulations!' : 'Awaiting decisions'}
          </div>
        </div>
      </div>

      {/* 4. Tier Balance */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Tier Ratio</span>
          <span className="text-xs font-bold text-slate-400">D/T/S</span>
        </div>
        <div className="mt-2">
          <div className="text-xl font-black text-slate-800 flex items-center gap-1.5">
            <span className="text-purple-600">{dreamCount}</span>:
            <span className="text-sky-600">{targetCount}</span>:
            <span className="text-emerald-600">{safeCount}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Dream : Target : Safe</div>
        </div>
      </div>

      {/* 5. Due Soon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Due in 14d</span>
          <AlertTriangle className={`w-4 h-4 ${upcomingDeadlines > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
        </div>
        <div className="mt-2">
          <div className={`text-2xl font-black ${upcomingDeadlines > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
            {upcomingDeadlines}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Need attention</div>
        </div>
      </div>

      {/* 6. Total Fees */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Fees</span>
          <DollarSign className="w-4 h-4 text-slate-500" />
        </div>
        <div className="mt-2">
          <div className="text-xl font-black text-slate-800">
            {preferredCurrency} {Math.round(totalFeeConverted).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Live rates converted</div>
        </div>
      </div>
    </div>
  );
};
