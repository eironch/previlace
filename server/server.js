import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

import User from "./src/models/User.js";
import connectDB from "./src/config/database.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import errorHandler from "./src/middleware/errorHandler.js";
import { generalLimiter } from "./src/middleware/rateLimitMiddleware.js";
import { AppError } from "./src/utils/AppError.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(mongoSanitize());
app.use(generalLimiter);

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.REDIRECT_URI,
			accessType: "offline",
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				const user = await User.findOrCreate({
					googleId: profile.id,
					email: profile.emails[0].value,
					firstName: profile.name.givenName,
					lastName: profile.name.familyName,
					avatar: profile.photos[0]?.value,
				});

				return done(null, { accessToken, refreshToken, profile, user });
			} catch (err) {
				return done(err);
			}
		}
	)
);

app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(
	cors({
		origin: (origin, callback) => {
			const allowedOrigins = [
				"http://localhost:5173",
				"http://127.0.0.1:5173",
				process.env.CLIENT_URL
			].filter(Boolean);
			
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		credentials: true,
		allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
		optionsSuccessStatus: 200
	})
);

app.use(passport.initialize());

app.get("/", (req, res) => {
	res.json({
		success: true,
		message: "Previlace API is running",
		version: "2.0.0",
	});
});

app.get("/api/health", (req, res) => {
	res.json({
		success: true,
		message: "API is healthy",
		timestamp: new Date().toISOString(),
	});
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.all("*", (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

const PORT = process.env.PORT || 8080;

const startServer = async () => {
	try {
		await connectDB();

		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

startServer();

export default app;
