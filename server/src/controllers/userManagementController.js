import User from "../models/User.js";
import { catchAsync, AppError } from "../utils/AppError.js";

const getAllUsers = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    role,
    status,
    examType,
    education,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const query = {};

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role && role !== "all") {
    query.role = role;
  }

  if (status && status !== "all") {
    if (status === "active") {
      query.lastLogin = {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };
    } else if (status === "inactive") {
      query.lastLogin = {
        $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };
    } else if (status === "verified") {
      query.isEmailVerified = true;
    } else if (status === "unverified") {
      query.isEmailVerified = false;
    } else if (status === "locked") {
      query.lockUntil = { $gt: new Date() };
    } else if (status === "suspended") {
      query.isSuspended = true;
    }
  }

  if (examType && examType !== "all") {
    query.examType = examType;
  }

  if (education && education !== "all") {
    query.education = education;
  }

  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const [users, totalCount] = await Promise.all([
    User.find(query)
      .select("-password -refreshTokens -emailVerificationToken -passwordResetToken")
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .lean(),
    User.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / parseInt(limit));

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers: totalCount,
        limit: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
    },
  });
});

const updateUserStatus = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { action, reason } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if ((user.role === "admin" || user.role === "super_admin") && req.user._id.toString() !== userId) {
    if (req.user.role !== "super_admin") {
      throw new AppError("Insufficient permissions to modify admin accounts", 403);
    }
  }

  switch (action) {
    case "suspend":
      user.isSuspended = true;
      user.suspendedAt = new Date();
      user.suspensionReason = reason || "Administrative action";
      break;

    case "activate":
      user.isSuspended = false;
      user.suspendedAt = null;
      user.suspensionReason = null;
      break;

    case "verify":
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;
      break;

    case "unlock":
      user.loginAttempts = 0;
      user.lockUntil = null;
      break;

    case "makeAdmin":
      if (req.user.role !== "super_admin") {
        throw new AppError("Only super admins can promote users to admin", 403);
      }
      user.role = "admin";
      break;

    case "makeSuperAdmin":
      if (req.user.role !== "super_admin") {
        throw new AppError("Only super admins can promote users to super admin", 403);
      }
      user.role = "super_admin";
      break;

    case "removeAdmin":
      if (req.user.role !== "super_admin") {
        throw new AppError("Only super admins can demote users", 403);
      }
      user.role = "student";
      break;

    default:
      throw new AppError("Invalid action", 400);
  }

  await user.save();

  res.json({
    success: true,
    message: `User ${action} successfully`,
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isSuspended: user.isSuspended,
        lockUntil: user.lockUntil,
      },
    },
  });
});

const bulkUserAction = catchAsync(async (req, res) => {
  const { userIds, action, reason } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new AppError("Invalid user IDs", 400);
  }

  const updateQuery = {};
  let message = "";

  switch (action) {
    case "suspend":
      updateQuery.isSuspended = true;
      updateQuery.suspendedAt = new Date();
      updateQuery.suspensionReason = reason || "Bulk administrative action";
      message = "Users suspended successfully";
      break;

    case "activate":
      updateQuery.isSuspended = false;
      updateQuery.suspendedAt = null;
      updateQuery.suspensionReason = null;
      message = "Users activated successfully";
      break;

    case "verify":
      updateQuery.isEmailVerified = true;
      updateQuery.emailVerificationToken = null;
      updateQuery.emailVerificationExpires = null;
      message = "Users verified successfully";
      break;

    case "delete":
      const adminCheck = await User.find({
        _id: { $in: userIds },
        role: { $in: ["admin", "super_admin"] },
      });

      if (adminCheck.length > 0) {
        throw new AppError("Cannot delete admin or super admin accounts in bulk", 403);
      }

      await User.deleteMany({ _id: { $in: userIds } });

      return res.json({
        success: true,
        message: `${userIds.length} users deleted successfully`,
        data: { affectedCount: userIds.length },
      });

    default:
      throw new AppError("Invalid bulk action", 400);
  }

  const result = await User.updateMany(
    { _id: { $in: userIds }, role: "student" },
    updateQuery
  );

  res.json({
    success: true,
    message,
    data: { affectedCount: result.modifiedCount },
  });
});

const getUserActivity = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .select("email firstName lastName lastLogin createdAt refreshTokens loginAttempts")
    .lean();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const activityData = {
    user: {
      id: user._id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
    },
    activity: {
      lastLogin: user.lastLogin,
      accountCreated: user.createdAt,
      loginAttempts: user.loginAttempts || 0,
      activeSessions: user.refreshTokens?.length || 0,
      daysSinceCreation: Math.floor(
        (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
      ),
      daysSinceLastLogin: user.lastLogin
        ? Math.floor(
            (Date.now() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24)
          )
        : null,
    },
    sessions: user.refreshTokens?.map((token) => ({
      userAgent: token.userAgent,
      ipAddress: token.ipAddress,
      createdAt: token.createdAt,
      expiresAt: token.expiresAt,
      isExpired: new Date(token.expiresAt) < new Date(),
    })),
  };

  res.json({
    success: true,
    data: activityData,
  });
});

const searchUsers = catchAsync(async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.json({
      success: true,
      data: { users: [] },
    });
  }

  const users = await User.find({
    $or: [
      { firstName: { $regex: q, $options: "i" } },
      { lastName: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ],
  })
    .select("_id email firstName lastName avatar role")
    .limit(10)
    .lean();

  res.json({
    success: true,
    data: { users },
  });
});

