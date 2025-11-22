import DailyActivity from "../models/DailyActivity.js";
import StudyPlan from "../models/StudyPlan.js";
import Subject from "../models/Subject.js";
import Topic from "../models/Topic.js";
import ManualQuestion from "../models/ManualQuestion.js";

class ActivityGeneratorService {
  async generateWeekActivities(studyPlanId, weekNumber) {
    const plan = await StudyPlan.findById(studyPlanId)
      .populate("weeks.saturdaySession.subjectId weeks.saturdaySession.topics")
      .populate("weeks.sundaySession.subjectId weeks.sundaySession.topics");

    if (!plan) {
      throw new Error("Study plan not found");
    }

    const week = plan.weeks.find(w => w.weekNumber === weekNumber);
    if (!week) {
      throw new Error(`Week ${weekNumber} not found in study plan`);
    }

    const activities = [];
    const startDate = new Date(week.startDate);

    for (let day = 1; day <= 7; day++) {
      const activityDate = new Date(startDate);
      activityDate.setDate(activityDate.getDate() + (day - 1));
      
      const dayActivities = await this.generateDayActivities(
        studyPlanId,
        weekNumber,
        day,
        activityDate,
        week,
        plan.targetLevel
      );
      
      activities.push(...dayActivities);
    }

    await DailyActivity.insertMany(activities);
    return activities;
  }

  async generateDayActivities(studyPlanId, weekNumber, dayOfWeek, activityDate, week, targetLevel) {
    const activities = [];
    let order = 1;

    if (dayOfWeek === 6) {
      if (week.saturdaySession?.subjectId) {
        activities.push(await this.createClassActivity(
          studyPlanId,
          weekNumber,
          dayOfWeek,
          activityDate,
          week.saturdaySession,
          order++
        ));
      }
    } else if (dayOfWeek === 7) {
      if (week.sundaySession?.subjectId) {
        activities.push(await this.createClassActivity(
          studyPlanId,
          weekNumber,
          dayOfWeek,
          activityDate,
          week.sundaySession,
          order++
        ));
      }
    } else {
      const weekdayActivities = await this.createWeekdayActivities(
        studyPlanId,
        weekNumber,
        dayOfWeek,
        activityDate,
        week,
        targetLevel,
        order
      );
      activities.push(...weekdayActivities);
    }

    return activities;
  }

  async createClassActivity(studyPlanId, weekNumber, dayOfWeek, activityDate, session, order) {
    return {
      studyPlanId,
      weekNumber,
      dayOfWeek,
      activityDate,
      activityType: "class",
      subjectId: session.subjectId._id || session.subjectId,
      topicIds: session.topics || [],
      title: `Live Class: ${session.subjectId.name || "Subject"}`,
      description: `Instructor-led session with Q&A`,
      estimatedDuration: 120,
      isRequired: true,
      order,
      xpReward: 50,
      content: {
        instructions: "Attend the live class and participate in discussions",
      },
    };
  }

  async createWeekdayActivities(studyPlanId, weekNumber, dayOfWeek, activityDate, week, targetLevel, startOrder) {
    const activities = [];
    let order = startOrder;

    const subjectId = week.saturdaySession?.subjectId?._id || week.saturdaySession?.subjectId;
    if (!subjectId) return activities;

    const subject = await Subject.findById(subjectId);
    if (!subject) return activities;

    if (dayOfWeek === 1 || dayOfWeek === 2) {
      activities.push(await this.createLessonActivity(
        studyPlanId,
        weekNumber,
        dayOfWeek,
        activityDate,
        subject,
        targetLevel,
        order++
      ));
    }

    if (dayOfWeek === 2 || dayOfWeek === 3) {
      activities.push(await this.createPracticeActivity(
        studyPlanId,
        weekNumber,
        dayOfWeek,
        activityDate,
        subject,
        targetLevel,
        order++
      ));
    }

    if (dayOfWeek === 4) {
      activities.push(await this.createAssessmentActivity(
        studyPlanId,
        weekNumber,
        dayOfWeek,
        activityDate,
        subject,
        targetLevel,
        order++
      ));
    }

    if (dayOfWeek === 5) {
      activities.push(await this.createReviewActivity(
        studyPlanId,
        weekNumber,
        dayOfWeek,
        activityDate,
        subject,
        targetLevel,
        order++
      ));
    }

    return activities;
  }

