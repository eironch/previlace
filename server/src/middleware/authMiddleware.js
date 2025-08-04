import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";

dotenv.config();

export const authenticate = async (req, res, next) => {
	try {
		const { accessToken } = req.cookies;

		if (!accessToken) {
			return next(new AppError("Access token required", 401));
		}

		const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) {
			return next(new AppError("User not found", 401));
		}

		req.user = { 
			userId: user._id, 
			email: user.email,
			role: user.role 
		};
		next();
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			return next(new AppError("Token expired", 401));
		}
		return next(new AppError("Invalid token", 401));
	}
};

export const restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(new AppError("You do not have permission to perform this action", 403));
		}
		next();
	};
};

export const optionalAuth = async (req, res, next) => {
	try {
		const { accessToken } = req.cookies;

		if (accessToken) {
			const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
			const user = await User.findById(decoded.userId);
			
			if (user) {
				req.user = { 
					userId: user._id, 
					email: user.email,
					role: user.role 
				};
			}
		}
		
		next();
	} catch (error) {
		next();
	}
};

// Keep the default export for backward compatibility
export default authenticate;
