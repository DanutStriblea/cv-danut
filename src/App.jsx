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

  const frameWidth = 794;
  const frameHeight = 1123;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const recomputeScales = () => {
      if (isPrinting) return;
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        const newContentScale = Math.min(1, frameHeight / contentHeight);
        if (newContentScale !== contentScale) setContentScale(newContentScale);
      }
      if (!isMobile) {
        const scaleToWidth = (window.innerWidth - 32) / frameWidth;
        const scaleToHeight = (window.innerHeight - 32) / frameHeight;
        setFrameScale(Math.min(1, scaleToWidth, scaleToHeight));
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
        document.body.classList.add("force-print-desktop");
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
        document.body.classList.remove("force-print-desktop");
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
    setUserZoom((z) => Math.min(3, +(z * (1 + ZOOM_STEP)).toFixed(4)));
  const handleZoomOut = () =>
    setUserZoom((z) => Math.max(0.25, +(z / (1 + ZOOM_STEP)).toFixed(4)));

  const combinedScale = isPrinting ? 1 : frameScale * userZoom;

  const printWrapperStyle = isPrinting
    ? {
        width: "210mm",
        height: "297mm",
        transform: "none",
        position: "fixed",
        top: 0,
        left: "50%",
        margin: 0,
        transformOrigin: "top center",
        msTransform: "none",
      }
    : isMobile
    ? {
        width: "100%",
        maxWidth: `${frameWidth}px`,
        margin: "0 auto",
      }
    : {
        transform: `scale(${combinedScale})`,
        transformOrigin: "top center",
        position: "relative",
      };

  const a4Style = isPrinting
    ? { width: "210mm", height: "297mm" }
    : isMobile
    ? { width: "100%", height: "auto", minHeight: `${frameHeight}px` }
    : { width: `${frameWidth}px`, height: `${frameHeight}px` };

  const contentStyle = isPrinting
    ? { width: "210mm", height: "auto", transform: "none" }
    : isMobile
    ? { width: "100%", height: "auto" }
    : {
        width: `${compensatedWidth}px`,
        height: `${compensatedHeight}px`,
        transform: `scale(${contentScale})`,
        transformOrigin: "top left",
      };

  return (
    <div
      className="flex justify-center items-center min-h-screen 
                    bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500 
                    print:bg-white overflow-auto py-2 print:py-0 print:min-h-0"
    >
      <div className="mx-auto print-frame-scaler" style={printWrapperStyle}>
        <div
          className="
            a4-frame bg-white shadow-[0_8px_30px_rgba(0,0,0,0.60)] overflow-hidden
            print:shadow-none print:bg-white print:border-0
          "
          style={a4Style}
        >
          <div ref={contentRef} style={contentStyle}>
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
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
            transform: none !important;
            -webkit-transform: none !important;
            box-sizing: border-box !important;
            background: white !important;
          }

          /* Desktop-style print regardless of device when body.force-print-desktop present */
          body.force-print-desktop .print-frame-scaler {
            position: fixed !important;
            top: 0 !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            overflow: hidden !important;
          }

          body.force-print-desktop .a4-frame {
            width: 210mm !important;
            height: 297mm !important;
            box-shadow: none !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }

          body.force-print-desktop .a4-frame > div {
            width: 210mm !important;
            height: auto !important;
            min-height: 297mm !important;
            transform: none !important;
            overflow: visible !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
          }

          /* hide scrollbars in print preview */
          ::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }
          html { scrollbar-width: none !important; }

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
