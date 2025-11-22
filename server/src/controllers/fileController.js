import File from "../models/File.js";
import { AppError } from "../utils/AppError.js";
import path from "path";
import fs from "fs";

async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    const { relatedType, relatedId } = req.body;

    const file = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      path: req.file.path,
      uploadedBy: req.user.id,
      relatedTo: {
        type: relatedType || "other",
        id: relatedId || null,
      },
    });

    res.status(201).json(file);
  } catch (error) {
    // Clean up uploaded file if database creation fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    next(error);
  }
}

async function getFiles(req, res, next) {
  try {
    const { relatedType, relatedId } = req.query;
    const filter = {};

    if (relatedType) filter["relatedTo.type"] = relatedType;
    if (relatedId) filter["relatedTo.id"] = relatedId;

    const files = await File.find(filter)
      .populate("uploadedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    next(error);
  }
}

async function downloadFile(req, res, next) {
  try {
    const { id } = req.params;
    const file = await File.findById(id);

    if (!file) {
      throw new AppError("File not found", 404);
    }

    // Increment download count
    file.downloadCount += 1;
    await file.save();

    const filePath = path.resolve(file.path);
    res.download(filePath, file.originalName);
  } catch (error) {
    next(error);
  }
}

async function deleteFile(req, res, next) {
  try {
    const { id } = req.params;
    const file = await File.findById(id);

    if (!file) {
      throw new AppError("File not found", 404);
    }

    if (
      req.user.role !== "admin" &&
      file.uploadedBy.toString() !== req.user.id
    ) {
      throw new AppError("Unauthorized to delete this file", 403);
    }

    // Delete from filesystem
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete from database
    await File.findByIdAndDelete(id);

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export { uploadFile, getFiles, downloadFile, deleteFile };
