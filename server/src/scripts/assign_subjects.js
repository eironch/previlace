import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import connectDB from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, "../../.env");
dotenv.config({ path: envPath });

const assignSubjects = async () => {
    try {
        await connectDB();

        const instructor = await User.findOne({ email: "instructor@previlace.com" });
        if (!instructor) {
            console.error("Instructor not found");
            process.exit(1);
        }

        const subjectsToAssign = ["Numerical Reasoning", "Analytical Reasoning"];

        for (const name of subjectsToAssign) {
            const subject = await Subject.findOne({ name });
            if (subject) {
                subject.instructor = instructor._id;
                await subject.save();
                console.log(`Assigned ${name} to instructor.`);
            } else {
                console.log(`Subject ${name} not found.`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

assignSubjects();
