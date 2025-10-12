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
    // ✅ Treat only real phones as "mobile" (<= 768px)
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

      if (visualViewport) {
        const onVVChange = () => {
          const cur = visualViewport.scale || 1;
          if (Math.abs(cur - lastVVScale) > 0.001) {
            lastVVScale = cur;
            scheduleStableRecompute();
            return;
          }
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
        window.addEventListener("resize", recomputeScales);
        window.addEventListener("orientationchange", recomputeScales);
      }

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
    setUserZoom((z) => Math.min(3, +(z * (1 + ZOOM_STEP)).toFixed(4)));
  const handleZoomOut = () =>
    setUserZoom((z) => Math.max(0.25, +(z / (1 + ZOOM_STEP)).toFixed(4)));

  const combinedScale = frameScale * userZoom;

  return (
    <div
      className="flex justify-center items-center min-h-screen 
                    bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500 
                    print:bg-white overflow-auto py-2 print:py-0 print:min-h-0"
    >
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
        <div
          className="a4-frame bg-white shadow-[0_8px_30px_rgba(0,0,0,0.60)] overflow-hidden
            print:shadow-none print:bg-white print:border-0"
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

      {!isMobile && (
        <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      )}
    </div>
  );
}
