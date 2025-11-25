# Mock Data Creation Guide

## Overview
This guide outlines how to create comprehensive mock data for the Previlace Civil Service Exam Review System. Follow this structure to ensure data consistency and proper relationships between entities.

## Data Models Structure

### 1. Users
**Purpose**: Test users with different roles and progress levels

**Required Fields**:
- firstName, lastName, email, password (hashed)
- role: "student" | "admin"
- examLevel: "Professional" | "Sub-Professional"
- isProfileComplete: boolean
- targetExamDate: Date

**Mock Data Considerations**:
- Create at least 1 admin user
- Create 10-20 student users with varying progress levels
- Use realistic Filipino names
- Ensure unique emails
- Password should be hashed (use bcrypt)
- Mix of Professional and Sub-Professional exam takers
- Vary targetExamDate (past, near future, far future)

**Example Structure**:
```javascript
{
  firstName: "Juan",
  lastName: "Dela Cruz",
  email: "juan.delacruz@email.com",
  password: "$2a$10$hashedpassword",
  role: "student",
  examLevel: "Professional",
  isProfileComplete: true,
  targetExamDate: "2025-06-15T00:00:00.000Z",
  createdAt: "2024-11-01T00:00:00.000Z"
}
```

---

### 2. Subjects
**Purpose**: Main subject categories for CSE

**Required Fields**:
- name, code, description, icon
- examLevel: "Professional" | "Sub-Professional" | "Both"
- order: number (for display ordering)
- isActive: boolean
- totalTopics, totalQuestions, estimatedHours

**Standard CSE Subjects**:

**Professional Level**:
- General Information (GEN-INFO)
- Numerical Reasoning (NUM-REASON)
- Analytical Reasoning (ANAL-REASON)
- Verbal Reasoning (VERB-REASON)
- Clerical Operations (CLER-OPS)

**Sub-Professional Level**:
- Vocabulary (VOCAB)
- Grammar and Correct Usage (GRAMMAR)
- Paragraph Organization (PARA-ORG)
- Reading Comprehension (READ-COMP)
- Numerical Reasoning (NUM-REASON)

**Mock Data Considerations**:
- Use consistent code format (uppercase, hyphenated)
- Set realistic estimatedHours (10-20 hours per subject)
- Icon should be Lucide React icon name
- Order should reflect typical exam structure

---

### 3. Topics
**Purpose**: Sub-categories within each subject

**Required Fields**:
- subjectId (reference to Subject)
- name, code, description
- order: number
- difficulty: "beginner" | "intermediate" | "advanced"
- estimatedMinutes: number
- totalQuestions: number
- hasLearningContent: boolean
- isActive: boolean

**Topics per Subject Example (Numerical Reasoning)**:
- Basic Arithmetic (NUM-001)
- Fractions and Decimals (NUM-002)
- Percentages (NUM-003)
- Ratios and Proportions (NUM-004)
- Word Problems (NUM-005)
- Number Series (NUM-006)
- Data Interpretation (NUM-007)

**Mock Data Considerations**:
- Each subject should have 5-10 topics
- Mix difficulty levels within each subject
- EstimatedMinutes should be 15-45 minutes
- Code format: SUBJECT-CODE-###
- hasLearningContent should be true for 60-70% of topics

---

### 4. LearningContent
**Purpose**: Educational content for each topic

**Required Fields**:
- topicId (reference to Topic)
- content.introduction: string
- content.sections: array of { title, content, order }
- content.keyPoints: array of strings
- content.examples: array of { title, description }
- tips: array of strings
- commonMistakes: array of strings
- resources: array of { title, url, type }
- isPublished: boolean

**Mock Data Considerations**:
- Introduction should be 200-500 words
- Include 3-5 sections per topic
- Each section should be 300-700 words
- Provide 5-10 key points
- Include 2-4 examples with practical applications
- Add 5-8 tips for exam preparation
- List 3-5 common mistakes
- Include external resources (videos, articles, PDFs)
- Set isPublished: true for active content

**Content Quality Guidelines**:
- Use clear, professional language
- Include Filipino context examples where relevant
- Focus on CSE exam format and requirements
- Provide actionable study tips
- Reference official CSE materials

---

### 5. ManualQuestion (Questions)
**Purpose**: Quiz and exam questions

