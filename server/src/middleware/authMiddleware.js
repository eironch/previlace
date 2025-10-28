import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";

dotenv.config();

export const authenticate = async (req, res, next) => {
	try {
		const { accessToken } = req.cookies;

		if (!accessToken) {
			return res.status(401).json({
				success: false,
				message: "Access token required"
			});
		}

		const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId).select("_id email role firstName lastName");

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "User not found"
			});
		}

		req.user = user;
		next();
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({
				success: false,
				message: "Token expired"
			});
		}
		return res.status(401).json({
			success: false,
			message: "Invalid token"
		});
	}
};

export const restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				success: false,
				message: "You do not have permission to perform this action"
			});
		}
		next();
	};
};

export const optionalAuth = async (req, res, next) => {
	try {
		const { accessToken } = req.cookies;

		if (accessToken) {
			const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
			const user = await User.findById(decoded.userId).select("_id email role firstName lastName");
			
			if (user) {
				req.user = user;
			}
		}
		
		next();
	} catch (error) {
		next();
	}
};

export const protect = authenticate;

export default authenticate;
