import { ExtractedCourseInfo, categorizeProgram } from './universityParser';

/**
 * Parses raw text copied directly from any university catalog, program list,
 * syllabus page, or admissions requirement page.
 */
export function parseRawCatalogText(
  rawText: string,
  universityName: string = 'Target University',
  country: string = 'United States',
  currency: string = 'USD'
): ExtractedCourseInfo[] {
  if (!rawText.trim()) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const detectedCourses: ExtractedCourseInfo[] = [];

  // Patterns that identify academic degrees and course offerings
  const courseDegreePatterns = [
    /^(Master\s+(?:of|in)\s+[A-Za-z\s&,/-]+)/i,
    /^(M\.?Sc\.?\s+(?:in\s+)?[A-Za-z\s&,/-]+)/i,
    /^(M\.?Eng\.?\s+(?:in\s+)?[A-Za-z\s&,/-]+)/i,
    /^(M\.?A\.?\s+(?:in\s+)?[A-Za-z\s&,/-]+)/i,
    /^(MBA\s*(?:in\s+)?[A-Za-z\s&,/-]*)/i,
    /^(Ph\.?D\.?\s+(?:in\s+)?[A-Za-z\s&,/-]+)/i,
    /^(Bachelor\s+(?:of|in)\s+[A-Za-z\s&,/-]+)/i,
    /^(B\.?Sc\.?\s+(?:in\s+)?[A-Za-z\s&,/-]+)/i,
    /^(B\.?Tech\.?\s+(?:in\s+)?[A-Za-z\s&,/-]+)/i,
    /^(Graduate\s+Certificate\s+in\s+[A-Za-z\s&,/-]+)/i,
    /^(Doctor\s+of\s+[A-Za-z\s&,/-]+)/i,
  ];

  // Regex to spot deadlines in text
  const deadlineRegex = /(?:deadline|apply by|due date|application close)[:\s]*([A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/i;

  let currentCourse: Partial<ExtractedCourseInfo> | null = null;
  let collectedNotes: string[] = [];

  const finalizeCourse = () => {
    if (currentCourse && currentCourse.courseName) {
      const name = currentCourse.courseName;
      const lower = name.toLowerCase();

      const degreeType = lower.includes('mba')
        ? 'MBA'
        : lower.includes('arts') || lower.includes('m.a') || lower.includes('ma in')
        ? 'MA'
        : lower.includes('meng') || lower.includes('engineering')
        ? 'MEng'
        : lower.includes('phd') || lower.includes('doctor')
        ? 'PhD'
        : 'MS';

      const fee = currency === 'EUR' ? 0 : currency === 'GBP' ? 75 : 100;

      detectedCourses.push({
        id: `pasted-${Date.now()}-${detectedCourses.length}`,
        courseName: name,
        degree: degreeType as any,
        department: currentCourse.department || 'Academic Department',
        category: categorizeProgram(name),
        deadline: currentCourse.deadline || '2026-12-15',
        applicationFee: fee,
        currency,
        greRequirement: lower.includes('business') || lower.includes('mba') ? 'Optional' : 'Optional',
        toeflRequirement: 'Required',
        documentsRequired: [
          'Statement of Purpose (SOP)',
          '2-3 Letters of Recommendation (LORs)',
          'Official Academic Transcripts',
          'Updated Resume / CV',
          'English Language Test (TOEFL/IELTS)',
        ],
        description: collectedNotes.slice(0, 3).join(' ') || `Program extracted from university page text.`,
      });
    }
    currentCourse = null;
    collectedNotes = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line matches a degree course pattern
    let isHeader = false;
    for (const pat of courseDegreePatterns) {
      const match = line.match(pat);
      if (match && match[0].length >= 5 && match[0].length < 80) {
        finalizeCourse();
        currentCourse = {
          courseName: match[0].trim(),
        };
        isHeader = true;
        break;
      }
    }

    // Check if line contains bulleted course listing (e.g., "• Civil Engineering", "1. Robotics")
    if (!isHeader && /^[•\-\*\d+\.]\s+([A-Za-z\s&,/-]{6,60})$/.test(line)) {
      const candidate = line.replace(/^[•\-\*\d+\.]\s+/, '').trim();
      if (!candidate.toLowerCase().includes('requirement') && !candidate.toLowerCase().includes('deadline')) {
        finalizeCourse();
        currentCourse = {
          courseName: candidate,
        };
        isHeader = true;
      }
    }

    if (!isHeader && currentCourse) {
      // Look for deadline clues
      const dlMatch = line.match(deadlineRegex);
      if (dlMatch && !currentCourse.deadline) {
        currentCourse.deadline = dlMatch[1];
      } else {
        collectedNotes.push(line);
      }
    }
  }

  finalizeCourse();

  return detectedCourses;
}
