import mongoose from "mongoose";
import dotenv from "dotenv";
import UserQuestionHistory from "../models/UserQuestionHistory.js";
import fsrsService from "../services/fsrsService.js";

dotenv.config();

async function migrateSM2ToFSRS() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected. Fetching histories...");
    
    const cursor = UserQuestionHistory.find({
      spacedRepetitionData: { $exists: true }
    }).lean().cursor();

    console.log("Starting migration with cursor...");

    let migrated = 0;
    let skipped = 0;
    let bulkOps = [];

    for await (const history of cursor) {
      if (history.fsrsData && history.fsrsData.reps > 0) {
        skipped++;
        continue;
      }

      const sm2Data = history.spacedRepetitionData || {};
      const fsrsData = fsrsService.migrateFromSM2({
        easeFactor: sm2Data.easeFactor || 2.5,
        interval: sm2Data.interval || 1,
        repetitions: sm2Data.repetitions || 0,
        nextReviewDate: sm2Data.nextReviewDate,
        lastReviewedAt: sm2Data.lastReviewedAt
      });

      bulkOps.push({
        updateOne: {
          filter: { _id: history._id },
          update: {
            $set: { fsrsData: fsrsData },
            $unset: { spacedRepetitionData: "" }
          }
        }
      });

      if (bulkOps.length >= 1000) {
        await UserQuestionHistory.bulkWrite(bulkOps);
        migrated += bulkOps.length;
        console.log(`Migrated ${migrated} records...`);
        bulkOps = [];
      }
    }

    if (bulkOps.length > 0) {
      await UserQuestionHistory.bulkWrite(bulkOps);
      migrated += bulkOps.length;
    }

    await mongoose.disconnect();
    
    return { migrated, skipped };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Migration error:", error);
    }
    throw error;
  }
}

if (process.argv[1].includes("migrateSM2ToFSRS")) {
  migrateSM2ToFSRS()
    .then(result => {
      console.log("Migration complete:", result);
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

export default migrateSM2ToFSRS;
