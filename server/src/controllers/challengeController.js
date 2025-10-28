import Challenge from "../models/Challenge.js";
import { AppError, catchAsync } from "../utils/AppError.js";
import socketService from "../services/socketService.js";

const sendChallenge = catchAsync(async (req, res, next) => {
  const {
    opponentId,
    type = "quiz",
    category,
    difficulty = "intermediate",
    questionCount = 10,
    timeLimit = 600,
  } = req.body;

  if (!opponentId) {
    return next(new AppError("Opponent ID is required", 400));
  }

  if (req.user._id.toString() === opponentId) {
    return next(new AppError("Cannot challenge yourself", 400));
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 3);

  const challenge = await Challenge.create({
    challengerId: req.user._id,
    opponentId,
    type,
    category: category || null,
    difficulty,
    questionCount,
    timeLimit,
    expiresAt,
  });

  await challenge.populate("challengerId", "firstName lastName avatar");
  await challenge.populate("opponentId", "firstName lastName avatar");

  socketService.io.to(opponentId).emit("challenge:received", {
    challengeId: challenge._id,
    challenger: challenge.challengerId,
  });

  res.status(201).json({
    success: true,
    data: { challenge },
  });
});

const getPendingChallenges = catchAsync(async (req, res, next) => {
  const challenges = await Challenge.getPendingChallenges(req.user._id);

  res.json({
    success: true,
    data: { challenges },
  });
});

const acceptChallenge = catchAsync(async (req, res, next) => {
  const { challengeId } = req.params;

  const challenge = await Challenge.findById(challengeId);

  if (!challenge) {
    return next(new AppError("Challenge not found", 404));
  }

  if (challenge.opponentId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to accept this challenge", 403));
  }

  if (challenge.status !== "pending") {
    return next(new AppError("Challenge is not pending", 400));
  }

  await challenge.accept();
  challenge.status = "in-progress";
  await challenge.save();

  socketService.io
    .to(challenge.challengerId.toString())
    .emit("challenge:accepted", {
      challengeId: challenge._id,
    });

  res.json({
    success: true,
    data: { message: "Challenge accepted", challenge },
  });
});

const declineChallenge = catchAsync(async (req, res, next) => {
  const { challengeId } = req.params;

  const challenge = await Challenge.findById(challengeId);

  if (!challenge) {
    return next(new AppError("Challenge not found", 404));
  }

  if (challenge.opponentId.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to decline this challenge", 403));
  }

  await challenge.decline();

  socketService.io
    .to(challenge.challengerId.toString())
    .emit("challenge:declined", {
      challengeId: challenge._id,
    });

  res.json({
    success: true,
    data: { message: "Challenge declined" },
  });
});

const getActiveChallenges = catchAsync(async (req, res, next) => {
  const challenges = await Challenge.getActiveChallenges(req.user._id);

  res.json({
    success: true,
    data: { challenges },
  });
});

const recordChallengeScore = catchAsync(async (req, res, next) => {
  const { challengeId } = req.params;
  const { sessionId, score, percentage, timeSpent } = req.body;

  const challenge = await Challenge.findById(challengeId)
    .populate("challengerId")
    .populate("opponentId");

  if (!challenge) {
    return next(new AppError("Challenge not found", 404));
  }

  if (challenge.challengerId._id.toString() === req.user._id.toString()) {
    await challenge.recordChallengerScore(sessionId, score, percentage, timeSpent);
  } else if (challenge.opponentId._id.toString() === req.user._id.toString()) {
    await challenge.recordOpponentScore(sessionId, score, percentage, timeSpent);
  } else {
    return next(
      new AppError("Not authorized to record score for this challenge", 403)
    );
  }

  if (challenge.status === "completed") {
    socketService.io.to(challenge.challengerId._id.toString()).emit("challenge:completed", {
      challengeId: challenge._id,
      winner: challenge.winner,
    });

    socketService.io.to(challenge.opponentId._id.toString()).emit("challenge:completed", {
      challengeId: challenge._id,
      winner: challenge.winner,
    });
  }

  res.json({
    success: true,
    data: { challenge },
  });
});

const getChallengeHistory = catchAsync(async (req, res, next) => {
  const { limit = 20, page = 1 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const challenges = await Challenge.getChallengeHistory(
    req.user._id,
    limit
  );

  const paginatedChallenges = challenges.slice(
    skip,
    skip + parseInt(limit)
  );

  res.json({
    success: true,
    data: {
      challenges: paginatedChallenges,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(challenges.length / parseInt(limit)),
        totalItems: challenges.length,
      },
    },
  });
});

const getUserChallengeStats = catchAsync(async (req, res, next) => {
  const stats = await Challenge.getUserChallengeStats(req.user._id);

  const result = stats[0] || {
    totalChallenges: 0,
    wins: 0,
    losses: 0,
  };

  const winRate =
    result.totalChallenges > 0
      ? Math.round((result.wins / result.totalChallenges) * 100)
      : 0;

  res.json({
    success: true,
    data: {
      totalChallenges: result.totalChallenges,
      wins: result.wins,
      losses: result.losses,
      winRate,
    },
  });
});

export default {
  sendChallenge,
  getPendingChallenges,
  acceptChallenge,
  declineChallenge,
  getActiveChallenges,
  recordChallengeScore,
  getChallengeHistory,
  getUserChallengeStats,
};
