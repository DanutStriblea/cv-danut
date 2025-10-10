// src/components/ZoomControls.jsx
import React, { useEffect, useRef } from "react";

export default function ZoomControls({ onZoomIn, onZoomOut }) {
  const rootRef = useRef(null);
  const rafRef = useRef(null);

  const BUTTON_W = 44; // dimensiune desktop
  const BUTTON_H = 44;
  const OUTER_MARGIN = 12; // distanța față de A4
  const MIN_VIEWPORT_MARGIN = 8;

  const setStyleImportant = (el, name, value) => {
    if (!el) return;
    try {
      el.style.setProperty(name, value, "important");
    } catch {
      el.style[name] = value;
    }
  };

  useEffect(() => {
    const applyPosition = () => {
      const el = rootRef.current;
      if (!el) return;

      const vw = window.innerWidth || document.documentElement.clientWidth;
      const a4 = document.querySelector(".a4-frame");
      if (!a4) return;

      const frameRect = a4.getBoundingClientRect();

      if (vw > 900) {
        // Desktop: vertical, plus deasupra minus
        const safeLeft = Math.min(
          Math.round(frameRect.right + OUTER_MARGIN),
          Math.max(MIN_VIEWPORT_MARGIN, vw - BUTTON_W - MIN_VIEWPORT_MARGIN)
        );
        const topPx = Math.round(
          frameRect.top + frameRect.height / 2 - BUTTON_H
        );
        const safeTop = Math.max(MIN_VIEWPORT_MARGIN, topPx);

        setStyleImportant(el, "position", "fixed");
        setStyleImportant(el, "left", `${safeLeft}px`);
        setStyleImportant(el, "top", `${safeTop}px`);
        setStyleImportant(el, "transform", "translateY(0)");
        setStyleImportant(el, "bottom", "");
        return;
      }

      if (vw <= 900) {
        // Mobile: orizontal, imediat sub pagina A4
        const topPx = Math.round(frameRect.bottom + OUTER_MARGIN);
        setStyleImportant(el, "position", "fixed");
        setStyleImportant(el, "left", "50%");
        setStyleImportant(el, "transform", "translateX(-50%)");
        setStyleImportant(el, "top", `${topPx}px`);
        setStyleImportant(el, "bottom", "");
        return;
      }
    };

    const loop = () => {
      applyPosition();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const throttled = () => applyPosition();
    window.addEventListener("resize", throttled);
    window.addEventListener("scroll", throttled, { passive: true });
    window.addEventListener("transitionend", throttled);
    window.addEventListener("load", throttled);

    // Observe changes in A4 frame
    let mo = null;
    const a4 = document.querySelector(".a4-frame");
    if (a4) {
      mo = new MutationObserver(() => requestAnimationFrame(applyPosition));
      mo.observe(a4, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", throttled);
      window.removeEventListener("scroll", throttled);
      window.removeEventListener("transitionend", throttled);
      window.removeEventListener("load", throttled);
      if (mo) mo.disconnect();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const root = rootRef.current;
      if (!root) return;
      if (document.activeElement && root.contains(document.activeElement)) {
        if (e.key === "+" || e.key === "=") onZoomIn();
        if (e.key === "-" || e.key === "_") onZoomOut();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onZoomIn, onZoomOut]);

  return (
    <>
      <div
        ref={rootRef}
        className="zoom-controls zoom-controls-outside"
        aria-label="Zoom controls"
        style={{
          display: "flex",
          gap: "8px",
          zIndex: 1300,
          pointerEvents: "auto",
          userSelect: "none",
        }}
      >
        {/* Desktop vertical: plus deasupra minus */}
        <button
          className="zoom-btn zoom-plus"
          onClick={(e) => {
            onZoomIn();
            e.currentTarget.blur();
          }}
          aria-label="Zoom in"
          title="Zoom in"
        >
          +
        </button>
        <button
          className="zoom-btn zoom-minus"
          onClick={(e) => {
            onZoomOut();
            e.currentTarget.blur();
          }}
          aria-label="Zoom out"
          title="Zoom out"
        >
          −
        </button>
      </div>

      <style>{`
        .zoom-controls { flex-direction: column; }

        .zoom-btn {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: none;
          background: #e6eef7;
          color: #0f172a;
          box-shadow: 0 8px 20px rgba(2,6,23,0.18);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          transition: transform 120ms ease, background-color 120ms ease, box-shadow 120ms ease;
          -webkit-tap-highlight-color: transparent;
        }

        .zoom-btn:hover {
          transform: scale(1.1);
          background: #cbd5e1;
        }

        .zoom-btn:active {
          transform: scale(0.96);
          box-shadow: 0 6px 12px rgba(2,6,23,0.18);
        }

        .zoom-btn:focus { outline: none; } /* elimină bordura de focus */

        .zoom-plus { background: #e6eef7; }
        .zoom-minus { background: #f1f5f9; }

        @media (max-width: 900px) {
          /* Orizontal mobile imediat sub A4 */
          .zoom-controls { flex-direction: row !important; gap: 12px; }
          .zoom-btn { width: 48px; height: 48px; font-size: 28px; }
          .zoom-minus { order: 1; }
          .zoom-plus { order: 2; }
        }

        @media print {
          .zoom-controls, .zoom-controls-outside { display: none !important; }
        }
      `}</style>
    </>
  );
}