**Required Fields**:
- subjectId, topicId
- questionText: string
- questionMath: string (for LaTeX formulas)
- options: array of { text, isCorrect }
- explanation: string
- explanationMath: string
- category, subjectArea: string
- difficulty: "beginner" | "intermediate" | "advanced"
- examLevel: "Professional" | "Sub-Professional"
- status: "draft" | "published" | "archived"
- isActive: boolean

**Mock Data Considerations**:
- Create 20-50 questions per topic
- Distribute difficulty: 40% beginner, 40% intermediate, 20% advanced
- Each question should have 4 options
- Only one correct answer per question
- Explanation should be 100-300 words
- Use questionMath for mathematical formulas
- Category should match subject name
- Status should be "published" for active questions

**Question Types to Include**:
- Multiple choice
- Numerical problems
- Reading comprehension
- Grammar correction
- Logic puzzles
- Situational judgment

---

### 6. UserProgress
**Purpose**: Track user progress per subject

**Required Fields**:
- userId, subjectId
- completedTopics: array of ObjectId
- averageScore: number (0-100)
- totalAttempts: number
- lastAccessedAt: Date
- topicProgress: array of {
  - topicId
  - isCompleted: boolean
  - attempts: number
  - bestScore: number
  - lastAccessedAt: Date
}

**Mock Data Considerations**:
- Create progress for 60-80% of users
- Vary completion rates (0-100%)
- averageScore should range 40-95
- totalAttempts should be 5-50
- Recent lastAccessedAt for active users
- Some topics fully completed, some in progress
- bestScore should increase with attempts

---

### 7. UserQuestionHistory
**Purpose**: Track individual question performance

**Required Fields**:
- userId, questionId
- totalAttempts: number
- correctAttempts: number
- lastAttemptAt: Date
- masteryLevel: "learning" | "familiar" | "proficient" | "mastered"
- nextReviewDate: Date

**Mock Data Considerations**:
- Create for questions users have attempted
- totalAttempts: 1-10
- correctAttempts: 0 to totalAttempts
- masteryLevel based on success rate:
  - learning: 0-40%
  - familiar: 40-60%
  - proficient: 60-80%
  - mastered: 80-100%
- nextReviewDate uses spaced repetition algorithm

---

### 8. QuizSession
**Purpose**: Record quiz/exam attempts

**Required Fields**:
- userId
- mode: "practice" | "timed" | "mock" | "subject" | "topic"
- title: string
- questions: array of ObjectId
- answers: array of {
  - questionId
  - userAnswer: string
  - isCorrect: boolean
  - timeSpent: number
}
- status: "active" | "paused" | "completed" | "abandoned"
- score: { correct, total, percentage }
- timing: { startedAt, completedAt, totalTime, timeLimit }
- config: object

**Mock Data Considerations**:
- Create 5-20 sessions per active user
- Mix of completed and in-progress sessions
- Recent sessions should be incomplete
- Older sessions should be completed
- Score percentage varies by user level
- totalTime should be realistic (10-120 minutes)

---

### 9. Achievement
**Purpose**: System-wide achievements users can unlock

**Required Fields**:
- code: string (unique identifier)
- name, description: string
- category: "study" | "performance" | "streak" | "social" | "milestone"
- requirement: object (criteria for unlocking)
- points: number
- icon: string (Lucide icon name)
- isActive: boolean

**Achievement Examples**:
- First Quiz (complete first quiz)
- Perfect Score (100% on any quiz)
- Week Warrior (7 day study streak)
- Century Club (100 total questions answered)
- Mock Master (complete 3 mock exams)
- Subject Scholar (complete all topics in subject)
- Early Bird (study before 8 AM)
- Night Owl (study after 10 PM)

**Mock Data Considerations**:
- Create 20-30 achievements
- Mix easy and difficult achievements
- Points: 10-500 based on difficulty
- Vary categories
- All should be isActive: true

---

### 10. UserAchievement
**Purpose**: Track which achievements users have earned

**Required Fields**:
- userId, achievementId
- unlockedAt: Date
- progress: number (0-100)

**Mock Data Considerations**:
- Award 30-70% of achievements to active users
- Recent unlockedAt for new achievements
- Progress 100 for unlocked achievements
- Some achievements should be in progress

---

### 11. JobPosting
**Purpose**: Government job opportunities

**Required Fields**:
- title, description: string
- agency, department: string
- location: string
- salaryRange: { min, max }
- requirements: array of strings
- responsibilities: array of strings
- qualifications: array of strings
- examLevel: "Professional" | "Sub-Professional" | "Both"
- positionLevel: string
- employmentType: "Full-time" | "Part-time" | "Contract"
- applicationDeadline: Date
- postingDate: Date
- isActive: boolean

