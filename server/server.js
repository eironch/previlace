import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import User from "./models/User.js";

import authRoutes from "./controllers/authController.js";
import userRoutes from "./controllers/userController.js";

dotenv.config();

const server = express();

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
				await User.findOrCreate({
					where: {
						googleId: profile.id,
						email: profile.emails[0].value,
						avatar: profile.photos[0],
					},
				});

				return done(null, { accessToken, refreshToken, profile });
			} catch (err) {
				console.error(err);
				return done(err);
			}
		}
	)
);

server.use(cookieParser());
server.use(express.json());
server.use(
	cors({
		origin:
			process.env.ENV !== "production" ? "http://localhost:3000" : "https://gotayo.vercel.app",
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	})
);
server.use(passport.initialize());

server.get("/", (_, res) => {
	res.json("good mourning.");
});

(async () => {
	try {
		await sql.authenticate();
		console.log("Database connected successfully.");

		if (process.env.ENV !== "production") {
			await sql.sync({ alter: true });
			console.log("All tables synced successfully.");
		}
	} catch (err) {
		console.error("Database connection failed: ", err);
	}
})();

// routes
authRoutes(server);
userRoutes(server);

server.get("/api/test/delay", (req, res) => {
	setTimeout(() => {
		res.json({ message: "Data fetched successfully!" });
	}, 2000);
});

server.listen(8080, () => {
	console.log("Connected to the server.");
});

export default server;
