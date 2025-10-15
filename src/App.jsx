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
  const [isPrinting, setIsPrinting] = useState(false);
  const contentRef = useRef(null);
  const vvHandlerRef = useRef(null);
  const pinchTimerRef = useRef(null);

  const frameWidth = 794; // px target for desktop layout
  const frameHeight = 1123;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const recomputeScales = () => {
      if (isPrinting) return;
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        const newContentScale = Math.min(1, frameHeight / contentHeight);
        if (newContentScale !== contentScale) {
          setContentScale(newContentScale);
        }
      }
      if (!isMobile) {
        const scaleToWidth = (window.innerWidth - 32) / frameWidth;
        const scaleToHeight = (window.innerHeight - 32) / frameHeight;
        const newFrameScale = Math.min(1, scaleToWidth, scaleToHeight);
        setFrameScale(newFrameScale);
      }
    };

    recomputeScales();

    if (!isMobile) {
      const visualViewport = window.visualViewport;
      let lastVVScale = visualViewport ? visualViewport.scale || 1 : 1;

      const scheduleStableRecompute = () => {
        if (pinchTimerRef.current) clearTimeout(pinchTimerRef.current);
        pinchTimerRef.current = setTimeout(() => {
          recomputeScales();
          pinchTimerRef.current = null;
          lastVVScale = visualViewport ? visualViewport.scale || 1 : 1;
        }, 250);
      };

      const onVVChange = () => {
        if (isPrinting) return;
        const cur = visualViewport ? visualViewport.scale || 1 : 1;
        if (Math.abs(cur - lastVVScale) > 0.001) {
          lastVVScale = cur;
          scheduleStableRecompute();
          return;
        }
        recomputeScales();
      };

      if (visualViewport) {
        vvHandlerRef.current = onVVChange;
        visualViewport.addEventListener("resize", onVVChange, {
          passive: true,
        });
        visualViewport.addEventListener("scroll", onVVChange, {
          passive: true,
        });
      }
      window.addEventListener("resize", recomputeScales);
      window.addEventListener("orientationchange", recomputeScales);

      const observer = new MutationObserver(() => {
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

      const onBeforePrint = () => {
        setIsPrinting(true);
        try {
          if (visualViewport && vvHandlerRef.current) {
            visualViewport.removeEventListener("resize", vvHandlerRef.current);
            visualViewport.removeEventListener("scroll", vvHandlerRef.current);
          }
          setFrameScale(1);
          setContentScale(1);
          setUserZoom(1);
          document.documentElement.style.transform = "none";
          document.body.style.transform = "none";
        } catch (err) {
          console.warn("onBeforePrint cleanup failed:", err);
        }
      };
      const onAfterPrint = () => {
        setIsPrinting(false);
        try {
          if (visualViewport && vvHandlerRef.current) {
            visualViewport.addEventListener("resize", vvHandlerRef.current, {
              passive: true,
            });
            visualViewport.addEventListener("scroll", vvHandlerRef.current, {
              passive: true,
            });
          }
        } catch (err) {
          console.warn("onAfterPrint restore failed:", err);
        }
        recomputeScales();
      };

      window.addEventListener("beforeprint", onBeforePrint);
      window.addEventListener("afterprint", onAfterPrint);

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
          window.removeEventListener("beforeprint", onBeforePrint);
          window.removeEventListener("afterprint", onAfterPrint);
          window.removeEventListener("resize", checkMobile);
        } catch (err) {
          console.warn("cleanup failed in App scale effect:", err);
        }
      };
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [contentScale, frameHeight, frameWidth, isMobile, isPrinting]);

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

  const combinedScale = isPrinting ? 1 : frameScale * userZoom;

  return (
    <div
      className="flex justify-center items-center min-h-screen 
                    bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500 
                    print:bg-white overflow-auto py-2 print:py-0 print:min-h-0"
    >
      <div
        className="mx-auto print-frame-scaler"
        style={
          isMobile || isPrinting
            ? {
                width: "100%",
                maxWidth: `${frameWidth}px`,
                margin: "0 auto",
                transform: "none",
              }
            : {
                transform: `scale(${combinedScale})`,
                transformOrigin: "top center",
                position: "relative",
              }
        }
      >
        <div
          className="
            a4-frame bg-white shadow-[0_8px_30px_rgba(0,0,0,0.60)] overflow-hidden
            print:shadow-none print:bg-white print:border-0
          "
          style={
            isMobile || isPrinting
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
          <div
            ref={contentRef}
            style={
              isMobile || isPrinting
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

      {!isMobile && !isPrinting && (
        <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      )}

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }

          html, body, #root {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: hidden !important;
            -webkit-transform: none !important;
            transform: none !important;
          }

          .print-frame-scaler {
            transform: none !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            display: block !important;
            position: relative !important;
            overflow: visible !important;
          }

          .a4-frame {
            width: 210mm !important;
            height: 297mm !important;
            box-shadow: none !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            overflow: visible !important;
          }

          .a4-frame > div {
            transform: none !important;
            width: 210mm !important;
            height: auto !important;
            min-height: 297mm !important;
            display: block !important;
            overflow: visible !important;
            padding: 0 !important;
          }

          .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
          .pt-4 { padding-top: 1rem !important; }
          .pb-2 { padding-bottom: 0.5rem !important; }

          .grid.grid-cols-1.md\\:grid-cols-3 {
            display: grid !important;
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 1.5rem !important;
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
            padding-top: 1rem !important;
            padding-bottom: 0.5rem !important;
          }

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

          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
