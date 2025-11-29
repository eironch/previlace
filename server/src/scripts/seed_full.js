import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { addDays, startOfWeek, format } from "date-fns";

// Models
import User from "../models/User.js";
import Subject from "../models/Subject.js";
import Topic from "../models/Topic.js";
import InstructorAvailability from "../models/InstructorAvailability.js";
import WeekendClass from "../models/WeekendClass.js";
import InquiryTicket from "../models/InquiryTicket.js";
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

const INSTRUCTORS = [
    {
        email: "instructor1@previlace.com",
        firstName: "Maria",
        lastName: "Santos",
        bio: "Expert in Mathematics and Numerical Ability with 10 years of teaching experience.",
        subjects: ["Mathematics", "Numerical Ability"]
    },
    {
        email: "instructor2@previlace.com",
        firstName: "Juan",
        lastName: "Dela Cruz",
        bio: "Specializes in Philippine Constitution and General Information.",
        subjects: ["General Information", "Philippine Constitution"]
    },
    {
        email: "instructor3@previlace.com",
        firstName: "Ana",
        lastName: "Reyes",
        bio: "English and Verbal Ability instructor. Helps students improve their grammar and reading comprehension.",
        subjects: ["Verbal Ability", "Grammar", "Vocabulary", "Reading Comprehension"]
    },
    {
        email: "instructor4@previlace.com",
        firstName: "Pedro",
        lastName: "Garcia",
        bio: "Logic and Analytical Reasoning expert.",
        subjects: ["Analytical Reasoning", "Logic"]
    },
    {
        email: "instructor5@previlace.com",
        firstName: "Elena",
        lastName: "Torres",
        bio: "Clerical Ability and Office Procedures instructor.",
        subjects: ["Clerical Ability", "Clerical"]
    }
];

