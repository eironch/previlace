import InstructorAvailability from "../models/InstructorAvailability.js";
import User from "../models/User.js";
import Subject from "../models/Subject.js";

export async function setAvailability(req, res) {
  try {
    const { weeklySlots, specificDates, subjects, maxSessionsPerWeek } = req.body;
    const instructorId = req.user._id;

    const instructor = await User.findOne({ _id: instructorId, role: "instructor" });
    if (!instructor) {
      return res.status(403).json({ message: "Only instructors can set availability" });
    }

    if (subjects && subjects.length > 0) {
      const validSubjects = await Subject.find({ _id: { $in: subjects } });
      if (validSubjects.length !== subjects.length) {
        return res.status(400).json({ message: "Invalid subject IDs provided" });
      }
    }

    let availability = await InstructorAvailability.findOne({ instructorId });

    if (availability) {
      availability.weeklySlots = weeklySlots || availability.weeklySlots;
      availability.weekendAvailability = specificDates || availability.weekendAvailability;
      availability.subjects = subjects || availability.subjects;
      availability.maxSessionsPerWeek = maxSessionsPerWeek || availability.maxSessionsPerWeek;
      await availability.save();
    } else {
      availability = await InstructorAvailability.create({
        instructorId,
        weeklySlots: weeklySlots || [],
        weekendAvailability: specificDates || [], // Map specificDates from frontend to weekendAvailability in DB
        subjects: subjects || [],
        maxSessionsPerWeek: maxSessionsPerWeek || 4,
      });
    }

    const populated = await InstructorAvailability.findById(availability._id)
      .populate("subjects", "name");

    return res.status(200).json({
      message: "Availability set successfully",
      availability: populated,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error setting availability:", error);
    }
    return res.status(500).json({ message: "Server error setting availability" });
  }
}

export async function getAvailability(req, res) {
  try {
    const { instructorId } = req.params;
    const userId = instructorId || req.user._id;

    const availability = await InstructorAvailability.findOne({ instructorId: userId })
      .populate("subjects", "name");

    if (!availability) {
      return res.status(200).json({
        instructorId: userId,
        weeklySlots: [],
        weekendAvailability: [],
        subjects: [],
        maxSessionsPerWeek: 4,
      });
    }

    return res.status(200).json({ availability });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching availability:", error);
    }
    return res.status(500).json({ message: "Server error fetching availability" });
  }
}

export async function getAllAvailabilities(req, res) {
  try {
    const availabilities = await InstructorAvailability.find()
      .populate("instructorId", "firstName lastName email")
      .populate("subjects", "name");

    return res.status(200).json({ availabilities });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching availabilities:", error);
    }
    return res.status(500).json({ message: "Server error fetching availabilities" });
  }
}

export async function addWeeklySlot(req, res) {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;
    const instructorId = req.user._id;

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ message: "Invalid day of week (0-6)" });
    }

    let availability = await InstructorAvailability.findOne({ instructorId });

    if (!availability) {
      availability = await InstructorAvailability.create({
        instructorId,
        weeklySlots: [{ dayOfWeek, startTime, endTime, isAvailable: true }],
      });
    } else {
      availability.weeklySlots.push({ dayOfWeek, startTime, endTime, isAvailable: true });
      await availability.save();
    }

    return res.status(200).json({
      message: "Weekly slot added successfully",
      availability,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error adding weekly slot:", error);
    }
    return res.status(500).json({ message: "Server error adding weekly slot" });
  }
}

export async function removeWeeklySlot(req, res) {
  try {
    const { slotId } = req.params;
    const instructorId = req.user._id;

    const availability = await InstructorAvailability.findOne({ instructorId });

    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }

    availability.weeklySlots = availability.weeklySlots.filter(
      slot => slot._id.toString() !== slotId
    );
    await availability.save();

    return res.status(200).json({
      message: "Weekly slot removed successfully",
      availability,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error removing weekly slot:", error);
    }
    return res.status(500).json({ message: "Server error removing weekly slot" });
  }
}

export async function addSubject(req, res) {
  try {
    const { subjectId } = req.body;
    const instructorId = req.user._id;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    let availability = await InstructorAvailability.findOne({ instructorId });

    if (!availability) {
      availability = await InstructorAvailability.create({
        instructorId,
        subjects: [subjectId],
      });
    } else {
      if (!availability.subjects.includes(subjectId)) {
        availability.subjects.push(subjectId);
        await availability.save();
      }
    }

    const populated = await InstructorAvailability.findById(availability._id)
      .populate("subjects", "name");

    return res.status(200).json({
      message: "Subject added successfully",
      availability: populated,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error adding subject:", error);
    }
    return res.status(500).json({ message: "Server error adding subject" });
  }
}

export async function removeSubject(req, res) {
  try {
    const { subjectId } = req.params;
    const instructorId = req.user._id;

    const availability = await InstructorAvailability.findOne({ instructorId });

    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }

    availability.subjects = availability.subjects.filter(
      id => id.toString() !== subjectId
    );
    await availability.save();

    const populated = await InstructorAvailability.findById(availability._id)
      .populate("subjects", "name");

    return res.status(200).json({
      message: "Subject removed successfully",
      availability: populated,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error removing subject:", error);
    }
    return res.status(500).json({ message: "Server error removing subject" });
  }
}

export async function getAvailableInstructors(req, res) {
  try {
    const { date, dayOfWeek, subjectId } = req.query;

    // 1. Fetch all availabilities first (we need to filter in memory for complex date logic)
    // Optimization: We can still filter by subject at DB level if provided
    const dbFilter = {};
    if (subjectId) {
      dbFilter.subjects = subjectId;
    }

    const allAvailabilities = await InstructorAvailability.find(dbFilter)
      .populate("instructorId", "firstName lastName email")
      .populate("subjects", "name");

    // 2. Filter based on date/schedule logic
    const availableInstructors = allAvailabilities.filter((avail) => {
      if (!avail.instructorId) return false; // Skip orphaned records

      // If a specific date is provided, check for overrides first
      if (date) {
        const queryDate = new Date(date);
        const dateStr = queryDate.toISOString().split('T')[0];
        
        // Check specific date override
        const override = avail.weekendAvailability.find(
          (d) => new Date(d.date).toISOString().split('T')[0] === dateStr
        );

        if (override) {
          return override.isAvailable;
        }

        // Fallback to weekly slot
        const day = queryDate.getDay();
        const hasSlot = avail.weeklySlots.some(
          (slot) => slot.dayOfWeek === day && slot.isAvailable
        );
        return hasSlot;
      }

      // Fallback: If only dayOfWeek is provided (legacy/general check)
      if (dayOfWeek !== undefined) {
        return avail.weeklySlots.some(
          (slot) => slot.dayOfWeek === parseInt(dayOfWeek) && slot.isAvailable
        );
      }

      // If no date/day filter, return all (subject filter already applied)
      return true;
    });

    return res.status(200).json({ availabilities: availableInstructors });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching available instructors:", error);
    }
    return res.status(500).json({ message: "Server error fetching available instructors" });
  }
}
