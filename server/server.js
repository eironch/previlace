import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
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
import adminRoutes from "./src/routes/adminRoutes.js";
import questionTemplateRoutes from "./src/routes/questionTemplates.js";
import manualQuestionRoutes from "./src/routes/manualQuestions.js";
import testRoutes from "./src/routes/testRoutes.js";
import examRoutes from "./src/routes/examRoutes.js";
import bookmarkRoutes from "./src/routes/bookmarkRoutes.js";
import analyticsRoutes from "./src/routes/analyticsRoutes.js";
import flashcardRoutes from "./src/routes/flashcardRoutes.js";
import mistakeTrackingRoutes from "./src/routes/mistakeTrackingRoutes.js";
import achievementRoutes from "./src/routes/achievementRoutes.js";
import leaderboardRoutes from "./src/routes/leaderboardRoutes.js";
import challengeRoutes from "./src/routes/challengeRoutes.js";
import studyGroupRoutes from "./src/routes/studyGroupRoutes.js";
import seedRoutes from "./src/routes/seedRoutes.js";
import errorHandler from "./src/middleware/errorHandler.js";
import { generalLimiter } from "./src/middleware/rateLimitMiddleware.js";
import { AppError } from "./src/utils/AppError.js";
import { createServer } from "http";
import socketService from "./src/services/socketService.js";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://previlace.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["set-cookie"],
    optionsSuccessStatus: 200,
    preflightContinue: false,
  })
);

app.options("*", cors());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

app.use(mongoSanitize());
app.use(generalLimiter);

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

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
app.use(passport.initialize());

app.head((req, res) => {
  res.status(200).end();
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Previlace API is running",
    version: "2.0.0",
    environment: process.env.NODE_ENV,
  });
});

app.options("/api/health", cors());
app.get("/api/health", (req, res) => {
  const dbStatus = checkDatabaseConnection();

  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      status: dbStatus.state,
      connected: dbStatus.isConnected,
      host: dbStatus.host,
      port: dbStatus.port,
      name: dbStatus.name,
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/question-templates", questionTemplateRoutes);
app.use("/api/manual-questions", manualQuestionRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/mistakes", mistakeTrackingRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/study-groups", studyGroupRoutes);
app.use("/api/seed", seedRoutes);

app.options("*", cors());

app.all("*", (req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    const httpServer = createServer(app);
    socketService.initialize(httpServer);

    httpServer.listen(PORT);

    httpServer.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        process.exit(1);
      } else {
        process.exit(1);
      }
    });

    function gracefulShutdown(signal) {
      httpServer.close(async () => {
        try {
          await mongoose.connection.close();
          process.exit(0);
        } catch (error) {
          process.exit(1);
        }
      });

      setTimeout(() => {
        process.exit(1);
      }, 10000);
    }

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Server startup error:", error);
    }
    process.exit(1);
  }
}

startServer();

export default app;
