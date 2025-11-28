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

import emailService from "../services/emailService.js";

export const approveApplication = async (req, res, next) => {
    try {
        const { examType, sendEmail } = req.body;
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
            isProfileComplete: true,
            examType: examType || "Professional", // Default if not provided
            // Map other fields if necessary
        });

        application.status = "approved";
        application.reviewedBy = req.user._id;
        application.createdUserId = newUser._id;
        await application.save();

        // Send Email if requested
        if (sendEmail) {
            const loginLink = process.env.CLIENT_URL || "http://localhost:5173/login";
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #000;">Welcome to Previlace!</h2>
                    <p>Dear ${application.personalInfo.firstName},</p>
                    <p>Your registration application has been approved. You can now access your student account.</p>
                    
                    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0;"><strong>Login Credentials:</strong></p>
                        <p style="margin: 5px 0;">Email: ${application.personalInfo.email}</p>
                        <p style="margin: 5px 0;">Password: ${defaultPassword}</p>
                        <p style="margin: 5px 0;">Exam Type: ${examType || "Professional"}</p>
                    </div>

                    <p>Please change your password after your first login.</p>
                    
                    <a href="${loginLink}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">Login to Portal</a>
                </div>
            `;

            await emailService.sendEmail({
                to: application.personalInfo.email,
                subject: "Registration Approved - Previlace Account Credentials",
                html: emailHtml
            });
        }

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