**Mock Data Considerations**:
- Create 30-50 job postings
- Use real Philippine government agencies (CSC, DepEd, DOH, etc.)
- Mix of Professional and Sub-Professional positions
- Salary ranges realistic for PH government (₱15,000 - ₱50,000)
- Some expired, some active postings
- Requirements should match examLevel

---

### 12. Resume
**Purpose**: User-created resumes

**Required Fields**:
- userId
- personalInfo: { name, email, phone, address }
- summary: string
- education: array of { school, degree, year }
- experience: array of { company, position, duration, description }
- skills: array of strings
- certifications: array of { name, issuer, date }
- achievements: array of strings
- templateId: string
- isComplete: boolean

**Mock Data Considerations**:
- Create resumes for 40-60% of users
- Vary completion levels
- Include CSE passing as certification
- Skills should be relevant to government work
- Some resumes incomplete

---

### 13. InterviewPrep
**Purpose**: Interview practice records

**Required Fields**:
- userId
- jobPostingId (optional)
- questions: array of { question, userAnswer, feedback }
- overallFeedback: string
- score: number
- completedAt: Date

**Mock Data Considerations**:
- Create for active users preparing for interviews
- 3-10 questions per session
- Realistic government interview questions
- Feedback should be constructive
- Score: 60-95

---

### 14. Flashcard & FlashcardDeck
**Purpose**: Study flashcards

**Deck Required Fields**:
- userId, name, description
- subjectId (optional)
- cardCount: number
- isPublic: boolean

**Card Required Fields**:
- deckId
- front, back: string
- difficulty: "easy" | "medium" | "hard"
- nextReviewDate: Date
- reviewCount: number

**Mock Data Considerations**:
- Create 5-10 decks per active user
- 10-30 cards per deck
- Mix of public and private decks
- Use spaced repetition dates
- Cover key CSE topics

---

### 15. StudyGroup
**Purpose**: Collaborative study groups

**Required Fields**:
- name, description: string
- creatorId: ObjectId
- members: array of ObjectId
- subject: string
- examLevel: string
- isPublic: boolean
- maxMembers: number
- schedule: string

**Mock Data Considerations**:
- Create 8-15 study groups
- 3-10 members per group
- Mix of public and private groups
- Subject-specific groups
- Realistic meeting schedules

---

### 16. Challenge
**Purpose**: Competitive challenges between users

**Required Fields**:
- title, description: string
- challengeType: "speed" | "accuracy" | "streak" | "score"
- creatorId, opponentId: ObjectId
- subjectId (optional)
- startDate, endDate: Date
- status: "pending" | "active" | "completed"
- winner: ObjectId

**Mock Data Considerations**:
- Create various challenge types
- Mix of pending, active, and completed
- Some with winners, some without

---

### 17. Bookmark & BookmarkFolder
**Purpose**: User bookmarks for questions/topics

**Folder Required Fields**:
- userId, name, color
- itemCount: number

**Bookmark Required Fields**:
- userId, folderId
- itemType: "question" | "topic" | "article"
- itemId: ObjectId
- note: string

**Mock Data Considerations**:
- Create 3-5 folders per user
- 10-30 bookmarks per folder
- Use colors from design system
- Include helpful notes

---

## Data Relationships

### Primary Relationships
```
User
├── UserProgress (one-to-many)
├── UserQuestionHistory (one-to-many)
├── QuizSession (one-to-many)
├── UserAchievement (one-to-many)
└── Resume (one-to-many)

Subject
├── Topics (one-to-many)
├── Questions (one-to-many)
└── UserProgress (one-to-many)

Topic
├── LearningContent (one-to-one)
├── Questions (one-to-many)
└── Referenced in UserProgress.topicProgress

Question
├── UserQuestionHistory (one-to-many)
└── Referenced in QuizSession.questions
```

## Mock Data Best Practices

### 1. Consistency
- Use consistent date formats (ISO 8601)
- Maintain referential integrity
- Follow naming conventions
- Use ObjectId format for references

### 2. Realism
- Use realistic Filipino names and locations
- Base questions on actual CSE exam patterns
- Use appropriate salary ranges for PH government
- Include actual government agencies

### 3. Variety
- Mix difficulty levels
- Vary completion rates
- Include edge cases (new users, power users)
- Create diverse study patterns

