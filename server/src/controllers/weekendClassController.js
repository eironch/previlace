import WeekendClass from "../models/WeekendClass.js";
import { AppError } from "../utils/AppError.js";

export const getUpcomingClass = async (req, res, next) => {
  try {
    const upcomingClass = await WeekendClass.findOne({
      date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      status: { $ne: "cancelled" },
    }).sort({ date: 1 });

    res.json(upcomingClass);
  } catch (error) {
    next(error);
  }
};

export const createOrUpdateClass = async (req, res, next) => {
  try {
    const { topic, description, date, startTime, endTime, meetingLink } = req.body;

    // For simplicity, we'll just create a new one or update the existing one for the given date
    // But user asked to "set the time", implying managing the schedule.
    // Let's just create a new one.
    
    const newClass = await WeekendClass.create({
      topic,
      description,
      date,
      startTime,
      endTime,
      meetingLink,
      instructor: req.user.id,
    });

    res.status(201).json(newClass);
  } catch (error) {
    next(error);
  }
};

export default {
  getUpcomingClass,
  createOrUpdateClass,
};
