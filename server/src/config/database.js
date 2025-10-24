import mongoose from "mongoose";

const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 2000;

const connectDB = async () => {
	let retryCount = 0;
	
	while (retryCount < MAX_RETRY_ATTEMPTS) {
		try {
			const conn = await mongoose.connect(process.env.MONGODB_URI, {
				serverSelectionTimeoutMS: 5000,
				socketTimeoutMS: 45000,
				family: 4
			});

			conn.connection.on('error', (err) => {});
			conn.connection.on('disconnected', () => {});
			conn.connection.on('reconnected', () => {});

			process.on('SIGINT', async () => {
				await mongoose.connection.close();
				process.exit(0);
			});

			process.on('SIGTERM', async () => {
				await mongoose.connection.close();
				process.exit(0);
			});

			return conn;

		} catch (error) {
			retryCount++;

			if (retryCount >= MAX_RETRY_ATTEMPTS) {
				process.exit(1);
			}

			await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
		}
	}
};

const checkDatabaseConnection = () => {
	const state = mongoose.connection.readyState;
	const states = {
		0: 'disconnected',
		1: 'connected',
		2: 'connecting',
		3: 'disconnecting'
	};
	
	return {
		isConnected: state === 1,
		state: states[state] || 'unknown',
		host: mongoose.connection.host,
		port: mongoose.connection.port,
		name: mongoose.connection.name
	};
};

export { checkDatabaseConnection };
export default connectDB;
