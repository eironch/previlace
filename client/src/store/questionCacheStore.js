import { create } from "zustand";
import { persist } from "zustand/middleware";

const CACHE_CONFIG = {
  DURATION: 5 * 60 * 1000,
  STALE_THRESHOLD: 60 * 1000,
  MAX_ENTRIES: 100,
  VERSION: "1.0.0",
};

const useQuestionCacheStore = create(
  persist(
    (set, get) => ({
      questionCache: {},
      userHistoryCache: {},
      lastFetchTimestamps: {},
      cacheVersion: CACHE_CONFIG.VERSION,
      cacheHits: 0,
      cacheMisses: 0,

      getCachedQuestions: (key) => {
        const { questionCache, lastFetchTimestamps, cacheVersion } = get();

        if (cacheVersion !== CACHE_CONFIG.VERSION) {
          get().invalidateAllCaches();
          return null;
        }

        const cached = questionCache[key];
        const timestamp = lastFetchTimestamps[key];

        if (!cached || !timestamp) {
          set((state) => ({ cacheMisses: state.cacheMisses + 1 }));
          return null;
        }

        const age = Date.now() - timestamp;

        if (age > CACHE_CONFIG.DURATION) {
          get().invalidateCache(key);
          set((state) => ({ cacheMisses: state.cacheMisses + 1 }));
          return null;
        }

        set((state) => ({ cacheHits: state.cacheHits + 1 }));

        return {
          data: cached,
          isStale: age > CACHE_CONFIG.STALE_THRESHOLD,
          age,
          shouldRevalidate: age > CACHE_CONFIG.STALE_THRESHOLD,
        };
      },

      setCachedQuestions: (key, questions, metadata = {}) => {
        const { questionCache } = get();
        const cacheKeys = Object.keys(questionCache);

        if (cacheKeys.length >= CACHE_CONFIG.MAX_ENTRIES) {
          get().evictOldestEntries(10);
        }

        set((state) => ({
          questionCache: {
            ...state.questionCache,
            [key]: {
              questions,
              metadata,
              cachedAt: Date.now(),
            },
          },
          lastFetchTimestamps: {
            ...state.lastFetchTimestamps,
            [key]: Date.now(),
          },
        }));
      },

      getCachedUserHistory: (userId) => {
        const { userHistoryCache, lastFetchTimestamps, cacheVersion } = get();

        if (cacheVersion !== CACHE_CONFIG.VERSION) {
          return null;
        }

        const cacheKey = `history_${userId}`;
        const cached = userHistoryCache[userId];
        const timestamp = lastFetchTimestamps[cacheKey];

        if (!cached || !timestamp) {
          return null;
        }

        const age = Date.now() - timestamp;

        if (age > CACHE_CONFIG.DURATION) {
          get().invalidateUserHistory(userId);
          return null;
        }

        return {
          data: cached,
          isStale: age > CACHE_CONFIG.STALE_THRESHOLD,
          shouldRevalidate: age > CACHE_CONFIG.STALE_THRESHOLD,
        };
      },

      setCachedUserHistory: (userId, history) => {
        const cacheKey = `history_${userId}`;
        set((state) => ({
          userHistoryCache: {
            ...state.userHistoryCache,
            [userId]: {
              data: history,
              cachedAt: Date.now(),
            },
          },
          lastFetchTimestamps: {
            ...state.lastFetchTimestamps,
            [cacheKey]: Date.now(),
          },
        }));
      },

      invalidateCache: (key) => {
        set((state) => {
          const newQuestionCache = { ...state.questionCache };
          const newTimestamps = { ...state.lastFetchTimestamps };
          delete newQuestionCache[key];
          delete newTimestamps[key];
          return {
            questionCache: newQuestionCache,
            lastFetchTimestamps: newTimestamps,
          };
        });
      },

      invalidateUserHistory: (userId) => {
        set((state) => {
          const newHistoryCache = { ...state.userHistoryCache };
          const newTimestamps = { ...state.lastFetchTimestamps };
          delete newHistoryCache[userId];
          delete newTimestamps[`history_${userId}`];
          return {
            userHistoryCache: newHistoryCache,
            lastFetchTimestamps: newTimestamps,
          };
        });
      },

      invalidateByPattern: (pattern) => {
        const { questionCache, lastFetchTimestamps } = get();
        const keysToInvalidate = Object.keys(questionCache).filter((key) =>
          key.includes(pattern)
        );

        set((state) => {
          const newQuestionCache = { ...state.questionCache };
          const newTimestamps = { ...state.lastFetchTimestamps };

          keysToInvalidate.forEach((key) => {
            delete newQuestionCache[key];
            delete newTimestamps[key];
          });

          return {
            questionCache: newQuestionCache,
            lastFetchTimestamps: newTimestamps,
          };
        });
      },

      evictOldestEntries: (count) => {
        const { lastFetchTimestamps, questionCache, userHistoryCache } = get();

        const sortedKeys = Object.entries(lastFetchTimestamps)
          .sort(([, a], [, b]) => a - b)
          .slice(0, count)
          .map(([key]) => key);

        set((state) => {
          const newQuestionCache = { ...state.questionCache };
          const newHistoryCache = { ...state.userHistoryCache };
          const newTimestamps = { ...state.lastFetchTimestamps };

          sortedKeys.forEach((key) => {
            delete newQuestionCache[key];
            delete newTimestamps[key];

            if (key.startsWith("history_")) {
              const userId = key.replace("history_", "");
              delete newHistoryCache[userId];
            }
          });

          return {
            questionCache: newQuestionCache,
            userHistoryCache: newHistoryCache,
            lastFetchTimestamps: newTimestamps,
          };
        });
      },

      invalidateAllCaches: () => {
        set({
          questionCache: {},
          userHistoryCache: {},
          lastFetchTimestamps: {},
          cacheVersion: CACHE_CONFIG.VERSION,
        });
      },

      generateCacheKey: (params) => {
        const { mode, subjectId, topicId, examLevel, questionCount, difficulty } = params;
        const parts = [
          mode || "default",
          subjectId || "all",
          topicId || "all",
          examLevel || "any",
          questionCount || "10",
          difficulty || "mixed",
        ];
        return parts.join("_");
      },

      getCacheStats: () => {
        const { cacheHits, cacheMisses, questionCache, userHistoryCache } = get();
        const total = cacheHits + cacheMisses;
        return {
          hits: cacheHits,
          misses: cacheMisses,
          hitRate: total > 0 ? ((cacheHits / total) * 100).toFixed(2) : 0,
          questionCacheSize: Object.keys(questionCache).length,
          historyCacheSize: Object.keys(userHistoryCache).length,
        };
      },

      preloadCache: async (keys, fetchFn) => {
        const results = {};
        const keysToFetch = [];

        for (const key of keys) {
          const cached = get().getCachedQuestions(key);
          if (cached && !cached.shouldRevalidate) {
            results[key] = cached.data;
          } else {
            keysToFetch.push(key);
          }
        }

        if (keysToFetch.length > 0 && fetchFn) {
          try {
            const fetchedData = await fetchFn(keysToFetch);
            for (const key of keysToFetch) {
              if (fetchedData[key]) {
                get().setCachedQuestions(key, fetchedData[key]);
                results[key] = fetchedData[key];
              }
            }
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.error("Cache preload failed:", error);
            }
          }
        }

        return results;
      },
    }),
    {
      name: "question-cache-v2",
      partialize: (state) => ({
        questionCache: state.questionCache,
        userHistoryCache: state.userHistoryCache,
        lastFetchTimestamps: state.lastFetchTimestamps,
        cacheVersion: state.cacheVersion,
      }),
    }
  )
);

export default useQuestionCacheStore;
