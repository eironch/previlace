import nodemailer from "nodemailer";

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // App password
  },
});

const emailService = {
  sendEmail: async ({ to, subject, html }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn("Email credentials not found. Skipping email sending.");
      return;
    }

    try {
      const info = await transporter.sendMail({
        from: `"Civilearn Review Center" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log("Message sent: %s", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending email:", error);
      // Don't throw error to prevent blocking the main flow
    }
  },

  templates: {
    ticketResponse: (studentName, ticketTitle, link) => `
      <h1>New Response to your Ticket</h1>
      <p>Hi ${studentName},</p>
      <p>You have received a response to your ticket: <strong>${ticketTitle}</strong></p>
      <p><a href="${link}">Click here to view the response</a></p>
    `,
    studyReminder: (studentName, link) => `
      <h1>Time to Study!</h1>
      <p>Hi ${studentName},</p>
      <p>Keep your streak alive! Log in now to continue your review.</p>
      <p><a href="${link}">Start Studying</a></p>
    `,
  },
};

export default emailService;
