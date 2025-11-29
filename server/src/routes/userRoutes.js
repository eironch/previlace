import express from "express";
import userController from "../controllers/userController.js";
import { authenticate, restrictTo } from "../middleware/authMiddleware.js";
import { validateUpdateProfile } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/dashboard", userController.getDashboardData);
router.get("/my-registration", userController.getMyRegistration);
router.get("/profile", userController.getProfile);
router.patch("/profile", validateUpdateProfile, userController.updateProfile);
router.get("/level", userController.getLevel);
router.delete("/account", userController.deleteAccount);

router.get("/devices", userController.getActiveDevices);
router.delete("/devices/:deviceId", userController.revokeDevice);

router.get("/level", userController.getLevel);

import * as streakController from "../controllers/streakController.js";
router.get("/study-streak", streakController.getStreak);
router.post("/study-streak/session", streakController.updateStreak);

router.use(restrictTo("admin"));

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.patch("/:id/role", userController.updateUserRole);
router.delete("/:id", userController.deleteUser);

export default router;
