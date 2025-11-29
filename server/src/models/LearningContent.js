import mongoose from "mongoose";

const learningContentSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      unique: true,
      unique: true,
    },
    content: {
      introduction: {
        type: String,
        default: "",
      },
      sections: [
        {
          title: {
            type: String,
            required: true,
          },
          content: {
            type: String,
            required: true,
          },
          order: {
            type: Number,
            default: 0,
          },
        },
      ],
      keyPoints: [String],
      examples: [
        {
          title: String,
          description: String,
        },
      ],
    },
    tips: [String],
    commonMistakes: [String],
    resources: [
      {
        title: String,
        url: String,
        type: {
          type: String,
          enum: ["video", "article", "pdf", "external"],
        },
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

learningContentSchema.methods.publish = function () {
  this.isPublished = true;
  return this.save();
};

learningContentSchema.methods.unpublish = function () {
  this.isPublished = false;
  return this.save();
};

learningContentSchema.methods.addSection = function (section) {
  this.content.sections.push(section);
  this.content.sections.sort((a, b) => a.order - b.order);
  return this.save();
};

learningContentSchema.methods.removeSection = function (sectionId) {
  this.content.sections = this.content.sections.filter(
    (section) => section._id.toString() !== sectionId.toString()
  );
  return this.save();
};

learningContentSchema.statics.getByTopic = function (topicId) {
  return this.findOne({ topicId, isPublished: true });
};


learningContentSchema.index({ isPublished: 1 });

export default mongoose.model("LearningContent", learningContentSchema);
