import { create } from "zustand";
import { persist } from "zustand/middleware";

const CACHE_CONFIG = {
  DURATION: 5 * 60 * 1000, // 5 minutes
  STALE_THRESHOLD: 60 * 1000, // 1 minute
  VERSION: "1.0.0",
};

const useAdminCacheStore = create(
  persist(
    (set, get) => ({
      cache: {},
      lastFetchTimestamps: {},
      cacheVersion: CACHE_CONFIG.VERSION,

      getCachedData: (key) => {
        const { cache, lastFetchTimestamps, cacheVersion } = get();

        if (cacheVersion !== CACHE_CONFIG.VERSION) {
          get().invalidateAll();
          return null;
        }

        const data = cache[key];
        const timestamp = lastFetchTimestamps[key];

        if (!data || !timestamp) return null;

        const age = Date.now() - timestamp;

        if (age > CACHE_CONFIG.DURATION) {
          get().invalidate(key);
          return null;
        }

        return {
          data,
          isStale: age > CACHE_CONFIG.STALE_THRESHOLD,
        };
      },

      setCachedData: (key, data) => {
        set((state) => ({
          cache: { ...state.cache, [key]: data },
          lastFetchTimestamps: { ...state.lastFetchTimestamps, [key]: Date.now() },
        }));
      },

      invalidate: (key) => {
        set((state) => {
          const newCache = { ...state.cache };
          const newTimestamps = { ...state.lastFetchTimestamps };
          delete newCache[key];
          delete newTimestamps[key];
          return { cache: newCache, lastFetchTimestamps: newTimestamps };
        });
      },

      invalidateAll: () => {
        set({ cache: {}, lastFetchTimestamps: {}, cacheVersion: CACHE_CONFIG.VERSION });
      },
    }),
    {
      name: "admin-cache",
      partialize: (state) => ({
        cache: state.cache,
        lastFetchTimestamps: state.lastFetchTimestamps,
        cacheVersion: state.cacheVersion,
      }),
    }
  )
);

export default useAdminCacheStore;
