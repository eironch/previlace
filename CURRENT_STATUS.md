# Previlace - Current System Status
## AI-Enhanced Civil Service Review System

**Last Updated:** 2025-11-25T17:51:34+08:00  
**Project:** Weekend Review Center (Sat/Sun classes) for Philippine Civil Service Exam  
**Architecture:** Monorepo (React + Vite / Node.js + Express + MongoDB)  
**Current Phase:** Active Development & Feature Enhancement

---

## 📊 SYSTEM HEALTH

```
✅ Server (Node.js + Express)  Running for 55h44m43s
✅ Client (React + Vite)        Running for 55h44m37s  
✅ Database (MongoDB)           Connected
✅ Authentication               JWT + Google OAuth working
✅ Real-time                    Socket.io operational
```

---

## ✅ FULLY IMPLEMENTED & OPERATIONAL

### 🎯 Core Quiz System
| Feature | Implementation | Algorithm/Flow | Status |
|---------|---------------|----------------|--------|
| **Quiz Session Management** | examController.js | Start → Answer → Complete → Results | ✅ Complete |
| **Question Selection** | questionSelectionService.js | Random, Spaced Repetition, Adaptive modes | ✅ Complete |
| **SM-2 Spaced Repetition** | sm2AlgorithmService.js | Quality rating (0-5) → Ease factor → Interval → Next review | ✅ Complete |
| **Adaptive Difficulty** | adaptiveQuizService.js | User performance → Difficulty distribution (60/30/10, 20/60/20, 10/30/60) | ✅ Complete |
| **Multiple Question Types** | ManualQuestion model | Multiple choice, True/False, Multi-select, Essay | ✅ Complete |
| **Immediate Feedback** | QuizSession model | Practice mode gets instant feedback, mock/timed delayed | ✅ Complete |
| **Session Resumption** | examController.js | Resume active/paused sessions | ✅ Complete |
| **Post-Test Tracking** | PostTestTracking model | Week-by-week completion tracking | ✅ Complete |

**SM-2 Algorithm Details:**
- Ease Factor: 1.3 to 3.0 (default: 2.5)
- Quality Ratings: 0 (blackout) to 5 (perfect)
- Mastery Levels: Beginner (0-3 days) → Intermediate (4-14 days) → Advanced (15-60 days) → Mastered (61+ days)
- Interleaving: Questions grouped by topic, then selected round-robin
- Review Distribution: 40%due + 30% weak + 20% new + 10% reinforcement

### 📚 Study Plan & Journey
| Feature | Implementation | Flow | Status |
|---------|---------------|------|--------|
| **10-Week Schedule** | StudyPlan model | Week 1 (Pre-Assessment) → Week 2-10 (Sat/Sun classes) | ✅ Complete |
| **Daily Activities** | DailyActivity model | Pre-test → Learn → Daily Practice → Post-test | ✅ Complete |
| **Journey Map** | JourneyMap component | Visual weekly progression with clickable nodes | ✅ Complete |
| **Weekend Classes** | WeekendClass model | 32 classes seeded (Weeks 1-10, Sat/Sun, multiple subjects/day) | ✅ Complete |
| **Topic Unlocking** | StudyPlan service | Sequential unlocking based on week progression | ✅ Complete |

**Schedule Flow:**
```
Week 1: Pre-Assessment (all subjects)
Weeks 2-10: 
  Saturday: New topics introduced
  Sunday: Deep dive + practice
  Weekdays: Daily practice with SM-2 algorithm
Post-Test: Includes ALL topics learned so far (cumulative)
```

### 📈 Analytics & Progress Tracking
| Feature | Implementation | Metrics | Status |
|---------|---------------|---------|--------|
| **Performance Dashboard** | analytics Controller | Subject mastery, weak areas, accuracy over time | ✅ Complete |
| **Study Streak** | Streak model | Daily tracking, XP rewards, freeze days | ✅ Complete |
| **User Progress** | UserProgress model | Topic-level mastery, confidence scores | ✅ Complete |
| **Question History** | UserQuestionHistory model | Per-question stats, SM-2 data, next review date | ✅ Complete |
| **Leaderboard** | LeaderboardEntry model | XP-based rankings, weekly/all-time | ✅ Complete |
| **Achievements** | Achievement + UserAchievement |  Badge system with unlock conditions | ✅ Complete |

