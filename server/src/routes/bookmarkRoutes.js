import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import bookmarkController from "../controllers/bookmarkController.js";

const router = express.Router();

router.use(authenticate);

router.post("/", bookmarkController.createBookmark);
router.get("/", bookmarkController.getBookmarks);
router.put("/:bookmarkId", bookmarkController.updateBookmark);
router.delete("/:bookmarkId", bookmarkController.deleteBookmark);
router.get("/stats/all", bookmarkController.getBookmarkStats);

router.post("/folders", bookmarkController.createBookmarkFolder);
router.get("/folders/list", bookmarkController.getBookmarkFolders);
router.put("/folders/:folderId", bookmarkController.updateBookmarkFolder);
router.delete("/folders/:folderId", bookmarkController.deleteBookmarkFolder);

export default router;
