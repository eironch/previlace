import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import connectDB from "./src/config/database.js";
import RegistrationApplication from "./src/models/RegistrationApplication.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
const envPath = join(__dirname, ".env");
dotenv.config({ path: envPath });

const checkRegistrations = async () => {
    try {
        await connectDB();

        const count = await RegistrationApplication.countDocuments();
        const all = await RegistrationApplication.find({});

        const output = `Total: ${count}\nData: ${JSON.stringify(all, null, 2)}`;
        fs.writeFileSync('check_output.txt', output);

        console.log("Check complete.");
        process.exit(0);
    } catch (error) {
        console.error("Error checking registrations:", error);
        fs.writeFileSync('check_output.txt', `Error: ${error.message}`);
        process.exit(1);
    }
};

checkRegistrations();