### 👤 User Management & Auth
| Feature | Implementation | Details | Status |
|---------|---------------|---------|--------|
| **Authentication** | authController.js | JWT + Google OAuth 2.0 | ✅ Complete |
| **User Roles** | User model | Student, Instructor, Admin (3 roles) | ✅ Complete |
| **Onboarding** | OnboardingPage.jsx | Subject selection, year selection, preferences | ✅ Complete |
| **Profile Management** | userController.js | Update profile, change password, preferences | ✅ Complete |

### 🎓 Instructor Features
| Feature | Implementation | Capability | Status |
|---------|---------------|------------|--------|
| **Availability System** | InstructorAvailability controller/model | Set available hours, manage schedule | ✅ Complete |
| **Inquiry Tickets** | InquiryTicket controller | View, respond, internal notes, analytics | ⚠️ **Partial** |
| **Ticket Management** | inquiryTicketController.js | 10 methods implemented (see below) | ✅ Backend Complete |

**Inquiry Ticket System Status:**
- ✅ Backend: 100% complete (createTicket, getStudentTickets, getInstructorTickets, getTicketById, addResponse, addInternalNote, updateTicketStatus, getTicketAnalytics, expireOldTickets, bulkUpdateTickets)
- ✅ Model: Complete with priority, responses, internalNotes, status, expiresAt, resolvedAt, resolution Time
- ❌ Frontend: Missing UI components (see Goals below)

### 🎯 Admin Features
| Feature | Implementation | Capability | Status |
|---------|---------------|------------|--------|
| **Question Bank** | manualQuestionController.js | Full CRUD, filtering, status management | ✅ Complete |
| **User Management** | userManagementController.js | View, edit, delete users, role assignment | ✅ Complete |
| **Subject/Topic Management** | subjectController + topicController | Full CRUD operations | ✅ Complete |
| **Analytics Dashboard** | analyticsController.js | System-wide metrics, user performance | ✅ Complete |
| **Weekend Class Seeding** | weekendClassController.js | Manage class schedule | ✅ Complete |
| **Question Templates** | questionTemplateController.js | Reusable question patterns | ✅ Complete |
| **Seeding Tools** | seed_comprehensive.js | Full system data generation | ✅ Complete |

### 📁 Career Features (Partial Implementation)

#### ✅ Jobs Board
- **Backend:** ✅ Complete (jobController.js - 5 methods: create, getJobs, getJob, update, delete)
- **Model:** ✅ Job model with all fields
- **Frontend:** ✅ JobBoardPage.jsx with search, filters, job cards
- **Service:** ✅ jobService.js (client-side API calls)
- **Status:** **FULLY FUNCTIONAL** - can browse, search, filter jobs

#### ✅ Resume Builder  
- **Backend:** ⚠️ Basic (resumeController.js - 3 methods: getMyResume, updateResume, generatePDF - PDF not implemented)
- **Model:** ✅ Resume model exists
- **Frontend:** ✅ **FULLY BUILT** ResumePage.jsx - 654 lines, Harvard-style template, step-by-step form, live preview, localStorage support
- **Components:** ✅ PersonalDetailsForm, SummaryForm, EducationForm, ExperienceForm, SkillsForm, HarvardCV template
- **Features:** Multi-step wizard, progress bar, live preview, mobile responsive, print/save function
- **Status:** **FRONTEND COMPLETE**, PDF generation needs Puppeteer integration

#### ✅ Interview Prep
- **Backend:** ⚠️ Basic (interviewController.js - 3 methods: getQuestions, start, submitAnswer)
- **Model:** ✅ Interview + InterviewPrep models
- **Frontend:** ✅ Interview PrepPage.jsx with behavioral/technical/mixed modes, practice history
- **Service:** ✅ interviewService.js
- **Status:** **FUNCTIONAL**, needs question bank expansion

### 📧 Communication & Notifications

