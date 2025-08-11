import mongoose from "mongoose";

const MongoHelper = {
	async pingDatabase() {
		try {
			await mongoose.connection.db.admin().ping();
			return { success: true, message: "Database is responsive" };
		} catch (error) {
			return { success: false, message: error.message };
		}
	},

	getConnectionInfo() {
		const connection = mongoose.connection;
		return {
			readyState: connection.readyState,
			host: connection.host,
			port: connection.port,
			name: connection.name,
			collections: Object.keys(connection.collections)
		};
	},

	async getServerInfo() {
		try {
			const admin = mongoose.connection.db.admin();
			const serverStatus = await admin.serverStatus();
			return {
				success: true,
				version: serverStatus.version,
				uptime: serverStatus.uptime,
				connections: serverStatus.connections
			};
		} catch (error) {
			return {
				success: false,
				message: error.message
			};
		}
	},

	generateStartupInstructions() {
		const platform = process.platform;
		let instructions = [];

		switch (platform) {
			case 'win32':
				instructions = [
					"Windows MongoDB Startup Instructions:",
					"",
					"Method 1 - Windows Service:",
					"1. Open Command Prompt as Administrator",
					"2. Run: net start MongoDB",
					"",
					"Method 2 - Manual Start:",
					"1. Navigate to MongoDB installation directory (usually C:\\Program Files\\MongoDB\\Server\\[version]\\bin)",
					"2. Run: mongod.exe",
					"",
					"Method 3 - Custom Data Directory:",
					"1. Run: mongod.exe --dbpath C:\\path\\to\\your\\data",
					"",
					"Verify MongoDB is running:",
					"- Check if port 27017 is listening",
					"- Run: netstat -an | findstr :27017"
				];
				break;
			
			case 'darwin':
				instructions = [
					"macOS MongoDB Startup Instructions:",
					"",
					"Method 1 - Homebrew Service:",
					"1. Run: brew services start mongodb/brew/mongodb-community",
					"",
					"Method 2 - Manual Start:",
					"1. Run: mongod --config /usr/local/etc/mongod.conf",
					"",
					"Method 3 - Background Process:",
					"1. Run: mongod --fork --logpath /var/log/mongod.log",
					"",
					"Verify MongoDB is running:",
					"- Run: brew services list | grep mongodb",
					"- Check: lsof -i :27017"
				];
				break;
			
			default:
				instructions = [
					"Linux MongoDB Startup Instructions:",
					"",
					"Method 1 - System Service:",
					"1. Run: sudo systemctl start mongod",
					"2. Enable auto-start: sudo systemctl enable mongod",
					"",
					"Method 2 - Service Command:",
					"1. Run: sudo service mongod start",
					"",
					"Method 3 - Manual Start:",
					"1. Run: mongod --config /etc/mongod.conf",
					"",
					"Verify MongoDB is running:",
					"- Run: sudo systemctl status mongod",
					"- Check: netstat -tlnp | grep :27017"
				];
		}

		return instructions.join('\n');
	}
};

export default MongoHelper;