import dotenv from "dotenv";
import axios from "axios";

import User from "../models/User.js";

dotenv.config();

export default async function authMiddleware(req, res, next) {
	const { accessToken, refreshToken } = req.cookies;

	if (!accessToken)
		return res.status(401).json({ error: "Invalid request, complete credentials required." });

	if (!req.user) {
		req.user = {};
	}

	try {
		const response = await axios.get(
			`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`
		);

		const { sub: googleId, exp: expiryDate } = response.data;
		if (!googleId) return res.status(400).json({ error: "Invalid Google token" });

		const user = await User.findOne({ googleId });
		if (!user) return res.status(404).json({ error: "User not found" });

		const expiresIn = expiryDate - Date.now() / 1000;

		if (expiresIn < 300) {
			try {
				const refreshResponse = await axios.post("https://oauth2.googleapis.com/token", null, {
					params: {
						client_id: process.env.GOOGLE_CLIENT_ID,
						client_secret: process.env.GOOGLE_CLIENT_SECRET,
						refresh_token: refreshToken,
						grant_type: "refresh_token",
					},
				});

				const newAccessToken = refreshResponse.data.access_token;
				const newRefreshToken = refreshResponse.data.refresh_token || refreshToken;

				if (!newAccessToken) throw new Error("Failed to refresh token");

				res.cookie("accessToken", newAccessToken, {
					httpOnly: true,
					sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
					secure: process.env.NODE_ENV === "production",
					maxAge: 60 * 60 * 1000,
				});
				res.cookie("refreshToken", newRefreshToken, {
					httpOnly: true,
					sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
					secure: process.env.NODE_ENV === "production",
					maxAge: 31 * 24 * 60 * 60 * 1000,
				});

				req.user.accessToken = newAccessToken;
				req.user.refreshToken = newRefreshToken;
			} catch (err) {
				console.error("Refresh token invalid:", err.response?.data || err.message);

				res.clearCookie("accessToken");
				res.clearCookie("refreshToken");
				return res.status(403).json({ error: "Forbidden: Invalid or expired refresh token." });
			}
		}

		req.user.userId = user.userId;

		next();
	} catch (err) {
		console.error(err);
		return res.status(500).json({ error: "Internal server error" });
	}
}
