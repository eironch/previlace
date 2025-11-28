import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import RegistrationApplication from "./src/models/RegistrationApplication.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, ".env");
dotenv.config({ path: envPath });

const logFile = "debug_seed_output.txt";
const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + "\n");
};

const run = async () => {
    fs.writeFileSync(logFile, "Starting debug seed...\n");

    try {
        log(`URI: ${process.env.MONGODB_URI ? "Found" : "Missing"}`);

        await mongoose.connect(process.env.MONGODB_URI);
        log("Connected to MongoDB.");

        // 1. Count existing
        const countBefore = await RegistrationApplication.countDocuments();
        log(`Count before delete: ${countBefore}`);

        // 2. Delete
        await RegistrationApplication.deleteMany({});
        log("Executed deleteMany.");

        const countAfterDelete = await RegistrationApplication.countDocuments();
        log(`Count after delete: ${countAfterDelete}`);

        // 3. Insert 6 records
        const sampleRegistrations = [
            {
                registrationNumber: "REG-2025-001",
                courseInfo: {
                    date: new Date(),
                    courseEnrollingTo: "Intensive Review",
                    scheduledDays: "Sat-Sun",
                    time: "8:00 AM - 5:00 PM"
                },
                personalInfo: {
                    firstName: "John",
                    lastName: "Doe",
                    middleName: "A",
                    address: "123 Main St, Manila",
                    telNo: "02-123-4567",
                    mobile: "09171234567",
                    email: "john.doe@example.com",
                    facebook: "johndoe",
                    dateOfBirth: "1995-05-15",
                    placeOfBirth: "Quezon City",
                    civilStatus: "Single",
                    childrenCount: 0,
                    nationality: "Filipino",
                    emergencyContact: {
                        name: "Jane Doe",
                        number: "09177654321"
                    }
                },
                education: {
                    school: "University of the Philippines",
                    dateAttended: "2012-2016",
                    highestAttainment: "Bachelor's Degree",
                    languageSpoken: "English, Tagalog",
                    degree: "BS Computer Science"
                },
                professional: {
                    examTaken: "Civil Service Professional",
                    dateTaken: "2017",
                    company: "Tech Corp",
                    dateEmployment: "2017-Present",
                    position: "Software Engineer"
                },
                marketing: {
                    source: ["Website", "Facebook Account"]
                },
                status: "pending"
            },
            {
                registrationNumber: "REG-2025-002",
                courseInfo: {
                    date: new Date(),
                    courseEnrollingTo: "Comprehensive Review",
                    scheduledDays: "Mon-Fri",
                    time: "6:00 PM - 9:00 PM"
                },
                personalInfo: {
                    firstName: "Maria",
                    lastName: "Santos",
                    middleName: "B",
                    address: "456 Rizal Ave, Cebu City",
                    telNo: "032-987-6543",
                    mobile: "09181234567",
                    email: "maria.santos@example.com",
                    facebook: "mariasantos",
                    dateOfBirth: "1998-08-20",
                    placeOfBirth: "Cebu City",
                    civilStatus: "Married",
                    childrenCount: 1,
                    nationality: "Filipino",
                    emergencyContact: {
                        name: "Pedro Santos",
                        number: "09187654321"
                    }
                },
                education: {
                    school: "University of San Carlos",
                    dateAttended: "2015-2019",
                    highestAttainment: "Bachelor's Degree",
                    languageSpoken: "English, Cebuano, Tagalog",
                    degree: "BS Accountancy"
                },
                professional: {
                    examTaken: "CPA Board Exam",
                    dateTaken: "2019",
                    company: "Audit Firm",
                    dateEmployment: "2019-Present",
                    position: "Auditor"
                },
                marketing: {
                    source: ["Someone You Know"]
                },
                status: "pending"
            },
            {
                registrationNumber: "REG-2025-003",
                courseInfo: {
                    date: new Date(),
                    courseEnrollingTo: "Online Review",
                    scheduledDays: "Flexible",
                    time: "Flexible"
                },
                personalInfo: {
                    firstName: "Robert",
                    lastName: "Lee",
                    middleName: "C",
                    address: "789 Mabini St, Davao City",
                    telNo: "082-555-1234",
                    mobile: "09191234567",
                    email: "robert.lee@example.com",
                    facebook: "robertlee",
                    dateOfBirth: "2000-01-10",
                    placeOfBirth: "Davao City",
                    civilStatus: "Single",
                    childrenCount: 0,
                    nationality: "Filipino",
                    emergencyContact: {
                        name: "Susan Lee",
                        number: "09197654321"
                    }
                },
                education: {
                    school: "Ateneo de Davao University",
                    dateAttended: "2018-2022",
                    highestAttainment: "Bachelor's Degree",
                    languageSpoken: "English, Tagalog",
                    degree: "BS Psychology"
                },
                professional: {
                    examTaken: "Psychometrician Licensure Exam",
                    dateTaken: "2022",
                    company: "HR Solutions",
                    dateEmployment: "2022-Present",
                    position: "HR Assistant"
                },
                marketing: {
                    source: ["Facebook Account"]
                },
                status: "pending"
            },
            {
                registrationNumber: "REG-2025-004",
                courseInfo: {
                    date: new Date(),
                    courseEnrollingTo: "Intensive Review",
                    scheduledDays: "Sat-Sun",
                    time: "8:00 AM - 5:00 PM"
                },
                personalInfo: {
                    firstName: "Elena",
                    lastName: "Cruz",
                    middleName: "D",
                    address: "101 Luna St, Iloilo City",
                    telNo: "033-333-1111",
                    mobile: "09201234567",
                    email: "elena.cruz@example.com",
                    facebook: "elenacruz",
                    dateOfBirth: "1997-03-25",
                    placeOfBirth: "Iloilo City",
                    civilStatus: "Single",
                    childrenCount: 0,
                    nationality: "Filipino",
                    emergencyContact: {
                        name: "Mario Cruz",
                        number: "09207654321"
                    }
                },
                education: {
                    school: "West Visayas State University",
                    dateAttended: "2014-2018",
                    highestAttainment: "Bachelor's Degree",
                    languageSpoken: "English, Hiligaynon, Tagalog",
                    degree: "BS Education"
                },
                professional: {
                    examTaken: "LET",
                    dateTaken: "2018",
                    company: "Public School",
                    dateEmployment: "2018-Present",
                    position: "Teacher I"
                },
                marketing: {
                    source: ["Tarpaulin"]
                },
                status: "pending"
            },
            {
                registrationNumber: "REG-2025-005",
                courseInfo: {
                    date: new Date(),
                    courseEnrollingTo: "Comprehensive Review",
                    scheduledDays: "Mon-Fri",
                    time: "6:00 PM - 9:00 PM"
                },
                personalInfo: {
                    firstName: "Michael",
                    lastName: "Tan",
                    middleName: "E",
                    address: "202 Burgos St, Baguio City",
                    telNo: "074-444-2222",
                    mobile: "09211234567",
                    email: "michael.tan@example.com",
                    facebook: "michaeltan",
                    dateOfBirth: "1999-11-12",
                    placeOfBirth: "Baguio City",
                    civilStatus: "Single",
                    childrenCount: 0,
                    nationality: "Filipino",
                    emergencyContact: {
                        name: "Anna Tan",
                        number: "09217654321"
                    }
                },
                education: {
                    school: "Saint Louis University",
                    dateAttended: "2017-2021",
                    highestAttainment: "Bachelor's Degree",
                    languageSpoken: "English, Ilocano, Tagalog",
                    degree: "BS Civil Engineering"
                },
                professional: {
                    examTaken: "Civil Engineering Board Exam",
                    dateTaken: "2021",
                    company: "Construction Firm",
                    dateEmployment: "2021-Present",
                    position: "Junior Engineer"
                },
                marketing: {
                    source: ["Website"]
                },
                status: "pending"
            },
            {
                registrationNumber: "REG-2025-006",
                courseInfo: {
                    date: new Date(),
                    courseEnrollingTo: "Online Review",
                    scheduledDays: "Flexible",
                    time: "Flexible"
                },
                personalInfo: {
                    firstName: "Sarah",
                    lastName: "Garcia",
                    middleName: "F",
                    address: "303 Rizal St, Cagayan de Oro",
                    telNo: "088-888-3333",
                    mobile: "09221234567",
                    email: "sarah.garcia@example.com",
                    facebook: "sarahgarcia",
                    dateOfBirth: "1996-07-08",
                    placeOfBirth: "Cagayan de Oro",
                    civilStatus: "Married",
                    childrenCount: 2,
                    nationality: "Filipino",
                    emergencyContact: {
                        name: "David Garcia",
                        number: "09227654321"
                    }
                },
                education: {
                    school: "Xavier University",
                    dateAttended: "2013-2017",
                    highestAttainment: "Bachelor's Degree",
                    languageSpoken: "English, Cebuano, Tagalog",
                    degree: "BS Business Administration"
                },
                professional: {
                    examTaken: "None",
                    dateTaken: "",
                    company: "BPO Company",
                    dateEmployment: "2017-Present",
                    position: "Team Leader"
                },
                marketing: {
                    source: ["Facebook Account"]
                },
                status: "pending"
            }
        ];

        const created = await RegistrationApplication.insertMany(sampleRegistrations);
        log(`Inserted ${created.length} records.`);

        // 4. Verify
        const countFinal = await RegistrationApplication.countDocuments();
        log(`Final count: ${countFinal}`);

        const all = await RegistrationApplication.find({}, 'personalInfo.firstName registrationNumber');
        log("Records found:");
        all.forEach(r => log(`- ${r.personalInfo.firstName} (${r.registrationNumber})`));

        process.exit(0);

    } catch (error) {
        log(`ERROR: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
};

run();
