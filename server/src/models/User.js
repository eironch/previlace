import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: function () {
				return !this.googleId;
			},
			minlength: 6,
		},
		firstName: {
			type: String,
			trim: true,
		},
		lastName: {
			type: String,
			trim: true,
		},
		avatar: {
			type: String,
		},
		bio: {
			type: String,
			maxlength: 500,
		},
		googleId: {
			type: String,
			unique: true,
			sparse: true,
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		isProfileComplete: {
			type: Boolean,
			default: false,
		},
		examType: {
			type: String,
			enum: ["Professional", "Subprofessional", ""],
			default: "",
		},
		education: {
			type: String,
			default: "",
		},
		hasTakenExam: {
			type: String,
			enum: ["Yes", "No", ""],
			default: "",
		},
		previousScore: {
			type: String,
			default: "",
		},
		reviewExperience: {
			type: String,
			enum: ["Self-study", "Review center (in person)", "None", ""],
			default: "",
		},
		struggles: [{
			type: String,
			enum: ["Numerical Ability", "Verbal Ability", "General Information", "Clerical Ability", "Logic", "Grammar"]
		}],
		studyMode: [{
			type: String,
			enum: ["Video Lessons", "Text Modules", "Practice Quizzes", "Live Sessions"]
		}],
		studyTime: {
			type: String,
			enum: ["Morning", "Afternoon", "Evening", "Flexible", ""],
			default: "",
		},
		hoursPerWeek: {
			type: String,
			default: "",
		},
		targetDate: {
			type: String,
			default: "",
		},
		reason: {
			type: String,
			enum: ["Government Job", "Career Advancement", "Personal Development", "Other", ""],
			default: "",
		},
		targetScore: {
			type: String,
			default: "",
		},
		showLeaderboard: {
			type: Boolean,
			default: false,
		},
		receiveReminders: {
			type: Boolean,
			default: false,
		},
		studyBuddy: {
			type: Boolean,
			default: false,
		},
		emailVerificationToken: {
			type: String,
		},
		emailVerificationExpires: {
			type: Date,
		},
		passwordResetToken: {
			type: String,
		},
		passwordResetExpires: {
			type: Date,
		},
		lastLogin: {
			type: Date,
		},
		loginAttempts: {
			type: Number,
			default: 0,
		},
		lockUntil: {
			type: Date,
		},
		refreshTokens: [
			{
				token: String,
				createdAt: {
					type: Date,
					default: Date.now,
				},
				expiresAt: Date,
				userAgent: String,
				ipAddress: String,
			},
		],
	},
	{
		timestamps: true,
		toJSON: {
			transform: function (doc, ret) {
				delete ret.password;
				delete ret.refreshTokens;
				delete ret.emailVerificationToken;
				delete ret.passwordResetToken;
				delete ret.loginAttempts;
				delete ret.lockUntil;
				return ret;
			},
		},
	}
);

userSchema.virtual("isLocked").get(function () {
	return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual("fullName").get(function () {
	return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();

	try {
		const salt = await bcrypt.genSalt(12);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

userSchema.methods.comparePassword = async function (candidatePassword) {
	if (!this.password) return false;
	return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incLoginAttempts = function () {
	if (this.lockUntil && this.lockUntil < Date.now()) {
		return this.updateOne({
			$unset: {
				loginAttempts: 1,
				lockUntil: 1,
			},
		});
	}

	const updates = { $inc: { loginAttempts: 1 } };

	if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
		updates.$set = {
			lockUntil: Date.now() + 2 * 60 * 60 * 1000,
		};
	}

	return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function () {
	return this.updateOne({
		$unset: {
			loginAttempts: 1,
			lockUntil: 1,
		},
	});
};

userSchema.methods.addRefreshToken = function (token, userAgent, ipAddress) {
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 30);

	this.refreshTokens.push({
		token,
		expiresAt,
		userAgent,
		ipAddress,
	});

	if (this.refreshTokens.length > 5) {
		this.refreshTokens = this.refreshTokens.slice(-5);
	}

	return this.save();
};

userSchema.methods.removeRefreshToken = function (token) {
	this.refreshTokens = this.refreshTokens.filter((rt) => rt.token !== token);
	return this.save();
};

userSchema.statics.findOrCreate = async function (criteria) {
	const user = await this.findOne({ $or: [{ googleId: criteria.googleId }, { email: criteria.email }] });

	if (user) {
		return user;
	}

	return this.create({
		email: criteria.email,
		googleId: criteria.googleId,
		avatar: criteria.avatar,
		firstName: criteria.firstName,
		lastName: criteria.lastName,
		isEmailVerified: true,
		isProfileComplete: false,
	});
};

userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

export default mongoose.model("User", userSchema);
