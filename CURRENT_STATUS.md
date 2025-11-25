# Civilearn Review Center System - Missing Features

**Context:** Weekend review center (Sat/Sun classes) preparing students for CSE  
**Goal:** Help students review, understand, and pass the CSE exam  
**Style:** Duolingo/SoloLearn learning journey with adaptive assessments

---

## CURRENT STATE

### ✅ IMPLEMENTED
- Quiz system with immediate feedback
- Analytics dashboard with performance tracking
- Journey map with study plan integration
- Study streak tracking with gamification
- Leaderboard and achievements
- Admin question bank management
- Instructor availability system
- Inquiry ticket system (partial - needs enhancement)
- User management

### ⚠️ PLACEHOLDER ("Coming Soon" UI)
- Jobs page (models exist, no backend/frontend)
- Resume builder (models exist, no backend/frontend)
- Interview prep (models exist, partial backend)

### ❌ MISSING CRITICAL FEATURES
- Enhanced inquiry/support ticket system (customer service style)
- File upload system (admin + instructors)
- Notification center (in-app + email)
- Career development backend infrastructure
- Journey enhancements (weekly unlocking, email reminders)

---

## 1. INQUIRY/SUPPORT SYSTEM (CRITICAL)

### Current State
- Basic InquiryTicket model exists
- Instructor can view tickets
- Limited functionality

### What's Needed: Customer Service Ticketing System

**Inspiration:** Zendesk, Hiver, Intercom ticketing workflows

**Student Side:**
- Ask Question button on current subject/topic page
- Simple ticket creation form (subject, question, optional screenshot)
- Ticket automatically assigned to subject instructor
- View ticket status (Open, In Progress, Resolved)
- Receive response notification
- Ticket expires/closes after next class

**Instructor Side:**
- Ticket inbox dashboard (like customer service queue)
- Filter by: Open/Resolved, Subject, Priority, Date
- Ticket details view with student context
- Add response with rich text editor
- Mark as resolved
- Internal notes (visible only to instructors/admin)
- Bulk actions (assign, resolve)

**Admin Side:**
- View all tickets across all instructors
- Analytics: average response time, resolution rate
- Reassign tickets to different instructors

**Files to Create/Update:**

**Backend:**
```
server/src/models/InquiryTicket.js (enhance existing)
- Add fields: priority, internalNotes, resolvedAt, resolutionTime
- Add status: open, in_progress, resolved, expired

server/src/controllers/inquiryTicketController.js (enhance)
- getInstructorTickets() - filter by instructor + subject
- updateTicketStatus()
- addResponse()
- addInternalNote()
- getTicketAnalytics()
- bulkUpdateTickets()
- autoExpireTickets() - scheduled job

server/src/routes/inquiryTicketRoutes.js (enhance)
- GET /api/tickets/instructor/:instructorId
- PATCH /api/tickets/:id/status
- POST /api/tickets/:id/response
- POST /api/tickets/:id/internal-note
- GET /api/tickets/analytics
```

**Frontend:**
```
client/src/components/inquiry/AskQuestionButton.jsx
- Floating button on subject/topic pages
- Opens modal with form

client/src/components/inquiry/TicketForm.jsx
- Subject dropdown (auto-selected from current page)
- Question textarea
- Optional file upload (screenshot)

client/src/pages/student/MyTicketsPage.jsx
- List of student's tickets
- Filter by status
- View responses

client/src/pages/instructor/TicketInboxPage.jsx
- Ticket queue with filters
- Ticket detail panel
- Response editor
- Status updates

client/src/components/inquiry/TicketCard.jsx
- Ticket preview in list
- Shows: subject, preview, status, time ago

client/src/components/inquiry/TicketDetail.jsx
- Full ticket view
- Question + responses
- Internal notes (instructors only)
- Actions (resolve, add note)

client/src/store/inquiryStore.js (enhance)
- Student: createTicket, getMyTickets, viewTicket
- Instructor: getMyTickets, respondToTicket, resolveTicket
```

**Implementation Priority:**
1. Enhance InquiryTicket model with new fields
2. Create enhanced ticket controller with all CRUD operations
3. Build student AskQuestionButton component
4. Build TicketInboxPage for instructors
5. Add ticket status badge component
6. Implement auto-expiration logic (scheduled job)
7. Add ticket analytics for admin

