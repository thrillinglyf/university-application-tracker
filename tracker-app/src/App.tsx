import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  LayoutGrid, 
  List, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  GraduationCap, 
  RotateCcw,
  Sparkles,
  BookMarked
} from 'lucide-react';
import { UniversityApplication, ApplicationStatus, PriorityTier, UserProfileScores } from './types';
import { INITIAL_APPLICATIONS, INITIAL_PROFILE } from './mockData';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { CollegesOfInterestView } from './components/CollegesOfInterestView';
import { CurrencyConverterBar } from './components/CurrencyConverterBar';
import { ApplicationModal } from './components/ApplicationModal';
import { ProfileCard } from './components/ProfileCard';
import { StatsOverview } from './components/StatsOverview';

const STORAGE_KEY_APPS = 'masters_tracker_apps_v1';
const STORAGE_KEY_PROFILE = 'masters_tracker_profile_v1';

export function App() {
  // State for applications
  const [applications, setApplications] = useState<UniversityApplication[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_APPS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved applications', e);
      }
    }
    return INITIAL_APPLICATIONS;
  });

  // State for applicant profile
  const [profile, setProfile] = useState<UserProfileScores>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved profile', e);
      }
    }
    return INITIAL_PROFILE;
  });

  // View mode
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'interests'>('kanban');

  // Currency Converter state
  const [preferredCurrency, setPreferredCurrency] = useState<string>(() => {
    return localStorage.getItem('gradtrack_preferred_currency') || 'USD';
  });
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  const handleCurrencyChange = (curr: string) => {
    setPreferredCurrency(curr);
    localStorage.setItem('gradtrack_preferred_currency', curr);
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'deadline' | 'name' | 'tier'>('deadline');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<UniversityApplication | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  }, [profile]);

  // Handlers
  const handleCreateOrUpdate = (savedApp: UniversityApplication) => {
    setApplications((prev) => {
      const exists = prev.some((a) => a.id === savedApp.id);
      if (exists) {
        return prev.map((a) => (a.id === savedApp.id ? savedApp : a));
      }
      return [savedApp, ...prev];
    });
  };

  const handleDelete = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdateStatus = (id: string, newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: newStatus, updatedAt: new Date().toISOString() } : a
      )
    );
  };

  const handleToggleChecklist = (appId: string, itemId: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        return {
          ...app,
          checklist: app.checklist.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Export JSON
  const handleExportData = () => {
    const data = {
      profile,
      applications,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Masters_Applications_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.applications && Array.isArray(parsed.applications)) {
          setApplications(parsed.applications);
        }
        if (parsed.profile) {
          setProfile(parsed.profile);
        }
        alert('Data successfully imported!');
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset demo data
  const handleResetDemoData = () => {
    if (window.confirm('Reset all applications and profile to sample demo data?')) {
      setApplications(INITIAL_APPLICATIONS);
      setProfile(INITIAL_PROFILE);
    }
  };

  // Filtered & sorted applications
  const filteredApps = applications
    .filter((app) => {
      const matchSearch =
        app.universityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.notes && app.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchTier = selectedTier === 'All' || app.tier === selectedTier;
      const matchStatus = selectedStatus === 'All' || app.status === selectedStatus;

      return matchSearch && matchTier && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === 'name') {
        return a.universityName.localeCompare(b.universityName);
      }
      if (sortBy === 'tier') {
        const tierRank: Record<PriorityTier, number> = { Dream: 1, Target: 2, Safe: 3 };
        return tierRank[a.tier] - tierRank[b.tier];
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Global Live Currency Converter Bar */}
      <CurrencyConverterBar
        preferredCurrency={preferredCurrency}
        onCurrencyChange={handleCurrencyChange}
        rates={exchangeRates}
        onRatesUpdate={setExchangeRates}
      />

      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                GradTrack <span className="text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-700 font-bold">Masters 2026</span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">Graduate Admissions & Applications Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Pipeline
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <List className="w-3.5 h-3.5" /> Table
              </button>
              <button
                onClick={() => setViewMode('interests')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'interests'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-amber-700 hover:text-amber-800'
                }`}
              >
                ⭐ Colleges of Interest
              </button>
            </div>

            {/* Add App Button */}
            <button
              onClick={() => {
                setEditingApp(null);
                setIsModalOpen(true);
              }}
              className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Add Application
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Applicant Profile Card */}
        <ProfileCard profile={profile} onUpdateProfile={setProfile} />

        {/* Quick Stats Overview */}
        <StatsOverview
          applications={applications}
          preferredCurrency={preferredCurrency}
          rates={exchangeRates}
        />

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search university, program, country, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Filter by Tier */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-500">Tier:</span>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none bg-white font-medium"
              >
                <option value="All">All Tiers</option>
                <option value="Dream">🌟 Dream</option>
                <option value="Target">🎯 Target</option>
                <option value="Safe">🛡️ Safe</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-500">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none bg-white font-medium"
              >
                <option value="All">All Statuses</option>
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

            {/* Sort */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none bg-white font-medium"
              >
                <option value="deadline">Earliest Deadline</option>
                <option value="name">University Name</option>
                <option value="tier">Priority Tier</option>
              </select>
            </div>
          </div>

          {/* Backup / Export / Import Tools */}
          <div className="flex items-center gap-2 border-t md:border-t-0 pt-2 md:pt-0">
            <button
              onClick={handleExportData}
              className="p-2 text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Backup applications as JSON"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Restore from JSON"
            >
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportData}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={handleResetDemoData}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg text-xs transition-colors"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main View Switcher */}
        {viewMode === 'kanban' ? (
          <KanbanBoard
            applications={filteredApps}
            onSelectApp={(app) => {
              setEditingApp(app);
              setIsModalOpen(true);
            }}
            onUpdateStatus={handleUpdateStatus}
            onToggleChecklist={handleToggleChecklist}
            preferredCurrency={preferredCurrency}
            rates={exchangeRates}
          />
        ) : viewMode === 'list' ? (
          <ListView
            applications={filteredApps}
            onSelectApp={(app) => {
              setEditingApp(app);
              setIsModalOpen(true);
            }}
            onDeleteApp={handleDelete}
            onUpdateStatus={handleUpdateStatus}
            preferredCurrency={preferredCurrency}
            rates={exchangeRates}
          />
        ) : (
          <CollegesOfInterestView
            applications={applications}
            onSelectApp={(app) => {
              setEditingApp(app);
              setIsModalOpen(true);
            }}
            onDeleteApp={handleDelete}
            onConvertToActive={(app) => {
              handleCreateOrUpdate({
                ...app,
                isInterestOnly: false,
                status: 'In Progress',
              });
              setViewMode('kanban');
            }}
            onAddNewInterest={() => {
              setEditingApp({
                id: `interest-${Date.now()}`,
                universityName: '',
                country: 'United States',
                city: '',
                programName: '',
                degree: 'MS',
                term: 'Fall 2026',
                tier: 'Target',
                status: 'Shortlisted',
                deadline: '',
                applicationFee: 0,
                currency: 'USD',
                feePaid: false,
                isInterestOnly: true,
                checklist: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              setIsModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Application Add/Edit Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateOrUpdate}
        application={editingApp}
      />
    </div>
  );
}

export default App;
