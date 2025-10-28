import { InterviewPrep, InterviewQuestion } from "../models/InterviewPrep.js";
import User from "../models/User.js";

class InterviewPrepService {
  constructor() {
    this.questionCategories = {
      behavioral: "Questions about past behavior and experiences",
      situational: "Hypothetical scenarios and problem-solving",
      technical: "Job-specific knowledge and skills",
      government_knowledge: "Understanding of government processes",
      ethics_integrity: "Moral principles and professional conduct",
      leadership: "Leadership experience and potential",
      problem_solving: "Analytical thinking and decision-making",
      communication: "Verbal and written communication skills",
      teamwork: "Collaboration and interpersonal skills",
      adaptability: "Flexibility and change management",
      motivation: "Drive, ambition, and career goals",
      stress_management: "Handling pressure and difficult situations",
    };

    this.frameworkGuides = {
      STAR: {
        name: "Situation, Task, Action, Result",
        description: "Structure your answer by describing the Situation, Task, Action taken, and Result achieved",
        steps: ["Situation", "Task", "Action", "Result"],
      },
      SOAR: {
        name: "Situation, Obstacles, Actions, Results", 
        description: "Focus on challenges overcome and results achieved",
        steps: ["Situation", "Obstacles", "Actions", "Results"],
      },
      CARL: {
        name: "Context, Action, Result, Learning",
        description: "Include what you learned from the experience",
        steps: ["Context", "Action", "Result", "Learning"],
      },
    };

    this.defaultQuestions = [
      {
        question: "Tell me about yourself and why you're interested in government service.",
        category: "motivation",
        difficulty: "beginner",
        expectedAnswerStructure: {
          framework: "general",
          keyPoints: ["Background", "Motivation", "Goals", "Relevance to role"],
          timeLimit: 120,
        },
        tips: [
          "Keep it concise and relevant to the position",
          "Focus on your passion for public service",
          "Mention specific achievements or experiences",
        ],
      },
      {
        question: "Describe a time when you had to work under pressure to meet a deadline.",
        category: "behavioral",
        difficulty: "intermediate", 
        expectedAnswerStructure: {
          framework: "STAR",
          keyPoints: ["Specific situation", "Your role", "Actions taken", "Positive outcome"],
          timeLimit: 180,
        },
        tips: [
          "Choose a specific example with measurable results",
          "Emphasize your time management and prioritization skills",
          "Show how you maintained quality under pressure",
        ],
      },
      {
        question: "How would you handle a situation where you disagree with your supervisor's decision?",
        category: "situational",
        difficulty: "advanced",
        expectedAnswerStructure: {
          framework: "SOAR",
          keyPoints: ["Professional approach", "Communication strategy", "Compromise solutions", "Respect for hierarchy"],
          timeLimit: 150,
        },
        tips: [
          "Emphasize respect and professionalism",
          "Show willingness to understand different perspectives",
          "Demonstrate conflict resolution skills",
        ],
      },
      {
        question: "What do you know about our department's mission and recent initiatives?",
        category: "government_knowledge",
        difficulty: "intermediate",
        expectedAnswerStructure: {
          framework: "general",
          keyPoints: ["Department mission", "Recent programs", "Personal alignment", "Contribution potential"],
          timeLimit: 120,
        },
        tips: [
          "Research the department thoroughly beforehand",
          "Mention specific programs or initiatives",
          "Connect your skills to their needs",
        ],
      },
      {
        question: "Describe a situation where you had to maintain confidentiality while still being transparent.",
        category: "ethics_integrity",
        difficulty: "advanced",
        expectedAnswerStructure: {
          framework: "CARL",
          keyPoints: ["Ethical dilemma", "Decision process", "Balancing act", "Lessons learned"],
          timeLimit: 180,
        },
        tips: [
          "Show understanding of ethical boundaries",
          "Demonstrate good judgment",
          "Emphasize integrity and trust",
        ],
      },
    ];
  }

  async initializeQuestions() {
    try {
      const existingCount = await InterviewQuestion.countDocuments();
      
      if (existingCount === 0) {
        await InterviewQuestion.insertMany(this.defaultQuestions.map(q => ({
          ...q,
          source: "government_standard",
          isActive: true,
        })));
      }
    } catch (error) {
      console.error("Error initializing interview questions:", error);
    }
  }

  async createSession(userId, sessionConfig) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      const {
        sessionType = "general_government",
        targetPosition,
        targetDepartment,
        difficulty = "intermediate",
        practiceMode = "text_only",
        questionCount = 5,
      } = sessionConfig;

      const questions = await this.selectQuestionsForSession({
        sessionType,
        targetPosition,
        targetDepartment,
        difficulty,
        questionCount,
      });

      if (questions.length === 0) {
        throw new Error("No suitable questions found for this session");
      }

