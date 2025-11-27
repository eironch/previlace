import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Subject from "../models/Subject.js";
import connectDB from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, "../../.env");
dotenv.config({ path: envPath });

const listSubjects = async () => {
    try {
        await connectDB();
        const subjects = await Subject.find({});
        console.log("Subjects found:", subjects.map(s => ({ id: s._id, name: s.name })));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listSubjects();
