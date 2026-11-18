import React, { useState } from 'react';
import { 
  GraduationCap, 
  Award, 
  FileCheck, 
  Edit2, 
  Check, 
  BookOpen, 
  Target 
} from 'lucide-react';
import { UserProfileScores } from '../types';

interface ProfileCardProps {
  profile: UserProfileScores;
  onUpdateProfile: (updated: UserProfileScores) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfileScores>(profile);

  const handleSave = () => {
    onUpdateProfile(tempProfile);
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
            <GraduationCap className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Masters Applicant Profile
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                {profile.targetTerm || 'Fall 2026'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Intended Field: <span className="text-slate-200 font-semibold">{profile.intendedMajor}</span>
            </p>
          </div>
        </div>

        <div>
          {isEditing ? (
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" /> Save Profile
            </button>
          ) : (
            <button
              onClick={() => {
                setTempProfile(profile);
                setIsEditing(true);
              }}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Test Scores
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Undergrad GPA</label>
            <input
              type="text"
              value={tempProfile.gpa}
              onChange={(e) => setTempProfile({ ...tempProfile, gpa: e.target.value })}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-400"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">GRE Total</label>
            <input
              type="text"
              value={tempProfile.greOverall || ''}
              onChange={(e) => setTempProfile({ ...tempProfile, greOverall: e.target.value })}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-400"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">GRE Quant</label>
            <input
              type="text"
              value={tempProfile.greQuant || ''}
              onChange={(e) => setTempProfile({ ...tempProfile, greQuant: e.target.value })}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-400"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">GRE Verbal</label>
            <input
              type="text"
              value={tempProfile.greVerbal || ''}
              onChange={(e) => setTempProfile({ ...tempProfile, greVerbal: e.target.value })}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-400"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">TOEFL Score</label>
            <input
              type="text"
              value={tempProfile.toeflOverall || ''}
              onChange={(e) => setTempProfile({ ...tempProfile, toeflOverall: e.target.value })}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-400"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">IELTS Score</label>
            <input
              type="text"
              value={tempProfile.ieltsOverall || ''}
              onChange={(e) => setTempProfile({ ...tempProfile, ieltsOverall: e.target.value })}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-white/5 border border-white/5 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider">GPA</span>
            <span className="text-lg font-bold text-sky-300">{profile.gpa}</span>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider">GRE Score</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-amber-300">{profile.greOverall || '—'}</span>
              <span className="text-[10px] text-slate-400">
                (Q:{profile.greQuant || '-'} V:{profile.greVerbal || '-'})
              </span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider">GRE AWA</span>
            <span className="text-lg font-bold text-slate-200">{profile.greAwa || '—'}</span>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider">TOEFL</span>
            <span className="text-lg font-bold text-emerald-300">{profile.toeflOverall || '—'}</span>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider">IELTS</span>
            <span className="text-lg font-bold text-teal-300">{profile.ieltsOverall || '—'}</span>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider">Target Term</span>
            <span className="text-sm font-semibold text-purple-300">{profile.targetTerm}</span>
          </div>
        </div>
      )}
    </div>
  );
};
