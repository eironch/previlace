import { useEffect, useRef } from "react";
import { mathService } from "../../services/mathService";
import { cn } from "../../lib/utils";

function MathRenderer({ 
  latex, 
  displayMode = false, 
  className = "", 
  fallback = null 
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    initializeMath();
  }, []);

  useEffect(() => {
    if (containerRef.current && latex) {
      renderMath();
    }
  }, [latex, displayMode]);

  async function initializeMath() {
    await mathService.initialize();
    if (containerRef.current && latex) {
      renderMath();
    }
  }

  function renderMath() {
    if (!containerRef.current) return;
    
    mathService.renderToHTMLElement(
      containerRef.current,
      latex,
      { displayMode }
    );
  }

  if (!latex && fallback) {
    return fallback;
  }

  if (!latex) {
    return null;
  }

  return (
    <span
      ref={containerRef}
      className={cn(
        "katex-container",
        displayMode && "block text-center",
        className
      )}
    />
  );
}

export default MathRenderer;