**Key Features:**
- Ticket priority: Low/Medium/High (auto-set based on deadline)
- Auto-assign to subject instructor
- Auto-expire after next class session
- Email notifications on ticket creation/response
- Internal notes for instructor collaboration
- Response time tracking
- Ticket categories by subject

---

## 2. FILE UPLOAD SYSTEM (HIGH PRIORITY)

### Use Cases
**Admin:**
- Upload study materials (PDF reviewers, handouts)
- Upload reference materials for topics
- Upload exam practice files

**Instructor:**
- Upload lecture slides/notes
- Upload additional resources for students
- Attach files in ticket responses

**Students:**
- View/download uploaded materials
- Attach screenshots to inquiry tickets

### Implementation Strategy

**Backend:**
```
server/src/middleware/fileUpload.js
- Configure multer for file uploads
- File validation (size, type)
- Storage: local filesystem or cloud (AWS S3/Cloudinary)

server/src/models/File.js (new)
- fields: filename, originalName, fileType, fileSize, uploadedBy, 
  relatedTo (subject/topic/ticket), url, downloadCount

server/src/controllers/fileController.js (new)
- uploadFile()
- getFiles() - filter by subject/topic
- downloadFile()
- deleteFile() (admin/instructor only)

server/src/routes/fileRoutes.js (new)
- POST /api/files/upload (admin + instructor only)
- GET /api/files/:id/download
- GET /api/files?subjectId=...&topicId=...
- DELETE /api/files/:id (admin + instructor only)
```

**Frontend:**
```
client/src/components/files/FileUploadButton.jsx
- Upload button with drag-drop zone
- File type validation
- Progress indicator

client/src/components/files/FileList.jsx
- Display uploaded files
- Download button
- Delete button (admin/instructor only)
- File icons by type (PDF, DOC, IMAGE)

client/src/pages/admin/FileManagementPage.jsx
- Bulk upload interface
- Organize files by subject/topic
- Delete files

Update existing pages:
- TopicDetailPage.jsx - show available files
- SubjectDetailPage.jsx - show subject materials
- TicketDetail.jsx - show attached files
```

**File Storage Options:**

**Option 1: Local Storage (Simple)**
```
server/uploads/
  ├── materials/
  ├── tickets/
  └── temp/
```
- Pros: Simple, no external dependencies
- Cons: Not scalable, backup issues

**Option 2: Cloud Storage (Recommended)**
- AWS S3, Cloudinary, or Firebase Storage
- Pros: Scalable, CDN, backup
- Cons: Requires API setup, costs

**Recommendation:** Start with local storage, migrate to cloud later

**Files to Create:**
```
server/src/middleware/fileUpload.js
server/src/models/File.js
server/src/controllers/fileController.js
server/src/routes/fileRoutes.js
server/src/utils/fileValidator.js
client/src/components/files/FileUploadButton.jsx
client/src/components/files/FileList.jsx
client/src/components/files/FileCard.jsx
client/src/services/fileService.js
```

**Implementation Steps:**
1. Set up multer middleware for file handling
2. Create File model with metadata
3. Create file controller (upload, download, delete)
4. Add file routes with authentication
5. Create FileUploadButton component
6. Create FileList component
7. Add file upload to TopicDetailPage
8. Add file upload to admin panel
9. Add file attachment to ticket responses

**Security Considerations:**
- Validate file types (whitelist: PDF, DOC, DOCX, JPG, PNG)
- Limit file size (5MB for images, 25MB for documents)
- Scan for malware (optional: use ClamAV)
- Authentication required for upload/delete
- Public access for downloads (or auth-protected)

---

## 3. NOTIFICATION SYSTEM (HIGH PRIORITY)

### Required Notifications

**Email Notifications:**
- Streak reminder (daily at 6 PM if not studied yet)
- Weekly reminder (Sunday night for upcoming week)
- Ticket response received
- New study materials uploaded
- Quiz results available
- Achievement unlocked

**In-App Notifications:**
- New ticket response
- New materials uploaded for your subjects
- Streak about to break (if not studied today)
- Upcoming class reminder (Saturday morning)

### Implementation

