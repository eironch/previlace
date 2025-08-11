import express from "express";
import MongoHelper from "../utils/MongoHelper.js";
import { checkDatabaseConnection } from "../config/database.js";

const router = express.Router();

router.get("/status", async (req, res) => {
	try {
		const connectionInfo = checkDatabaseConnection();
		const ping = await MongoHelper.pingDatabase();
		const serverInfo = await MongoHelper.getServerInfo();

		res.json({
			success: true,
			connection: connectionInfo,
			ping: ping,
			server: serverInfo,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to get database status",
			error: error.message,
			timestamp: new Date().toISOString()
		});
	}
});

router.get("/help", (req, res) => {
	const instructions = MongoHelper.generateStartupInstructions();
	
	res.json({
		success: true,
		message: "MongoDB startup instructions",
		instructions: instructions.split('\n'),
		platform: process.platform,
		mongoUri: process.env.MONGODB_URI,
		timestamp: new Date().toISOString()
	});
});

export default router;