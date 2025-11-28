import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    relatedTo: {
      type: {
        type: String,
        enum: ["subject", "topic", "ticket", "other"],
        default: "other",
      },
      id: {
        type: String, // Changed from ObjectId to String to support "global_resources"
      },
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ "relatedTo.type": 1, "relatedTo.id": 1 });

export default mongoose.model("File", fileSchema);