#### ✅ Email Service
- **Implementation:** emailService.js with Nodemailer + Gmail SMTP
- **Templates:** ticketResponse, studyReminder
- **Status:** ✅ Setup complete, gracefully degrades if credentials missing
- **Missing:** Scheduled jobs for automated emails (see Goals)

#### ✅ Notification System
- **Backend:** ✅ notificationController.js (4 methods: getUserNotifications, markAsRead, markAllAsRead, deleteNotification)
- **Model:** ✅ Notification model complete
- **Service:** ✅ notificationService.js basic setup
- **Frontend:** ❌ No UI components (see Goals)
- **Status:** **Backend ready, needs frontend**

#### ✅ File Upload
- **Backend:** ⚠️ Minimal (fileController.js exists, basic structure)
- **Model:** ✅ File model exists
- **Frontend:** ❌ No components
- **Status:** **Needs full implementation** (see Goals)

### 🧩 Additional Features
| Feature | Status | Notes |
|---------|--------|-------|
| **Bookmarks** | ✅ Complete | Save questions, organize in folders |
| **Challenges** | ✅ Complete | Timed challenges, XP rewards |
| **Learning Content** | ✅ Complete | Additional study materials |
| **Testimonials** | ✅ Complete | User testimonials (public + admin) |
| **Study Groups** | ✅ Complete | Collaborative study sessions, messages |
| **Mistake Tracking** | ✅ Complete | Analyze common errors |
| **Math Rendering** | ✅ Complete | mathService.js for LaTeX/MathML |
| **PDF Generation Service** | ⚠️ Partial | pdfGenerationService.js exists, needs Puppeteer |
| **Socket.io** | ✅ Complete | Real-time updates, collaborative features |

---

## 📂 CODEBASE STRUCTURE

### Backend (`server/src/`)
```
├── config/              (1)   Database, environment
├── constants/           (2)   App constants
├── controllers/        (36)   ✅ ALL FUNCTIONAL
│   ├── examController.js        ✅ 1,162 lines - quiz logic
│   ├── inquiryTicketController.js ✅ 321 lines - full ticketing
│   ├── jobController.js         ✅ 126 lines - jobs CRUD
│   ├── resumeController.js      ⚠️ 57 lines - basic, no PDF
│   ├── notificationController.js ✅ 90 lines - complete
│   └── ... 31 more controllers
├── models/             (41)   ✅ ALL SCHEMAS DEFINED
├── routes/             (35)   ✅ ALL ROUTES MAPPED
├── services/           (23)   ✅ BUSINESS LOGIC
│   ├── questionSelectionService.js ✅ 237 lines - 3 selection modes
│   ├── sm2AlgorithmService.js     ✅ 246 lines - full SM-2
│   ├── emailService.js            ✅ 51 lines - Nodemailer
│   ├── adaptiveQuizService.js     ✅ 12.5KB - adaptive logic
│   ├── pdfGenerationService.js    ⚠️ 4.2KB - needs Puppeteer
│   ├── resumeBuilderService.js    ✅ 26KB - template logic
│   ├── interviewPrepService.js    ✅ 22KB - question bank
│   ├── jobCrawlingService.js      ✅ 16KB - job scraping
│   └── ... 15 more services
├── scripts/            (18)   Seeding & utilities
│   ├── seed_comprehensive.js    ✅ 30KB - full system seed
│   ├── comprehensiveQuestionGenerator.js ✅ 43KB - AI questions
│   └── ... 16 more scripts
├── middleware/          (7)   Auth, validation, errors
├── jobs/                (2)   Scheduled tasks
└── utils/               (3)   Helpers
```

### Frontend (`client/src/`)
```
├── components/        (102)   React components
├── pages/              (43)   ✅ ALL PAGES FUNCTIONAL
│   ├── career/
│   │   ├── JobBoardPage.jsx        ✅ 146 lines - fully functional
│   │   ├── ResumePage.jsx          ✅ 654 lines - complete builder
│   │   └── InterviewPrepPage.jsx   ✅ 170 lines - functional
│   ├── quiz/ (4 pages)             ✅ Complete
│   ├── dashboard/ (1 page)         ✅ Complete
│   ├── admin/ (5 pages)            ✅ Complete
│   └── ... 30+ more pages
├── services/           (31)   ✅ API CLIENT LAYER
│   ├── jobService.js               ✅ Complete
│   ├── resumeService.js            ✅ Complete
│   ├── interviewService.js         ✅ Complete
│   ├── examService.js              ✅ Complete
│   └── ... 27 more services
├── store/              (32)   Zustand state management
└── hooks/               (1)   Custom React hooks
```

