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
  const isTouchRef = useRef(false);

  const frameWidth = 794; // A4 width px
  const frameHeight = 1123; // A4 height px

  useEffect(() => {
    // Detect if it's a touch device
    isTouchRef.current =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    const recomputeScales = () => {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        const newContentScale = Math.min(1, frameHeight / contentHeight);
        if (newContentScale !== contentScale) {
          setContentScale(newContentScale);
        }
      }

      // On touch devices, use fixed scaling to allow native zoom
      if (isTouchRef.current) {
        const scaleToWidth = (window.innerWidth - 32) / frameWidth;
        const scaleToHeight = (window.innerHeight - 32) / frameHeight;
        const newFrameScale = Math.min(1, scaleToWidth, scaleToHeight);
        setFrameScale(newFrameScale * 0.9); // Slightly smaller to allow space for native zoom
      } else {
        // Desktop behavior - normal scaling
        const scaleToWidth = (window.innerWidth - 32) / frameWidth;
        const scaleToHeight = (window.innerHeight - 32) / frameHeight;
        const newFrameScale = Math.min(1, scaleToWidth, scaleToHeight);
        setFrameScale(newFrameScale);
      }
    };

    // Initial compute
    recomputeScales();

    // Only use resize/orientation change listeners
    window.addEventListener("resize", recomputeScales);
    window.addEventListener("orientationchange", recomputeScales);

    // Mutation observer for content changes
    const observer = new MutationObserver(() => {
      setTimeout(recomputeScales, 120);
    });

    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      window.removeEventListener("resize", recomputeScales);
      window.removeEventListener("orientationchange", recomputeScales);
      observer.disconnect();
    };
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
      style={{
        // Allow native zoom on touch devices
        touchAction: isTouchRef.current ? "manipulation" : "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Wrapper centrat vertical și orizontal */}
      <div
        className="mx-auto print-frame-scaler"
        style={{
          transform: isTouchRef.current ? "none" : `scale(${combinedScale})`,
          transformOrigin: "top center",
          position: "relative",
          // On touch devices, use responsive width/height instead of scaling
          width: isTouchRef.current ? "90vw" : "auto",
          maxWidth: isTouchRef.current ? `${frameWidth}px` : "none",
          height: isTouchRef.current ? "auto" : "auto",
        }}
      >
        {/* Rama A4 */}
        <div
          className="
            a4-frame bg-white shadow-[0_8px_30px_rgba(0,0,0,0.60)] overflow-hidden
            print:shadow-none print:rounded-none
          "
          style={{
            width: isTouchRef.current ? "100%" : `${frameWidth}px`,
            height: isTouchRef.current ? "auto" : `${frameHeight}px`,
            position: "relative",
            // Ensure content is visible for native zoom
            minHeight: isTouchRef.current ? "100vh" : "auto",
          }}
        >
          {/* Conținutul CV-ului */}
          <div
            ref={contentRef}
            style={{
              width: isTouchRef.current ? "100%" : `${compensatedWidth}px`,
              height: isTouchRef.current ? "auto" : `${compensatedHeight}px`,
              transform: isTouchRef.current ? "none" : `scale(${contentScale})`,
              transformOrigin: "top left",
            }}
          >
            <Header1 />
            <Contact />
            <Profile />

            <div className="px-6 pt-4 pb-2 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              <Education />
              <Skills />
              <Projects />
            </div>

            <WorkExperience />
          </div>
        </div>
      </div>

      {/* On touch devices, hide zoom controls since we use native zoom */}
      {!isTouchRef.current && (
        <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      )}

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
        html, body { 
          -webkit-text-size-adjust: 100%; 
          touch-action: manipulation;
          overflow-x: auto;
        }

        /* Better mobile experience */
        @media (max-width: 768px) {
          .a4-frame {
            margin: 0 auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          }
        }
      `}</style>
    </div>
  );
}
