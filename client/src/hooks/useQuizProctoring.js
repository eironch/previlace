import { useState, useEffect, useCallback, useRef } from "react";
import { captureIntegrityEvent, getSessionId } from "@/lib/posthog";

const INTEGRITY_EVENT_TYPES = {
  TAB_SWITCH: "tab_switch",
  FOCUS_LOST: "focus_lost",
  COPY_ATTEMPT: "copy_attempt",
  PASTE_ATTEMPT: "paste_attempt",
  RIGHT_CLICK: "right_click",
  TEXT_SELECT: "text_select",
  FULLSCREEN_EXIT: "fullscreen_exit",
  MOUSE_LEAVE: "mouse_leave",
  KEYBOARD_SHORTCUT: "keyboard_shortcut",
};

function useQuizProctoring(quizAttemptId, options = {}) {
  const {
    enabled = true,
    onIntegrityEvent = null,
    trackTabSwitch = true,
    trackFocusLoss = true,
    trackCopyPaste = true,
    trackRightClick = true,
    trackTextSelection = true,
    trackMouseLeave = true,
    trackKeyboardShortcuts = true,
  } = options;

  const [integrityEvents, setIntegrityEvents] = useState([]);
  const [integrityScore, setIntegrityScore] = useState(100);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);

  const tabSwitchStartRef = useRef(null);
  const focusLostStartRef = useRef(null);
  const eventCountRef = useRef({
    tabSwitch: 0,
    focusLost: 0,
    copyAttempt: 0,
    pasteAttempt: 0,
    rightClick: 0,
    textSelect: 0,
    mouseLeave: 0,
  });

  const recordEvent = useCallback(
    (eventType, metadata = {}) => {
      if (!enabled) return;

      const event = {
        type: eventType,
        timestamp: new Date().toISOString(),
        questionId: currentQuestionId,
        quizAttemptId,
        ...metadata,
      };

      setIntegrityEvents((prev) => [...prev, event]);

      captureIntegrityEvent(eventType, {
        quiz_attempt_id: quizAttemptId,
        question_id: currentQuestionId,
        session_id: getSessionId(),
        ...metadata,
      });

      if (onIntegrityEvent) {
        onIntegrityEvent(event);
      }

      updateIntegrityScore(eventType, metadata);
    },
    [enabled, currentQuestionId, quizAttemptId, onIntegrityEvent]
  );

  const updateIntegrityScore = useCallback((eventType, metadata) => {
    const weights = {
      [INTEGRITY_EVENT_TYPES.TAB_SWITCH]: metadata.duration > 5000 ? 5 : 2,
      [INTEGRITY_EVENT_TYPES.FOCUS_LOST]: metadata.duration > 5000 ? 3 : 1,
      [INTEGRITY_EVENT_TYPES.COPY_ATTEMPT]: 10,
      [INTEGRITY_EVENT_TYPES.PASTE_ATTEMPT]: 15,
      [INTEGRITY_EVENT_TYPES.RIGHT_CLICK]: 2,
      [INTEGRITY_EVENT_TYPES.TEXT_SELECT]: 1,
      [INTEGRITY_EVENT_TYPES.FULLSCREEN_EXIT]: 3,
      [INTEGRITY_EVENT_TYPES.MOUSE_LEAVE]: 0.5,
      [INTEGRITY_EVENT_TYPES.KEYBOARD_SHORTCUT]: 5,
    };

    const penalty = weights[eventType] || 1;
    setIntegrityScore((prev) => Math.max(0, prev - penalty));
  }, []);

  useEffect(() => {
    if (!enabled || !trackTabSwitch) return;

    function handleVisibilityChange() {
      if (document.hidden) {
        tabSwitchStartRef.current = Date.now();
        setIsDocumentVisible(false);
      } else {
        const duration = tabSwitchStartRef.current
          ? Date.now() - tabSwitchStartRef.current
          : 0;
        tabSwitchStartRef.current = null;
        setIsDocumentVisible(true);

        if (duration > 100) {
          eventCountRef.current.tabSwitch++;
          recordEvent(INTEGRITY_EVENT_TYPES.TAB_SWITCH, {
            duration,
            switchCount: eventCountRef.current.tabSwitch,
          });
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, trackTabSwitch, recordEvent]);

  useEffect(() => {
    if (!enabled || !trackFocusLoss) return;

    function handleFocusLost() {
      focusLostStartRef.current = Date.now();
      setIsWindowFocused(false);
    }

    function handleFocusGained() {
      const duration = focusLostStartRef.current
        ? Date.now() - focusLostStartRef.current
        : 0;
      focusLostStartRef.current = null;
      setIsWindowFocused(true);

      if (duration > 500) {
        eventCountRef.current.focusLost++;
        recordEvent(INTEGRITY_EVENT_TYPES.FOCUS_LOST, {
          duration,
          lostCount: eventCountRef.current.focusLost,
        });
      }
    }

    window.addEventListener("blur", handleFocusLost);
    window.addEventListener("focus", handleFocusGained);

    return () => {
      window.removeEventListener("blur", handleFocusLost);
      window.removeEventListener("focus", handleFocusGained);
    };
  }, [enabled, trackFocusLoss, recordEvent]);

  useEffect(() => {
    if (!enabled || !trackCopyPaste) return;

    function handleCopy(e) {
      e.preventDefault();
      eventCountRef.current.copyAttempt++;
      recordEvent(INTEGRITY_EVENT_TYPES.COPY_ATTEMPT, {
        attemptCount: eventCountRef.current.copyAttempt,
      });
    }

    function handlePaste(e) {
      e.preventDefault();
      eventCountRef.current.pasteAttempt++;
      recordEvent(INTEGRITY_EVENT_TYPES.PASTE_ATTEMPT, {
        attemptCount: eventCountRef.current.pasteAttempt,
      });
    }

    function handleCut(e) {
      e.preventDefault();
      recordEvent(INTEGRITY_EVENT_TYPES.COPY_ATTEMPT, {
        action: "cut",
        attemptCount: eventCountRef.current.copyAttempt,
      });
    }

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
    };
  }, [enabled, trackCopyPaste, recordEvent]);

  useEffect(() => {
    if (!enabled || !trackRightClick) return;

    function handleContextMenu(e) {
      e.preventDefault();
      eventCountRef.current.rightClick++;
      recordEvent(INTEGRITY_EVENT_TYPES.RIGHT_CLICK, {
        attemptCount: eventCountRef.current.rightClick,
        x: e.clientX,
        y: e.clientY,
      });
    }

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [enabled, trackRightClick, recordEvent]);

  useEffect(() => {
    if (!enabled || !trackTextSelection) return;

    function handleSelectionChange() {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (selectedText && selectedText.length > 10) {
        eventCountRef.current.textSelect++;
        recordEvent(INTEGRITY_EVENT_TYPES.TEXT_SELECT, {
          textLength: selectedText.length,
          selectCount: eventCountRef.current.textSelect,
        });
      }
    }

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [enabled, trackTextSelection, recordEvent]);

  useEffect(() => {
    if (!enabled || !trackMouseLeave) return;

    function handleMouseLeave(e) {
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth) {
        eventCountRef.current.mouseLeave++;
        recordEvent(INTEGRITY_EVENT_TYPES.MOUSE_LEAVE, {
          leaveCount: eventCountRef.current.mouseLeave,
          position: { x: e.clientX, y: e.clientY },
        });
      }
    }

    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [enabled, trackMouseLeave, recordEvent]);

  useEffect(() => {
    if (!enabled || !trackKeyboardShortcuts) return;

    function handleKeyDown(e) {
      const suspiciousKeys = [
        { key: "c", ctrl: true },
        { key: "v", ctrl: true },
        { key: "x", ctrl: true },
        { key: "a", ctrl: true },
        { key: "Tab", alt: true },
        { key: "F12" },
        { key: "I", ctrl: true, shift: true },
        { key: "J", ctrl: true, shift: true },
        { key: "U", ctrl: true },
      ];

      const isSuspicious = suspiciousKeys.some(
        (combo) =>
          e.key.toLowerCase() === combo.key.toLowerCase() &&
          (!combo.ctrl || e.ctrlKey || e.metaKey) &&
          (!combo.shift || e.shiftKey) &&
          (!combo.alt || e.altKey)
      );

      if (isSuspicious) {
        e.preventDefault();
        recordEvent(INTEGRITY_EVENT_TYPES.KEYBOARD_SHORTCUT, {
          key: e.key,
          ctrl: e.ctrlKey,
          alt: e.altKey,
          shift: e.shiftKey,
          meta: e.metaKey,
        });
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, trackKeyboardShortcuts, recordEvent]);

  const setQuestion = useCallback((questionId) => {
    setCurrentQuestionId(questionId);
  }, []);

  const getEventCounts = useCallback(() => {
    return { ...eventCountRef.current };
  }, []);

  const getBehaviorSummary = useCallback(() => {
    return {
      integrityScore,
      totalEvents: integrityEvents.length,
      eventCounts: getEventCounts(),
      isDocumentVisible,
      isWindowFocused,
      events: integrityEvents,
    };
  }, [integrityScore, integrityEvents, isDocumentVisible, isWindowFocused, getEventCounts]);

  const resetTracking = useCallback(() => {
    setIntegrityEvents([]);
    setIntegrityScore(100);
    eventCountRef.current = {
      tabSwitch: 0,
      focusLost: 0,
      copyAttempt: 0,
      pasteAttempt: 0,
      rightClick: 0,
      textSelect: 0,
      mouseLeave: 0,
    };
  }, []);

  return {
    integrityEvents,
    integrityScore,
    isDocumentVisible,
    isWindowFocused,
    setQuestion,
    getEventCounts,
    getBehaviorSummary,
    resetTracking,
    INTEGRITY_EVENT_TYPES,
  };
}

export default useQuizProctoring;
export { INTEGRITY_EVENT_TYPES };