**Total:** 41 models, 36 controllers, 35 routes, 23 services, 102 components, 43 pages, 31 services (client), 32 stores

---

## 🎯 GOALS (What's NOT Yet Complete)

### 🔴 Priority 1: Inquiry Ticketing Frontend

**What's Missing:**
- ❌ AskQuestionButton component (floating button on subject/topic pages)
- ❌ TicketForm component (modal with file upload)
- ❌ TicketCard component (ticket preview in lists)
- ❌ TicketDetail component (full conversation view)
- ❌ MyTicketsPage (student ticket list)
- ❌ TicketInboxPage (instructor dashboard)
- ❌ Integration with Navigation component
- ❌ Real-time ticket notifications

**Backend Ready:** ✅ 100% (10 controller methods, full model)

**Estimated Effort:** 1-2 weeks

---

### 🔴 Priority 2: File Upload System

**What's Missing:**
- ❌ Multer middleware configuration
- ❌ File controller implementation (upload, download, delete)
- ❌ File routes with authentication
- ❌ FileUploadButton component (drag & drop)
- ❌ FileList component
- ❌ FileCard component
- ❌ Integration with topics, tickets, admin panel
- ❌ File validation & security

**Current State:** Model exists, minimal controller structure

**Estimated Effort:** 1 week

---

### 🟡 Priority 3: Notification Center Frontend

**What's Missing:**
- ❌ NotificationBell component (header icon with badge)
- ❌ NotificationDropdown component
- ❌ NotificationItem component
- ❌ NotificationsPage (full history)
- ❌ notificationStore (Zustand)
- ❌ Integration with Navigation
- ❌ Real-time updates (polling or WebSocket)

**Backend Ready:** ✅ 100% (4 controller methods, notificationService)

**Estimated Effort:** 1 week

---

### 🟡 Priority 4: Scheduled Jobs (Cron)

**What's Missing:**
- ❌ Daily streak reminders (6 PM)
- ❌ Weekly class reminders (Sunday 8 PM)
- ❌ Ticker expiration job (hourly)
- ❌ Automatic post-test reminders
- ❌ Achievement unlock notifications
- ❌ node-cron setup in server.js

**Required:** node-cron package, scheduled job configuration

**Estimated Effort:** 3-5 days

---

### 🟢 Priority 5: PDF Generation (Resume)

**What's Missing:**
- ❌ Puppeteer integration
- ❌ PDF generation route implementation
- ❌ HTML to PDF conversion
- ❌ Download PDF button functionality

**Current State:** Frontend complete with print button (uses browser print), backend placeholder

**Estimated Effort:** 2-3 days

---

### 🟢 Priority 6: Journey Enhancements

**What's Missing:**
- ❌ Weekly unlock animations
- ❌ Lock/unlock visual indicators
- ❌ "This Week's Focus" dashboard card
- ❌ Progress bars per week
- ❌ Email reminders for journey milestones

**Current State:** Journey map functional, needs polish

**Estimated Effort:** 1 week

---

### 🟢 Priority 7: Analytics Enhancements

**What's Missing:**
- ❌ Study time tracking (daily/weekly/monthly)
- ❌ Time per subject graphs
- ❌ Comparative analytics (vs cohort average)
- ❌ Predictive exam readiness percentage
- ❌ Weak areas deep dive with recommendations
- ❌ Success probability calculator

**Current State:** Basic analytics working

**Estimated Effort:** 1-2 weeks

---

### 🟢 Priority 8: Admin Tools

**What's Missing:**
- ❌ Bulk question import (CSV upload)
- ❌ System monitoring dashboard
- ❌ Real-time metrics
- ❌ Instructor performance tracking

**Current State:** Admin has full CRUD, but no bulk actions

**Estimated Effort:** 1 week

---

