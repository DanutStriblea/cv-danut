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
    const recomputeScales = () => {
      // Scale for fitting content inside A4
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        const newContentScale = Math.min(1, frameHeight / contentHeight);
        if (newContentScale !== contentScale) {
          setContentScale(newContentScale);
        }
      }

      // Scale for fitting A4 frame in viewport
      const scaleToWidth = (window.innerWidth - 32) / frameWidth;
      const scaleToHeight = (window.innerHeight - 32) / frameHeight;
      const newFrameScale = Math.min(1, scaleToWidth, scaleToHeight);
      setFrameScale(newFrameScale);
    };

    // Recompute on mount and on content changes
    recomputeScales();
    window.addEventListener("resize", recomputeScales);

    // Use a MutationObserver to detect content changes
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
        className="mx-auto print-frame-scaler"
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

      {/* Stiluri pentru print */}
      <style>{`
        @media print {
          /* mică margine @page pentru a oferi spațiu antet/footer sistem */
          @page {
            size: A4;
            margin: 4mm;
          }

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

          body > div {
            display: block !important;
            height: 100%;
          }

          .print-frame-scaler {
            transform: none !important;
            margin: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }

          .a4-frame {
            box-shadow: none !important;
            width: 100% !important;
            height: 100% !important;
            overflow: hidden !important;
          }

          /* reducere ușoară pentru dispozitive mobile la print (iPhone) */
          /* ajustați valorile dacă e nevoie: 0.84 = 84% */
          @media print and (max-device-width: 900px) {
            /* Aplicăm o scalare ușoară doar la print pe ecrane mici */
            .a4-frame > div {
              transform-origin: top left !important;
              transform: scale(0.92) !important;
            }
            /* reduce padding intern vizibil doar la print */
            .a4-frame .px-6 { padding-left: 6px !important; padding-right: 6px !important; }
            .a4-frame .pt-4 { padding-top: 6px !important; }
            .a4-frame .pb-2 { padding-bottom: 6px !important; }
          }

          /* Elemente care pot încă să streseze layout-ul - ascundeți dacă nu sunt necesare */
          .no-print { display: none !important; }

          /* evită page breaks în interiorul secțiunilor mari */
          .no-break, .section, .project {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
