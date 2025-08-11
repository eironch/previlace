import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import mongoose from "mongoose";

import User from "./src/models/User.js";
import connectDB, { checkDatabaseConnection } from "./src/config/database.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import databaseRoutes from "./src/routes/databaseRoutes.js";
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
		environment: process.env.NODE_ENV
	});
});

app.get("/api/health", (req, res) => {
	const dbStatus = checkDatabaseConnection();
	
	res.json({
		success: true,
		message: "API is healthy",
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV,
		database: {
			status: dbStatus.state,
			connected: dbStatus.isConnected,
			host: dbStatus.host,
			port: dbStatus.port,
			name: dbStatus.name
		}
	});
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/database", databaseRoutes);

app.all("*", (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

const PORT = process.env.PORT || 8080;

const startServer = async () => {
	try {
		console.log(`Starting Previlace server in ${process.env.NODE_ENV} mode...`);
		
		await connectDB();
		
		const server = app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
			console.log(`Health check: http://localhost:${PORT}/api/health`);
		});

		server.on('error', (error) => {
			if (error.code === 'EADDRINUSE') {
				console.error(`Port ${PORT} is already in use`);
			} else {
				console.error('Server error:', error.message);
			}
			process.exit(1);
		});

		const gracefulShutdown = (signal) => {
			console.log(`Received ${signal}. Starting graceful shutdown...`);
			
			server.close(async () => {
				console.log('HTTP server closed');
				
				try {
					await mongoose.connection.close();
					console.log('Database connection closed');
					process.exit(0);
				} catch (error) {
					console.error('Error during database disconnection:', error);
					process.exit(1);
				}
			});

			setTimeout(() => {
				console.error('Could not close connections in time, forcefully shutting down');
				process.exit(1);
			}, 10000);
		};

		process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
		process.on('SIGINT', () => gracefulShutdown('SIGINT'));

	} catch (error) {
		console.error("Failed to start server:", error.message);
		process.exit(1);
	}
};

startServer();

export default app;