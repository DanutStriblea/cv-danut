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
  const [userZoom, setUserZoom] = useState(0.8); // start at 80%
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

      const applyPrintingClass = (on) => {
        try {
          if (on) {
            document.documentElement.classList.add("printing");
            document.body.classList.add("printing");
            const root = document.getElementById("root");
            if (root) root.classList.add("printing");
          } else {
            document.documentElement.classList.remove("printing");
            document.body.classList.remove("printing");
            const root = document.getElementById("root");
            if (root) root.classList.remove("printing");
          }
        } catch (err) {
          console.warn("printing class toggle failed", err);
        }
      };

      const onBeforePrint = () => {
        // ensure printing class is applied first
        applyPrintingClass(true);
        setIsPrinting(true);
        setFrameScale(1);
        setContentScale(1);

        // mobile: tighter scaling so A4 fits in mobile print preview (69%)
        if (window.innerWidth <= 768) {
          setUserZoom(0.69);
        } else {
          setUserZoom(1);
        }

        // small delay to let the browser apply class/layout before print dialog
        setTimeout(() => {
          // optional: force a reflow/read to encourage layout stabilization
          // eslint-disable-next-line no-unused-expressions
          document.body && document.body.offsetHeight;
        }, 40);
      };

      const onAfterPrint = () => {
        setIsPrinting(false);
        applyPrintingClass(false);
        recomputeScales();
      };

      // matchMedia print listener (named handler to avoid unused param)
      let mql = null;
      const handleMqlChange = (mqEvent) => {
        if (mqEvent.matches) onBeforePrint();
        else onAfterPrint();
      };

      try {
        if (typeof window !== "undefined" && "matchMedia" in window) {
          mql = window.matchMedia("print");
          if (mql && typeof mql.addEventListener === "function") {
            mql.addEventListener("change", handleMqlChange);
          } else if (mql && typeof mql.addListener === "function") {
            mql.addListener(handleMqlChange);
          }
        }
      } catch (err) {
        console.warn("matchMedia print setup failed", err);
      }

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
          if (mql) {
            try {
              if (typeof mql.removeEventListener === "function") {
                mql.removeEventListener("change", handleMqlChange);
              } else if (typeof mql.removeListener === "function") {
                mql.removeListener(handleMqlChange);
              }
            } catch {
              /* ignore */
            }
          }
          applyPrintingClass(false);
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

  // If printing, use the userZoom defined for printing (mobile 0.69). Otherwise use frameScale*userZoom.
  const combinedScale = isPrinting ? userZoom : frameScale * userZoom;

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
    </div>
  );
}
