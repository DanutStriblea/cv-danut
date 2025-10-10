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
  const contentRef = useRef(null);

  const frameWidth = 794; // A4 width px
  const frameHeight = 1123; // A4 height px

  useEffect(() => {
    let mounted = true;
    const recomputeScales = () => {
      if (!mounted) return;
      // Scale for fitting content inside A4 (screen only)
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        const newContentScale = Math.min(1, frameHeight / contentHeight);
        if (Math.abs(newContentScale - contentScale) > 0.0001) {
          setContentScale(newContentScale);
        }
      }

      // Scale for fitting A4 frame in viewport (screen only)
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
      mounted = false;
      window.removeEventListener("resize", recomputeScales);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentScale, frameHeight, frameWidth]);

  // compensăm dimensiunile pentru a elimina spațiul din dreapta
  const compensatedWidth = frameWidth / contentScale;
  const compensatedHeight = frameHeight / contentScale;

  return (
    <div
      className="flex justify-center items-center min-h-screen 
                    bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500 
                    print:bg-transparent overflow-auto py-2 print:p-0 print:min-h-0"
    >
      {/* Wrapper centrat vertical și orizontal */}
      <div
        className="mx-auto print-frame-scaler flex items-center justify-center"
        style={{
          transform: `scale(${frameScale})`,
          transformOrigin: "top center",
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
            className="content-root"
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

      {/* Stiluri pentru print și pentru afișare; pastrează integrate în componentă */}
      <style>{`
        /* GENERAL */
        html, body, * { box-sizing: border-box; }

        @media print {
          /* pagină A4 cu margini mici: zona utilă reală */
          @page { size: A4; margin: 6mm; }

          /* reset pentru print: nu folosim transform-uri de pe ecran */
          .print-frame-scaler {
            transform: none !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
          }

          /* folosește dimensiuni reale A4 în mm pentru imprimantă */
          .a4-frame {
            width: 210mm !important;
            height: 297mm !important;
            box-shadow: none !important;
            overflow: visible !important;
            padding: 6mm !important;
            margin: 0 auto !important;
            page-break-after: avoid;
            page-break-inside: avoid;
          }

          /* conținutul nu va folosi transform scale la print */
          .a4-frame > .content-root {
            transform: none !important;
            width: auto !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* forțăm evitarea de page breaks în interiorul secțiunilor */
          .no-break, .section, .project, .content-root {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* ascunde elemente inutile pentru print */
          .no-print { display: none !important; }

          /* limitează imaginile să nu extindă layout-ul */
          .a4-frame img { max-width: 100% !important; height: auto !important; display: block; }

          /* prevenim orice margin-left/right neașteptat */
          body, html { margin: 0; padding: 0; width: 210mm; height: 297mm; overflow: hidden; }

          /* mică reducere de font pe mobile print pentru a evita overflow minor */
          @media print and (max-device-width: 900px) {
            body { font-size: 97% !important; }
          }
        }

        /* DISPLAY (screen) helpers to keep centered and avoid chaotic zoom */
        @media screen {
          /* centrarea verticală / orizontală rămâne */
          .print-frame-scaler { display: flex; align-items: center; justify-content: center; width: 100%; }

          /* conținutul root folosește overflow visible pentru layout pe ecran */
          .content-root { overflow: visible; }
        }
      `}</style>
    </div>
  );
}
