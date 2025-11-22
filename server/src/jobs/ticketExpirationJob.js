import cron from "node-cron";
import { expireOldTickets } from "../controllers/inquiryTicketController.js";

function startTicketExpirationJob() {
  cron.schedule("0 * * * *", expireOldTickets);

  if (process.env.NODE_ENV === "development") {
    console.error("Ticket expiration job started");
  }
}

export { startTicketExpirationJob };
