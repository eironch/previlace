import StudyPlan from "../models/StudyPlan.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";
import InstructorAvailability from "../models/InstructorAvailability.js";

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getNextSaturday(date) {
  const result = new Date(date);
  const day = result.getDay();
  const daysToAdd = day === 6 ? 7 : (6 - day + 7) % 7;
  return addDays(result, daysToAdd);
}

function getNextSunday(saturday) {
  return addDays(saturday, 1);
}

export async function createStudyPlan(req, res) {
  try {
    const { batchId, name, description, startDate, examDate, targetLevel, weeks } = req.body;

    if (!batchId || !name || !startDate || !examDate || !targetLevel || !weeks) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const start = new Date(startDate);
    const end = addDays(start, weeks.length * 7);
    const exam = new Date(examDate);

    if (start >= exam) {
      return res.status(400).json({ message: "Start date must be before exam date" });
    }

    const existingPlan = await StudyPlan.findOne({ batchId });
    if (existingPlan) {
      return res.status(400).json({ message: "Batch ID already exists" });
    }

    for (const week of weeks) {
      if (week.saturdaySession?.instructorId) {
        const instructor = await User.findOne({ _id: week.saturdaySession.instructorId, role: "instructor" });
        if (!instructor) {
          return res.status(400).json({ message: `Invalid instructor for week ${week.weekNumber} Saturday` });
        }
      }
      if (week.sundaySession?.instructorId) {
        const instructor = await User.findOne({ _id: week.sundaySession.instructorId, role: "instructor" });
        if (!instructor) {
          return res.status(400).json({ message: `Invalid instructor for week ${week.weekNumber} Sunday` });
        }
      }
    }

    const studyPlan = new StudyPlan({
      batchId,
      name,
      description,
      startDate: start,
      endDate: end,
      examDate: exam,
      targetLevel,
      totalWeeks: weeks.length,
      status: "draft",
      weeks,
      createdBy: req.user._id,
    });

    await studyPlan.save();

    return res.status(201).json({
      message: "Study plan created successfully",
      studyPlan,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error creating study plan:", error);
    }
    return res.status(500).json({ message: "Server error creating study plan" });
  }
}

export async function getStudyPlans(req, res) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const plans = await StudyPlan.find(filter)
      .populate("weeks.saturdaySession.subjectId weeks.saturdaySession.instructorId")
      .populate("weeks.sundaySession.subjectId weeks.sundaySession.instructorId")
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ plans });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching study plans:", error);
    }
    return res.status(500).json({ message: "Server error fetching study plans" });
  }
}

export async function getStudyPlan(req, res) {
  try {
    const { id } = req.params;

    const plan = await StudyPlan.findById(id)
      .populate("weeks.saturdaySession.subjectId weeks.saturdaySession.instructorId")
      .populate("weeks.sundaySession.subjectId weeks.sundaySession.instructorId")
      .populate("weeks.saturdaySession.topics weeks.sundaySession.topics")
      .populate("enrolledStudents", "firstName lastName email")
      .populate("createdBy", "firstName lastName email");

    if (!plan) {
      return res.status(404).json({ message: "Study plan not found" });
    }

    // Calculate progress for the student
    let progress = 0;
    if (req.user && req.user.role === 'student') {
      // Logic to calculate progress based on completed topics/weeks
      // For now, we'll return a placeholder or simple calculation if available
      // In a real app, we'd query UserActivity or similar
      progress = 0; // Placeholder
    }

    return res.status(200).json({ plan, progress });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching study plan:", error);
    }
    return res.status(500).json({ message: "Server error fetching study plan" });
  }
}

export async function updateStudyPlan(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const plan = await StudyPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Study plan not found" });
    }

    if (plan.status === "active") {
      return res.status(400).json({ message: "Cannot update active study plan" });
    }

    Object.assign(plan, updates);
    await plan.save();

    return res.status(200).json({
      message: "Study plan updated successfully",
      plan,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error updating study plan:", error);
    }
    return res.status(500).json({ message: "Server error updating study plan" });
  }
}

