import performanceAnalysisService from "./performanceAnalysisService.js";
import UserQuestionHistory from "../models/UserQuestionHistory.js";
import User from "../models/User.js";

class StudyPlanService {
  async generatePersonalizedPlan(userId, targetDate) {
    const user = await User.findById(userId);
    const weakAreas = await performanceAnalysisService.identifyWeakAreas(userId);
    const examReadiness = await performanceAnalysisService.getExamReadinessScore(userId, user.examType);
    
    const daysUntilExam = this.calculateDaysUntilExam(targetDate);
    const dailyStudyTime = user.dailyStudyHours * 60 || 120;
    
    const plan = {
      userId,
      targetExamDate: targetDate,
      startDate: new Date(),
      totalDays: daysUntilExam,
      dailyStudyTime,
      currentReadinessScore: examReadiness.overallScore,
      weeklySchedule: this.generateWeeklySchedule(weakAreas, daysUntilExam, dailyStudyTime),
      milestones: this.generateMilestones(daysUntilExam, examReadiness.overallScore),
      recommendations: this.generateStudyRecommendations(weakAreas, examReadiness, daysUntilExam)
    };

    return plan;
  }

  generateWeeklySchedule(weakAreas, totalDays, dailyStudyTime) {
    const totalWeeks = Math.ceil(totalDays / 7);
    const schedule = [];

    for (let week = 1; week <= totalWeeks; week++) {
      const weekPlan = {
        week,
        focus: this.determineWeeklyFocus(week, totalWeeks, weakAreas),
        dailyTargets: this.generateDailyTargets(week, totalWeeks, dailyStudyTime, weakAreas),
        goals: this.generateWeeklyGoals(week, totalWeeks, weakAreas)
      };
      schedule.push(weekPlan);
    }

    return schedule;
  }

  determineWeeklyFocus(currentWeek, totalWeeks, weakAreas) {
    const phase = currentWeek / totalWeeks;
    
    if (phase <= 0.3) {
      return "Foundation Building";
    } else if (phase <= 0.7) {
      return "Skill Development";
    } else if (phase <= 0.9) {
      return "Practice & Application";
    } else {
      return "Final Review";
    }
  }

  generateDailyTargets(week, totalWeeks, dailyStudyTime, weakAreas) {
    const daysInWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const dailyTargets = {};

    daysInWeek.forEach((day, index) => {
      if (index === 6) {
        dailyTargets[day] = {
          studyTime: dailyStudyTime * 0.5,
          activities: ["Review", "Light Practice"],
          questionsTarget: 10
        };
      } else {
        const primaryArea = weakAreas[index % weakAreas.length];
        dailyTargets[day] = {
          studyTime: dailyStudyTime,
          activities: this.getDailyActivities(day, week, totalWeeks),
          primaryFocus: primaryArea?.category || "General Review",
          questionsTarget: this.calculateDailyQuestionTarget(dailyStudyTime)
        };
      }
    });

    return dailyTargets;
  }

  getDailyActivities(day, week, totalWeeks) {
    const phase = week / totalWeeks;
    const baseActivities = [];

    if (phase <= 0.3) {
      baseActivities.push("Concept Review", "Basic Practice");
    } else if (phase <= 0.7) {
      baseActivities.push("Targeted Practice", "Weakness Focus");
    } else if (phase <= 0.9) {
      baseActivities.push("Timed Practice", "Mock Tests");
    } else {
      baseActivities.push("Final Review", "Strategy Refresh");
    }

    if (day === "friday") {
      baseActivities.push("Weekly Assessment");
    }

    return baseActivities;
  }

  calculateDailyQuestionTarget(dailyStudyTime) {
    const averageTimePerQuestion = 2;
    const studyTimeMinutes = dailyStudyTime;
    return Math.floor(studyTimeMinutes / averageTimePerQuestion);
  }

