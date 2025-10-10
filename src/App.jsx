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

    recomputeScales();
    window.addEventListener("resize", recomputeScales);

    const observer = new MutationObserver(recomputeScales);
    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    return () => {
      window.removeEventListener("resize", recomputeScales);
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
        html, body { -webkit-text-size-adjust: 100%; }
      `}</style>
    </div>
  );
}
