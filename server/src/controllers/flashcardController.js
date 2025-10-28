import Flashcard from "../models/Flashcard.js";
import FlashcardDeck from "../models/FlashcardDeck.js";
import spacedRepetitionService from "../services/spacedRepetitionService.js";
import { AppError, catchAsync } from "../utils/AppError.js";

const getDueFlashcards = catchAsync(async (req, res, next) => {
  const { limit = 20 } = req.query;

  const flashcards = await Flashcard.getDueCards(req.user._id, parseInt(limit));

  res.json({
    success: true,
    data: { flashcards },
  });
});

const recordFlashcardReview = catchAsync(async (req, res, next) => {
  const { flashcardId } = req.params;
  const { quality, timeSpent } = req.body;

  const flashcard = await Flashcard.findById(flashcardId);

  if (!flashcard) {
    return next(new AppError("Flashcard not found", 404));
  }

  if (flashcard.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to review this flashcard", 403));
  }

  if (quality < 0 || quality > 5) {
    return next(new AppError("Quality must be between 0 and 5", 400));
  }

  await flashcard.recordReview(quality, timeSpent || 0);

  const reviewData = spacedRepetitionService.calculateNextReview(quality, {
    easeFactor: flashcard.easeFactor,
    interval: flashcard.interval,
    repetitions: flashcard.repetitions,
  });

  flashcard.easeFactor = reviewData.easeFactor;
  flashcard.interval = reviewData.interval;
  flashcard.repetitions = reviewData.repetitions;
  flashcard.nextReviewDate = reviewData.nextReviewDate;

  await flashcard.save();

  if (flashcard.deckId) {
    const deck = await FlashcardDeck.findById(flashcard.deckId);
    if (deck) {
      await deck.updateStatistics();
    }
  }

  res.json({
    success: true,
    data: { flashcard },
  });
});

const getFlashcardStats = catchAsync(async (req, res, next) => {
  const stats = await Flashcard.getUserStats(req.user._id);

  res.json({
    success: true,
    data: { stats: stats[0] || null },
  });
});

const createFlashcardDeck = catchAsync(async (req, res, next) => {
  const { name, description, isPublic } = req.body;

  if (!name) {
    return next(new AppError("Deck name is required", 400));
  }

  const deck = await FlashcardDeck.create({
    userId: req.user._id,
    name,
    description,
    isPublic: isPublic || false,
  });

  res.status(201).json({
    success: true,
    data: { deck },
  });
});

const getFlashcardDecks = catchAsync(async (req, res, next) => {
  const decks = await FlashcardDeck.getUserDecks(req.user._id);

  res.json({
    success: true,
    data: { decks },
  });
});

const getPublicFlashcardDecks = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const decks = await FlashcardDeck.getPublicDecks(parseInt(limit));

  res.json({
    success: true,
    data: { decks },
  });
});

const updateFlashcardDeck = catchAsync(async (req, res, next) => {
  const { deckId } = req.params;
  const { name, description, isPublic } = req.body;

  const deck = await FlashcardDeck.findById(deckId);

  if (!deck) {
    return next(new AppError("Deck not found", 404));
  }

  if (deck.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to update this deck", 403));
  }

  if (name) deck.name = name;
  if (description !== undefined) deck.description = description;
  if (isPublic !== undefined) deck.isPublic = isPublic;

  await deck.save();

  res.json({
    success: true,
    data: { deck },
  });
});

const deleteFlashcardDeck = catchAsync(async (req, res, next) => {
  const { deckId } = req.params;

  const deck = await FlashcardDeck.findById(deckId);

  if (!deck) {
    return next(new AppError("Deck not found", 404));
  }

  if (deck.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to delete this deck", 403));
  }

  await Flashcard.deleteMany({ deckId });
  await FlashcardDeck.deleteOne({ _id: deckId });

  res.json({
    success: true,
    data: { message: "Deck deleted" },
  });
});

const addQuestionToFlashcardDeck = catchAsync(async (req, res, next) => {
  const { deckId } = req.params;
  const { questionId } = req.body;

  const deck = await FlashcardDeck.findById(deckId);

  if (!deck) {
    return next(new AppError("Deck not found", 404));
  }

  if (deck.userId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to modify this deck", 403));
  }

  await deck.addQuestion(questionId);

  const flashcard = await Flashcard.getOrCreate(req.user._id, questionId, deckId);

  res.json({
    success: true,
    data: { deck, flashcard },
  });
});

export default {
  getDueFlashcards,
  recordFlashcardReview,
  getFlashcardStats,
  createFlashcardDeck,
  getFlashcardDecks,
  getPublicFlashcardDecks,
  updateFlashcardDeck,
  deleteFlashcardDeck,
  addQuestionToFlashcardDeck,
};
