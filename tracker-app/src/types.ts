export type ApplicationStatus = 
  | 'Shortlisted'
  | 'In Progress'
  | 'Ready to Submit'
  | 'Submitted'
  | 'Interview'
  | 'Admitted'
  | 'Waitlisted'
  | 'Rejected';

export type Term = 'Fall 2025' | 'Spring 2026' | 'Fall 2026' | 'Spring 2027' | 'Other';

export type PriorityTier = 'Dream' | 'Target' | 'Safe';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface UniversityApplication {
  id: string;
  universityName: string;
  country: string;
  city?: string;
  programName: string; // e.g. MS in Computer Science
  degree: 'MS' | 'PhD' | 'MEng' | 'MBA' | 'Other';
  term: Term;
  tier: PriorityTier;
  status: ApplicationStatus;
  deadline: string; // YYYY-MM-DD
  decisionDate?: string;
  portalUrl?: string;
  portalUsername?: string;
  applicationFee?: number;
  currency: string; // USD, EUR, GBP, CAD, INR, etc.
  feePaid: boolean;
  greRequirement?: 'Required' | 'Optional' | 'Waived' | 'Not Required';
  toeflRequirement?: 'Required' | 'Waived' | 'Duolingo Accepted' | 'IELTS Accepted';
  minGpa?: string;
  checklist: ChecklistItem[];
  notes?: string;
  facultyContacts?: string;
  isInterestOnly?: boolean; // College of interest / preliminary shortlist (before active application)
  interestReason?: string; // Why interested: labs, professors, location, budget, ranking
  ranking?: string; // e.g. US News #6, QS #15
  averageGpa?: string;
  scholarshipApplied?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileScores {
  gpa: string;
  greOverall?: string;
  greQuant?: string;
  greVerbal?: string;
  greAwa?: string;
  ieltsOverall?: string;
  toeflOverall?: string;
  intendedMajor: string;
  targetTerm: string;
}
