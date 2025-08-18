export default function errorHandler(err, req, res, next) {
	let error = { ...err };
	error.message = err.message;

	if (err.name === "CastError") {
		const message = "Resource not found";
		error = { message, statusCode: 404 };
	}

	if (err.code === 11000) {
		const message = "Duplicate field value entered";
		error = { message, statusCode: 400 };
	}

	if (err.name === "ValidationError") {
		const message = Object.values(err.errors).map(val => val.message).join(", ");
		error = { message, statusCode: 400 };
	}

	if (err.name === "TokenExpiredError") {
		error = { message: "Token expired", statusCode: 401 };
	}

	if (err.name === "JsonWebTokenError") {
		error = { message: "Invalid token", statusCode: 401 };
	}

	res.setHeader("Content-Type", "application/json");
	
	res.status(error.statusCode || 500).json({
		success: false,
		message: error.message || "Server Error",
		...(process.env.NODE_ENV === "development" && { stack: err.stack })
	});
}
