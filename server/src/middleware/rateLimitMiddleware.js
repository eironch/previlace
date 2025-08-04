const rateLimitStore = new Map();

const cleanupExpiredEntries = () => {
	const now = Date.now();
	for (const [key, data] of rateLimitStore.entries()) {
		if (data.resetTime <= now) {
			rateLimitStore.delete(key);
		}
	}
};

setInterval(cleanupExpiredEntries, 15 * 60 * 1000);

export const createRateLimit = (options = {}) => {
	const {
		windowMs = 15 * 60 * 1000,
		max = 100,
		message = "Too many requests, please try again later",
		standardHeaders = true,
		legacyHeaders = false,
		keyGenerator = (req) => req.ip,
	} = options;

	return (req, res, next) => {
		const key = keyGenerator(req);
		const now = Date.now();

		let record = rateLimitStore.get(key);

		if (!record || record.resetTime <= now) {
			record = {
				count: 0,
				resetTime: now + windowMs,
			};
		}

		record.count++;
		rateLimitStore.set(key, record);

		const remaining = Math.max(0, max - record.count);
		const resetTime = Math.ceil(record.resetTime / 1000);

		if (standardHeaders) {
			res.set({
				"RateLimit-Limit": max,
				"RateLimit-Remaining": remaining,
				"RateLimit-Reset": new Date(record.resetTime).toISOString(),
			});
		}

		if (legacyHeaders) {
			res.set({
				"X-RateLimit-Limit": max,
				"X-RateLimit-Remaining": remaining,
				"X-RateLimit-Reset": resetTime,
			});
		}

		if (record.count > max) {
			return res.status(429).json({
				success: false,
				message,
				retryAfter: Math.ceil((record.resetTime - now) / 1000),
			});
		}

		next();
	};
};

export const authLimiter = createRateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: "Too many authentication attempts, please try again in 15 minutes",
	keyGenerator: (req) => `auth:${req.ip}:${req.body?.email || "unknown"}`,
});

export const generalLimiter = createRateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: "Too many requests from this IP, please try again in 15 minutes",
});

export const passwordResetLimiter = createRateLimit({
	windowMs: 60 * 60 * 1000,
	max: 3,
	message: "Too many password reset attempts, please try again in 1 hour",
	keyGenerator: (req) => `password-reset:${req.ip}:${req.body?.email || "unknown"}`,
});
