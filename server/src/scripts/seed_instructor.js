import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import User from "../models/User.js";
import connectDB from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
const envPath = join(__dirname, "../../.env");
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env:", result.error);
} else {
    console.log("Loaded .env from:", envPath);
}

const seedInstructor = async () => {
    try {
        console.log("Connecting to DB...");
        console.log("URI:", process.env.MONGODB_URI ? "Defined" : "Undefined");

        await connectDB();
        console.log("Connected to DB");

        const instructorEmail = "instructor@previlace.com";
        const instructorPassword = "instructor@previlace.com";

        // 1. Cleanup ANY existing user with this email
        await User.deleteOne({ email: instructorEmail });
        await User.deleteOne({ email: "instructor@example.com" }); // Just in case

        console.log("Cleaned up existing instructor accounts.");

        // 2. Create fresh account
        const newInstructor = await User.create({
            email: instructorEmail,
            password: instructorPassword,
            firstName: "Instructor",
            lastName: "User",
            role: "instructor",
            isProfileComplete: true,
            isEmailVerified: true,
            bio: "I am a seeded instructor account.",
            phone: "09123456789",
        });

        console.log("Instructor account created successfully.");
        console.log(`Email: ${instructorEmail}`);
        console.log(`Password: ${instructorPassword}`);

        // 3. Verify password immediately
        const isMatch = await newInstructor.comparePassword(instructorPassword);
        console.log(`Password verification check: ${isMatch ? "PASSED" : "FAILED"}`);

        if (!isMatch) {
            throw new Error("Password verification failed immediately after creation!");
        }

        fs.writeFileSync('seed_result.txt', 'SUCCESS: Instructor seeded and verified');
        process.exit(0);
    } catch (error) {
        console.error("Error seeding instructor:", error);
        fs.writeFileSync('seed_result.txt', 'ERROR: ' + error.message);
        process.exit(1);
    }
};

seedInstructor();
