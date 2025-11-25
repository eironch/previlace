import WeekendClass from "../models/WeekendClass.js";
import User from "../models/User.js";
import Topic from "../models/Topic.js";
import Subject from "../models/Subject.js";

export const getAllClasses = async (req, res) => {
  try {
    const { startDate, endDate, instructorId } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (instructorId) {
      query.instructor = instructorId;
    }

    const classes = await WeekendClass.find(query)
      .populate("instructor", "firstName lastName email")
      .populate("subject", "name code")
      .populate("topic", "name")
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createClass = async (req, res) => {
  try {
    const {
      subject,
      topic,
      description,
      date,
      startTime,
      endTime,
      instructor,
      mode,
      meetingLink,
      location,
    } = req.body;

    // Basic validation
    if (!subject || !topic || !date || !startTime || !endTime || !instructor || !mode) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check for conflicts (basic check: same instructor, same date, overlapping time logic omitted for brevity but recommended)
    // For now, just check if instructor has a class at the exact same start time on the same date
    const existingClass = await WeekendClass.findOne({
      instructor,
      date: new Date(date),
      startTime,
      status: { $ne: "cancelled" },
    });

    if (existingClass) {
      return res.status(409).json({
        success: false,
        message: "Instructor already has a class scheduled at this time.",
      });
    }

    const newClass = await WeekendClass.create({
      subject,
      topic,
      description,
      date: new Date(date),
      startTime,
      endTime,
      instructor,
      mode,
      meetingLink,
      location,
    });

    const populatedClass = await WeekendClass.findById(newClass._id)
      .populate("instructor", "firstName lastName")
      .populate("subject", "name")
      .populate("topic", "name");

    res.status(201).json({ success: true, data: populatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedClass = await WeekendClass.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("instructor", "firstName lastName")
      .populate("subject", "name")
      .populate("topic", "name");

    if (!updatedClass) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    res.status(200).json({ success: true, data: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClass = await WeekendClass.findByIdAndDelete(id);

    if (!deletedClass) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    res.status(200).json({ success: true, message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUpcomingClass = async (req, res) => {
    try {
        // Logic to get the single most relevant upcoming class, or list of them
        // For the widget on dashboard
        const upcoming = await WeekendClass.findOne({
            date: { $gte: new Date() },
            status: { $ne: 'cancelled' }
        })
        .sort({ date: 1, startTime: 1 })
        .populate('topic', 'name')
        .populate('subject', 'name');

        res.status(200).json(upcoming);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