**Backend:**
```
server/src/models/Notification.js (new)
- fields: userId, type, title, message, read, link, createdAt

server/src/controllers/notificationController.js (new)
- getUserNotifications()
- markAsRead()
- markAllAsRead()
- deleteNotification()

server/src/services/emailService.js (new)
- sendEmail() using Nodemailer or SendGrid
- Email templates for different notification types

server/src/services/notificationService.js (new)
- createNotification()
- sendEmailNotification()
- scheduleReminders() - cron jobs

server/src/routes/notificationRoutes.js (new)
- GET /api/notifications
- PATCH /api/notifications/:id/read
- PATCH /api/notifications/read-all
- DELETE /api/notifications/:id

server/src/jobs/reminderJob.js (new)
- Daily streak reminders (cron)
- Weekly class reminders (cron)
- Ticket expiration reminders (cron)
```

**Frontend:**
```
client/src/components/notifications/NotificationBell.jsx
- Bell icon in Navigation
- Badge with unread count
- Dropdown with notification list

client/src/components/notifications/NotificationItem.jsx
- Single notification card
- Click to navigate
- Mark as read action

client/src/components/notifications/NotificationDropdown.jsx
- Scrollable list
- "Mark all as read" button
- "View all" link

client/src/pages/NotificationsPage.jsx
- Full notification history
- Filter by type/read status
- Delete notifications

client/src/store/notificationStore.js (new)
- getNotifications()
- markAsRead()
- realTimeNotifications() - polling or WebSocket

client/src/services/notificationService.js (new)
- API calls for notifications
```

**Email Service Setup:**
```javascript
// Using Nodemailer + Gmail SMTP
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // App password
  }
});

// Or use SendGrid for better deliverability
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

**Scheduled Jobs (using node-cron):**
```javascript
const cron = require('node-cron');

// Daily at 6 PM - Send streak reminders
cron.schedule('0 18 * * *', async () => {
  await sendStreakReminders();
});

// Sunday at 8 PM - Send weekly reminders
cron.schedule('0 20 * * 0', async () => {
  await sendWeeklyReminders();
});

// Every hour - Check expired tickets
cron.schedule('0 * * * *', async () => {
  await expireOldTickets();
});
```

**Implementation Priority:**
1. Create Notification model
2. Set up email service (Nodemailer or SendGrid)
3. Create notification controller and routes
4. Build NotificationBell component
5. Add to Navigation component
6. Create scheduled jobs for reminders
7. Trigger notifications on key events

---

## 4. CAREER DEVELOPMENT (CRITICAL - THESIS REQUIREMENT)

### Backend Infrastructure (Currently Missing)

**Jobs System:**
```
server/src/controllers/jobController.js (NEW)
- getAllJobs() - list with filters
- getJobById() - job details
- createJob() - admin only
- updateJob() - admin only
- deleteJob() - admin only
- matchJobsForUser() - AI matching algorithm

server/src/routes/jobRoutes.js (NEW)
- GET /api/jobs - list jobs
- GET /api/jobs/:id - job details
- POST /api/jobs - create (admin only)
- PATCH /api/jobs/:id - update (admin only)
- DELETE /api/jobs/:id - delete (admin only)
- GET /api/jobs/matches - matched jobs for logged-in user

server/src/services/jobService.js (NEW)
- filterJobs() - filter by exam level, location, salary
- searchJobs() - keyword search
- matchJobs() - match user profile to jobs
- crawlJobs() - future: scrape government job sites

server/src/services/jobCrawlerService.js (FUTURE)
- Scrape CSC website, PhilJobNet
- Parse job postings
- Store in database
```

**Resume System:**
```
server/src/controllers/resumeController.js (NEW)
- getUserResumes()
- getResumeById()
- createResume()
- updateResume()
- deleteResume()
- generatePDF() - generate PDF from resume data

server/src/routes/resumeRoutes.js (NEW)
- GET /api/resumes - user's resumes
- GET /api/resumes/:id
- POST /api/resumes - create
- PATCH /api/resumes/:id - update
- DELETE /api/resumes/:id - delete
- GET /api/resumes/:id/pdf - download PDF

server/src/services/resumeService.js (NEW)
- buildResume() - format resume data
- generatePDF() - using puppeteer or PDFKit
- validateResume() - check required fields

server/src/services/pdfService.js (NEW)
- generateResumePDF() using Puppeteer or PDFKit
- HTML templates for resume layouts
```

**Interview Prep:**
```
server/src/controllers/interviewController.js (ENHANCE)
- getQuestionBank() - government interview questions
- createPracticeSession()
- saveUserResponse()
- getSessionHistory()

