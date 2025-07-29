import passport from "passport";
import dotenv from "dotenv";
import axios from "axios";

import User from "../models/User.js";

dotenv.config();

export default function authRoutes(server) {
	server.post("/api/auth/post-verify-google-token", async (req, res) => {
		const { accessToken, refreshToken } = req.cookies;

		if (!accessToken)
			return res.status(401).json({ error: "Invalid request, complete credentials required." });

		try {
			const response = await axios.get(
				`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
			);

			const { sub: googleId, exp: expiryDate } = response.data;

			if (!googleId) {
				return res.status(400).json({ error: "Invalid Google token" });
			}

			const user = await User.findOne({ googleId });

			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			const payload = {
				firstName: user.firstName,
				lastName: user.lastName,
				isNewUser: user.firstName === null,
				bio: user.bio,
				avatar: user.avatar,
				accessToken,
				refreshToken,
			};

			const expiresIn = expiryDate - Date.now() / 1000;

			if (expiresIn < 300 && refreshToken) {
				const refreshResponse = await axios.post("https://oauth2.googleapis.com/token", null, {
					params: {
						client_id: process.env.GOOGLE_CLIENT_ID,
						client_secret: process.env.GOOGLE_CLIENT_SECRET,
						refresh_token: refreshToken,
						grant_type: "refresh_token",
					},
				});

				if (!refreshResponse.data.access_token) {
					return res.status(401).json({ error: "Failed to refresh token" });
				}

				payload.accessToken = refreshResponse.data.access_token;
				payload.refreshToken = refreshResponse.data.refresh_token || refreshToken;
			}

			return res.status(200).json({
				payload,
				message: "Token is valid",
			});
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: "Internal server error" });
		}
	});

	server.get(
		"/api/auth/google",
		passport.authenticate("google", {
			scope: ["profile", "email"],
			session: false,
			prompt: "consent",
			accessType: "offline",
		})
	);

	server.get(
		"/api/auth/google/callback",
		passport.authenticate("google", {
			failureRedirect: `${process.env.CLIENT_URL}`,
			session: false,
		}),
		(req, res) => {
			res.cookie("accessToken", req.user.accessToken, {
				httpOnly: true,
				sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
				secure: process.env.NODE_ENV === "production",
				maxAge: 60 * 60 * 1000,
			});

			res.cookie("refreshToken", req.user.refreshToken, {
				httpOnly: true,
				sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
				secure: process.env.NODE_ENV === "production",
				maxAge: 31 * 24 * 60 * 60 * 1000,
			});

			const script = `
				window.opener.postMessage({}, "*");
				window.close();
    	`;

			res.send(`<script>${script}</script>`);
		}
	);
}
