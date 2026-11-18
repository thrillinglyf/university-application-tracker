import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  ExternalLink, 
  Save, 
  Sparkles,
  School,
  Clock,
  DollarSign
} from 'lucide-react';
import { UniversityApplication, ApplicationStatus, PriorityTier, Term } from '../types';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (app: UniversityApplication) => void;
  application: UniversityApplication | null;
}

const DEFAULT_CHECKLIST = [
  'Statement of Purpose (SOP)',
  '3 Letters of Recommendation (LORs)',
  'Resume / CV Updated',
  'Official / Unofficial Transcripts',
  'GRE Score Report Sent',
  'TOEFL / IELTS Score Report Sent',
  'Financial Documents / Bank Letter',
  'Application Fee Payment',
];

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  application,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<UniversityApplication>(
    application || {
      id: `app-${Date.now()}`,
      universityName: '',
      country: 'United States',
      city: '',
      programName: '',
      degree: 'MS',
      term: 'Fall 2026',
      tier: 'Target',
      status: 'Shortlisted',
      deadline: '',
      portalUrl: '',
      portalUsername: '',
      applicationFee: 100,
      currency: 'USD',
      feePaid: false,
      greRequirement: 'Optional',
      toeflRequirement: 'Required',
      minGpa: '',
      notes: '',
      facultyContacts: '',
      scholarshipApplied: false,
      isInterestOnly: false,
      interestReason: '',
      ranking: '',
      checklist: DEFAULT_CHECKLIST.map((item, idx) => ({
        id: `c-${idx}`,
        label: item,
        completed: false,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [newTaskText, setNewTaskText] = useState('');

  const handleAddChecklist = () => {
    if (!newTaskText.trim()) return;
    setFormData({
      ...formData,
      checklist: [
        ...formData.checklist,
        {
          id: `c-${Date.now()}`,
          label: newTaskText.trim(),
          completed: false,
        },
      ],
    });
    setNewTaskText('');
  };

  const handleToggleItem = (id: string) => {
    setFormData({
      ...formData,
      checklist: formData.checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    });
  };

  const handleDeleteItem = (id: string) => {
    setFormData({
      ...formData,
      checklist: formData.checklist.filter((item) => item.id !== id),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.universityName.trim() || !formData.programName.trim()) {
      alert('Please fill out University Name and Program Name.');
      return;
    }
    onSave({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {application ? 'Edit Application Details' : 'Manual Entry: Add University Application'}
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ✏️ Manual Mode (Stored Locally)
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Directly enter your university, program, deadlines, testing rules, and custom document checklists without any web scraping.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Basic Information */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                1. University & Program Info
              </h3>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <input
                  type="checkbox"
                  checked={formData.isInterestOnly || false}
                  onChange={(e) => setFormData({ ...formData, isInterestOnly: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Save as "College of Interest" (Preliminary exploration)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  University Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stanford University"
                  value={formData.universityName}
                  onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Program / Degree Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MS in Mechanical Engineering or Full-Time MBA"
                  value={formData.programName}
                  onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Degree Type</label>
                <select
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value as any })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="MS">MS (Master of Science)</option>
                  <option value="MEng">MEng (Master of Engineering)</option>
                  <option value="MBA">MBA (Master of Business Admin)</option>
                  <option value="MA">MA (Master of Arts)</option>
                  <option value="PhD">PhD (Doctor of Philosophy)</option>
                  <option value="Other">Other / Dual Degree</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  placeholder="e.g. United States, Germany, Canada, UK"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City / Campus</label>
                <input
                  type="text"
                  placeholder="e.g. Cambridge, MA"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ranking / Tier Recognition</label>
                <input
                  type="text"
                  placeholder="e.g. US News #5, QS #12, Top 20"
                  value={formData.ranking || ''}
                  onChange={(e) => setFormData({ ...formData, ranking: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Why I'm Interested</label>
                <input
                  type="text"
                  placeholder="e.g. World-class AI lab, Prof. X research, generous assistantships"
                  value={formData.interestReason || ''}
                  onChange={(e) => setFormData({ ...formData, interestReason: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Application Details & Deadlines */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              2. Status, Tier & Dates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Tier</label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value as PriorityTier })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="Dream">🌟 Dream (Ambitious)</option>
                  <option value="Target">🎯 Target (Moderate)</option>
                  <option value="Safe">🛡️ Safe (High Chance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Term</label>
                <select
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value as Term })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="Fall 2025">Fall 2025</option>
                  <option value="Spring 2026">Spring 2026</option>
                  <option value="Fall 2026">Fall 2026</option>
                  <option value="Spring 2027">Spring 2027</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Application Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Application Fee</label>
                <div className="flex gap-2">
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-24 text-sm px-2 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Fee amount"
                    value={formData.applicationFee ?? ''}
                    onChange={(e) => setFormData({ ...formData, applicationFee: Number(e.target.value) })}
                    className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={formData.feePaid}
                    onChange={(e) => setFormData({ ...formData, feePaid: e.target.checked })}
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <span>Fee already paid</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 select-none mt-2">
                  <input
                    type="checkbox"
                    checked={formData.scholarshipApplied || false}
                    onChange={(e) => setFormData({ ...formData, scholarshipApplied: e.target.checked })}
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <span>Applied for Scholarship / TA / RA</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Portal Credentials & Links */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              3. Portal & Credentials (Stored Privately in Browser)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Application Portal URL
                </label>
                <input
                  type="url"
                  placeholder="https://admissions.university.edu/apply"
                  value={formData.portalUrl || ''}
                  onChange={(e) => setFormData({ ...formData, portalUrl: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Portal Username / App ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. applicant_92812 or your email"
                  value={formData.portalUsername || ''}
                  onChange={(e) => setFormData({ ...formData, portalUsername: e.target.value })}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Document & Task Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                4. Application Checklist & Documents
              </h3>
              <span className="text-xs text-slate-500">
                {formData.checklist.filter((i) => i.completed).length} of {formData.checklist.length} done
              </span>
            </div>

            <div className="space-y-2 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              {formData.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleItem(item.id)}
                    className="flex items-center gap-2.5 text-sm text-left flex-1"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        item.completed ? 'line-through text-slate-400' : 'text-slate-700'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2 mt-3 pt-2 border-t border-slate-200">
                <input
                  type="text"
                  placeholder="Add custom task or document (e.g. Diversity Statement, WES Evaluation)..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklist();
                    }
                  }}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddChecklist}
                  className="px-3 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Notes & Faculty Contacts */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              5. Notes, Research Labs & Faculty Contacts
            </h3>
            <textarea
              rows={3}
              placeholder="Professors contacted, lab interests, interview questions, specific department guidelines..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-semibold bg-sky-600 text-white rounded-xl hover:bg-sky-500 transition-colors shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Application
          </button>
        </div>
      </div>
    </div>
  );
};
