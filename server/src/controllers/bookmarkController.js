import Bookmark from "../models/Bookmark.js";
import BookmarkFolder from "../models/BookmarkFolder.js";
import { AppError, catchAsync } from "../utils/AppError.js";

const createBookmark = catchAsync(async (req, res, next) => {
  const { questionId, notes, priority, folderId } = req.body;

  if (!questionId) {
    return next(new AppError("Question ID is required", 400));
  }

  const bookmark = await Bookmark.getOrCreate(req.user._id, questionId, folderId);

  if (notes) bookmark.notes = notes;
  if (priority) bookmark.priority = priority;
  if (folderId) bookmark.folderId = folderId;

  await bookmark.save();

  res.status(201).json({
    success: true,
    data: { bookmark },
  });
});

const getBookmarks = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, folderId, priority, tags } = req.query;

  const filters = {};
  if (folderId) filters.folderId = folderId;
  if (priority) filters.priority = priority;
  if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];

  const bookmarks = await Bookmark.getUserBookmarks(req.user._id, filters);

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const paginatedBookmarks = bookmarks.slice(skip, skip + parseInt(limit));

  res.json({
    success: true,
    data: {
      bookmarks: paginatedBookmarks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(bookmarks.length / parseInt(limit)),
        totalItems: bookmarks.length,
        hasNextPage: page * limit < bookmarks.length,
        hasPrevPage: page > 1,
      },
    },
  });
});

const updateBookmark = catchAsync(async (req, res, next) => {
  const { bookmarkId } = req.params;
  const { notes, priority, folderId, tags } = req.body;

  const bookmark = await Bookmark.findById(bookmarkId);

  if (!bookmark) {
    return next(new AppError("Bookmark not found", 404));
  }

  if (bookmark.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to update this bookmark", 403));
  }

  if (notes !== undefined) bookmark.notes = notes;
  if (priority !== undefined) bookmark.priority = priority;
  if (folderId !== undefined) bookmark.folderId = folderId;
  if (tags !== undefined) bookmark.tags = tags;

  await bookmark.save();

  res.json({
    success: true,
    data: { bookmark },
  });
});

const deleteBookmark = catchAsync(async (req, res, next) => {
  const { bookmarkId } = req.params;

  const bookmark = await Bookmark.findById(bookmarkId);

  if (!bookmark) {
    return next(new AppError("Bookmark not found", 404));
  }

  if (bookmark.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to delete this bookmark", 403));
  }

  await Bookmark.deleteOne({ _id: bookmarkId });

  res.json({
    success: true,
    data: { message: "Bookmark deleted" },
  });
});

const createBookmarkFolder = catchAsync(async (req, res, next) => {
  const { name, description, color } = req.body;

  if (!name) {
    return next(new AppError("Folder name is required", 400));
  }

  const folder = await BookmarkFolder.create({
    userId: req.user._id,
    name,
    description,
    color: color || "#3B82F6",
  });

  res.status(201).json({
    success: true,
    data: { folder },
  });
});

const getBookmarkFolders = catchAsync(async (req, res, next) => {
  const folders = await BookmarkFolder.getUserFolders(req.user._id);

  const foldersWithStats = await Promise.all(
    folders.map(async (folder) => {
      const stats = await folder.getStats();
      return {
        ...folder.toObject(),
        ...stats,
      };
    })
  );

  res.json({
    success: true,
    data: { folders: foldersWithStats },
  });
});

const updateBookmarkFolder = catchAsync(async (req, res, next) => {
  const { folderId } = req.params;
  const { name, description, color } = req.body;

  const folder = await BookmarkFolder.findById(folderId);

  if (!folder) {
    return next(new AppError("Folder not found", 404));
  }

  if (folder.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to update this folder", 403));
  }

  if (name) folder.name = name;
  if (description !== undefined) folder.description = description;
  if (color) folder.color = color;

  await folder.save();

  res.json({
    success: true,
    data: { folder },
  });
});

const deleteBookmarkFolder = catchAsync(async (req, res, next) => {
  const { folderId } = req.params;

  const folder = await BookmarkFolder.findById(folderId);

  if (!folder) {
    return next(new AppError("Folder not found", 404));
  }

  if (folder.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to delete this folder", 403));
  }

  await Bookmark.updateMany({ folderId }, { folderId: null });
  await BookmarkFolder.deleteOne({ _id: folderId });

  res.json({
    success: true,
    data: { message: "Folder deleted" },
  });
});

const getBookmarkStats = catchAsync(async (req, res, next) => {
  const stats = await Bookmark.getUserStats(req.user._id);

  res.json({
    success: true,
    data: { stats: stats[0] || null },
  });
});

export default {
  createBookmark,
  getBookmarks,
  updateBookmark,
  deleteBookmark,
  createBookmarkFolder,
  getBookmarkFolders,
  updateBookmarkFolder,
  deleteBookmarkFolder,
  getBookmarkStats,
};
