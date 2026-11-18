import React from 'react';
import { 
  Building2, 
  Clock, 
  Award, 
  DollarSign, 
  CheckCircle2, 
  ExternalLink, 
  Calendar, 
  Layers, 
  CheckSquare, 
  MoreVertical,
  Flame
} from 'lucide-react';
import { UniversityApplication, ApplicationStatus } from '../types';

interface KanbanBoardProps {
  applications: UniversityApplication[];
  onSelectApp: (app: UniversityApplication) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onToggleChecklist: (appId: string, itemId: string) => void;
  preferredCurrency?: string;
  rates?: Record<string, number>;
}

const COLUMNS: { status: ApplicationStatus; title: string; color: string; badgeBg: string }[] = [
  { status: 'Shortlisted', title: 'Shortlisted', color: 'border-slate-300 bg-slate-50', badgeBg: 'bg-slate-200 text-slate-800' },
  { status: 'In Progress', title: 'In Progress', color: 'border-amber-300 bg-amber-50/50', badgeBg: 'bg-amber-100 text-amber-800' },
  { status: 'Ready to Submit', title: 'Ready to Submit', color: 'border-blue-300 bg-blue-50/50', badgeBg: 'bg-blue-100 text-blue-800' },
  { status: 'Submitted', title: 'Submitted', color: 'border-indigo-300 bg-indigo-50/50', badgeBg: 'bg-indigo-100 text-indigo-800' },
  { status: 'Interview', title: 'Interview / Review', color: 'border-purple-300 bg-purple-50/50', badgeBg: 'bg-purple-100 text-purple-800' },
  { status: 'Admitted', title: '🎉 Admitted', color: 'border-emerald-300 bg-emerald-50/50', badgeBg: 'bg-emerald-100 text-emerald-800' },
  { status: 'Waitlisted', title: 'Waitlisted', color: 'border-orange-300 bg-orange-50/50', badgeBg: 'bg-orange-100 text-orange-800' },
  { status: 'Rejected', title: 'Rejected', color: 'border-rose-300 bg-rose-50/50', badgeBg: 'bg-rose-100 text-rose-800' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  onSelectApp,
  onUpdateStatus,
  onToggleChecklist,
  preferredCurrency = 'USD',
  rates = {},
}) => {
  const getDaysUntilDeadline = (deadlineStr: string) => {
    if (!deadlineStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(deadlineStr);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Dream':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Target':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Safe':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 select-none min-h-[600px]">
      {COLUMNS.map((col) => {
        const appsInCol = applications.filter((a) => a.status === col.status);

        return (
          <div
            key={col.status}
            className={`flex-shrink-0 w-80 rounded-xl border flex flex-col ${col.color} backdrop-blur-sm transition-all`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const appId = e.dataTransfer.getData('text/plain');
              if (appId) {
                onUpdateStatus(appId, col.status);
              }
            }}
          >
            {/* Column Header */}
            <div className="p-3.5 border-b flex items-center justify-between border-black/5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-slate-800">{col.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${col.badgeBg}`}>
                  {appsInCol.length}
                </span>
              </div>
            </div>

            {/* Application Cards List */}
            <div className="p-2.5 flex-1 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-250px)]">
              {appsInCol.map((app) => {
                const daysLeft = getDaysUntilDeadline(app.deadline);
                const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 14;
                const isPast = daysLeft !== null && daysLeft < 0;
                const completedItems = app.checklist.filter((i) => i.completed).length;
                const progressPct = app.checklist.length > 0 
                  ? Math.round((completedItems / app.checklist.length) * 100) 
                  : 0;

                return (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', app.id);
                    }}
                    onClick={() => onSelectApp(app)}
                    className="bg-white rounded-lg p-3.5 shadow-sm border border-slate-200 hover:shadow-md hover:border-sky-300 transition-all cursor-pointer relative group"
                  >
                    {/* Header: Tier & Country */}
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getTierColor(app.tier)}`}>
                        {app.tier}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {app.country}
                      </span>
                    </div>

                    {/* University Name */}
                    <h4 className="font-bold text-slate-900 text-sm leading-snug hover:text-sky-600 transition-colors">
                      {app.universityName}
                    </h4>
                    
                    {/* Program */}
                    <p className="text-xs text-slate-600 mt-0.5 font-medium line-clamp-1">
                      {app.programName}
                    </p>

                    {/* Deadline Badge */}
                    {app.deadline && (
                      <div className="mt-2.5 flex items-center justify-between">
                        <div
                          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium ${
                            isPast
                              ? 'bg-slate-100 text-slate-500'
                              : isUrgent
                              ? 'bg-rose-100 text-rose-700 animate-pulse font-semibold'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{app.deadline}</span>
                          {daysLeft !== null && (
                            <span className="font-bold">
                              {daysLeft === 0
                                ? '• Today!'
                                : daysLeft > 0
                                ? `(${daysLeft}d left)`
                                : '(Passed)'}
                            </span>
                          )}
                        </div>
                        {isUrgent && <Flame className="w-4 h-4 text-rose-500" />}
                      </div>
                    )}

                    {/* Checklist Progress */}
                    {app.checklist.length > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1">
                          <span className="flex items-center gap-1">
                            <CheckSquare className="w-3 h-3 text-slate-400" />
                            Tasks: {completedItems}/{app.checklist.length}
                          </span>
                          <span className="font-semibold text-slate-700">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              progressPct === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Quick Footer Links */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        {app.applicationFee !== undefined ? (
                          <>
                            {app.feePaid ? (
                              <span className="text-emerald-600 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Fee Paid
                              </span>
                            ) : (
                              <span>
                                Fee: {app.currency} {app.applicationFee}
                                {preferredCurrency && app.currency !== preferredCurrency && rates[app.currency] && rates[preferredCurrency] && (
                                  <span className="text-[10px] text-slate-400 block font-normal">
                                    ≈ {preferredCurrency} {Math.round((app.applicationFee / rates[app.currency]) * rates[preferredCurrency])}
                                  </span>
                                )}
                              </span>
                            )}
                          </>
                        ) : null}
                      </span>

                      {app.portalUrl && (
                        <a
                          href={app.portalUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-sky-600 hover:text-sky-700 flex items-center gap-1 text-[11px] hover:underline"
                        >
                          Portal <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}

              {appsInCol.length === 0 && (
                <div className="h-28 border-2 border-dashed border-slate-200/80 rounded-lg flex items-center justify-center text-xs text-slate-400">
                  Drag & drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