const exportUsers = catchAsync(async (req, res) => {
  const { format = "json", filters = {} } = req.query;

  const query = {};

  if (filters.role) query.role = filters.role;
  if (filters.examType) query.examType = filters.examType;
  if (filters.isEmailVerified !== undefined)
    query.isEmailVerified = filters.isEmailVerified === "true";

  const users = await User.find(query)
    .select("-password -refreshTokens -emailVerificationToken -passwordResetToken")
    .lean();

  if (format === "csv") {
    const csv = users
      .map((user) => {
        return [
          user._id,
          user.email,
          user.firstName,
          user.lastName,
          user.role,
          user.examType,
          user.education,
          user.isEmailVerified,
          user.createdAt,
        ].join(",");
      })
      .join("\n");

    const header = "ID,Email,First Name,Last Name,Role,Exam Type,Education,Verified,Created At\n";

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");
    return res.send(header + csv);
  }

  res.json({
    success: true,
    data: { users, count: users.length },
  });
});

import crypto from "crypto";
import emailService from "../services/emailService.js";

const generateStudentId = async () => {
  const year = new Date().getFullYear();
  let unique = false;
  let studentId = "";
  
  while (!unique) {
    const random = Math.floor(1000 + Math.random() * 9000);
    studentId = `${year}-${random}`;
    const existing = await User.findOne({ studentId });
    if (!existing) unique = true;
  }
  return studentId;
};

const generatePassword = () => {
  return crypto.randomBytes(4).toString("hex"); // 8 characters
};

const createUser = catchAsync(async (req, res) => {
  const { email, firstName, lastName, role = "student" } = req.body;

  // Permission Check
  if (role === "admin" && req.user.role !== "super_admin") {
    throw new AppError("Only super admins can create admin accounts", 403);
  }
  if (role === "instructor" && req.user.role !== "super_admin" && req.user.role !== "admin") {
    throw new AppError("Insufficient permissions to create instructor accounts", 403);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already in use", 400);
  }

  const password = generatePassword();
  let studentId = undefined;

  if (role === "student") {
    studentId = await generateStudentId();
  }

  const user = await User.create({
    email,
    firstName,
    lastName,
    password,
    role,
    studentId,
    isEmailVerified: true,
    isProfileComplete: false,
  });

  // Send Email with Credentials (SKIP FOR ADMIN)
  if (role !== "admin") {
    const loginLink = process.env.CLIENT_URL || "http://localhost:5173";
    const html = `
      <h1>Welcome to Previlace Review Center!</h1>
      <p>Hi ${firstName},</p>
      <p>Your account has been created successfully.</p>
      <p><strong>Login Credentials:</strong></p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        ${studentId ? `<li><strong>Student ID:</strong> ${studentId}</li>` : ""}
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Please log in and change your password immediately.</p>
      <p><a href="${loginLink}">Log In Now</a></p>
    `;

    try {
      await emailService.sendEmail({
        to: email,
        subject: "Your Previlace Account Credentials",
        html,
      });
    } catch (error) {
      console.error("Failed to send credentials email:", error);
      // Don't fail the request, but maybe warn?
    }
  }

  res.status(201).json({
    success: true,
    message: role === "admin" 
      ? "Admin account created. Please copy the password." 
      : "User account created and credentials sent via email",
    data: {
      user: {
        id: user._id,
        email: user.email,
        studentId: user.studentId,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        password: password, // Return password so it can be displayed
      },
    },
  });
});

const createInstructor = catchAsync(async (req, res) => {
  const { email, firstName, lastName, subjects } = req.body;

  if (req.user.role !== "super_admin" && req.user.role !== "admin") {
    throw new AppError("Insufficient permissions to create instructor accounts", 403);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already in use", 400);
  }

  const password = generatePassword();

  const instructor = await User.create({
    email,
    firstName,
    lastName,
    password,
    role: "instructor",
    isEmailVerified: true,
  });

  if (subjects && subjects.length > 0) {
    const InstructorAvailability = (await import("../models/InstructorAvailability.js")).default;
    await InstructorAvailability.create({
      instructorId: instructor._id,
      subjects,
    });
  }

  // Send Email
  const loginLink = process.env.CLIENT_URL || "http://localhost:5173";
  const html = `
    <h1>Welcome to Previlace Review Center!</h1>
    <p>Hi ${firstName},</p>
    <p>Your Instructor account has been created.</p>
    <p><strong>Login Credentials:</strong></p>
    <ul>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Password:</strong> ${password}</li>
    </ul>
    <p><a href="${loginLink}">Log In Now</a></p>
  `;

  await emailService.sendEmail({
    to: email,
    subject: "Your Instructor Account Credentials",
    html,
  });

  res.status(201).json({
    success: true,
    message: "Instructor account created and credentials sent via email",
    data: {
      instructor: {
        id: instructor._id,
        email: instructor.email,
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        role: instructor.role,
      },
    },
  });
});

const getInstructors = catchAsync(async (req, res) => {
  const { subjectId } = req.query;

  const query = { role: "instructor" };

  const instructors = await User.find(query)
    .select("email firstName lastName avatar createdAt")
    .lean();

  let instructorData = instructors;

  if (subjectId) {
    const InstructorAvailability = (await import("../models/InstructorAvailability.js")).default;
    const availabilities = await InstructorAvailability.find({
      subjects: subjectId,
    }).select("instructorId subjects");

    const instructorIds = availabilities.map(a => a.instructorId.toString());
    instructorData = instructors.filter(i => instructorIds.includes(i._id.toString()));
  }

  res.json({
    success: true,
    data: { instructors: instructorData, count: instructorData.length },
  });
});

export default {
  getAllUsers,
  updateUserStatus,
  bulkUserAction,
  getUserActivity,
  searchUsers,
  exportUsers,
  createUser,
  createInstructor,
  getInstructors,
};
