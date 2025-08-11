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

			console.log(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
			console.log(`Database: ${conn.connection.name}`);

			conn.connection.on('error', (err) => {
				console.error('MongoDB connection error:', err);
			});

			conn.connection.on('disconnected', () => {
				console.log('MongoDB disconnected');
			});

			conn.connection.on('reconnected', () => {
				console.log('MongoDB reconnected');
			});

			process.on('SIGINT', async () => {
				await mongoose.connection.close();
				console.log('MongoDB connection closed due to app termination');
				process.exit(0);
			});

			process.on('SIGTERM', async () => {
				await mongoose.connection.close();
				console.log('MongoDB connection closed due to app termination');
				process.exit(0);
			});

			return conn;

		} catch (error) {
			retryCount++;
			
			if (error.name === 'MongooseServerSelectionError') {
				console.error(`MongoDB connection attempt ${retryCount}/${MAX_RETRY_ATTEMPTS} failed:`);
				console.error('MongoDB server is not running or unreachable');
				
				if (process.platform === 'win32') {
					console.error('To start MongoDB on Windows:');
					console.error('1. Run "net start MongoDB" as Administrator');
					console.error('2. Or start MongoDB manually from installation directory');
					console.error('3. Default MongoDB runs on port 27017');
				} else {
					console.error('To start MongoDB:');
					console.error('1. Run "sudo service mongod start" (Linux)');
					console.error('2. Or "brew services start mongodb/brew/mongodb-community" (macOS)');
				}
			} else {
				console.error(`Database connection error (attempt ${retryCount}/${MAX_RETRY_ATTEMPTS}):`, error.message);
			}

			if (retryCount >= MAX_RETRY_ATTEMPTS) {
				console.error('Maximum retry attempts reached. Unable to connect to MongoDB.');
				console.error('Please ensure MongoDB is running and accessible.');
				process.exit(1);
			}

			console.log(`Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
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