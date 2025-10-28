import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    targetPosition: {
      type: String,
      trim: true,
    },
    template: {
      type: String,
      enum: [
        "professional",
        "modern", 
        "classic",
        "government_standard",
        "technical",
        "executive"
      ],
      default: "government_standard",
    },
    personalInfo: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        street: String,
        city: String,
        province: String,
        postalCode: String,
        country: {
          type: String,
          default: "Philippines",
        },
      },
      dateOfBirth: Date,
      nationality: {
        type: String,
        default: "Filipino",
      },
      civilStatus: {
        type: String,
        enum: ["Single", "Married", "Divorced", "Widowed", "Separated"],
      },
      profilePhoto: String,
    },
    professionalSummary: {
      type: String,
      maxlength: 500,
    },
    objective: {
      type: String,
      maxlength: 300,
    },
    workExperience: [{
      jobTitle: {
        type: String,
        required: true,
      },
      company: {
        type: String,
        required: true,
      },
      location: String,
      startDate: {
        type: Date,
        required: true,
      },
      endDate: Date,
      isCurrentJob: {
        type: Boolean,
        default: false,
      },
      responsibilities: [String],
      achievements: [String],
      salary: Number,
      reasonForLeaving: String,
    }],
    education: [{
      degree: {
        type: String,
        required: true,
      },
      institution: {
        type: String,
        required: true,
      },
      location: String,
      startDate: Date,
      endDate: Date,
      isCurrentlyEnrolled: {
        type: Boolean,
        default: false,
      },
      gpa: Number,
      maxGpa: Number,
      honors: String,
      relevantCoursework: [String],
      thesis: String,
    }],
    skills: {
      technical: [String],
      soft: [String],
      languages: [{
        language: String,
        proficiency: {
          type: String,
          enum: ["Basic", "Intermediate", "Advanced", "Native"],
        },
        certifications: [String],
      }],
    },
    certifications: [{
      name: {
        type: String,
        required: true,
      },
      issuingOrganization: String,
      issueDate: Date,
      expirationDate: Date,
      credentialId: String,
      credentialUrl: String,
      doesNotExpire: {
        type: Boolean,
        default: false,
      },
    }],
    civilServiceExam: {
      level: {
        type: String,
        enum: ["Professional", "Sub-Professional"],
      },
      rating: Number,
      dateOfExam: Date,
      validUntil: Date,
      eligibilityNumber: String,
    },
    projects: [{
      title: String,
      description: String,
      technologies: [String],
      startDate: Date,
      endDate: Date,
      url: String,
      role: String,
    }],
    publications: [{
      title: String,
      authors: [String],
      publication: String,
      publishDate: Date,
      url: String,
      description: String,
    }],
    awards: [{
      title: String,
      organization: String,
      date: Date,
      description: String,
    }],
    volunteerWork: [{
      organization: String,
      position: String,
      startDate: Date,
      endDate: Date,
      description: String,
      isCurrentPosition: {
        type: Boolean,
        default: false,
      },
    }],
    references: [{
      name: String,
      position: String,
      organization: String,
      email: String,
      phone: String,
      relationship: String,
      yearsKnown: Number,
    }],
    customSections: [{
      title: String,
      content: String,
      items: [String],
      order: Number,
    }],
    settings: {
      includePhoto: {
        type: Boolean,
        default: false,
      },
      includeReferences: {
        type: Boolean,
        default: true,
      },
      includeSalaryHistory: {
        type: Boolean,
        default: false,
      },
      dateFormat: {
        type: String,
        enum: ["MM/YYYY", "MM/DD/YYYY", "Month YYYY"],
        default: "MM/YYYY",
      },
      sectionOrder: [{
        section: String,
        order: Number,
        visible: {
          type: Boolean,
          default: true,
        },
      }],
    },
    aiOptimizations: {
      lastOptimizedAt: Date,
      optimizedFor: [String],
      suggestions: [{
        type: {
          type: String,
          enum: ["grammar", "content", "structure", "keywords", "formatting"],
        },
        suggestion: String,
        priority: {
          type: String,
          enum: ["low", "medium", "high"],
        },
        applied: {
          type: Boolean,
          default: false,
        },
        appliedAt: Date,
      }],
      keywordOptimization: {
        targetKeywords: [String],
        currentDensity: Number,
        recommendedDensity: Number,
        missingKeywords: [String],
      },
    },
    versions: [{
      title: String,
      data: mongoose.Schema.Types.Mixed,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      notes: String,
    }],
    isDefault: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareUrl: String,
    downloadCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    lastExported: Date,
    exportFormats: [{
      format: {
        type: String,
        enum: ["pdf", "docx", "html", "txt"],
      },
      exportedAt: {
        type: Date,
        default: Date.now,
      },
      fileSize: Number,
      downloadUrl: String,
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

resumeSchema.virtual("fullName").get(function () {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

resumeSchema.virtual("totalExperience").get(function () {
  if (!this.workExperience || this.workExperience.length === 0) return 0;
  
  let totalMonths = 0;
  this.workExperience.forEach(job => {
    const startDate = new Date(job.startDate);
    const endDate = job.isCurrentJob ? new Date() : new Date(job.endDate);
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                  (endDate.getMonth() - startDate.getMonth());
    totalMonths += months;
  });
  
  return Math.round(totalMonths / 12 * 10) / 10;
});

resumeSchema.virtual("completenessScore").get(function () {
  let score = 0;
  const maxScore = 100;
  
  if (this.personalInfo.firstName && this.personalInfo.lastName) score += 10;
  if (this.personalInfo.email && this.personalInfo.phone) score += 10;
  if (this.personalInfo.address.city && this.personalInfo.address.province) score += 5;
  if (this.professionalSummary || this.objective) score += 15;
  if (this.workExperience.length > 0) score += 20;
  if (this.education.length > 0) score += 15;
  if (this.skills.technical.length > 0 || this.skills.soft.length > 0) score += 10;
  if (this.certifications.length > 0) score += 10;
  if (this.civilServiceExam.level && this.civilServiceExam.rating) score += 5;
  
  return Math.min(score, maxScore);
});

resumeSchema.methods.createVersion = function (notes = "") {
  this.versions.push({
    title: `Version ${this.versions.length + 1}`,
    data: this.toObject(),
    notes,
  });
  
  if (this.versions.length > 10) {
    this.versions = this.versions.slice(-10);
  }
  
  return this.save();
};

resumeSchema.methods.revertToVersion = function (versionIndex) {
  if (versionIndex >= 0 && versionIndex < this.versions.length) {
    const version = this.versions[versionIndex];
    Object.assign(this, version.data);
    return this.save();
  }
  throw new Error("Invalid version index");
};

resumeSchema.methods.optimizeForJob = function (jobPosting) {
  const keywords = [];
  
  if (jobPosting.title) keywords.push(...jobPosting.title.toLowerCase().split(" "));
  if (jobPosting.description) keywords.push(...jobPosting.description.toLowerCase().match(/\b\w+\b/g));
  if (jobPosting.qualifications) keywords.push(...jobPosting.qualifications.join(" ").toLowerCase().split(" "));
  
  const uniqueKeywords = [...new Set(keywords)].filter(word => word.length > 3);
  
  this.aiOptimizations.targetKeywords = uniqueKeywords.slice(0, 20);
  this.aiOptimizations.optimizedFor.push(jobPosting._id.toString());
  this.aiOptimizations.lastOptimizedAt = new Date();
  
  return this.save();
};

resumeSchema.methods.generateShareUrl = function () {
  const shareToken = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
  this.shareUrl = `${process.env.FRONTEND_URL}/resume/view/${shareToken}`;
  return this.save();
};

resumeSchema.methods.incrementView = function () {
  this.viewCount++;
  return this.save();
};

resumeSchema.methods.incrementDownload = function () {
  this.downloadCount++;
  this.lastExported = new Date();
  return this.save();
};

resumeSchema.statics.getUserResumes = function (userId) {
  return this.find({ userId })
    .sort({ isDefault: -1, updatedAt: -1 });
};

resumeSchema.statics.setDefaultResume = async function (userId, resumeId) {
  await this.updateMany({ userId }, { isDefault: false });
  return this.findByIdAndUpdate(resumeId, { isDefault: true }, { new: true });
};

resumeSchema.statics.getPublicResumes = function (limit = 20) {
  return this.find({ isPublic: true })
    .sort({ viewCount: -1, updatedAt: -1 })
    .limit(limit)
    .select("-versions -aiOptimizations -personalInfo.email -personalInfo.phone");
};

resumeSchema.statics.getResumeStats = function (userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalResumes: { $sum: 1 },
        totalViews: { $sum: "$viewCount" },
        totalDownloads: { $sum: "$downloadCount" },
        avgCompleteness: { $avg: "$completenessScore" },
        templatesUsed: { $addToSet: "$template" },
        lastUpdated: { $max: "$updatedAt" },
      }
    }
  ]);
};

resumeSchema.index({ userId: 1, isDefault: -1 });
resumeSchema.index({ isPublic: 1, viewCount: -1 });
resumeSchema.index({ userId: 1, updatedAt: -1 });
resumeSchema.index({ shareUrl: 1 });

export default mongoose.model("Resume", resumeSchema);