## 🧪 TEST ACCOUNTS (Seeded)

| Email | Role | Password | Characteristics |
|-------|------|----------|----------------|
| admin@previlace.com | Admin | password123 | Full system access |
| instructor@previlace.com | Instructor | password123 | Can view tickets, manage availability |
| student@previlace.com | Student | password123 | Week 1, medium performance, fresh start |
| student1@previlace.com | Student | password123 | Week 3, **low performer**, struggles with quizzes |
| student2@previlace.com | Student | password123 | Week 6, **medium performer**, average progress |
| student3@previlace.com | Student | password123 | Week 11, **high performer**, excelling |

**All seeded with:**
- StudyPlan (10 weeks, Sat/Sun classes)
- DailyActivities (past progress)
- QuizSessions (realistic history)
- UserQuestionHistory (SM-2 data)
- Streaks, Achievements, Leaderboard entries

---

## 🔬 ALGORITHMS & TECHNICAL DETAILS

### SM-2 Spaced Repetition Algorithm

**Implementation:** `sm2AlgorithmService.js` (246 lines)

```javascript
// Quality Rating Calculation
function calculateQualityRating(isCorrect, responseTime, avgTime, consecutiveCorrect) {
  if (!isCorrect) return 0-2; // INCORRECT_* ratings
  
  const timeRatio = responseTime / avgTime;
  if (timeRatio <= 0.5 && consecutiveCorrect >= 3) return 5; // PERFECT
  if (timeRatio <= 0.8) return 4; // HESITATION
  return 3; // DIFFICULT
}

// Ease Factor Calculation
newEaseFactor = currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
// Clamped between 1.3 and 3.0

// Interval Calculation
if (quality < 3) {
  interval = 1;  // Reset
  repetitions = 0;
} else if (repetitions == 1) interval = 1;
  else if (repetitions == 2) interval = 6;
  else interval = Math.round(previousInterval * easeFactor);
```

**Mastery Determination:**
- Beginner: 0-3 days interval, accuracy < 60%
- Intermediate: 4-14 days, accuracy 60-75%
- Advanced: 15-60 days, accuracy 75-90%
- Mastered: 61+ days, accuracy 90%+

### Question Selection Modes

**1. Random Mode** (default for practice)
```javascript
// 30% review (due SM-2 questions) + 70% new questions
// Excludes recently answered (last 50)
// Shuffled for variety
```

**2. Spaced Repetition Mode**
```javascript
// Prioritizes questions due for review (nextReviewDate <= today)
// Sorted by priority score:
//   - Overdue questions (high priority)
//   - Low ease factor (struggling)
//   - High error rate
//   - Long intervals (retention check)
```

**3. Adaptive Mode**
```javascript
// Adjusts difficulty based on recent performance (last 20 questions)
// High performer (80%+): 10% beginner, 30% intermediate, 60% advanced
// Medium (60-80%): 20% beginner, 60% intermediate, 20% advanced
// Low (<60%): 60% beginner, 30% intermediate, 10% advanced
```

### Study Plan Flow

```
Week 1: Pre-Assessment Quiz (all 8 subjects, establish baseline)
↓
Week 2-10: Structured Learning
  Saturday:
    - Pre-test (new topics for today)
    - Class session (in-person/recorded)
    - Daily practice (SM-2 from previous weeks)
  Sunday:
    - Pre-test (today's new topics)
    - Deep-dive session
    - Daily practice (SM-2)
    - Post-test (ALL topics learned so far - cumulative)
  
  Monday-Friday:
    - Daily practice only (SM-2 algorithm)
    - Keeps streak alive
    - Reinforces learning
```

### Post-Test Logic

**Implementation:** `examController.js` + `PostTestTracking` model

```javascript
// Post-test questions include:
// 1. ALL topics from current week
// 2. ALL topics from previous weeks (cumulative)
// 3. Distributed across all subjects covered
// 4. Adaptive difficulty based on user performance

// Example: Week 6 Sunday Post-Test
// Includes topics from: Week 2, 3, 4, 5, 6 (cumulative)
// ~50 questions total, covering all subjects
```

---

## 🏗️ ARCHITECTURE DECISIONS

