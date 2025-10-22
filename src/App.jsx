import React, { useState, useEffect, useRef } from "react";
import Header1 from "./components/Header1";
import Contact from "./components/Contact";
import Profile from "./components/Profile";
import Education from "./components/Education";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import WorkExperience from "./components/WorkExperience";

export default function App() {
  const [_isPrinting, setIsPrinting] = useState(false);
  const cvRef = useRef(null);

  useEffect(() => {
    const onBeforePrint = () => {
      setIsPrinting(true);
    };

    const onAfterPrint = () => {
      setIsPrinting(false);
    };

    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);

    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-stone-300 via-stone-400 to-stone-500 print:bg-white print:min-h-0 print:block">
      <div
        ref={cvRef}
        className="a4-frame bg-white shadow-2xl print:shadow-none overflow-hidden"
      >
        <Header1 cvRef={cvRef} />
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
  );
}
