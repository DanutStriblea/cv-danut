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

  // dimensiuni A4 în px pentru layout intern (nu transformăm pagina)
  const frameWidth = 794;
  const frameHeight = 1123;

  useEffect(() => {
    const recompute = () => {
      if (!contentRef.current) return;
      // păstrăm acest recompute doar pentru eventuale layout changes (opțional)
      // nu setăm stare nefolosită, deci funcția doar "forțează" recalcul dacă e necesar
      // (poți elimina complet observer-ul dacă nu ai conținut dinamic)
      void contentRef.current.scrollHeight;
    };

    recompute();
    window.addEventListener("resize", recompute);
    const mo = new MutationObserver(recompute);
    if (contentRef.current) {
      mo.observe(contentRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
    return () => {
      window.removeEventListener("resize", recompute);
      mo.disconnect();
    };
  }, [frameHeight]);

  return (
    <div
      className="flex justify-center items-center min-h-screen
                 bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500
                 print:bg-transparent overflow-auto py-2 print:p-0 print:min-h-0"
    >
      {/* wrapper centrat; nu aplicăm transform: scale aici */}
      <div className="mx-auto print-frame-scaler flex items-center justify-center w-full">
        {/* rama A4: fix px width dar responsive prin max-w */}
        <div
          className="a4-frame bg-white shadow-[0_8px_30px_rgba(0,0,0,0.60)] overflow-hidden print:shadow-none print:rounded-none"
          style={{
            width: `${frameWidth}px`,
            maxWidth: "calc(100vw - 32px)",
            height: "auto",
            position: "relative",
            margin: "16px auto",
          }}
        >
          {/* Conținutul CV-ului */}
          <div
            ref={contentRef}
            className="content-root"
            style={{
              width: "100%",
              boxSizing: "border-box",
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

      {/* Stiluri pentru print păstrate (fără transform-uri care să afecteze zoom) */}
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
          .print-frame-scaler { transform: none !important; margin: 0 !important; width: 100% !important; height: 100% !important; }
          .a4-frame { box-shadow: none !important; width: 100% !important; height: 100% !important; overflow: hidden !important; }
        }
        /* centrare stabilă pe ecran */
        .print-frame-scaler { display: flex; align-items: center; justify-content: center; }
        .a4-frame { box-sizing: border-box; }
        .content-root { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
