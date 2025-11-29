import { useState, useEffect, useCallback, useRef } from "react";
import { captureEvent, getSessionId } from "@/lib/posthog";

const DEFAULT_IDLE_TIMEOUT = 60000;
const DEFAULT_ENGAGEMENT_INTERVAL = 5000;

function useActivityTracker(options = {}) {
  const {
    enabled = true,
    idleTimeout = DEFAULT_IDLE_TIMEOUT,
    engagementInterval = DEFAULT_ENGAGEMENT_INTERVAL,
    onIdle = null,
    onActive = null,
    onEngagementUpdate = null,
  } = options;

  const [isIdle, setIsIdle] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [sessionStartTime] = useState(Date.now());
  const [totalActiveTime, setTotalActiveTime] = useState(0);
  const [totalIdleTime, setTotalIdleTime] = useState(0);
  const [engagementScore, setEngagementScore] = useState(100);

  const idleTimerRef = useRef(null);
  const engagementTimerRef = useRef(null);
  const idleStartRef = useRef(null);
  const activityCountRef = useRef({
    clicks: 0,
    keystrokes: 0,
    scrolls: 0,
    mouseMoves: 0,
  });
  const lastMouseMoveRef = useRef(Date.now());

  const resetIdleTimer = useCallback(() => {
    if (!enabled) return;

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    if (isIdle && idleStartRef.current) {
      const idleDuration = Date.now() - idleStartRef.current;
      setTotalIdleTime((prev) => prev + idleDuration);
      idleStartRef.current = null;

      captureEvent("user_active", {
        idle_duration: idleDuration,
        session_id: getSessionId(),
      });

      if (onActive) {
        onActive({ idleDuration });
      }
    }

    setIsIdle(false);
    setLastActivityTime(Date.now());

    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
      idleStartRef.current = Date.now();

      captureEvent("user_idle", {
        last_activity: lastActivityTime,
        session_id: getSessionId(),
      });

      if (onIdle) {
        onIdle({ lastActivityTime });
      }
    }, idleTimeout);
  }, [enabled, idleTimeout, isIdle, lastActivityTime, onIdle, onActive]);

  const calculateEngagementScore = useCallback(() => {
    const now = Date.now();
    const sessionDuration = now - sessionStartTime;
    const idleRatio = totalIdleTime / Math.max(sessionDuration, 1);
    const activityTotal =
      activityCountRef.current.clicks +
      activityCountRef.current.keystrokes +
      activityCountRef.current.scrolls;
    const activityRate = activityTotal / (sessionDuration / 60000);

    let score = 100;
    score -= idleRatio * 30;
    if (activityRate < 5) score -= 20;
    else if (activityRate < 10) score -= 10;
    score = Math.max(0, Math.min(100, score));

    return Math.round(score);
  }, [sessionStartTime, totalIdleTime]);

  useEffect(() => {
    if (!enabled) return;

    function handleClick() {
      activityCountRef.current.clicks++;
      resetIdleTimer();
    }

    function handleKeydown() {
      activityCountRef.current.keystrokes++;
      resetIdleTimer();
    }

    function handleScroll() {
      activityCountRef.current.scrolls++;
      resetIdleTimer();
    }

    function handleMouseMove() {
      const now = Date.now();
      if (now - lastMouseMoveRef.current > 100) {
        activityCountRef.current.mouseMoves++;
        lastMouseMoveRef.current = now;
        resetIdleTimer();
      }
    }

    function handleTouchStart() {
      resetIdleTimer();
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("touchstart", handleTouchStart, { passive: true });

    resetIdleTimer();

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchstart", handleTouchStart);

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [enabled, resetIdleTimer]);

  useEffect(() => {
    if (!enabled) return;

    engagementTimerRef.current = setInterval(() => {
      if (!isIdle) {
        setTotalActiveTime((prev) => prev + engagementInterval);
      }

      const newScore = calculateEngagementScore();
      setEngagementScore(newScore);

      if (onEngagementUpdate) {
        onEngagementUpdate({
          engagementScore: newScore,
          totalActiveTime,
          totalIdleTime,
          activityCounts: { ...activityCountRef.current },
        });
      }
    }, engagementInterval);

    return () => {
      if (engagementTimerRef.current) {
        clearInterval(engagementTimerRef.current);
      }
    };
  }, [enabled, isIdle, engagementInterval, calculateEngagementScore, onEngagementUpdate, totalActiveTime, totalIdleTime]);

  const getSessionDuration = useCallback(() => {
    return Date.now() - sessionStartTime;
  }, [sessionStartTime]);

  const getActivityCounts = useCallback(() => {
    return { ...activityCountRef.current };
  }, []);

  const getActivitySummary = useCallback(() => {
    const sessionDuration = getSessionDuration();
    return {
      sessionDuration,
      totalActiveTime,
      totalIdleTime,
      engagementScore,
      isIdle,
      lastActivityTime,
      activityCounts: getActivityCounts(),
      activePercentage: Math.round((totalActiveTime / Math.max(sessionDuration, 1)) * 100),
    };
  }, [getSessionDuration, totalActiveTime, totalIdleTime, engagementScore, isIdle, lastActivityTime, getActivityCounts]);

  const resetTracking = useCallback(() => {
    setTotalActiveTime(0);
    setTotalIdleTime(0);
    setEngagementScore(100);
    setIsIdle(false);
    setLastActivityTime(Date.now());
    activityCountRef.current = {
      clicks: 0,
      keystrokes: 0,
      scrolls: 0,
      mouseMoves: 0,
    };
  }, []);

  return {
    isIdle,
    lastActivityTime,
    totalActiveTime,
    totalIdleTime,
    engagementScore,
    getSessionDuration,
    getActivityCounts,
    getActivitySummary,
    resetTracking,
    resetIdleTimer,
  };
}

export default useActivityTracker;