  async createLessonActivity(studyPlanId, weekNumber, dayOfWeek, activityDate, subject, targetLevel, order) {
    const topics = await Topic.find({ subjectId: subject._id, examLevel: { $in: [targetLevel, "Both"] } }).limit(3);
    const questions = await this.selectQuestions(subject._id, topics.map(t => t._id), targetLevel, 10, "easy");

    return {
      studyPlanId,
      weekNumber,
      dayOfWeek,
      activityDate,
      activityType: "lesson",
      subjectId: subject._id,
      topicIds: topics.map(t => t._id),
      title: `${subject.name} Lesson`,
      description: `Learn key concepts and practice with guided questions`,
      estimatedDuration: 20,
      questionCount: 10,
      difficulty: "easy",
      isRequired: true,
      order,
      xpReward: 10,
      content: {
        questions: questions.map(q => q._id),
        instructions: "Complete the lesson questions and review explanations",
      },
    };
  }

  async createPracticeActivity(studyPlanId, weekNumber, dayOfWeek, activityDate, subject, targetLevel, order) {
    const topics = await Topic.find({ subjectId: subject._id, examLevel: { $in: [targetLevel, "Both"] } }).limit(3);
    const questions = await this.selectQuestions(subject._id, topics.map(t => t._id), targetLevel, 15, "mixed");

    return {
      studyPlanId,
      weekNumber,
      dayOfWeek,
      activityDate,
      activityType: "practice",
      subjectId: subject._id,
      topicIds: topics.map(t => t._id),
      title: `${subject.name} Practice`,
      description: `Reinforce your understanding with mixed difficulty questions`,
      estimatedDuration: 20,
      questionCount: 15,
      difficulty: "mixed",
      isRequired: false,
      order,
      xpReward: 15,
      content: {
        questions: questions.map(q => q._id),
        instructions: "Practice questions to strengthen your skills",
      },
    };
  }

  async createAssessmentActivity(studyPlanId, weekNumber, dayOfWeek, activityDate, subject, targetLevel, order) {
    const topics = await Topic.find({ subjectId: subject._id, examLevel: { $in: [targetLevel, "Both"] } });
    const questions = await this.selectQuestions(subject._id, topics.map(t => t._id), targetLevel, 20, "mixed");

    return {
      studyPlanId,
      weekNumber,
      dayOfWeek,
      activityDate,
      activityType: "assessment",
      subjectId: subject._id,
      topicIds: topics.map(t => t._id),
      title: `${subject.name} Weekly Assessment`,
      description: `Test your knowledge with a comprehensive quiz`,
      estimatedDuration: 30,
      questionCount: 20,
      difficulty: "mixed",
      isRequired: true,
      order,
      xpReward: 25,
      content: {
        questions: questions.map(q => q._id),
        instructions: "Complete all questions to measure your progress",
      },
    };
  }

  async createReviewActivity(studyPlanId, weekNumber, dayOfWeek, activityDate, subject, targetLevel, order) {
    return {
      studyPlanId,
      weekNumber,
      dayOfWeek,
      activityDate,
      activityType: "review",
      subjectId: subject._id,
      topicIds: [],
      title: `${subject.name} Mistake Review`,
      description: `Revisit questions you got wrong to improve`,
      estimatedDuration: 15,
      difficulty: "mixed",
      isRequired: false,
      order,
      xpReward: 10,
      content: {
        questions: [],
        instructions: "Review your mistakes and learn from them",
      },
    };
  }

  async selectQuestions(subjectId, topicIds, examLevel, count, difficulty) {
    const query = {
      subjectId,
      examLevel: { $in: [examLevel, "Both"] },
      isActive: true,
    };

    if (topicIds.length > 0) {
      query.topicId = { $in: topicIds };
    }

    if (difficulty !== "mixed") {
      query.difficulty = difficulty;
    }

    const questions = await ManualQuestion.find(query)
      .limit(count)
      .lean();

    return questions;
  }

  async regenerateActivity(activityId) {
    const activity = await DailyActivity.findById(activityId)
      .populate("subjectId topicIds");

    if (!activity) {
      throw new Error("Activity not found");
    }

    const questions = await this.selectQuestions(
      activity.subjectId._id,
      activity.topicIds.map(t => t._id),
      activity.subjectId.examLevel,
      activity.questionCount,
      activity.difficulty
    );

    activity.content.questions = questions.map(q => q._id);
    await activity.save();

    return activity;
  }
}

export default new ActivityGeneratorService();
