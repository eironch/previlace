import express from "express";
import questionTemplateController from "../controllers/questionTemplateController.js";
import authenticate from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", questionTemplateController.getTemplates);
router.get("/categories", questionTemplateController.getTemplateCategories);
router.get("/popular", questionTemplateController.getPopularTemplates);
router.get("/:id", questionTemplateController.getTemplateById);

router.post("/", questionTemplateController.createTemplate);
router.put("/:id", questionTemplateController.updateTemplate);
router.delete("/:id", questionTemplateController.deleteTemplate);

export default router;
