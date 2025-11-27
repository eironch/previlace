import RegistrationApplication from "../models/RegistrationApplication.js";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";

export const submitApplication = async (req, res, next) => {
    try {
        // Generate Registration Number: REG-YYYY-XXXX (e.g., REG-2023-0001)
        const year = new Date().getFullYear();
        const count = await RegistrationApplication.countDocuments({
            createdAt: {
                $gte: new Date(year, 0, 1),
                $lt: new Date(year + 1, 0, 1)
            }
        });
        const sequence = String(count + 1).padStart(4, '0');
        const registrationNumber = `REG-${year}-${sequence}`;

        const application = await RegistrationApplication.create({
            ...req.body,
            registrationNumber
        });

        res.status(201).json({
            success: true,
            data: application,
            message: "Application submitted successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const getApplications = async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const applications = await RegistrationApplication.find(filter)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: applications,
        });
    } catch (error) {
        next(error);
    }
};

export const getApplicationById = async (req, res, next) => {
    try {
        const application = await RegistrationApplication.findById(req.params.id);
        if (!application) {
            throw new AppError("Application not found", 404);
        }
        res.status(200).json({
            success: true,
            data: application,
        });
    } catch (error) {
        next(error);
    }
};

export const approveApplication = async (req, res, next) => {
    try {
        const application = await RegistrationApplication.findById(req.params.id);
        if (!application) {
            throw new AppError("Application not found", 404);
        }

        if (application.status === "approved") {
            throw new AppError("Application already approved", 400);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: application.personalInfo.email });
        if (existingUser) {
            throw new AppError("User with this email already exists", 400);
        }

        // Create User
        // Default password generation: LastName + "123!" (e.g., "Doe123!")
        const defaultPassword = `${application.personalInfo.lastName}123!`;

        const newUser = await User.create({
            email: application.personalInfo.email,
            password: defaultPassword,
            firstName: application.personalInfo.firstName,
            lastName: application.personalInfo.lastName,
            phone: application.personalInfo.mobile,
            role: "student",
            isProfileComplete: true, // Assuming form gives enough info? Maybe false to force review.
            // Map other fields if necessary
        });

        application.status = "approved";
        application.reviewedBy = req.user._id;
        application.createdUserId = newUser._id;
        await application.save();

        res.status(200).json({
            success: true,
            data: {
                application,
                user: newUser,
                generatedPassword: defaultPassword
            },
            message: "Application approved and user account created",
        });
    } catch (error) {
        next(error);
    }
};

export const rejectApplication = async (req, res, next) => {
    try {
        const application = await RegistrationApplication.findById(req.params.id);
        if (!application) {
            throw new AppError("Application not found", 404);
        }

        application.status = "rejected";
        application.reviewedBy = req.user._id;
        await application.save();

        res.status(200).json({
            success: true,
            data: application,
            message: "Application rejected",
        });
    } catch (error) {
        next(error);
    }
};