  generateMilestones(totalDays, currentReadinessScore) {
    const milestones = [];
    const targetScore = Math.max(85, currentReadinessScore + 20);
    const scoreIncrement = (targetScore - currentReadinessScore) / 4;

    for (let i = 1; i <= 4; i++) {
      const daysFromStart = Math.floor((totalDays / 4) * i);
      const targetReadiness = Math.round(currentReadinessScore + (scoreIncrement * i));
      
      milestones.push({
        week: Math.ceil(daysFromStart / 7),
        day: daysFromStart,
        targetReadinessScore: targetReadiness,
        description: this.getMilestoneDescription(i, targetReadiness),
        assessmentType: i === 4 ? "Mock Exam" : "Practice Assessment"
      });
    }

    return milestones;
  }

  getMilestoneDescription(milestone, score) {
    const descriptions = {
      1: `Foundation Check - Target: ${score}% readiness`,
      2: `Mid-point Assessment - Target: ${score}% readiness`,
      3: `Pre-exam Review - Target: ${score}% readiness`,
      4: `Final Readiness - Target: ${score}% readiness`
    };
    
    return descriptions[milestone];
  }

  generateStudyRecommendations(weakAreas, examReadiness, daysUntilExam) {
    const recommendations = [];

    if (daysUntilExam < 30) {
      recommendations.push({
        type: "time_management",
        priority: "high",
        message: "Focus on high-impact areas given limited time",
        actions: ["Daily timed practice", "Focus on top 3 weak areas", "Take practice exams"]
      });
    }

    if (examReadiness.overallScore < 60) {
      recommendations.push({
        type: "intensive_study",
        priority: "high", 
        message: "Intensive study plan needed for readiness",
        actions: ["Increase daily study time", "Focus on fundamentals", "Seek additional resources"]
      });
    }

    if (weakAreas.length > 5) {
      recommendations.push({
        type: "prioritization",
        priority: "medium",
        message: "Prioritize most critical weak areas",
        actions: [`Focus on top 3: ${weakAreas.slice(0, 3).map(w => w.category).join(", ")}`]
      });
    }

    return recommendations;
  }

  async trackStudySession(userId, sessionData) {
    const { category, questionsAnswered, timeSpent, accuracy, date } = sessionData;
    
    const user = await User.findById(userId);
    if (!user.studyPlan) return null;

    const today = new Date(date || Date.now());
    const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const currentWeek = this.getCurrentWeek(user.studyPlan.startDate, today);

    const adherenceUpdate = {
      week: currentWeek,
      day: dayOfWeek,
      actualStudyTime: timeSpent,
      questionsCompleted: questionsAnswered,
      accuracy,
      category,
      completedAt: today
    };

    return adherenceUpdate;
  }

  async calculateAdherenceRate(userId) {
    const user = await User.findById(userId);
    if (!user.studyPlan) return 0;

    const planStartDate = new Date(user.studyPlan.startDate);
    const daysSinceStart = Math.floor((Date.now() - planStartDate) / (1000 * 60 * 60 * 24));
    
    const completedSessions = user.studyPlan.adherenceLog?.length || 0;
    const expectedSessions = Math.min(daysSinceStart, user.studyPlan.totalDays);
    
    return expectedSessions > 0 ? (completedSessions / expectedSessions) * 100 : 0;
  }

  getCurrentWeek(startDate, currentDate) {
    const diffTime = currentDate - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
  }

  calculateDaysUntilExam(targetDate) {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async adjustPlanBasedOnProgress(userId) {
    const user = await User.findById(userId);
    const currentReadiness = await performanceAnalysisService.getExamReadinessScore(userId, user.examType);
    const adherenceRate = await this.calculateAdherenceRate(userId);

    const adjustments = [];

    if (currentReadiness.overallScore < user.studyPlan.expectedProgress) {
      adjustments.push({
        type: "increase_intensity",
        message: "Consider increasing daily study time",
        recommendation: "Add 30 minutes to daily sessions"
      });
    }

    if (adherenceRate < 70) {
      adjustments.push({
        type: "schedule_adjustment",
        message: "Current schedule may be too ambitious",
        recommendation: "Reduce daily targets by 20%"
      });
    }

    return adjustments;
  }
}

export default new StudyPlanService();