server/src/routes/interviewRoutes.js (NEW)
- GET /api/interview/questions
- POST /api/interview/practice
- GET /api/interview/history
```

### Frontend Pages (Currently Placeholders)

**Jobs Page:**
```
client/src/pages/career/JobsPage.jsx (REPLACE PLACEHOLDER)
- Job listing with search/filters
- Filter by: exam level, location, agency, salary range
- Job cards with: title, agency, location, salary, deadline
- Click to view job details

client/src/pages/career/JobDetailPage.jsx (NEW)
- Full job description
- Requirements
- How to apply
- Application deadline
- "Apply" button (external link)
- "Save to favorites" option

client/src/components/jobs/JobCard.jsx (NEW)
- Job preview card
- Key info displayed
- Match percentage badge (if logged in)

client/src/components/jobs/JobFilters.jsx (NEW)
- Filter sidebar/dropdown
- Search box
- Exam level toggle
- Location select
- Salary range slider

client/src/services/jobService.js (NEW)
- getJobs(), getJobById(), getMatchedJobs()
```

**Resume Builder:**
```
client/src/pages/career/ResumeBuilderPage.jsx (REPLACE PLACEHOLDER)
- Step-by-step resume form
- Sections: Personal Info, Education, Work Experience, Skills, CSE Info
- Live preview on right side
- Save as draft
- Download as PDF

client/src/components/resume/ResumeForm.jsx (NEW)
- Form with sections
- Add/remove work experience
- Add/remove education
- Skills selector

client/src/components/resume/ResumePreview.jsx (NEW)
- Live preview of resume
- Government-standard format
- Professional layout

client/src/components/resume/ResumeTemplates.jsx (NEW)
- Template selector
- 3-4 government-standard templates

client/src/services/resumeService.js (NEW)
- createResume(), updateResume(), downloadPDF()
```

**Interview Prep:**
```
client/src/pages/career/InterviewPrepPage.jsx (REPLACE PLACEHOLDER)
- Question categories (behavioral, situational, technical)
- Practice mode: random question
- View sample answers
- Track questions practiced

client/src/components/interview/QuestionCard.jsx (NEW)
- Question display
- Answer input
- Tips section

client/src/components/interview/PracticeHistory.jsx (NEW)
- List of practiced questions
- Performance tracking
```

**Implementation Priority:**
1. Create job controller, routes, service
2. Build JobsPage with listing and filters
3. Build JobDetailPage
4. Seed job postings in database
5. Create resume controller, routes, service
6. Build ResumeBuilderPage with form
7. Implement PDF generation
8. Build InterviewPrepPage with question bank
9. Add job matching algorithm
10. (Future) Implement job crawler

---

## 5. JOURNEY ENHANCEMENTS (MEDIUM PRIORITY)

### Current State
- Journey map exists
- Study plan with schedule exists
- Weekly progression tracked

### Missing Duolingo-Style Features

**Weekly Unlocking:**
- Week 1 unlocks on Monday after first class
- Week 2 unlocks on Monday after second class
- Lock/unlock animation
- Clear progress indicators

**Email Reminders:**
- Monday morning: "Week X is now unlocked!"
- Wednesday: "Don't forget to practice this week"
- Saturday morning: "Class today at [time]"
- Sunday evening: "Prepare for tomorrow's class"

**Weekday Assessments:**
- Encourage daily practice Monday-Friday
- Quick 10-question quizzes
- Immediate feedback (already exists)
- XP/streak rewards

**Visual Improvements:**
- Journey path with nodes
- Completed checkmarks
- Current week highlight
- Next week preview (locked state)

**Files to Enhance:**
```
client/src/components/JourneyMap.jsx (ENHANCE)
- Add lock/unlock animations
- Add progress bars per week
- Add week status indicators

client/src/pages/dashboard/DashboardPage.jsx (ENHANCE)
- Add "This Week's Focus" card
- Add "Daily Practice" CTA
- Add streak prominence

server/src/services/notificationService.js (ENHANCE)
- Add journey-related email templates
- Schedule weekly unlock notifications