### Authentication
- **JWT**: Access tokens (24h expiry), stored in localStorage
- **Google OAuth 2.0**: Social login via Passport.js
- **Session Management**: Handled client-side, no server sessions

### State Management
- **Zustand**: Lightweight, fast, no boilerplate
- **32 stores**: Quiz, Auth, Analytics, Leaderboard, Journey, etc.
- **Persistence**: localStorage for auth, session data

### Real-time Features
- **Socket.io**: Study groups, live leaderboard, collaborative sessions
- **Polling** (planned): Notifications (5-10s interval)

### Styling
- **Tailwind CSS**: Utility-first, rapid development
- **Design System**: Black/white/gray foundation, minimal color accents
- **Responsive**: Mobile-first, works on all devices

### Database
- **MongoDB**: Flexible schema, fast queries
- **Mongoose**: ODM with schemas, validation, middleware
- **Indexes**: Optimized for common queries (userId, questionId, date ranges)

---

## 📊 DEVELOPMENT METRICS

### Recent Commits (Last 15)
```
8f391af Merge branch 'Desabille'
730e1c2 feat: add design docs and major dashboard enhancements
230eae0 feat: streamline navigation and landing page
22d160b feat: update resume page and navigation branding
53bf3de feat: initial implementation of full-stack learning platform
e1a21ed refactor: change routing, admin UI, quiz analytics
280af15 Merge pull request #19
...
```

### Code Statistics
- **Backend:** 36 controllers, 41 models, 35 routes, 23 services
- **Frontend:** 102 components, 43 pages, 31 API services, 32 Zustand stores
- **Total Lines:** ~300,000+ (estimated)
- **Dependencies:** 80+ npm packages (client + server combined)

---

## 🐛 KNOWN ISSUES

