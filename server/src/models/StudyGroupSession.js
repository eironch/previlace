import mongoose from "mongoose";

const studyGroupSessionSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyGroup",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      default: 60,
      min: 15,
      max: 480,
    },
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "cancelled"],
      default: "scheduled",
      index: true,
    },
    sessionType: {
      type: String,
      enum: ["study", "quiz", "discussion", "review"],
      default: "study",
    },
    topics: [String],
    maxParticipants: {
      type: Number,
      default: 20,
      min: 2,
      max: 50,
    },
    participants: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      joinedAt: Date,
      leftAt: Date,
      status: {
        type: String,
        enum: ["registered", "attended", "no-show"],
        default: "registered",
      },
    }],
    quizzes: [{
      quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuizAttempt",
      },
      sharedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      sharedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    resources: [{
      name: String,
      url: String,
      type: {
        type: String,
        enum: ["link", "file", "document"],
      },
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    meetingLink: String,
    notes: String,
    recordingUrl: String,
    actualStartTime: Date,
    actualEndTime: Date,
    stats: {
      totalRegistered: {
        type: Number,
        default: 0,
      },
      totalAttended: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
      },
      totalRatings: {
        type: Number,
        default: 0,
      },
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrencePattern: {
      type: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
      },
      interval: Number,
      daysOfWeek: [Number],
      endDate: Date,
    },
  },
  {
    timestamps: true,
  }
);

studyGroupSessionSchema.index({ groupId: 1, scheduledAt: 1 });
studyGroupSessionSchema.index({ status: 1, scheduledAt: 1 });
studyGroupSessionSchema.index({ createdBy: 1, scheduledAt: -1 });

studyGroupSessionSchema.methods.addParticipant = function (userId) {
  const existingParticipant = this.participants.find(
    p => p.userId.toString() === userId.toString()
  );

  if (existingParticipant) {
    throw new Error("User already registered");
  }

  if (this.participants.length >= this.maxParticipants) {
    throw new Error("Session is full");
  }

  this.participants.push({ userId });
  this.stats.totalRegistered = this.participants.length;
  return this.save();
};

studyGroupSessionSchema.methods.removeParticipant = function (userId) {
  this.participants = this.participants.filter(
    p => p.userId.toString() !== userId.toString()
  );
  this.stats.totalRegistered = this.participants.length;
  return this.save();
};

studyGroupSessionSchema.methods.markAttendance = function (userId) {
  const participant = this.participants.find(
    p => p.userId.toString() === userId.toString()
  );

  if (!participant) {
    throw new Error("User not registered for this session");
  }

  participant.status = "attended";
  participant.joinedAt = new Date();
  
  this.stats.totalAttended = this.participants.filter(
    p => p.status === "attended"
  ).length;

  return this.save();
};

studyGroupSessionSchema.methods.startSession = function () {
  if (this.status !== "scheduled") {
    throw new Error("Session cannot be started");
  }

  this.status = "in-progress";
  this.actualStartTime = new Date();
  return this.save();
};

studyGroupSessionSchema.methods.endSession = function (notes = "") {
  if (this.status !== "in-progress") {
    throw new Error("Session is not in progress");
  }

  this.status = "completed";
  this.actualEndTime = new Date();
  this.notes = notes;

  this.participants.forEach(participant => {
    if (participant.status === "registered" && !participant.joinedAt) {
      participant.status = "no-show";
    }
  });

  return this.save();
};

studyGroupSessionSchema.methods.cancelSession = function () {
  if (this.status === "completed") {
    throw new Error("Cannot cancel completed session");
  }

  this.status = "cancelled";
  return this.save();
};

studyGroupSessionSchema.methods.addQuiz = function (quizId, sharedBy) {
  const existingQuiz = this.quizzes.find(
    q => q.quizId.toString() === quizId.toString()
  );

  if (existingQuiz) {
    throw new Error("Quiz already shared in this session");
  }

  this.quizzes.push({ quizId, sharedBy });
  return this.save();
};

studyGroupSessionSchema.methods.addResource = function (name, url, type, uploadedBy) {
  this.resources.push({
    name,
    url,
    type,
    uploadedBy,
  });
  return this.save();
};

studyGroupSessionSchema.methods.rateSession = function (rating) {
  const totalRatings = this.stats.totalRatings;
  const currentAvg = this.stats.averageRating || 0;
  
  const newAvg = (currentAvg * totalRatings + rating) / (totalRatings + 1);
  
  this.stats.averageRating = Math.round(newAvg * 100) / 100;
  this.stats.totalRatings = totalRatings + 1;
  
  return this.save();
};

studyGroupSessionSchema.statics.getGroupSessions = function (groupId, status = null, limit = 20) {
  const query = { groupId };
  if (status) {
    query.status = status;
  }

  return this.find(query)
    .populate("createdBy", "firstName lastName avatar")
    .populate("participants.userId", "firstName lastName avatar")
    .sort({ scheduledAt: -1 })
    .limit(limit);
};

studyGroupSessionSchema.statics.getUserSessions = function (userId, status = null, limit = 20) {
  const query = { "participants.userId": userId };
  if (status) {
    query.status = status;
  }

  return this.find(query)
    .populate("groupId", "name")
    .populate("createdBy", "firstName lastName avatar")
    .sort({ scheduledAt: -1 })
    .limit(limit);
};

studyGroupSessionSchema.statics.getUpcomingSessions = function (groupId, days = 7) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  return this.find({
    groupId,
    status: "scheduled",
    scheduledAt: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .populate("createdBy", "firstName lastName avatar")
    .sort({ scheduledAt: 1 });
};

studyGroupSessionSchema.statics.createRecurringSessions = async function (sessionData, pattern) {
  const sessions = [];
  const startDate = new Date(sessionData.scheduledAt);
  let currentDate = new Date(startDate);
  const endDate = new Date(pattern.endDate);

  while (currentDate <= endDate) {
    const sessionClone = {
      ...sessionData,
      scheduledAt: new Date(currentDate),
      isRecurring: true,
      recurrencePattern: pattern,
    };

    const session = await this.create(sessionClone);
    sessions.push(session);

    switch (pattern.type) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + pattern.interval);
        break;
      case "weekly":
        currentDate.setDate(currentDate.getDate() + (7 * pattern.interval));
        break;
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + pattern.interval);
        break;
    }
  }

  return sessions;
};

export default mongoose.model("StudyGroupSession", studyGroupSessionSchema);
