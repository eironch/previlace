import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateTokens = (payload) => {
	const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});

	const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "30d",
	});

	return { accessToken, refreshToken };
};

export const verifyAccessToken = (token) => {
	return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token) => {
	return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

export const generateSecureToken = () => {
	return crypto.randomBytes(32).toString("hex");
};

export const hashToken = (token) => {
	return crypto.createHash("sha256").update(token).digest("hex");
};

export const setCookieOptions = (isProduction) => ({
	httpOnly: true,
	secure: isProduction,
	sameSite: isProduction ? "None" : "Strict",
	maxAge: 30 * 24 * 60 * 60 * 1000,
});

export const clearCookieOptions = (isProduction) => ({
	httpOnly: true,
	secure: isProduction,
	sameSite: isProduction ? "None" : "Strict",
});
