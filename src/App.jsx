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
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef(null);
  const vvHandlerRef = useRef(null);
  const pinchTimerRef = useRef(null);

  const frameWidth = 794; // A4 width px
  const frameHeight = 1123; // A4 height px

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const recomputeScales = () => {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        const newContentScale = Math.min(1, frameHeight / contentHeight);
        if (newContentScale !== contentScale) {
          setContentScale(newContentScale);
        }
      }

      // Don't compute frame scale on mobile - let browser handle zoom
      if (!isMobile) {
        const scaleToWidth = (window.innerWidth - 32) / frameWidth;
        const scaleToHeight = (window.innerHeight - 32) / frameHeight;
        const newFrameScale = Math.min(1, scaleToWidth, scaleToHeight);
        setFrameScale(newFrameScale);
      }
    };

    // initial compute
    recomputeScales();

    // On mobile, don't set up the complex scaling listeners
    if (!isMobile) {
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
        visualViewport.addEventListener("resize", onVVChange, {
          passive: true,
        });
        visualViewport.addEventListener("scroll", onVVChange, {
          passive: true,
        });

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
          window.removeEventListener("resize", checkMobile);
        } catch (err) {
          console.warn("cleanup failed in App scale effect", err);
        }
      };
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [contentScale, frameHeight, frameWidth, isMobile]);

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
                    print:bg-white overflow-auto py-2 print:py-0 print:min-h-0"
    >
      {/* Wrapper centrat vertical și orizontal */}
      <div
        className="mx-auto print-frame-scaler"
        style={
          isMobile
            ? {
                width: "100%",
                maxWidth: `${frameWidth}px`,
                margin: "0 auto",
              }
            : {
                transform: `scale(${combinedScale})`,
                transformOrigin: "top center",
                position: "relative",
              }
        }
      >
        {/* Rama A4 */}
        <div
          className="
            a4-frame bg-white shadow-[0_8px_30px_rgba(0,0,0,0.60)] overflow-hidden
            print:shadow-none print:bg-white print:border-0
          "
          style={
            isMobile
              ? {
                  width: "100%",
                  height: "auto",
                  minHeight: `${frameHeight}px`,
                }
              : {
                  width: `${frameWidth}px`,
                  height: `${frameHeight}px`,
                }
          }
        >
          {/* Conținutul CV-ului */}
          <div
            ref={contentRef}
            style={
              isMobile
                ? {
                    width: "100%",
                    height: "auto",
                  }
                : {
                    width: `${compensatedWidth}px`,
                    height: `${compensatedHeight}px`,
                    transform: `scale(${contentScale})`,
                    transformOrigin: "top left",
                  }
            }
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

      {/* Hide zoom controls on mobile */}
      {!isMobile && (
        <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      )}

      {/* Stiluri pentru print - FĂRĂ DUNGI NEGRE ȘI CU PADDING-URI CORECTE */}
      <style>{`
        @media print {
          @page { 
            size: A4; 
            margin: 0mm;
            padding: 0mm;
            border: none;
          }
          
          /* RESET mai puțin agresiv - păstrează layout-ul dar elimină problemele */
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
            border: none !important;
            outline: none !important;
          }
          
          body {
            display: flex !important;
            justify-content: center !important;
            align-items: flex-start !important;
            background: white !important;
            overflow: hidden !important;
            border: none !important;
          }
          
          #root {
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: flex-start !important;
            overflow: hidden !important;
            border: none !important;
          }
          
          /* ELIMINĂ DUNGILE NEGRE ȘI SCROLLBARS */
          * {
            box-sizing: border-box !important;
            border: none !important;
            outline: none !important;
          }
          
          /* PĂSTREAZĂ EXACT desktop view-ul */
          .print-frame-scaler {
            transform: none !important;
            width: 794px !important;
            height: 1123px !important;
            margin: 0 auto !important;
            display: block !important;
            position: relative !important;
            scale: 1 !important;
            rotate: 0 !important;
            overflow: hidden !important;
            border: none !important;
            outline: none !important;
          }
          
          .a4-frame {
            width: 794px !important;
            height: 1123px !important;
            box-shadow: none !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            overflow: hidden !important;
            border: none !important;
            outline: none !important;
          }
          
          .a4-frame > div {
            transform: none !important;
            width: 794px !important;
            height: auto !important;
            min-height: 1123px !important;
            display: block !important;
            scale: 1 !important;
            overflow: hidden !important;
            border: none !important;
            outline: none !important;
            /* PĂSTREAZĂ PADDING-URILE ORIGINALE */
            padding: 0 !important;
          }
          
          /* PĂSTREAZĂ PADDING-URILE COMPONENTELOR */
          .px-6 {
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
          }
          
          .pt-4 {
            padding-top: 1rem !important;
          }
          
          .pb-2 {
            padding-bottom: 0.5rem !important;
          }
          
          /* Asigură că grid-ul are spațierea corectă */
          .grid.grid-cols-1.md\\:grid-cols-3 {
            display: grid !important;
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 1.5rem !important;
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
            padding-top: 1rem !important;
            padding-bottom: 0.5rem !important;
          }
          
          /* Ascunde elementele care nu trebuie să apară în print */
          .zoom-controls,
          .vite-error-overlay,
          .audio-enable-pill,
          [class*="overlay"],
          [class*="popup"],
          [class*="modal"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
          
          /* Garantează că nu există scrollbars */
          ::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          
          /* Pentru Firefox */
          html {
            scrollbar-width: none !important;
          }
          
          /* Elimină orice border sau outline care ar putea crea dungi */
          div, section, article, main, header, footer {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
          }
        }

        /* ensure wrapper scales cleanly */
        .print-frame-scaler { 
          display: inline-block; 
          box-sizing: border-box; 
        }

        /* safety: keep touch gestures available */
        html, body { 
          -webkit-text-size-adjust: 100%; 
          touch-action: auto; 
        }
      `}</style>
    </div>
  );
}
