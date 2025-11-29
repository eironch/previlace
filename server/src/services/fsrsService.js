import integrityService from "./integrityService.js";

const FSRS_WEIGHTS = [
  0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031,
  1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755
];

const FSRS_CONFIG = {
  requestRetention: 0.9,
  maximumInterval: 365,
  decay: -0.5,
  factor: 0.9 ** (1 / -0.5)
};

const State = {
  NEW: 0,
  LEARNING: 1,
  REVIEW: 2,
  RELEARNING: 3
};

const Rating = {
  AGAIN: 1,
  HARD: 2,
  GOOD: 3,
  EASY: 4
};

class FSRSService {
  constructor(weights = FSRS_WEIGHTS, config = FSRS_CONFIG) {
    this.w = weights;
    this.requestRetention = config.requestRetention;
    this.maximumInterval = config.maximumInterval;
    this.decay = config.decay;
    this.factor = config.factor;
  }

  createEmptyCard(now = new Date()) {
    return {
      due: now,
      stability: 0,
      difficulty: 0,
      elapsedDays: 0,
      scheduledDays: 0,
      reps: 0,
      lapses: 0,
      state: State.NEW,
      lastReview: null
    };
  }

  getRetrievability(card, now = new Date()) {
    if (card.state === State.NEW || !card.lastReview) {
      return 0;
    }
    const elapsedDays = this.daysBetween(new Date(card.lastReview), now);
    return this.forgettingCurve(elapsedDays, card.stability);
  }

  forgettingCurve(elapsedDays, stability) {
    if (stability <= 0) return 0;
    return Math.pow(1 + (this.factor * elapsedDays) / stability, this.decay);
  }

  schedule(card, now = new Date(), rating) {
    const cardCopy = { ...card };
    const elapsedDays = card.lastReview 
      ? this.daysBetween(new Date(card.lastReview), now) 
      : 0;

    cardCopy.elapsedDays = elapsedDays;
    cardCopy.lastReview = now;
    cardCopy.reps += 1;

    if (card.state === State.NEW) {
      return this.scheduleNew(cardCopy, rating);
    }

    return this.scheduleReview(cardCopy, rating);
  }

  scheduleNew(card, rating) {
    card.difficulty = this.initDifficulty(rating);
    card.stability = this.initStability(rating);

    switch (rating) {
      case Rating.AGAIN:
        card.state = State.LEARNING;
        card.scheduledDays = 0;
        card.due = this.addMinutes(new Date(card.lastReview), 1);
        card.lapses += 1;
        break;
      case Rating.HARD:
        card.state = State.LEARNING;
        card.scheduledDays = 0;
        card.due = this.addMinutes(new Date(card.lastReview), 5);
        break;
      case Rating.GOOD:
        card.state = State.LEARNING;
        card.scheduledDays = 0;
        card.due = this.addMinutes(new Date(card.lastReview), 10);
        break;
      case Rating.EASY:
        card.state = State.REVIEW;
        const interval = this.nextInterval(card.stability);
        card.scheduledDays = interval;
        card.due = this.addDays(new Date(card.lastReview), interval);
        break;
    }

    return card;
  }

  scheduleReview(card, rating) {
    const retrievability = this.getRetrievability(card, new Date(card.lastReview));

    if (rating === Rating.AGAIN) {
      card.lapses += 1;
      card.stability = this.nextForgetStability(
        card.difficulty,
        card.stability,
        retrievability
      );
      card.difficulty = this.nextDifficulty(card.difficulty, rating);
      card.state = State.RELEARNING;
      card.scheduledDays = 0;
      card.due = this.addMinutes(new Date(card.lastReview), 5);
    } else {
      card.stability = this.nextRecallStability(
        card.difficulty,
        card.stability,
        retrievability,
        rating
      );
      card.difficulty = this.nextDifficulty(card.difficulty, rating);
      card.state = State.REVIEW;
      const interval = this.nextInterval(card.stability);
      card.scheduledDays = interval;
      card.due = this.addDays(new Date(card.lastReview), interval);
    }

    return card;
  }

  initStability(rating) {
    return Math.max(0.1, this.w[rating - 1]);
  }

  initDifficulty(rating) {
    return this.constrainDifficulty(this.w[4] - Math.exp(this.w[5] * (rating - 1)) + 1);
  }

  nextDifficulty(d, rating) {
    const delta = rating - 3;
    const nextD = d - this.w[6] * delta;
    return this.constrainDifficulty(this.meanReversion(this.w[4], nextD));
  }

  constrainDifficulty(d) {
    return Math.min(Math.max(d, 1), 10);
  }

  meanReversion(init, current) {
    return this.w[7] * init + (1 - this.w[7]) * current;
  }