server/src/services/studyPlanService.js (ENHANCE)
- calculateWeeklyProgress()
- unlockNextWeek()
- checkIfWeekComplete()
```

---

## 6. ANALYTICS ENHANCEMENTS (MEDIUM PRIORITY)

### Missing Features on Analytics Page

**Study Time Tracking:**
- Daily/weekly/monthly study time
- Time per subject
- Avg session duration
- Compare with cohort average

**Weak Areas Deep Dive:**
- Top 3 weakest topics
- Recommended practice questions
- Progress since last week
- Improvement suggestions

**Predictive Analytics:**
- Estimated exam readiness percentage
- Days needed to reach target score
- Suggested study pace
- Success probability

**Comparative Analytics:**
- Your rank in class
- Average vs your performance
- Improvement rate comparison

**Files to Enhance:**
```
client/src/pages/AnalyticsPage.jsx (ENHANCE)
- Add study time chart
- Add weak areas section with recommendations
- Add predictive metrics card

server/src/controllers/analyticsController.js (ENHANCE)
- calculateStudyTime()
- identifyWeakAreas()
- predictExamReadiness()
- getComparativeAnalytics()

server/src/services/analyticsService.js (NEW)
- Advanced analytics calculations
- ML predictions (optional)
```

---

## 7. ADMIN ENHANCEMENTS (LOW-MEDIUM PRIORITY)

### Bulk Import Questions
- CSV upload for questions
- Validate format
- Preview before import
- Error handling

### System Monitoring
- Active users count
- Quiz completion rate
- Average quiz score
- Ticket response time
- Instructor performance

### Content Management
- Bulk edit questions
- Archive old questions
- Duplicate question detection

**Files Needed:**
```
client/src/pages/admin/BulkImportPage.jsx (NEW)
- CSV upload interface
- Validation results
- Import preview

server/src/services/importService.js (NEW)
- Parse CSV
- Validate data
- Bulk insert questions