### Non-Critical (Warnings)
- ⚠️ Mongoose duplicate schema index warnings (cosmetic, doesn't affect functionality)
- ⚠️ Reserved schema pathname `errors` in ManualQuestion model (intentional use)

### Resolved  
- ✅ Sunday No Subject issue (fixed in seed_comprehensive.js)
- ✅ Journey Map not navigation working (fixed)
- ✅ Session resumption (implemented)
- ✅ Study plan generation errors (fixed)

### Active (None blocking)
- All systems operational

---

## 📋 IMPLEMENTATION ROADMAP

### ✅ Phase 1: Core Learning System (COMPLETE)
- ✅ Quiz system with SM-2 algorithm
- ✅ Study plan with 10-week schedule
- ✅ Journey map with weekly progression
- ✅ Analytics and progress tracking
- ✅ Leaderboard and achievements

### ⚠️ Phase 2: Career Features (MOSTLY COMPLETE)
- ✅ Jobs board (fully functional)
- ✅ Resume builder (frontend complete, PDF pending)
- ✅ Interview prep (functional, needs expansion)

### 🔄 Phase 3: Communication (IN PROGRESS)
- ✅ Inquiry tickets (backend complete)
- ❌ Ticketing frontend (1-2 weeks)
- ✅ Email service (ready)
- ❌ Scheduled emails (3-5 days)
- ✅ Notifications (backend ready)
- ❌ Notification center UI (1 week)

### 📅 Phase 4: Enhancements (PLANNED)
- ❌ File upload system (1 week)
- ❌ Journey animations (1 week)
- ❌ Advanced analytics (1-2 weeks)
- ❌ Admin bulk tools (1 week)
- ❌ PDF generation (2-3 days)

---

## 🎯 NEXT STEPS (Recommended Priority)

1. **Inquiry Ticketing Frontend** (1-2 weeks) - Complete the support system
2. **Scheduled Jobs** (3-5 days) - Automate reminders and maintenance
3. **Notification Center UI** (1 week) - Engage users with timely updates
4. **File Upload** (1 week) - Enable study materials distribution
5. **PDF Generation** (2-3 days) - Complete resume builder
6. **Journey Animations** (1 week) - Polish the learning experience
7. **Analytics Enhancements** (1-2 weeks) - Deeper insights
8. **Admin Bulk Tools** (1 week) - Efficiency improvements

**Total Estimated Time to Full Feature Completion:** 6-8 weeks

---

## 🔧 TECHNICAL STACK

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** Passport.js, JWT, bcryptjs
- **Real-time:** Socket.io
- **Email:** Nodemailer (Gmail SMTP)
- **Utils:** Lodash, date-fns, validator

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State:** Zustand
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP:** Axios
- **Real-time:** socket.io-client

### Development
- **Package Manager:** pnpm (recommended), npm (server)
- **Code Quality:** Prettier, ESLint
- **Version Control:** Git + GitHub

---

## 📝 ENVIRONMENT VARIABLES

### Required
```env
# Database
MONGODB_URI=mongodb://localhost:27017/previlace

# Auth
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
SESSION_SECRET=your-session-secret

# Server
NODE_ENV=development
PORT=5000
```

### Optional (for full features)
```env
# Email (for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# SendGrid (alternative to Gmail)
SENDGRID_API_KEY=your-sendgrid-key

# Cloud Storage (future)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# File Upload
MAX_FILE_SIZE=25MB
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,png
```

---

## 📖 KEY FILES TO UNDERSTAND

### Backend Entry Points
- `server/server.js` - Server initialization, routes, middleware
- `server/src/config/database.js` - MongoDB connection
- `server/src/middleware/auth.js` - Authentication middleware

### Core Business Logic
- `server/src/services/questionSelectionService.js` - 3 selection modes
- `server/src/services/sm2AlgorithmService.js` - Spaced repetition
- `server/src/services/adaptiveQuizService.js` - Adaptive difficulty
- `server/src/services/studyPlanService.js` - Weekly schedule generation

### Critical Controllers
- `server/src/controllers/examController.js` - Quiz session management (1,162 lines)
- `server/src/controllers/inquiryTicketController.js` - Ticketing system (321 lines)
- `server/src/controllers/analyticsController.js` - Performance tracking

### Data Models
- `server/src/models/QuizSession.js` - Quiz state and scoring
- `server/src/models/UserQuestionHistory.js` - SM-2 tracking
- `server/src/models/StudyPlan.js` - 10-week schedule
- `server/src/models/InquiryTicket.js` - Support tickets

### Frontend Core
- `client/src/App.jsx` - Routing, protected routes
- `client/src/pages/quiz/QuizSessionPage.jsx` - Main quiz interface
- `client/src/pages/dashboard/DashboardPage.jsx` - Student homepage
- `client/src/pages/career/ResumePage.jsx` - Resume builder (654 lines)

---

## 🎓 LEARNING RESOURCES

### For Developers
- **SM-2 Algorithm:** [SuperMemo Documentation](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- **React + Vite:** [Vite Guide](https://vitejs.dev/)
- **Zustand:** [Zustand Docs](https://zustand-demo.pmnd.rs/)
- **Tailwind CSS:** [Tailwind Docs](https://tailwindcss.com/)
- **Express.js:** [Express Guide](https://expressjs.com/)
- **Mongoose:** [Mongoose Docs](https://mongoosejs.com/)

### For Understanding the System
1. Start with `GEMINI.md` - Project overview and conventions
2. Review `seed_comprehensive.js` - See how data is structured
3. Examine `examController.js` - Understand quiz flow
4. Study `questionSelectionService.js` - See selection logic
5. Read `sm2AlgorithmService.js` - Learn spaced repetition

---

## 🚀 QUICK START

```bash
# Install all dependencies
pnpm install:all

# Start MongoDB (make sure it's running)
mongod

# Seed the database (run from server directory)
cd server
npm run seed  # or node src/scripts/seed_comprehensive.js

# Start both dev servers (from root)
# Terminal 1: Server
pnpm dev:server

# Terminal 2: Client
pnpm dev:client

# Access:
# Client: http://localhost:5173
# Server: http://localhost:5000
# API: http://localhost:5000/api
```

---

**END OF STATUS REPORT**

*This document reflects the actual current state of the system as of 2025-11-25. Updated based on real codebase inspection.*

---

Files Changed:
- `CURRENT_STATUS.md` — Comprehensive, realistic reflection of actual system state with implemented features, missing goals, algorithms, and technical details
