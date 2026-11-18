import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  Sparkles, 
  Calendar, 
  FileText, 
  Check, 
  Plus, 
  X, 
  CheckCircle2, 
  School, 
  DollarSign, 
  BookOpen,
  ArrowRight,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { extractUniversityFromUrl, UniversityScrapeResult, ExtractedCourseInfo } from '../services/universityParser';
import { UniversityApplication } from '../types';

interface UniversityUrlExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddApplication: (app: UniversityApplication) => void;
  preferredCurrency?: string;
  rates?: Record<string, number>;
}

export const UniversityUrlExtractorModal: React.FC<UniversityUrlExtractorModalProps> = ({
  isOpen,
  onClose,
  onAddApplication,
  preferredCurrency = 'USD',
  rates = {},
}) => {
  if (!isOpen) return null;

  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<UniversityScrapeResult | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [addedCourses, setAddedCourses] = useState<string[]>([]);

  const handleScanUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsLoading(true);
    setExtractedData(null);
    setSelectedCourseIds([]);

    // Simulating deep crawler analysis
    setTimeout(() => {
      const result = extractUniversityFromUrl(inputUrl);
      setExtractedData(result);
      // Select the first course by default
      if (result.courses.length > 0) {
        setSelectedCourseIds([result.courses[0].id]);
      }
      setIsLoading(false);
    }, 600);
  };

  const toggleSelectCourse = (id: string) => {
    if (selectedCourseIds.includes(id)) {
      setSelectedCourseIds(selectedCourseIds.filter((item) => item !== id));
    } else {
      setSelectedCourseIds([...selectedCourseIds, id]);
    }
  };

  const handleAddSelectedCourses = (isInterestOnly: boolean = false) => {
    if (!extractedData) return;

    const coursesToAdd = extractedData.courses.filter((c) => selectedCourseIds.includes(c.id));

    coursesToAdd.forEach((course) => {
      const newApp: UniversityApplication = {
        id: `app-extracted-${Date.now()}-${course.id}`,
        universityName: extractedData.universityName,
        country: extractedData.country,
        city: extractedData.city,
        programName: course.courseName,
        degree: course.degree,
        term: 'Fall 2026',
        tier: 'Target',
        status: isInterestOnly ? 'Shortlisted' : 'In Progress',
        deadline: course.deadline,
        portalUrl: extractedData.sourceUrl.startsWith('http')
          ? extractedData.sourceUrl
          : `https://${extractedData.sourceUrl}`,
        applicationFee: course.applicationFee,
        currency: course.currency,
        feePaid: false,
        greRequirement: course.greRequirement,
        toeflRequirement: course.toeflRequirement,
        checklist: course.documentsRequired.map((doc, idx) => ({
          id: `req-${idx}-${Date.now()}`,
          label: doc,
          completed: false,
        })),
        notes: course.description || `Extracted automatically from ${extractedData.sourceUrl}`,
        isInterestOnly,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onAddApplication(newApp);
    });

    setAddedCourses([...addedCourses, ...selectedCourseIds]);
    setSelectedCourseIds([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 via-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-600 text-white rounded-xl shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                AI University Web Scraper & Course Extractor
              </h2>
              <p className="text-xs text-slate-500">
                Paste any university or program link to extract courses, admission deadlines, and required documents.
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

        {/* URL Input Form */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <form onSubmit={handleScanUrl} className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Paste university link (e.g. stanford.edu, cs.cmu.edu, tum.de, gatech.edu, utoronto.ca)..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" /> Extract Courses
                </>
              )}
            </button>
          </form>

          {/* Quick Click Samples */}
          <div className="flex items-center gap-2 mt-2.5 text-[11px] text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-400">Try sample links:</span>
            {['cs.cmu.edu', 'stanford.edu', 'tum.de', 'gatech.edu', 'utoronto.ca', 'cam.ac.uk'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setInputUrl(`https://${sample}`);
                  setTimeout(() => {
                    const result = extractUniversityFromUrl(sample);
                    setExtractedData(result);
                    if (result.courses.length > 0) {
                      setSelectedCourseIds([result.courses[0].id]);
                    }
                  }, 200);
                }}
                className="hover:text-sky-600 font-medium px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-sky-300 transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-sky-500 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-800 text-sm">
                Parsing admissions portal & course catalog...
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Extracting deadlines, GRE/TOEFL requirements, and document checklists
              </p>
            </div>
          ) : extractedData ? (
            <div className="space-y-6">
              {/* University Header Card */}
              <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-lg">
                    <School className="w-6 h-6 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{extractedData.universityName}</h3>
                    <p className="text-xs text-slate-400">
                      {extractedData.city}, {extractedData.country} • Source:{' '}
                      <span className="text-sky-300 underline font-mono text-[11px]">
                        {extractedData.sourceUrl}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {extractedData.courses.length} Programs Detected
                  </span>
                </div>
              </div>

              {/* Courses List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span className="font-bold uppercase tracking-wider">
                    Available Courses, Deadlines & Required Documents
                  </span>
                  <span>Select which programs you'd like to import</span>
                </div>

                {extractedData.courses.map((course) => {
                  const isSelected = selectedCourseIds.includes(course.id);
                  const isAdded = addedCourses.includes(course.id);

                  return (
                    <div
                      key={course.id}
                      onClick={() => !isAdded && toggleSelectCourse(course.id)}
                      className={`rounded-xl border p-4.5 transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-50/50 border-emerald-200 opacity-80 cursor-default'
                          : isSelected
                          ? 'bg-sky-50/50 border-sky-400 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {isAdded ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectCourse(course.id)}
                                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                              />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 text-sm">
                                {course.courseName}
                              </h4>
                              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                                {course.degree}
                              </span>
                              <span className="text-xs text-slate-500">
                                • {course.department}
                              </span>
                            </div>

                            {course.description && (
                              <p className="text-xs text-slate-600 mt-1">{course.description}</p>
                            )}

                            {/* Badges: Deadline, Fee, Tests */}
                            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                              <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200/80">
                                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                                Deadline: {course.deadline}
                              </div>

                              <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                                Fee: {course.currency} {course.applicationFee}
                                {preferredCurrency && course.currency !== preferredCurrency && rates[course.currency] && rates[preferredCurrency] && (
                                  <span className="text-slate-500 text-[10px]">
                                    (≈ {preferredCurrency} {Math.round((course.applicationFee / rates[course.currency]) * rates[preferredCurrency])})
                                  </span>
                                )}
                              </div>

                              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                                GRE: {course.greRequirement}
                              </span>

                              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                                TOEFL: {course.toeflRequirement}
                              </span>
                            </div>

                            {/* Required Documents Checklist Preview */}
                            <div className="mt-3.5 pt-3 border-t border-slate-100">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5 text-sky-500" />
                                Required Documents & Items ({course.documentsRequired.length}):
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {course.documentsRequired.map((doc, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-1.5 text-xs text-slate-700 bg-white/80 px-2 py-1 rounded border border-slate-100"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                                    <span>{doc}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {isAdded && (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                            Added
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 text-base">Paste Any University URL Above</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                GradTrack automatically scans the department page or admissions link, extracts degree options, application deadlines, testing requirements, and documents to build your checklist automatically.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {extractedData && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-600 font-medium">
              {selectedCourseIds.length} course(s) selected
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddSelectedCourses(true)}
                disabled={selectedCourseIds.length === 0}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 disabled:opacity-50 transition-colors"
              >
                ⭐ Add to Colleges of Interest
              </button>

              <button
                type="button"
                onClick={() => handleAddSelectedCourses(false)}
                disabled={selectedCourseIds.length === 0}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" /> Add to Active Applications
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
