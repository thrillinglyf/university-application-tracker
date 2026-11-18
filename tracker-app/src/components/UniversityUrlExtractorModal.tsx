import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  Sparkles, 
  Calendar, 
  FileText, 
  Plus, 
  X, 
  CheckCircle2, 
  School, 
  DollarSign, 
  Filter,
  Layers,
  GraduationCap,
  Loader2,
  CheckSquare
} from 'lucide-react';
import { 
  scrapeUniversityPrograms, 
  UniversityScrapeResult, 
  ACADEMIC_DISCIPLINES 
} from '../services/universityParser';
import { parseRawCatalogText } from '../services/textCatalogParser';
import { parseMastersPortalContent } from '../services/mastersPortalParser';
import { UniversityApplication } from '../types';
import { ClipboardPaste, AlertTriangle, Info } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'url' | 'paste'>('url');
  const [rawPastedText, setRawPastedText] = useState('');
  const [pastedUniName, setPastedUniName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<UniversityScrapeResult | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [addedCourses, setAddedCourses] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Disciplines');
  const [courseSearch, setCourseSearch] = useState<string>('');

  const handleScanUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsLoading(true);
    setExtractedData(null);
    setSelectedCourseIds([]);
    setSelectedCategory('All Disciplines');

    try {
      const result = await scrapeUniversityPrograms(inputUrl);
      setExtractedData(result);
      if (result.courses.length > 0) {
        setSelectedCourseIds([result.courses[0].id]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParsePastedText = () => {
    if (!rawPastedText.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      // Check if text was copied from MastersPortal
      let parsedCourses;
      let uniTitle = pastedUniName || 'Custom University';

      if (rawPastedText.toLowerCase().includes('mastersportal') || rawPastedText.includes('EUR/year') || rawPastedText.includes('Tuition')) {
        const mpParsed = parseMastersPortalContent(rawPastedText);
        parsedCourses = mpParsed.courses;
        if (!pastedUniName && mpParsed.institutionName !== 'MastersPortal University') {
          uniTitle = mpParsed.institutionName;
        }
      } else {
        parsedCourses = parseRawCatalogText(rawPastedText, uniTitle);
      }

      setExtractedData({
        universityName: uniTitle,
        country: 'United States',
        city: 'Campus',
        sourceUrl: 'Direct Page Text Import',
        detectedCategories: Array.from(new Set(parsedCourses.map((c) => c.category))),
        courses: parsedCourses,
      });

      if (parsedCourses.length > 0) {
        setSelectedCourseIds([parsedCourses[0].id]);
      }
      setIsLoading(false);
    }, 300);
  };

  const toggleSelectCourse = (id: string) => {
    if (selectedCourseIds.includes(id)) {
      setSelectedCourseIds(selectedCourseIds.filter((item) => item !== id));
    } else {
      setSelectedCourseIds([...selectedCourseIds, id]);
    }
  };

  const handleSelectAllVisible = (courses: any[]) => {
    const unaddedIds = courses.filter((c) => !addedCourses.includes(c.id)).map((c) => c.id);
    const allSelected = unaddedIds.every((id) => selectedCourseIds.includes(id));
    if (allSelected) {
      setSelectedCourseIds(selectedCourseIds.filter((id) => !unaddedIds.includes(id)));
    } else {
      setSelectedCourseIds(Array.from(new Set([...selectedCourseIds, ...unaddedIds])));
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
        degree: (course.degree as any) || 'MS',
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
        notes: `${course.description || ''} • Department: ${course.department}`,
        isInterestOnly,
        interestReason: `Category: ${course.category}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onAddApplication(newApp);
    });

    setAddedCourses([...addedCourses, ...selectedCourseIds]);
    setSelectedCourseIds([]);
  };

  // Filter courses by discipline & search keyword
  const visibleCourses = extractedData
    ? extractedData.courses.filter((course) => {
        const matchesCategory =
          selectedCategory === 'All Disciplines' || course.category === selectedCategory;
        const matchesSearch =
          course.courseName.toLowerCase().includes(courseSearch.toLowerCase()) ||
          course.department.toLowerCase().includes(courseSearch.toLowerCase()) ||
          course.category.toLowerCase().includes(courseSearch.toLowerCase());
        return matchesCategory && matchesSearch;
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 via-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-600 text-white rounded-xl shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                All-Discipline University Scraper & Degree Catalog
              </h2>
              <p className="text-xs text-slate-500">
                Paste any university URL to view all programs across Engineering, Business, Sciences, Medicine, Humanities & Law.
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

        {/* Tab Selector: URL Scan vs Direct Page Text Paste */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-4 sm:px-5 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 border-b-2 rounded-t-lg transition-all flex items-center gap-2 ${
              activeTab === 'url'
                ? 'border-sky-600 text-sky-700 bg-white font-bold shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> 1. Scrape by URL
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2 border-b-2 rounded-t-lg transition-all flex items-center gap-2 ${
              activeTab === 'paste'
                ? 'border-sky-600 text-sky-700 bg-white font-bold shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-amber-600" /> 2. Paste Page Text (Bypasses All Blocks)
          </button>
        </div>

        {/* Input Forms */}
        {activeTab === 'url' ? (
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60">
            <form onSubmit={handleScanUrl} className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter university URL (e.g. harvard.edu, mit.edu, tum.de, cam.ac.uk, oxford.ac.uk, stanford.edu, utoronto.ca)..."
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !inputUrl.trim()}
                className="px-4 sm:px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Scraping...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" /> Scrape All Programs
                  </>
                )}
              </button>
            </form>

            {/* Quick-Pick University Presets */}
            <div className="flex items-center gap-2 mt-2.5 text-[11px] text-slate-500 flex-wrap">
              <span className="font-semibold text-slate-400">Quick Test URLs:</span>
              <button
                type="button"
                onClick={() => {
                  setInputUrl('https://www.mastersportal.com');
                  setIsLoading(true);
                  scrapeUniversityPrograms('https://www.mastersportal.com').then((res) => {
                    setExtractedData(res);
                    if (res.courses.length > 0) setSelectedCourseIds([res.courses[0].id]);
                    setIsLoading(false);
                  });
                }}
                className="hover:text-amber-600 font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 transition-colors flex items-center gap-1"
              >
                🎓 MastersPortal.com
              </button>
              {['harvard.edu', 'mit.edu', 'tum.de', 'stanford.edu', 'cam.ac.uk', 'utoronto.ca'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setInputUrl(preset);
                    setIsLoading(true);
                    scrapeUniversityPrograms(preset).then((res) => {
                      setExtractedData(res);
                      if (res.courses.length > 0) setSelectedCourseIds([res.courses[0].id]);
                      setIsLoading(false);
                    });
                  }}
                  className="hover:text-sky-600 font-medium px-2 py-0.5 rounded bg-white border border-slate-200 hover:border-sky-300 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-800">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Why paste?</span> University websites (Cloudflare, Akamai, React SPAs) often block automated web scrapers. Simply press <kbd className="px-1.5 py-0.5 bg-white border rounded shadow-xs font-mono">Ctrl+A</kbd> and <kbd className="px-1.5 py-0.5 bg-white border rounded shadow-xs font-mono">Ctrl+C</kbd> on any program catalog page, and paste it here!
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="University Name (e.g. Johns Hopkins University)..."
                value={pastedUniName}
                onChange={(e) => setPastedUniName(e.target.value)}
                className="w-1/3 text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={handleParsePastedText}
                disabled={!rawPastedText.trim() || isLoading}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap ml-auto"
              >
                <ClipboardPaste className="w-3.5 h-3.5" /> Parse Courses & Deadlines
              </button>
            </div>

            <textarea
              rows={4}
              value={rawPastedText}
              onChange={(e) => setRawPastedText(e.target.value)}
              placeholder="Paste copied text from any graduate admissions or catalog webpage here..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono bg-white"
            />
          </div>
        )}

        {/* Results & Disciplines Switcher */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-sky-500 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">
                Crawling University Programs & Admission Requirements...
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Scanning across Engineering, Business, Sciences, and Arts for official deadlines, GRE/TOEFL rules, and checklists.
              </p>
            </div>
          ) : extractedData ? (
            <div className="space-y-5">
              {/* University Profile Card */}
              <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-lg">
                    <School className="w-6 h-6 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{extractedData.universityName}</h3>
                    <p className="text-xs text-slate-400">
                      {extractedData.city}, {extractedData.country} • Scraped link:{' '}
                      <span className="text-sky-300 font-mono text-[11px] underline">
                        {extractedData.sourceUrl}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {extractedData.courses.length} Programs Found
                  </span>
                </div>
              </div>

              {/* Discipline Filter Pills & Search */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter courses by name (e.g. Mechanical, MBA, Bio, Law)..."
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectAllVisible(visibleCourses)}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 self-end sm:self-auto"
                  >
                    <CheckSquare className="w-3.5 h-3.5" /> Toggle Select All Visible ({visibleCourses.length})
                  </button>
                </div>

                {/* Categories Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {ACADEMIC_DISCIPLINES.map((discipline) => {
                    const isSelected = selectedCategory === discipline;
                    const count = discipline === 'All Disciplines' 
                      ? extractedData.courses.length
                      : extractedData.courses.filter((c) => c.category === discipline).length;

                    if (count === 0 && discipline !== 'All Disciplines') return null;

                    return (
                      <button
                        key={discipline}
                        onClick={() => setSelectedCategory(discipline)}
                        className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 text-xs ${
                          isSelected
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                        }`}
                      >
                        <span>{discipline}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-slate-100'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Courses Grid List */}
              <div className="space-y-3">
                {visibleCourses.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                    No programs matched "{courseSearch}" in {selectedCategory}. Try another filter!
                  </div>
                ) : (
                  visibleCourses.map((course) => {
                    const isSelected = selectedCourseIds.includes(course.id);
                    const isAdded = addedCourses.includes(course.id);

                    return (
                      <div
                        key={course.id}
                        onClick={() => !isAdded && toggleSelectCourse(course.id)}
                        className={`rounded-xl border p-4 transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-50/50 border-emerald-200 opacity-80 cursor-default'
                            : isSelected
                            ? 'bg-sky-50/60 border-sky-400 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {isAdded ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectCourse(course.id)}
                                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                                />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-slate-900 text-sm">
                                  {course.courseName}
                                </h4>
                                <span className="text-[11px] px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
                                  {course.degree}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                                  {course.category}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">
                                  • {course.department}
                                </span>
                              </div>

                              {course.description && (
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                  {course.description}
                                </p>
                              )}

                              {/* Badges: Deadline, Fee, Testing */}
                              <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs">
                                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200/80">
                                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                                  Deadline: {course.deadline}
                                </div>

                                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                  <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                                  Fee: {course.currency} {course.applicationFee}
                                  {preferredCurrency && course.currency !== preferredCurrency && rates[course.currency] && rates[preferredCurrency] && (
                                    <span className="text-slate-500 text-[10px]">
                                      (≈ {preferredCurrency} {Math.round((course.applicationFee / rates[course.currency]) * rates[preferredCurrency])})
                                    </span>
                                  )}
                                </div>

                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                  GRE: {course.greRequirement}
                                </span>

                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                  TOEFL: {course.toeflRequirement}
                                </span>
                              </div>

                              {/* Required Documents Checklist */}
                              <div className="mt-3 pt-2.5 border-t border-slate-100">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5 text-sky-500" />
                                  Documents Required ({course.documentsRequired.length}):
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {course.documentsRequired.map((doc, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100"
                                    >
                                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                                      <span className="line-clamp-1">{doc}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {isAdded && (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                              Imported
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 text-base">Paste Any University URL Above</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
                GradTrack scans the university link across all academic divisions: Business & MBA, Mechanical / Electrical / Civil Engineering, Biotechnology, Physical Sciences, Law, and Public Policy with their respective deadlines and document requirements.
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
                ⭐ Add Selected to Colleges of Interest
              </button>

              <button
                type="button"
                onClick={() => handleAddSelectedCourses(false)}
                disabled={selectedCourseIds.length === 0}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" /> Add to Active Pipeline
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
