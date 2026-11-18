import React from 'react';
import { 
  Building2, 
  Calendar, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { UniversityApplication, ApplicationStatus, PriorityTier } from '../types';

interface ListViewProps {
  applications: UniversityApplication[];
  onSelectApp: (app: UniversityApplication) => void;
  onDeleteApp: (id: string) => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  preferredCurrency?: string;
  rates?: Record<string, number>;
}

export const ListView: React.FC<ListViewProps> = ({
  applications,
  onSelectApp,
  onDeleteApp,
  onUpdateStatus,
  preferredCurrency = 'USD',
  rates = {},
}) => {
  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Ready to Submit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Submitted':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Interview':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Admitted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Waitlisted':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  const getTierBadge = (tier: PriorityTier) => {
    switch (tier) {
      case 'Dream':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Target':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Safe':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
            <tr>
              <th className="py-3.5 px-4">University & Program</th>
              <th className="py-3.5 px-4">Country / Degree</th>
              <th className="py-3.5 px-4">Tier</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Deadline</th>
              <th className="py-3.5 px-4">Fee / Scholarship</th>
              <th className="py-3.5 px-4">Checklist</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No applications found matching your criteria.
                </td>
              </tr>
            ) : (
              applications.map((app) => {
                const completedTasks = app.checklist.filter((c) => c.completed).length;
                return (
                  <tr
                    key={app.id}
                    onClick={() => onSelectApp(app)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{app.universityName}</div>
                      <div className="text-xs text-slate-500">{app.programName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-700">{app.country}</span>
                      <div className="text-xs text-slate-500">{app.degree} ({app.term})</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getTierBadge(app.tier)}`}>
                        {app.tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={app.status}
                        onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${getStatusBadge(app.status)}`}
                      >
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Ready to Submit">Ready to Submit</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Interview">Interview</option>
                        <option value="Admitted">Admitted</option>
                        <option value="Waitlisted">Waitlisted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {app.deadline || 'No deadline'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="font-medium">
                        {app.applicationFee !== undefined ? (
                          <span>
                            {app.currency} {app.applicationFee}{' '}
                            <span className={app.feePaid ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                              ({app.feePaid ? 'Paid' : 'Unpaid'})
                            </span>
                            {preferredCurrency && app.currency !== preferredCurrency && rates[app.currency] && rates[preferredCurrency] && (
                              <div className="text-[11px] text-slate-400 font-normal">
                                ≈ {preferredCurrency} {Math.round((app.applicationFee / rates[app.currency]) * rates[preferredCurrency])}
                              </div>
                            )}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </div>
                      {app.scholarshipApplied && (
                        <span className="text-[11px] text-purple-600 font-medium">✨ Scholarship applied</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {app.checklist.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {completedTasks} / {app.checklist.length} done
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No tasks</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {app.portalUrl && (
                          <a
                            href={app.portalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-sky-600 rounded-md hover:bg-slate-100"
                            title="Open Application Portal"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => onSelectApp(app)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100"
                          title="Edit Application"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete application for ${app.universityName}?`)) {
                              onDeleteApp(app.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
