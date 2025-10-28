import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import flashcardController from "../controllers/flashcardController.js";

const router = express.Router();

router.use(authenticate);

router.get("/due", flashcardController.getDueFlashcards);
router.get("/stats", flashcardController.getFlashcardStats);
router.post("/:flashcardId/review", flashcardController.recordFlashcardReview);

router.post("/decks", flashcardController.createFlashcardDeck);
router.get("/decks/list", flashcardController.getFlashcardDecks);
router.get("/decks/public", flashcardController.getPublicFlashcardDecks);
router.put("/decks/:deckId", flashcardController.updateFlashcardDeck);
router.delete("/decks/:deckId", flashcardController.deleteFlashcardDeck);
router.post("/decks/:deckId/questions", flashcardController.addQuestionToFlashcardDeck);

export default router;
