import express from "express";
import TemplateController from "../controllers/templateController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/templates", authenticateToken, TemplateController.createTemplate);
router.get("/templates", authenticateToken, TemplateController.getTemplates);
router.get("/templates/popular", authenticateToken, TemplateController.getPopularTemplates);
router.get("/templates/recommended", authenticateToken, TemplateController.getRecommendedTemplates);
router.get("/templates/:id", authenticateToken, TemplateController.getTemplateById);
router.get("/templates/:id/statistics", authenticateToken, TemplateController.getTemplateStatistics);
router.put("/templates/:id", authenticateToken, TemplateController.updateTemplate);
router.delete("/templates/:id", authenticateToken, TemplateController.deleteTemplate);
router.post("/templates/:id/publish", authenticateToken, TemplateController.publishTemplate);
router.post("/templates/:id/clone", authenticateToken, TemplateController.cloneTemplate);
router.post("/templates/:id/collaborators", authenticateToken, TemplateController.addCollaborator);
router.delete("/templates/:id/collaborators", authenticateToken, TemplateController.removeCollaborator);

export default router;