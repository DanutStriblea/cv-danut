// src/App.jsx
import React, { useEffect, useRef, useState } from "react";
import Header1 from "./components/Header1";
import Contact from "./components/Contact";
import Profile from "./components/Profile";
import Education from "./components/Education";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import WorkExperience from "./components/WorkExperience";
import ZoomControls from "./components/ZoomControls";

export default function App() {
  const [frameScale, setFrameScale] = useState(1);
  const [contentScale, setContentScale] = useState(1);
  const [userZoom, setUserZoom] = useState(1);
  const contentRef = useRef(null);
  const vvHandlerRef = useRef(null);
  const pinchTimerRef = useRef(null);

  const frameWidth = 794; // A4 width px
  const frameHeight = 1123; // A4 height px

  useEffect(() => {
    const recomputeScales = () => {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        const newContentScale = Math.min(1, frameHeight / contentHeight);
        if (newContentScale !== contentScale) {
          setContentScale(newContentScale);
        }
      }

      const scaleToWidth = (window.innerWidth - 32) / frameWidth;
      const scaleToHeight = (window.innerHeight - 32) / frameHeight;
      const newFrameScale = Math.min(1, scaleToWidth, scaleToHeight);
      setFrameScale(newFrameScale);
    };

    // initial compute
    recomputeScales();

    // prefer visualViewport when available to detect pinch gestures
    const visualViewport = window.visualViewport;
    let lastVVScale = visualViewport ? visualViewport.scale || 1 : 1;

    const scheduleStableRecompute = () => {
      if (pinchTimerRef.current) clearTimeout(pinchTimerRef.current);
      pinchTimerRef.current = setTimeout(() => {
        recomputeScales();
        pinchTimerRef.current = null;
        lastVVScale = visualViewport ? visualViewport.scale || 1 : 1;
      }, 250); // wait for pinch to settle
    };

    if (visualViewport) {
      const onVVChange = () => {
        const cur = visualViewport.scale || 1;
        // when scale is changing assume pinch/zoom; delay recompute until stable
        if (Math.abs(cur - lastVVScale) > 0.001) {
          lastVVScale = cur;
          scheduleStableRecompute();
          return;
        }
        // layout-only changes: recompute immediately
        recomputeScales();
      };
      vvHandlerRef.current = onVVChange;
      visualViewport.addEventListener("resize", onVVChange, { passive: true });
      visualViewport.addEventListener("scroll", onVVChange, { passive: true });

      window.addEventListener("resize", recomputeScales);
      window.addEventListener("orientationchange", recomputeScales);
    } else {
      // fallback
      window.addEventListener("resize", recomputeScales);
      window.addEventListener("orientationchange", recomputeScales);
    }

    // Mutation observer for content changes
    const observer = new MutationObserver(() => {
      // debounce slight DOM churn
      if (pinchTimerRef.current) clearTimeout(pinchTimerRef.current);
      pinchTimerRef.current = setTimeout(() => {
        recomputeScales();
        pinchTimerRef.current = null;
      }, 120);
    });
    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      try {
        if (visualViewport && vvHandlerRef.current) {
          visualViewport.removeEventListener("resize", vvHandlerRef.current);
          visualViewport.removeEventListener("scroll", vvHandlerRef.current);
          vvHandlerRef.current = null;
        }
        window.removeEventListener("resize", recomputeScales);
        window.removeEventListener("orientationchange", recomputeScales);
        if (pinchTimerRef.current) {
          clearTimeout(pinchTimerRef.current);
          pinchTimerRef.current = null;
        }
        observer.disconnect();
      } catch (err) {
        // keep cleanup robust
        // eslint-disable-next-line no-console
        console.warn("cleanup failed in App scale effect", err);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentScale, frameHeight, frameWidth]);

  const compensatedWidth = frameWidth / contentScale;
  const compensatedHeight = frameHeight / contentScale;

  const ZOOM_STEP = 0.15;
  const handleZoomIn = () =>
    setUserZoom((z) => {
      const next = +(z * (1 + ZOOM_STEP)).toFixed(4);
      return Math.min(3, next);
    });
  const handleZoomOut = () =>
    setUserZoom((z) => {
      const next = +(z / (1 + ZOOM_STEP)).toFixed(4);
      return Math.max(0.25, next);
    });

  const combinedScale = frameScale * userZoom;

  return (
    <div
      className="flex justify-center items-center min-h-screen 
                    bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500 
                    print:bg-transparent overflow-auto py-2 print:p-0 print:min-h-0"
    >
      {/* Wrapper centrat vertical și orizontal */}
      <div
        className="mx-auto print-frame-scaler"
        style={{
          transform: `scale(${combinedScale})`,
          transformOrigin: "top center",
          position: "relative",
        }}
      >
        {/* Rama A4 */}
        <div
          className="
            a4-frame bg-white shadow-[0_8px_30px_rgba(0,0,0,0.60)] overflow-hidden
            print:shadow-none print:rounded-none
          "
          style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            position: "relative",
          }}
        >
          {/* Conținutul CV-ului */}
          <div
            ref={contentRef}
            style={{
              width: `${compensatedWidth}px`,
              height: `${compensatedHeight}px`,
              transform: `scale(${contentScale})`,
              transformOrigin: "top left",
            }}
          >
            <Header1 />
            <Contact />
            <Profile />

            <div className="px-6 pt-4 pb-2 grid grid-cols-3 gap-6 w-full">
              <Education />
              <Skills />
              <Projects />
            </div>

            <WorkExperience />
          </div>
        </div>
      </div>

      {/* IMPORTANT: ZoomControls is OUTSIDE .print-frame-scaler (sibling),
          so position:fixed will be relative to viewport and not affected by scale */}
      <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />

      {/* Stiluri pentru print */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          html, body {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body > div { display: block !important; height: 100%; }
          .print-frame-scaler { transform: none !important; margin: 0 !important; width: 100% !important; height: 100% !important; }
          .a4-frame { box-shadow: none !important; width: 100% !important; height: 100% !important; overflow: hidden !important; }
          /* hide zoom controls at print */
          .zoom-controls, .zoom-controls-outside { display: none !important; }
        }

        /* ensure wrapper scales cleanly */
        .print-frame-scaler { display: inline-block; box-sizing: border-box; }

        /* safety: keep touch gestures available */
        html, body { -webkit-text-size-adjust: 100%; touch-action: auto; }
      `}</style>
    </div>
  );
}
