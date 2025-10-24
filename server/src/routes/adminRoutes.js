import express from "express";
import adminController from "../controllers/adminController.js";
import userManagementController from "../controllers/userManagementController.js";
import authenticate from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import { adminLimiter, statsLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

router.get("/stats", statsLimiter,  adminController.getAdminStats);
router.get("/users/recent", statsLimiter, adminController.getRecentUsers);
router.get("/users/:id", adminLimiter, adminController.getUserDetails);

router.get("/users", adminLimiter, userManagementController.getAllUsers);
router.patch("/users/:userId/status", adminLimiter, userManagementController.updateUserStatus);
router.post("/users/bulk-action", adminLimiter, userManagementController.bulkUserAction);
router.get("/users/:userId/activity", adminLimiter, userManagementController.getUserActivity);
router.get("/users/search", adminLimiter, userManagementController.searchUsers);
router.get("/users/export", adminLimiter, userManagementController.exportUsers);

export default router;
