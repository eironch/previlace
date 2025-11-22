import mongoose from "mongoose";

const TicketStatus = Object.freeze({
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  EXPIRED: "expired",
});

const TicketPriority = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
});

const inquiryTicketSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.OPEN,
    },
    priority: {
      type: String,
      enum: Object.values(TicketPriority),
      default: TicketPriority.MEDIUM,
    },
    responses: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
          maxlength: 2000,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    internalNotes: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        note: {
          type: String,
          required: true,
          trim: true,
          maxlength: 1000,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolvedAt: {
      type: Date,
    },
    resolutionTime: {
      type: Number,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

inquiryTicketSchema.index({ student: 1, status: 1 });
inquiryTicketSchema.index({ instructor: 1, status: 1 });
inquiryTicketSchema.index({ subject: 1 });
inquiryTicketSchema.index({ expiresAt: 1 });

inquiryTicketSchema.methods.resolve = function () {
  this.status = TicketStatus.RESOLVED;
  this.resolvedAt = new Date();
  this.resolutionTime = this.resolvedAt - this.createdAt;
  return this.save();
};

inquiryTicketSchema.methods.expire = function () {
  this.status = TicketStatus.EXPIRED;
  return this.save();
};

inquiryTicketSchema.methods.addResponse = function (authorId, message) {
  this.responses.push({ author: authorId, message });
  if (this.status === TicketStatus.OPEN) {
    this.status = TicketStatus.IN_PROGRESS;
  }
  return this.save();
};

inquiryTicketSchema.methods.addInternalNote = function (authorId, note) {
  this.internalNotes.push({ author: authorId, note });
  return this.save();
};

inquiryTicketSchema.statics.TicketStatus = TicketStatus;
inquiryTicketSchema.statics.TicketPriority = TicketPriority;

export default mongoose.model("InquiryTicket", inquiryTicketSchema);
