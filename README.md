# 🎓 GradTrack - Masters & University Admissions Tracker

A responsive web application designed for graduate school applicants to manage university shortlists, deadlines, document checklists, and admission decisions.

---

## 🌟 Key Features

1. **Kanban Pipeline Board**:
   - Visual stages: *Shortlisted* → *In Progress* → *Ready to Submit* → *Submitted* → *Interview / Review* → *Admitted 🎉* → *Waitlisted* → *Rejected*.
   - **Drag-and-Drop**: Easily move university cards across stages as your application progresses.

2. **Table / List View**:
   - Sortable & filterable tabular view with direct status changers, portal links, and quick edit/delete actions.

3. **Applicant Profile & Test Scores**:
   - Keep your GRE (Quant, Verbal, AWA), TOEFL/IELTS, GPA, target major, and target term visible at the top for quick reference when filling out applications.

4. **Document & Requirement Checklist**:
   - Per-university checklists for SOPs, Letters of Recommendation (LORs), transcripts, GRE/TOEFL score reporting codes, and custom items.
   - Interactive progress bars indicating application completeness.

5. **Deadline Countdown & Urgency Indicators**:
   - Color-coded badges and flame indicators for deadlines approaching within 14 days.

6. **Financial & Application Fee Tracking**:
   - Multi-currency tracking (USD, EUR, GBP, CAD, INR, AUD).
   - Track paid vs. unpaid fees and scholarship/assistantship application status.

7. **Data Persistence & Portability**:
   - Automatic local storage in your browser.
   - One-click **Export / Backup to JSON** and **Import from JSON** so your data is safe and portable.

---

## 🚀 How to Run

### Option 1: Quick Launch (Windows)
Double-click the created batch file in the root folder:
- **`start-tracker.bat`** (Automatically launches the dev server and opens your browser to `http://localhost:5173`)

### Option 2: Command Line
```bash
cd tracker-app
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in any browser.

---

## 🛠️ Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: LocalStorage with JSON backup
