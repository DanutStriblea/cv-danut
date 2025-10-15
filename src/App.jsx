import React, { useEffect, useRef, useState } from "react";
import Header1 from "./components/Header1";
import Contact from "./components/Contact";
import Profile from "./components/Profile";
import Education from "./components/Education";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import WorkExperience from "./components/WorkExperience";

export default function App() {
  const [frameScale, setFrameScale] = useState(1);
  const [contentScale, setContentScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const contentRef = useRef(null);
  const vvHandlerRef = useRef(null);
  const pinchTimerRef = useRef(null);

  const frameWidth = 794;
  const frameHeight = 1123;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 900;
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
      visualViewport.addEventListener("resize", onVVChange, { passive: true });
      visualViewport.addEventListener("scroll", onVVChange, { passive: true });
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

      // Scale fix 78% pe mobil/tablet, altfel 100%
      setFrameScale(isMobile ? 0.78 : 1);
      setContentScale(1);

      if (visualViewport && vvHandlerRef.current) {
        visualViewport.removeEventListener("resize", vvHandlerRef.current);
        visualViewport.removeEventListener("scroll", vvHandlerRef.current);
      }
    };

    const onAfterPrint = () => {
      setIsPrinting(false);

      if (visualViewport && vvHandlerRef.current) {
        visualViewport.addEventListener("resize", vvHandlerRef.current, {
          passive: true,
        });
        visualViewport.addEventListener("scroll", vvHandlerRef.current, {
          passive: true,
        });
      }
      recomputeScales();
    };

    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("resize", recomputeScales);
      window.removeEventListener("orientationchange", recomputeScales);
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
      if (pinchTimerRef.current) clearTimeout(pinchTimerRef.current);
      observer.disconnect();
      if (visualViewport && vvHandlerRef.current) {
        visualViewport.removeEventListener("resize", vvHandlerRef.current);
        visualViewport.removeEventListener("scroll", vvHandlerRef.current);
        vvHandlerRef.current = null;
      }
    };
  }, [contentScale, frameHeight, frameWidth, isMobile, isPrinting]);

  const compensatedWidth = frameWidth / contentScale;
  const compensatedHeight = frameHeight / contentScale;

  const combinedScale = frameScale; // already set in beforeprint for mobile/tablet

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
                transform: `scale(${combinedScale})`,
                transformOrigin: "top center",
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
    </div>
  );
}
