import Notification from "../models/Notification.js";
import emailService from "./emailService.js";
import User from "../models/User.js";

const notificationService = {
  createNotification: async ({
    recipientId,
    type,
    title,
    message,
    link,
    data,
    sendEmail = false,
  }) => {
    try {
      const notification = await Notification.create({
        recipient: recipientId,
        type,
        title,
        message,
        link,
        data,
      });

      // If real-time socket is implemented, emit event here
      // io.to(recipientId).emit('new_notification', notification);

      if (sendEmail) {
        const user = await User.findById(recipientId);
        if (user && user.email) {
          // Determine email template based on type
          let emailHtml = `<p>${message}</p><p><a href="${
            process.env.CLIENT_URL || "http://localhost:5173"
          }${link}">View Details</a></p>`;
          
          if (type === "ticket_response") {
            emailHtml = emailService.templates.ticketResponse(
              user.firstName,
              title,
              `${process.env.CLIENT_URL || "http://localhost:5173"}${link}`
            );
          }

          await emailService.sendEmail({
            to: user.email,
            subject: title,
            html: emailHtml,
          });
        }
      }

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  },
};

export default notificationService;
