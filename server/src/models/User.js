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
	});
};

userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

export default mongoose.model("User", userSchema);