### 4. Volume
- Users: 20-50
- Subjects: 10-15
- Topics per Subject: 5-10
- Questions per Topic: 20-50
- Sessions per User: 5-20
- Achievements: 20-30

### 5. Temporal Data
- Spread createdAt dates over 3-6 months
- Recent activity for active users
- Older data for inactive users
- Future dates for upcoming deadlines

## Implementation Steps

### Phase 1: Core Data
1. Create admin and student users
2. Create all subjects
3. Create topics for each subject
4. Create learning content for topics

### Phase 2: Questions
1. Create questions for each topic
2. Distribute across difficulty levels
3. Ensure proper categorization
4. Add explanations

### Phase 3: User Activity
1. Create UserProgress records
2. Generate QuizSessions
3. Create UserQuestionHistory
4. Award UserAchievements

### Phase 4: Additional Features
1. Create job postings
2. Generate resumes
3. Create study groups
4. Add flashcard decks
5. Create bookmarks

### Phase 5: Verification
1. Check all relationships
2. Verify data integrity
3. Test queries
4. Ensure indexes work

## Seeding Script Structure

```javascript
// File: server/src/scripts/seedDatabase.js

async function seedDatabase() {
  // 1. Clear existing data
  await clearDatabase();
  
  // 2. Create users
  const users = await createUsers();
  
  // 3. Create subjects
  const subjects = await createSubjects();
  
  // 4. Create topics
  const topics = await createTopics(subjects);
  
  // 5. Create learning content
  await createLearningContent(topics);
  
  // 6. Create questions
  const questions = await createQuestions(subjects, topics);
  
  // 7. Create user progress
  await createUserProgress(users, subjects, topics);
  
  // 8. Create quiz sessions
  await createQuizSessions(users, questions);
  
  // 9. Create achievements
  const achievements = await createAchievements();
  
  // 10. Award achievements
  await awardAchievements(users, achievements);
  
  // 11. Create job postings
  await createJobPostings();
  
  // 12. Create additional features
  await createAdditionalFeatures(users, subjects, topics);
}
```

## Testing Mock Data

### Validation Checklist
- [ ] All required fields populated
- [ ] References exist (no orphaned data)
- [ ] Dates are valid and logical
- [ ] Enum values are correct
- [ ] Numerical values in valid ranges
- [ ] No duplicate unique fields
- [ ] Indexes created properly
- [ ] Queries return expected results

### Query Tests
```javascript
// Test queries to validate data

// 1. Count documents per collection
await User.countDocuments();
await Subject.countDocuments();

// 2. Verify relationships
const subject = await Subject.findOne().populate('topics');

// 3. Check user progress
const progress = await UserProgress.find({ userId });

// 4. Validate question distribution
const questionStats = await ManualQuestion.aggregate([
  { $group: { _id: "$difficulty", count: { $sum: 1 } } }
]);

// 5. Check session completion
const sessions = await QuizSession.find({ status: "completed" });
```

## Common Pitfalls

### Avoid These Mistakes
1. Creating questions without linking to topics
2. Orphaned progress records (user/subject deleted)
3. Inconsistent date ranges (completed before started)
4. Invalid ObjectId references
5. Missing required fields
6. Incorrect enum values
7. Unrealistic data (1000% scores, negative times)
8. No variation in difficulty
9. Empty arrays for required array fields
10. Inconsistent examLevel values

## Philippine Context Considerations

### Local Relevance
- Use Philippine government agencies
- Include local holidays and events
- Reference Philippine laws and policies
- Use Peso currency (₱)
- Include Filipino cultural context
- Reference actual CSE exam structure
- Use Philippine locations (NCR, provinces)
- Include relevant Filipino vocabulary

### Government Positions
- Administrative Aide (Sub-Professional)
- Administrative Officer (Professional)
- Revenue Officer (Professional)
- Social Welfare Officer (Professional)
- Public Health Nurse (Professional)
- Teacher (Professional)
- Clerk (Sub-Professional)
- Utility Worker (Sub-Professional)

## Maintenance

### Updating Mock Data
1. Add new questions regularly
2. Update job postings (expire old ones)
3. Create new achievements
4. Update learning content
5. Refresh user activity patterns
6. Add new topics as CSE evolves

### Cleanup
1. Archive old quiz sessions
2. Remove expired job postings
3. Soft delete inactive users
4. Archive outdated questions
5. Clean up orphaned references

---

This guide provides the framework for creating comprehensive, realistic mock data for the entire Previlace system. Follow this structure to ensure data quality and proper testing capabilities.
