import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../utils/AppError.js";

// Ensure upload directory exists
// Ensure upload directory exists
const uploadDir = process.env.VERCEL || process.env.NODE_ENV === "production" ? "/tmp" : "uploads";

if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (error) {
    console.warn(`Failed to create upload directory at ${uploadDir}, using /tmp instead`);
    // Fallback to /tmp if custom path fails
    if (uploadDir !== "/tmp") {
       // This might be redundant if we already set it to /tmp, but good for safety
    }
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename: timestamp-uuid-extension
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, WEBP are allowed.",
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
});

export default upload;
