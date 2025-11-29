import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let isInitialized = false;

function initPostHog() {
  if (isInitialized || !POSTHOG_KEY) {
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    session_recording: {
      recordCrossOriginIframes: true,
    },
    persistence: "localStorage",
    loaded: (ph) => {
      if (import.meta.env.DEV) {
        ph.debug();
      }
    },
  });

  isInitialized = true;
}

function identifyUser(userId, properties = {}) {
  if (!isInitialized) return;
  posthog.identify(userId, properties);
}

function resetUser() {
  if (!isInitialized) return;
  posthog.reset();
}

function captureEvent(eventName, properties = {}) {
  if (!isInitialized) return;
  posthog.capture(eventName, {
    ...properties,
    timestamp: new Date().toISOString(),
  });
}

function captureQuizEvent(eventName, quizData = {}) {
  captureEvent(eventName, {
    category: "quiz",
    ...quizData,
  });
}

function captureIntegrityEvent(eventType, eventData = {}) {
  captureEvent("integrity_event", {
    category: "integrity",
    type: eventType,
    ...eventData,
  });
}

function captureStudyEvent(eventName, studyData = {}) {
  captureEvent(eventName, {
    category: "study",
    ...studyData,
  });
}

function getSessionId() {
  if (!isInitialized) return null;
  return posthog.get_session_id();
}

function getDistinctId() {
  if (!isInitialized) return null;
  return posthog.get_distinct_id();
}

function setUserProperties(properties) {
  if (!isInitialized) return;
  posthog.people.set(properties);
}

function isPostHogEnabled() {
  return isInitialized && !!POSTHOG_KEY;
}

export {
  initPostHog,
  identifyUser,
  resetUser,
  captureEvent,
  captureQuizEvent,
  captureIntegrityEvent,
  captureStudyEvent,
  getSessionId,
  getDistinctId,
  setUserProperties,
  isPostHogEnabled,
};

export default posthog;
