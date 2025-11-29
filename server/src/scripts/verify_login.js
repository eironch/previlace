import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import User from "../models/User.js";
import connectDB from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, "../../.env");
dotenv.config({ path: envPath });

const verifyUser = async () => {
    try {
        await connectDB();
        const email = "instructor1@previlace.com";
        const password = "instructor1@previlace.com";

        const user = await User.findOne({ email }).select("+password");
        
        if (!user) {
            console.log("User NOT FOUND");
        } else {
            console.log("User FOUND");
            console.log("Role:", user.role);
            console.log("Stored Hashed Password:", user.password);
            
            const isMatch = await user.comparePassword(password);
            console.log("Password Match Result:", isMatch);
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyUser();
