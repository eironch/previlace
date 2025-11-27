import mongoose from "mongoose";

const registrationApplicationSchema = new mongoose.Schema(
    {
        registrationNumber: {
            type: String,
            unique: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        courseInfo: {
            date: Date,
            courseEnrollingTo: String,
            scheduledDays: String,
            time: String,
        },
        personalInfo: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            middleName: String,
            address: String,
            telNo: String,
            mobile: { type: String, required: true },
            email: { type: String, required: true },
            facebook: String,
            dateOfBirth: Date,
            placeOfBirth: String,
            civilStatus: String,
            childrenCount: Number,
            nationality: String,
            emergencyContact: {
                name: String,
                number: String,
            },
        },
        education: {
            school: String,
            dateAttended: String,
            highestAttainment: String,
            languageSpoken: String,
            degree: String,
        },
        professional: {
            examTaken: String,
            dateTaken: String,
            company: String,
            dateEmployment: String,
            position: String,
        },
        marketing: {
            source: [String], // Array for checkboxes
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        createdUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("RegistrationApplication", registrationApplicationSchema);
