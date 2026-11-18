import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Plus, 
  Search, 
  Globe2, 
  GraduationCap,
  BookmarkCheck,
  Award
} from 'lucide-react';
import { UniversityApplication, PriorityTier } from '../types';

interface CollegesOfInterestViewProps {
  applications: UniversityApplication[];
  onSelectApp: (app: UniversityApplication) => void;
  onDeleteApp: (id: string) => void;
  onConvertToActive: (app: UniversityApplication) => void;
  onAddNewInterest: () => void;
}

export const CollegesOfInterestView: React.FC<CollegesOfInterestViewProps> = ({
  applications,
  onSelectApp,
  onDeleteApp,
  onConvertToActive,
  onAddNewInterest,
}) => {
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<string>('All');

  // Filter items that are either marked isInterestOnly OR in 'Shortlisted' status
  const interestColleges = applications.filter((app) => {
    const isInterest = app.isInterestOnly || app.status === 'Shortlisted';
    const matchSearch =
      app.universityName.toLowerCase().includes(search.toLowerCase()) ||
      app.programName.toLowerCase().includes(search.toLowerCase()) ||
      app.country.toLowerCase().includes(search.toLowerCase()) ||
      (app.interestReason && app.interestReason.toLowerCase().includes(search.toLowerCase()));
    const matchTier = filterTier === 'All' || app.tier === filterTier;
    return isInterest && matchSearch && matchTier;
  });

  const getTierColor = (tier: PriorityTier) => {
    switch (tier) {
      case 'Dream':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Target':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'Safe':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Informational Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-700 rounded-xl">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Colleges of Interest (Stored 100% Locally on Your Device)
            </h3>
            <p className="text-xs text-slate-600">
              Save potential programs, rankings, lab notes, and why you're interested. Zero cloud servers — your data never leaves your browser.
            </p>
          </div>
        </div>
        <button
          onClick={onAddNewInterest}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add College of Interest
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search saved colleges, locations, or reasons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-semibold text-slate-500">Tier:</span>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none bg-white font-medium"
          >
            <option value="All">All Categories</option>
            <option value="Dream">🌟 Dream</option>
            <option value="Target">🎯 Target</option>
            <option value="Safe">🛡️ Safe</option>
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      {interestColleges.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700 text-base">No colleges of interest found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click "Add College of Interest" above to begin bookmarking universities you'd like to explore before officially applying!
          </p>
          <button
            onClick={onAddNewInterest}
            className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Your First College
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interestColleges.map((college) => (
            <div
              key={college.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header: Tier + Ranking */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getTierColor(college.tier)}`}>
                    {college.tier}
                  </span>
                  {college.ranking && (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                      <Award className="w-3 h-3" /> {college.ranking}
                    </span>
                  )}
                </div>

                {/* University Name & Location */}
                <h4 className="font-bold text-slate-900 text-base leading-snug group-hover:text-amber-600 transition-colors">
                  {college.universityName}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {college.city ? `${college.city}, ` : ''}{college.country}
                  </span>
                </div>

                {/* Program */}
                <div className="mt-2 text-xs font-medium text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="line-clamp-1">{college.programName}</span>
                </div>

                {/* Why Interested / Notes */}
                {(college.interestReason || college.notes) && (
                  <div className="mt-3 text-xs text-slate-600 bg-amber-50/40 p-2.5 rounded-lg border border-amber-100/60 leading-relaxed">
                    <span className="font-semibold text-amber-900 block mb-0.5 text-[11px]">Why I'm Interested:</span>
                    <p className="line-clamp-3 text-[11px] text-slate-700">
                      {college.interestReason || college.notes}
                    </p>
                  </div>
                )}

                {/* Quick Info Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                  {college.deadline && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                      Deadline: {college.deadline}
                    </span>
                  )}
                  {college.greRequirement && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                      GRE: {college.greRequirement}
                    </span>
                  )}
                  {college.applicationFee !== undefined && college.applicationFee > 0 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                      Fee: {college.currency} {college.applicationFee}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {college.portalUrl && (
                    <a
                      href={college.portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-sky-600 rounded hover:bg-slate-50"
                      title="Visit Program Page / Portal"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => onSelectApp(college)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 rounded hover:bg-slate-50"
                    title="Edit Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Remove ${college.universityName} from your colleges of interest?`)) {
                        onDeleteApp(college.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-50"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => onConvertToActive(college)}
                  className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                  title="Move to Active Application Pipeline"
                >
                  Start Applying <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
