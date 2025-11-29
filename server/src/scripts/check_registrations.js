import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import connectDB from "../config/database.js";
import RegistrationApplication from "../models/RegistrationApplication.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
const envPath = join(__dirname, "../../.env");
dotenv.config({ path: envPath });

const checkRegistrations = async () => {
    try {
        await connectDB();
        console.log("Connected to DB");

        const count = await RegistrationApplication.countDocuments();
        console.log(`Total Registrations in DB: ${count}`);

        const all = await RegistrationApplication.find({});
        console.log("Registrations:", JSON.stringify(all, null, 2));

        process.exit(0);
    } catch (error) {
        console.error("Error checking registrations:", error);
        process.exit(1);
    }
};

checkRegistrations();