  nextRecallStability(d, s, r, rating) {
    const hardPenalty = rating === Rating.HARD ? this.w[15] : 1;
    const easyBonus = rating === Rating.EASY ? this.w[16] : 1;

    return s * (
      1 +
      Math.exp(this.w[8]) *
      (11 - d) *
      Math.pow(s, -this.w[9]) *
      (Math.exp((1 - r) * this.w[10]) - 1) *
      hardPenalty *
      easyBonus
    );
  }

  nextForgetStability(d, s, r) {
    return Math.max(
      0.1,
      this.w[11] *
      Math.pow(d, -this.w[12]) *
      (Math.pow(s + 1, this.w[13]) - 1) *
      Math.exp((1 - r) * this.w[14])
    );
  }

  nextInterval(stability) {
    const interval = Math.round(
      (stability / this.factor) * (Math.pow(this.requestRetention, 1 / this.decay) - 1)
    );
    return Math.min(Math.max(interval, 1), this.maximumInterval);
  }

  daysBetween(date1, date2) {
    const diffTime = Math.abs(date2 - date1);
    return diffTime / (1000 * 60 * 60 * 24);
  }

  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  addMinutes(date, minutes) {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }

  calculateExamReadiness(cards, examDate) {
    if (!cards || cards.length === 0) return 0;

    const now = new Date();
    const daysUntilExam = this.daysBetween(now, new Date(examDate));
    let totalRetrievability = 0;
    let validCards = 0;

    for (const card of cards) {
      if (card.state === State.NEW || !card.lastReview) continue;

      const elapsedDays = this.daysBetween(new Date(card.lastReview), now);
      const daysAtExam = elapsedDays + daysUntilExam;
      const retrievabilityAtExam = this.forgettingCurve(daysAtExam, card.stability);

      totalRetrievability += retrievabilityAtExam;
      validCards++;
    }

    if (validCards === 0) return 0;
    return Math.round((totalRetrievability / validCards) * 100);
  }

  getDueCards(cards, now = new Date()) {
    return cards.filter(card => {
      if (!card.due) return true;
      return new Date(card.due) <= now;
    });
  }

  sortByPriority(cards, now = new Date()) {
    return [...cards].sort((a, b) => {
      const retrievabilityA = this.getRetrievability(a, now);
      const retrievabilityB = this.getRetrievability(b, now);
      return retrievabilityA - retrievabilityB;
    });
  }

  migrateFromSM2(sm2Data) {
    const difficulty = this.mapEaseFactorToDifficulty(sm2Data.easeFactor || 2.5);
    const stability = Math.max(0.1, sm2Data.interval || 1);
    
    let state = State.NEW;
    if (sm2Data.repetitions > 0) {
      state = sm2Data.interval >= 1 ? State.REVIEW : State.LEARNING;
    }

    return {
      stability,
      difficulty,
      due: sm2Data.nextReviewDate || new Date(),
      elapsedDays: 0,
      scheduledDays: sm2Data.interval || 0,
      reps: sm2Data.repetitions || 0,
      lapses: 0,
      state: this.stateToString(state),
      lastReview: sm2Data.lastReviewedAt || null
    };
  }

  mapEaseFactorToDifficulty(easeFactor) {
    const normalized = (easeFactor - 1.3) / (3.0 - 1.3);
    return Math.max(1, Math.min(10, 10 - normalized * 9));
  }

  stateToString(state) {
    const stateMap = {
      [State.NEW]: "new",
      [State.LEARNING]: "learning",
      [State.REVIEW]: "review",
      [State.RELEARNING]: "relearning"
    };
    return stateMap[state] || "new";
  }

  stringToState(stateStr) {
    const stateMap = {
      "new": State.NEW,
      "learning": State.LEARNING,
      "review": State.REVIEW,
      "relearning": State.RELEARNING
    };
    return stateMap[stateStr] ?? State.NEW;
  }

  async getBehaviorAdjustedRating(userId, questionId, isCorrect, responseTime, behaviorData) {
    return integrityService.getRatingForQuestion(
      userId,
      questionId,
      isCorrect,
      responseTime,
      behaviorData
    );
  }

  calculateRatingFromBehavior(isCorrect, responseTime, avgQuestionTime, behaviorData = {}) {
    if (!isCorrect) return Rating.AGAIN;

    const timeRatio = responseTime / (avgQuestionTime || 30000);
    let rating;

    if (timeRatio < 0.5) rating = 4;
    else if (timeRatio < 0.8) rating = 3;
    else rating = 2;

    if (behaviorData.answerChanges > 2) {
      rating = Math.max(2, rating - 1);
    }

    if (behaviorData.wasSkipped) {
      rating = Math.max(2, rating - 0.5);
    }

    if (behaviorData.focusScore && behaviorData.focusScore < 70) {
      rating = Math.max(2, rating - 0.5);
    }

    if (behaviorData.integrityEventCount > 0) {
      rating = Math.max(2, rating - 1);
    }

    return Math.round(rating);
  }
}

export const Rating_ENUM = Rating;
export const State_ENUM = State;
export default new FSRSService();