export async function publishStudyPlan(req, res) {
  try {
    const { id } = req.params;

    const plan = await StudyPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Study plan not found" });
    }

    if (plan.status !== "draft") {
      return res.status(400).json({ message: "Only draft plans can be published" });
    }

    plan.status = "published";
    plan.publishedAt = new Date();
    await plan.save();

    return res.status(200).json({
      message: "Study plan published successfully",
      plan,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error publishing study plan:", error);
    }
    return res.status(500).json({ message: "Server error publishing study plan" });
  }
}

export async function activateStudyPlan(req, res) {
  try {
    const { id } = req.params;

    const plan = await StudyPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Study plan not found" });
    }

    if (plan.status !== "published") {
      return res.status(400).json({ message: "Only published plans can be activated" });
    }

    await StudyPlan.updateMany({ isActive: true }, { isActive: false });

    plan.status = "active";
    plan.isActive = true;
    await plan.save();

    return res.status(200).json({
      message: "Study plan activated successfully",
      plan,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error activating study plan:", error);
    }
    return res.status(500).json({ message: "Server error activating study plan" });
  }
}

export async function enrollStudent(req, res) {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    const plan = await StudyPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Study plan not found" });
    }

    if (plan.status !== "active" && plan.status !== "published") {
      return res.status(400).json({ message: "Cannot enroll in inactive plans" });
    }

    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (plan.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ message: "Student already enrolled" });
    }

    await plan.enrollStudents([studentId]);

    return res.status(200).json({
      message: "Student enrolled successfully",
      plan,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error enrolling student:", error);
    }
    return res.status(500).json({ message: "Server error enrolling student" });
  }
}

export async function addWeek(req, res) {
  try {
    const { id } = req.params;
    const weekData = req.body;

    const plan = await StudyPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Study plan not found" });
    }

    if (plan.status === "active") {
      return res.status(400).json({ message: "Cannot add weeks to active study plan" });
    }

    await plan.addWeek(weekData);

    return res.status(200).json({
      message: "Week added successfully",
      plan,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error adding week:", error);
    }
    return res.status(500).json({ message: "Server error adding week" });
  }
}

export async function updateWeek(req, res) {
  try {
    const { id, weekNumber } = req.params;
    const updates = req.body;

    const plan = await StudyPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Study plan not found" });
    }

    await plan.updateWeek(parseInt(weekNumber), updates);

    return res.status(200).json({
      message: "Week updated successfully",
      plan,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error updating week:", error);
    }
    return res.status(500).json({ message: error.message || "Server error updating week" });
  }
}

export async function updateSession(req, res) {
  try {
    const { id, weekNumber, day } = req.params;
    const sessionData = req.body;

    const plan = await StudyPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Study plan not found" });
    }

    if (day !== 'saturday' && day !== 'sunday') {
      return res.status(400).json({ message: "Day must be 'saturday' or 'sunday'" });
    }

    await plan.updateSession(parseInt(weekNumber), day, sessionData);

    return res.status(200).json({
      message: "Session updated successfully",
      plan,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error updating session:", error);
    }
    return res.status(500).json({ message: error.message || "Server error updating session" });
  }
}

export async function removeWeek(req, res) {
  try {
    const { id, weekNumber } = req.params;

    const plan = await StudyPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Study plan not found" });
    }

    if (plan.status === "active") {
      return res.status(400).json({ message: "Cannot remove weeks from active study plan" });
    }

    await plan.removeWeek(parseInt(weekNumber));

    return res.status(200).json({
      message: "Week removed successfully",
      plan,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error removing week:", error);
    }
    return res.status(500).json({ message: error.message || "Server error removing week" });
  }
}

export async function getActiveStudyPlan(req, res) {
  try {
    const plan = await StudyPlan.getActiveStudyPlan();

    if (!plan) {
      return res.status(404).json({ message: "No active study plan found" });
    }

    return res.status(200).json({ plan });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching active study plan:", error);
    }
    return res.status(500).json({ message: "Server error fetching active study plan" });
  }
}

export async function deleteStudyPlan(req, res) {
  try {
    const { id } = req.params;

    const plan = await StudyPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: "Study plan not found" });
    }

    if (plan.status === "active") {
      return res.status(400).json({ message: "Cannot delete active study plan" });
    }

    await plan.deleteOne();

    return res.status(200).json({ message: "Study plan deleted successfully" });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error deleting study plan:", error);
    }
    return res.status(500).json({ message: "Server error deleting study plan" });
  }
}