const seedFull = async () => {
    try {
        console.log("Connecting to DB...");
        await connectDB();
        console.log("Connected to DB");

        // 1. Clear relevant collections (optional, but good for clean state)
        // Note: Be careful with clearing Users if you want to keep student data.
        // Here we only clear instructors we are about to seed.
        console.log("Cleaning up old data...");
        await User.deleteMany({ email: { $in: INSTRUCTORS.map(i => i.email) } });
        await InstructorAvailability.deleteMany({});
        await WeekendClass.deleteMany({});
        await InquiryTicket.deleteMany({});
        
        // Fetch Subjects and Topics for reference
        const subjects = await Subject.find({});
        const topics = await Topic.find({});
        
        if (subjects.length === 0) {
            throw new Error("No subjects found. Please seed subjects first.");
        }

        // 2. Seed Instructors
        console.log("Seeding Instructors...");
        const createdInstructors = [];
        for (const instData of INSTRUCTORS) {
            const instructor = await User.create({
                email: instData.email,
                password: instData.email, // Password same as email for demo
                firstName: instData.firstName,
                lastName: instData.lastName,
                role: "instructor",
                isProfileComplete: true,
                isEmailVerified: true,
                bio: instData.bio,
                phone: "09" + Math.floor(Math.random() * 1000000000),
            });
            createdInstructors.push({ ...instructor.toObject(), subjects: instData.subjects });
            console.log(`Created instructor: ${instData.email}`);
        }

        // 3. Seed Availability
        console.log("Seeding Availability...");
        for (const instructor of createdInstructors) {
            // Find subject IDs matching instructor's expertise
            const instructorSubjectIds = subjects
                .filter(s => instructor.subjects.some(sub => s.name.includes(sub)))
                .map(s => s._id);

            // If no specific match, assign random subjects
            const assignedSubjectIds = instructorSubjectIds.length > 0 
                ? instructorSubjectIds 
                : subjects.slice(0, 2).map(s => s._id);

            // Create availability
            // Randomly assign available days (e.g., Sat or Sun or Both)
            const availableDays = [];
            if (Math.random() > 0.3) availableDays.push(6); // Saturday
            if (Math.random() > 0.3) availableDays.push(0); // Sunday
            if (availableDays.length === 0) availableDays.push(6); // Ensure at least one day

            const weeklySlots = availableDays.map(day => ({
                dayOfWeek: day,
                startTime: "08:00",
                endTime: "17:00",
                isAvailable: true
            }));

            await InstructorAvailability.create({
                instructorId: instructor._id,
                weeklySlots,
                subjects: assignedSubjectIds,
                maxSessionsPerWeek: 4
            });
            console.log(`Set availability for ${instructor.firstName}`);
        }

        // 4. Seed Weekend Classes (Sessions)
        console.log("Seeding Weekend Classes...");
        const today = new Date();
        const upcomingWeekends = [];
        let current = startOfWeek(today);
        
        // Generate next 4 weekends
        for (let i = 0; i < 4; i++) {
            const saturday = addDays(current, 6 + (i * 7));
            const sunday = addDays(current, 0 + ((i + 1) * 7));
            upcomingWeekends.push(saturday, sunday);
        }

        for (const date of upcomingWeekends) {
            // Create 2-3 sessions per day
            const sessionsCount = 2 + Math.floor(Math.random() * 2);
            
            for (let i = 0; i < sessionsCount; i++) {
                // Pick random subject and topic
                const subject = subjects[Math.floor(Math.random() * subjects.length)];
                const subjectTopics = topics.filter(t => t.subjectId.toString() === subject._id.toString());
                
                if (subjectTopics.length === 0) continue;
                const topic = subjectTopics[Math.floor(Math.random() * subjectTopics.length)];

                // Find available instructor for this day and subject
                const dayOfWeek = date.getDay();
                const availableInstructors = await InstructorAvailability.find({
                    "weeklySlots.dayOfWeek": dayOfWeek,
                    subjects: subject._id
                });

                if (availableInstructors.length === 0) continue;
                
                const availInst = availableInstructors[Math.floor(Math.random() * availableInstructors.length)];
                
                // Create session
                const startTime = `${8 + (i * 3)}:00`;
                const endTime = `${10 + (i * 3)}:00`; // 2 hours duration

                await WeekendClass.create({
                    subject: subject._id,
                    topic: topic._id,
                    description: `Deep dive into ${topic.name}`,
                    date: date,
                    startTime,
                    endTime,
                    instructor: availInst.instructorId,
                    mode: "Online",
                    meetingLink: "https://meet.google.com/abc-defg-hij",
                    status: "scheduled"
                });
            }
        }
        console.log("Seeded weekend classes.");

        // 5. Seed Inquiry Tickets
        console.log("Seeding Inquiry Tickets...");
        
        // Define students to seed
        const studentsToSeed = [
            { email: "student@previlace.com", firstName: "Demo", lastName: "Student" },
            { email: "student1@previlace.com", firstName: "Alice", lastName: "Reyes" },
            { email: "student2@previlace.com", firstName: "Bob", lastName: "Santos" },
            { email: "student3@previlace.com", firstName: "Charlie", lastName: "Dizon" }
        ];

        const createdStudents = [];

        for (const s of studentsToSeed) {
            let student = await User.findOne({ email: s.email });
            if (!student) {
                student = await User.create({
                    email: s.email,
                    password: "password123",
                    firstName: s.firstName,
                    lastName: s.lastName,
                    role: "student",
                    isProfileComplete: true,
                    isEmailVerified: true
                });
                console.log(`Created student: ${s.email}`);
            } else {
                console.log(`Student exists: ${s.email}`);
            }
            createdStudents.push(student);
        }

        const ticketTemplates = [
            { title: "Clarification on Algebra", question: "I'm having trouble understanding the quadratic formula application in the module.", subject: "Mathematics" },
            { title: "Constitution Article III", question: "Can you explain the Bill of Rights in simpler terms?", subject: "Philippine Constitution" },
            { title: "Verbal Analogy Help", question: "I keep getting the relationship wrong in these analogy questions.", subject: "Verbal Ability" },
            { title: "Logic Puzzle Confusion", question: "The seating arrangement puzzle in the mock exam seems impossible.", subject: "Analytical Reasoning" },
            { title: "Filing System Inquiry", question: "What are the standard rules for alphabetic filing used in the exam?", subject: "Clerical Ability" },
            { title: "Mock Exam Schedule", question: "When will the next full-length mock exam be available?", subject: "General Information" },
            { title: "Score Discrepancy", question: "I think my score for the last quiz was calculated incorrectly.", subject: "Mathematics" },
            { title: "Study Plan Adjustment", question: "Can I adjust my study plan to focus more on Math?", subject: "General Information" }
        ];

        const statuses = ["open", "in_progress", "resolved"];

        for (const student of createdStudents) {
            console.log(`Creating tickets for student: ${student.email}`);
            
            // Create a ticket for EACH instructor
            for (const instructor of createdInstructors) {
                const template = ticketTemplates[Math.floor(Math.random() * ticketTemplates.length)];
                
                // Find relevant subject or default to first
                const subject = subjects.find(s => s.name.includes(template.subject)) || subjects[0];
                
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                
                const ticket = await InquiryTicket.create({
                    student: student._id,
                    subject: subject._id,
                    instructor: instructor._id,
                    title: template.title,
                    question: template.question,
                    status: status,
                    priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
                    expiresAt: addDays(new Date(), 7),
                    createdAt: addDays(new Date(), -Math.floor(Math.random() * 10)) // Created in last 10 days
                });

                // Add responses for non-open tickets
                if (status !== "open") {
                    // Instructor response
                    await ticket.addResponse(instructor._id, `Hi ${student.firstName}, thanks for reaching out. ${status === 'resolved' ? 'Here is the explanation...' : 'I am looking into this.'}`);
                    
                    if (Math.random() > 0.5) {
                        // Student reply
                        await ticket.addResponse(student._id, "Thank you for the quick response!");
                    }
                }
            }
        }
        console.log("Seeded inquiry tickets: All students connected to all instructors.");

        fs.writeFileSync('seed_full_result.txt', 'SUCCESS: Full seed completed');
        console.log("Full seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding full data:", error);
        fs.writeFileSync('seed_full_result.txt', 'ERROR: ' + error.message);
        process.exit(1);
    }
};

seedFull();
