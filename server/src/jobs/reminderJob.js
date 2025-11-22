import cron from "node-cron";
import User from "../models/User.js";
import InquiryTicket from "../models/InquiryTicket.js";
import notificationService from "../services/notificationService.js";

export const startReminderJobs = () => {
  // Daily Streak Reminder at 6 PM
  cron.schedule("0 18 * * *", async () => {
    console.log("Running daily streak reminder job...");
    try {
      // Find users who haven't studied today (simplified logic)
      // In a real app, we'd check UserActivity for today
      const users = await User.find({ "streak.lastActiveDate": { $lt: new Date().setHours(0, 0, 0, 0) } });
      
      for (const user of users) {
        await notificationService.createNotification({
          recipientId: user._id,
          type: "study_reminder",
          title: "Keep your streak alive!",
          message: "You haven't studied yet today. Take a quick quiz to maintain your streak!",
          link: "/dashboard/quiz",
          sendEmail: true,
        });
      }
    } catch (error) {
      console.error("Error in streak reminder job:", error);
    }
  });

  // Hourly Ticket Expiration Check
  cron.schedule("0 * * * *", async () => {
    console.log("Running ticket expiration job...");
    try {
      const now = new Date();
      const expiredTickets = await InquiryTicket.find({
        expiresAt: { $lt: now },
        status: { $in: ["open", "in_progress"] },
      });

      for (const ticket of expiredTickets) {
        ticket.status = "expired";
        await ticket.save();
        
        // Notify student
        await notificationService.createNotification({
          recipientId: ticket.student,
          type: "system",
          title: "Ticket Expired",
          message: `Your ticket "${ticket.title}" has expired.`,
          link: `/dashboard/tickets`,
        });
      }
    } catch (error) {
      console.error("Error in ticket expiration job:", error);
    }
  });
};
