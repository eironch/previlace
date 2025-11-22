import express from "express";
import {
  uploadFile,
  getFiles,
  downloadFile,
  deleteFile,
} from "../controllers/fileController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import upload from "../middleware/fileUpload.js";

const router = express.Router();

router.use(protect);

router.post(
  "/upload",
  restrictTo("admin", "instructor"),
  upload.single("file"),
  uploadFile
);

router.get("/", getFiles);
router.get("/:id/download", downloadFile);
router.delete("/:id", restrictTo("admin", "instructor"), deleteFile);

export default router;