      const session = await InterviewPrep.create({
        userId,
        sessionType,
        targetPosition,
        targetDepartment,
        difficulty,
        practiceMode,
        questions: questions.map(q => ({
          questionId: q._id,
          question: q.question,
          category: q.category,
          timeSpent: 0,
          attempts: 0,
          isBookmarked: false,
        })),
        status: "in_progress",
      });

      return session;
    } catch (error) {
      console.error("Error creating interview session:", error);
      throw error;
    }
  }

  async selectQuestionsForSession(config) {
    try {
      const {
        sessionType,
        targetPosition,
        targetDepartment,
        difficulty,
        questionCount,
      } = config;

      let query = { isActive: true };

      if (difficulty && difficulty !== "mixed") {
        query.difficulty = difficulty;
      }

      if (targetPosition) {
        query.$or = [
          { targetPositions: { $in: [targetPosition] } },
          { targetPositions: { $size: 0 } },
        ];
      }

      if (targetDepartment) {
        query.$or = [
          ...(query.$or || []),
          { targetDepartments: { $in: [targetDepartment] } },
          { targetDepartments: { $size: 0 } },
        ];
      }

      const categoryMapping = {
        general_government: ["motivation", "government_knowledge", "communication"],
        behavioral: ["behavioral", "leadership", "teamwork"],
        situational: ["situational", "problem_solving", "adaptability"],
        ethics_integrity: ["ethics_integrity", "stress_management"],
        technical: ["technical", "problem_solving"],
        department_specific: ["government_knowledge", "technical"],
      };

      const preferredCategories = categoryMapping[sessionType] || ["behavioral", "situational", "motivation"];
      
      const questions = [];
      
      for (const category of preferredCategories) {
        const categoryQuery = { ...query, category };
        const categoryQuestions = await InterviewQuestion.find(categoryQuery)
          .limit(Math.ceil(questionCount / preferredCategories.length))
          .sort({ usageCount: 1, averageScore: -1 });
        
        questions.push(...categoryQuestions);
      }

      if (questions.length < questionCount) {
        const additionalQuestions = await InterviewQuestion.find({
          ...query,
          _id: { $nin: questions.map(q => q._id) },
        })
          .limit(questionCount - questions.length)
          .sort({ usageCount: 1 });
        
        questions.push(...additionalQuestions);
      }

      return questions.slice(0, questionCount);
    } catch (error) {
      console.error("Error selecting questions:", error);
      throw error;
    }
  }

  async submitResponse(sessionId, questionIndex, response) {
    try {
      const session = await InterviewPrep.findById(sessionId);
      if (!session) throw new Error("Session not found");

      if (questionIndex < 0 || questionIndex >= session.questions.length) {
        throw new Error("Invalid question index");
      }

      const question = session.questions[questionIndex];
      question.userResponse = {
        text: response.text,
        audioUrl: response.audioUrl,
        videoUrl: response.videoUrl,
        duration: response.duration,
      };
      question.timeSpent = response.timeSpent || 0;
      question.attempts = (question.attempts || 0) + 1;

      const analysis = await this.analyzeResponse(question, response);
      question.aiAnalysis = analysis;

      await session.save();

      const questionDoc = await InterviewQuestion.findById(question.questionId);
      if (questionDoc) {
        await questionDoc.incrementUsage();
        await questionDoc.updateAverageScore(analysis.score);
      }

      return { session, analysis };
    } catch (error) {
      console.error("Error submitting response:", error);
      throw error;
    }
  }

  async analyzeResponse(question, response) {
    try {
      const analysis = {
        score: 0,
        strengths: [],
        improvements: [],
        keywordMatch: 0,
        confidenceLevel: "medium",
        communicationScore: 0,
        contentScore: 0,
        structureScore: 0,
      };

      if (!response.text || response.text.trim().length < 20) {
        return {
          ...analysis,
          score: 20,
          improvements: ["Please provide a more detailed response", "Answer should be at least 20 characters"],
          confidenceLevel: "low",
        };
      }

      const responseText = response.text.toLowerCase();
      const wordCount = responseText.split(/\s+/).length;

      analysis.communicationScore = this.scoreCommunication(responseText, wordCount);
      analysis.contentScore = this.scoreContent(responseText, question);
      analysis.structureScore = this.scoreStructure(responseText, question);

      analysis.score = Math.round(
        (analysis.communicationScore * 0.3) +
        (analysis.contentScore * 0.4) +
        (analysis.structureScore * 0.3)
      );

      analysis.keywordMatch = this.calculateKeywordMatch(responseText, question);
      analysis.confidenceLevel = this.assessConfidence(analysis.score, wordCount);

      analysis.strengths = this.identifyStrengths(responseText, analysis);
      analysis.improvements = this.identifyImprovements(responseText, analysis, question);

      return analysis;
    } catch (error) {
      console.error("Error analyzing response:", error);
      return {
        score: 50,
        strengths: ["Response submitted"],
        improvements: ["Consider providing more specific examples"],
        keywordMatch: 0,
        confidenceLevel: "medium",
        communicationScore: 50,
        contentScore: 50,
        structureScore: 50,
      };
    }
  }

  scoreCommunication(text, wordCount) {
    let score = 60;

    if (wordCount >= 50) score += 10;
    if (wordCount >= 100) score += 10;
    if (wordCount >= 150) score += 10;

    if (text.includes("i") && text.includes("my") && text.includes("me")) score += 5;

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    if (sentences.length >= 3) score += 5;

    if (text.includes("for example") || text.includes("specifically") || text.includes("such as")) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  scoreContent(text, question) {
    let score = 50;

    if (text.includes("experience") || text.includes("situation") || text.includes("time")) {
      score += 15;
    }

    if (text.includes("result") || text.includes("outcome") || text.includes("achieved")) {
      score += 15;
    }

    if (text.includes("learned") || text.includes("improved") || text.includes("developed")) {
      score += 10;
    }

    if (question.category === "government_knowledge" && 
        (text.includes("government") || text.includes("public") || text.includes("service"))) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  scoreStructure(text, question) {
    let score = 60;

    const framework = question.expectedAnswerStructure?.framework;
    
    if (framework === "STAR") {
      if (text.includes("situation") || text.includes("context")) score += 10;
      if (text.includes("task") || text.includes("responsibility")) score += 10;
      if (text.includes("action") || text.includes("did")) score += 10;
      if (text.includes("result") || text.includes("outcome")) score += 10;
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length >= 4) score += 5;
    if (sentences.length >= 6) score += 5;

    return Math.min(score, 100);
  }

  calculateKeywordMatch(text, question) {
    if (!question.keywords || question.keywords.length === 0) return 50;

    const matchedKeywords = question.keywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );

    return Math.round((matchedKeywords.length / question.keywords.length) * 100);
  }

  assessConfidence(score, wordCount) {
    if (score >= 80 && wordCount >= 100) return "high";
    if (score >= 60 && wordCount >= 50) return "medium";
    return "low";
  }

  identifyStrengths(text, analysis) {
    const strengths = [];

    if (analysis.communicationScore >= 80) {
      strengths.push("Clear and articulate communication");
    }

    if (text.includes("example") || text.includes("specifically")) {
      strengths.push("Provided specific examples");
    }

    if (text.includes("result") || text.includes("achieved") || text.includes("improved")) {
      strengths.push("Demonstrated results-oriented thinking");
    }

    if (text.includes("team") || text.includes("collaboration")) {
      strengths.push("Shows teamwork and collaboration skills");
    }

    if (analysis.structureScore >= 75) {
      strengths.push("Well-structured response");
    }

    return strengths.length > 0 ? strengths : ["Response shows effort and engagement"];
  }

  identifyImprovements(text, analysis, question) {
    const improvements = [];

    if (analysis.communicationScore < 70) {
      improvements.push("Consider expanding your answer with more details");
    }

    if (analysis.contentScore < 60) {
      improvements.push("Include more specific examples and experiences");
    }

    if (analysis.structureScore < 60) {
      if (question.expectedAnswerStructure?.framework === "STAR") {
        improvements.push("Try using the STAR method: Situation, Task, Action, Result");
      } else {
        improvements.push("Organize your response with a clearer structure");
      }
    }

    if (!text.includes("result") && !text.includes("outcome")) {
      improvements.push("Mention the results or outcomes of your actions");
    }

    if (text.split(/\s+/).length < 75) {
      improvements.push("Consider providing more depth in your response");
    }

    return improvements.length > 0 ? improvements : ["Consider adding more specific examples"];
  }

  async completeSession(sessionId) {
    try {
      const session = await InterviewPrep.findById(sessionId);
      if (!session) throw new Error("Session not found");

      await session.completeSession();

      const feedback = this.generateSessionFeedback(session);
      session.feedback = feedback;
      
      await session.save();

      return session;
    } catch (error) {
      console.error("Error completing session:", error);
      throw error;
    }
  }

  generateSessionFeedback(session) {
    const answeredQuestions = session.questions.filter(q => q.userResponse && q.userResponse.text);
    
    if (answeredQuestions.length === 0) {
      return {
        overall: "No responses were provided. Try again with detailed answers.",
        strengths: [],
        improvements: ["Complete the questions with thoughtful responses"],
        nextSteps: ["Practice answering questions using the STAR method"],
      };
    }

    const avgScore = session.overallScore || 0;
    const strengths = [];
    const improvements = [];
    const nextSteps = [];

    if (avgScore >= 80) {
      strengths.push("Excellent interview performance overall");
      strengths.push("Demonstrates strong preparation and competence");
      nextSteps.push("Continue practicing to maintain confidence");
    } else if (avgScore >= 60) {
      strengths.push("Good foundation with room for improvement");
      improvements.push("Focus on providing more specific examples");
      nextSteps.push("Practice common interview questions daily");
    } else {
      improvements.push("Needs significant improvement in response quality");
      improvements.push("Work on structuring answers using proven frameworks");
      nextSteps.push("Study the job description and practice relevant scenarios");
    }

    const allStrengths = answeredQuestions.flatMap(q => q.aiAnalysis?.strengths || []);
    const uniqueStrengths = [...new Set(allStrengths)];
    strengths.push(...uniqueStrengths.slice(0, 3));

    const allImprovements = answeredQuestions.flatMap(q => q.aiAnalysis?.improvements || []);
    const uniqueImprovements = [...new Set(allImprovements)];
    improvements.push(...uniqueImprovements.slice(0, 3));

    return {
      overall: this.generateOverallFeedback(avgScore, answeredQuestions.length),
      strengths: [...new Set(strengths)].slice(0, 5),
      improvements: [...new Set(improvements)].slice(0, 5),
      nextSteps: [...new Set(nextSteps)].slice(0, 3),
      confidenceImprovement: this.generateConfidenceAdvice(avgScore),
      communicationTips: this.generateCommunicationTips(answeredQuestions),
    };
  }

  generateOverallFeedback(avgScore, questionCount) {
    if (avgScore >= 85) {
      return `Excellent performance! You answered ${questionCount} questions with strong, well-structured responses. You're well-prepared for interviews.`;
    } else if (avgScore >= 70) {
      return `Good job! You completed ${questionCount} questions with solid responses. Focus on adding more specific examples to strengthen your answers.`;
    } else if (avgScore >= 55) {
      return `Decent effort on ${questionCount} questions. Work on structuring your answers and providing more detailed examples from your experience.`;
    } else {
      return `You completed ${questionCount} questions, but there's significant room for improvement. Focus on preparation and practice with structured answer methods.`;
    }
  }

  generateConfidenceAdvice(avgScore) {
    if (avgScore >= 75) {
      return "You demonstrate good confidence. Maintain this level through regular practice.";
    } else if (avgScore >= 60) {
      return "Build confidence by practicing common questions and preparing specific examples.";
    } else {
      return "Work on building confidence through thorough preparation and mock interview practice.";
    }
  }

  generateCommunicationTips(answeredQuestions) {
    const tips = [
      "Use the STAR method to structure behavioral questions",
      "Prepare specific examples from your experience",
      "Practice speaking clearly and at an appropriate pace",
      "Make eye contact and maintain good posture",
      "Ask thoughtful questions about the role and organization",
    ];

    const avgWordCount = answeredQuestions.reduce((sum, q) => {
      const wordCount = q.userResponse?.text?.split(/\s+/).length || 0;
      return sum + wordCount;
    }, 0) / answeredQuestions.length;

    if (avgWordCount < 50) {
      tips.unshift("Provide more detailed responses - aim for 75-150 words per answer");
    }

    return tips.slice(0, 5);
  }

  async getUserSessions(userId, filters = {}) {
    try {
      return InterviewPrep.getUserSessions(userId, filters);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      throw error;
    }
  }

  async getUserStats(userId) {
    try {
      return InterviewPrep.getUserStats(userId);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  }

  async getQuestionsByCategory(category, limit = 10) {
    try {
      return InterviewQuestion.getQuestionsByCategory(category, limit);
    } catch (error) {
      console.error("Error fetching questions by category:", error);
      throw error;
    }
  }

  getFrameworkGuide(framework) {
    return this.frameworkGuides[framework] || this.frameworkGuides.STAR;
  }

  getQuestionCategories() {
    return this.questionCategories;
  }

  async addCustomQuestion(questionData) {
    try {
      const question = await InterviewQuestion.create({
        ...questionData,
        source: "user_contributed",
        isActive: true,
      });

      return question;
    } catch (error) {
      console.error("Error adding custom question:", error);
      throw error;
    }
  }

  async bookmarkQuestion(sessionId, questionIndex) {
    try {
      const session = await InterviewPrep.findById(sessionId);
      if (!session) throw new Error("Session not found");

      if (questionIndex >= 0 && questionIndex < session.questions.length) {
        session.questions[questionIndex].isBookmarked = true;
        await session.save();
      }

      return session;
    } catch (error) {
      console.error("Error bookmarking question:", error);
      throw error;
    }
  }
}

export default new InterviewPrepService();