client/src/pages/admin/SystemMonitoringPage.jsx (NEW)
- KPI dashboard
- Charts and metrics
```

---

## 8. INSTRUCTOR ENHANCEMENTS (LOW PRIORITY)

### Class Management
- View assigned students
- View class schedule
- Mark attendance (if needed)

### Performance Dashboard
- Student performance overview
- At-risk students alert
- Topic difficulty analysis

**Files to Enhance:**
```
client/src/pages/InstructorDashboardPage.jsx (ENHANCE)
- Add student list
- Add performance metrics
- Add ticket queue summary
```

---

## IMPLEMENTATION ROADMAP

### Phase 1: Critical Features (3-4 weeks)
**Week 1-2: Inquiry/Ticketing System**
1. Enhance InquiryTicket model
2. Build ticket controller with full CRUD
3. Create student AskQuestionButton
4. Build instructor TicketInboxPage
5. Add auto-expiration logic
6. Add email notifications

**Week 3: File Upload System**
1. Set up multer middleware
2. Create File model and controller
3. Build FileUploadButton component
4. Add file upload to admin panel
5. Add file downloads to topic pages

**Week 4: Notification System**
1. Create Notification model
2. Set up email service (Nodemailer)
3. Build NotificationBell component
4. Add to Navigation
5. Create scheduled reminder jobs

### Phase 2: Career Features (2-3 weeks)
**Week 5-6: Jobs + Resume**
1. Create job controller, routes, service
2. Build JobsPage with listing/filters
3. Seed job postings
4. Create resume controller, routes, service
5. Build ResumeBuilderPage
6. Implement PDF generation

**Week 7: Interview Prep**
1. Enhance interview controller
2. Build InterviewPrepPage
3. Seed interview questions
4. Add practice tracking

### Phase 3: Journey + Analytics (1-2 weeks)
**Week 8-9:**
1. Enhance JourneyMap with animations
2. Add weekly unlock logic
3. Add email reminders for journey
4. Enhance analytics with study time
5. Add predictive metrics

### Phase 4: Admin + Instructor (1 week)
**Week 10:**
1. Bulk import functionality
2. System monitoring dashboard
3. Instructor enhancements

---

## FILES TO CREATE (Summary)

### Backend (New Files)
```
server/src/models/Notification.js
server/src/models/File.js
server/src/controllers/jobController.js
server/src/controllers/resumeController.js
server/src/controllers/interviewController.js
server/src/controllers/notificationController.js
server/src/controllers/fileController.js
server/src/routes/jobRoutes.js
server/src/routes/resumeRoutes.js
server/src/routes/interviewRoutes.js
server/src/routes/notificationRoutes.js
server/src/routes/fileRoutes.js
server/src/services/jobService.js
server/src/services/resumeService.js
server/src/services/pdfService.js
server/src/services/emailService.js
server/src/services/notificationService.js
server/src/services/fileService.js
server/src/services/importService.js
server/src/middleware/fileUpload.js
server/src/jobs/reminderJob.js
server/src/utils/fileValidator.js
```

### Frontend (New Files)
```
client/src/components/inquiry/AskQuestionButton.jsx
client/src/components/inquiry/TicketForm.jsx
client/src/components/inquiry/TicketCard.jsx
client/src/components/inquiry/TicketDetail.jsx
client/src/components/files/FileUploadButton.jsx
client/src/components/files/FileList.jsx
client/src/components/files/FileCard.jsx
client/src/components/notifications/NotificationBell.jsx
client/src/components/notifications/NotificationItem.jsx
client/src/components/notifications/NotificationDropdown.jsx
client/src/components/jobs/JobCard.jsx
client/src/components/jobs/JobFilters.jsx
client/src/components/resume/ResumeForm.jsx
client/src/components/resume/ResumePreview.jsx
client/src/components/resume/ResumeTemplates.jsx
client/src/components/interview/QuestionCard.jsx
client/src/components/interview/PracticeHistory.jsx
client/src/pages/student/MyTicketsPage.jsx
client/src/pages/instructor/TicketInboxPage.jsx
client/src/pages/NotificationsPage.jsx
client/src/pages/career/JobsPage.jsx (replace)
client/src/pages/career/JobDetailPage.jsx
client/src/pages/career/ResumeBuilderPage.jsx (replace)
client/src/pages/career/InterviewPrepPage.jsx (replace)
client/src/pages/admin/BulkImportPage.jsx
client/src/pages/admin/SystemMonitoringPage.jsx
client/src/pages/admin/FileManagementPage.jsx
client/src/services/jobService.js
client/src/services/resumeService.js
client/src/services/fileService.js
client/src/services/notificationService.js
client/src/store/notificationStore.js
```

### Files to Enhance
```
server/src/models/InquiryTicket.js
server/src/controllers/inquiryTicketController.js
server/src/routes/inquiryTicketRoutes.js
server/src/controllers/analyticsController.js
server/src/services/analyticsService.js
client/src/components/JourneyMap.jsx
client/src/pages/dashboard/DashboardPage.jsx
client/src/pages/AnalyticsPage.jsx
client/src/pages/InstructorDashboardPage.jsx
client/src/pages/TopicDetailPage.jsx
client/src/pages/SubjectDetailPage.jsx
client/src/components/Navigation.jsx
client/src/store/inquiryStore.js
```

**Total:** ~60 new files, ~15 files to enhance

---

## PRIORITY SUMMARY

### MUST HAVE (Before Thesis Defense)
1. **Inquiry/Ticketing System** - Core feature for student-instructor communication
2. **Notification System** - Email + in-app for engagement
3. **Career Features** - Jobs, Resume, Interview (thesis requirement)
4. **File Upload** - Essential for study materials

### SHOULD HAVE (For Full Functionality)
1. Journey enhancements (weekly unlocking, email reminders)
2. Analytics enhancements (study time, predictions)
3. Bulk import for admin
4. Instructor dashboard enhancements

### NICE TO HAVE (Future Iterations)
1. Job crawling automation
2. Advanced AI features
3. System monitoring dashboard
4. Mobile app (future)

---

## TECHNICAL NOTES

**Email Service Recommendation:**
- Start with Nodemailer + Gmail (free, simple)
- Migrate to SendGrid if scaling (better deliverability)

**File Storage:**
- Start with local filesystem
- Move to cloud (S3/Cloudinary) when needed

**Scheduled Jobs:**
- Use node-cron for reminder jobs
- Run in separate process or use PM2

**PDF Generation:**
- Puppeteer (headless Chrome) - flexible, HTML templates
- PDFKit - lightweight, programmatic

**Real-time Notifications:**
- Start with polling (simple)
- Migrate to WebSocket later if needed

---

## REMOVED FEATURES (Per User Request)

❌ Discussion forums  
❌ Flashcards system  
❌ Note-taking system  
❌ Mobile app  
❌ PWA features  
❌ Collaboration features (study groups, peer reviews)  
❌ Class announcements  
❌ Video content system (future consideration)  
❌ General messaging (replaced with inquiry tickets)  

**Focus:** Review center exam preparation with adaptive learning journey
