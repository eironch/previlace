import express from "express";
import studyGroupController from "../controllers/studyGroupController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateStudyGroup, validateMessage, validateMemberAction } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(validateStudyGroup, studyGroupController.createStudyGroup)
  .get(studyGroupController.getUserGroups);

router.get("/public", studyGroupController.getPublicGroups);

router.post("/join-by-code", studyGroupController.joinGroupByInviteCode);

router
  .route("/:groupId")
  .get(studyGroupController.getGroupDetails)
  .put(validateStudyGroup, studyGroupController.updateGroup);

router.post("/:groupId/join", studyGroupController.joinGroup);
router.post("/:groupId/leave", studyGroupController.leaveGroup);

router.post("/:groupId/members/:memberId", validateMemberAction, studyGroupController.manageMember);

router
  .route("/:groupId/messages")
  .post(validateMessage, studyGroupController.sendMessage)
  .get(studyGroupController.getMessages);

router.delete("/:groupId/messages/:messageId", studyGroupController.deleteMessage);

router.get("/:groupId/leaderboard", studyGroupController.getGroupLeaderboard);

export default router;
