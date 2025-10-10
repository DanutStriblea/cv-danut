// src/App.jsx
import React, { useEffect, useRef } from "react";
import Header1 from "./components/Header1";
import Contact from "./components/Contact";
import Profile from "./components/Profile";
import Education from "./components/Education";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import WorkExperience from "./components/WorkExperience";

export default function App() {
  const contentRef = useRef(null);

  useEffect(() => {
    const recompute = () => {
      if (!contentRef.current) return;
      void contentRef.current.scrollHeight;
    };
    recompute();
    window.addEventListener("resize", recompute);
    const mo = new MutationObserver(recompute);
    if (contentRef.current)
      mo.observe(contentRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    return () => {
      window.removeEventListener("resize", recompute);
      mo.disconnect();
    };
  }, []);

  return (
    <div
      className="flex justify-center items-center min-h-screen
                 bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500
                 print:bg-transparent overflow-auto py-6"
    >
      <div className="mx-auto print-frame-scaler flex items-center justify-center w-full">
        <div
          className="a4-frame bg-white shadow-[0_8px_30px_rgba(0,0,0,0.60)] overflow-hidden print:shadow-none print:rounded-none"
          style={{
            width: "min(794px, calc(100vw - 32px))",
            height: "auto",
            position: "relative",
            margin: "16px auto",
            borderRadius: "8px",
            boxSizing: "border-box",
          }}
        >
          <div
            ref={contentRef}
            className="content-root"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 16,
            }}
          >
            <Header1 />
            <Contact />
            <Profile />

            <div className="px-0 pt-4 pb-2 responsive-grid w-full">
              <Education />
              <Skills />
              <Projects />
            </div>

            <WorkExperience />
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          .print-frame-scaler { transform: none !important; width: 100% !important; height: 100% !important; margin:0; }
          .a4-frame { width: 100% !important; height: 100% !important; box-shadow: none !important; overflow: visible !important; padding: 0 !important; border-radius: 0 !important; }
          .a4-frame > .content-root { padding: 0 !important; }
        }
        .print-frame-scaler { display: flex; align-items: center; justify-content: center; }
        .a4-frame { box-sizing: border-box; }
        .content-root { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
