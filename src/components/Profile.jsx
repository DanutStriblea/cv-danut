// src/components/Profile.jsx
import React, { useState, useRef, useEffect } from "react";
import profilePic from "../assets/profile.png";
import monkeyPic from "../assets/monkey.jpg";

export default function Profile() {
  const [flash, setFlash] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setFlash(true);
    timeoutRef.current = setTimeout(() => {
      setFlash(false);
      timeoutRef.current = null;
    }, 400); // 2 fractiuni de secunda = 400ms
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      // keep the flash running for the remainder: restart a 400ms fade-out
      timeoutRef.current = setTimeout(() => {
        setFlash(false);
        timeoutRef.current = null;
      }, 400);
    } else {
      setFlash(false);
    }
  };

  return (
    <div className="flex flex-row items-start gap-10 mt-6 bg-white w-full px-20 mb-2">
      <div
        className="relative w-28 h-28 -mt-2"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={profilePic}
          alt="Dănuț Striblea"
          className="w-28 h-28 rounded-full object-cover transform rotate-[-20deg] scale-x-[-1]"
        />

        <img
          src={monkeyPic}
          alt="monkey flash"
          className={
            "absolute inset-0 w-28 h-28 rounded-full object-cover transform origin-center " +
            (flash
              ? "opacity-100 transition-opacity duration-150"
              : "opacity-0 transition-opacity duration-200")
          }
          style={{
            pointerEvents: "none",
            transform: "rotate(10deg) scaleX(-1) scale(0.96)",
          }}
        />
      </div>

      <div className="flex-1">
        <h2 className="text-center bg-slate-300 py-1 rounded text-lg font-semibold font-montserrat mb-2">
          Profil
        </h2>
        <p className="text-xs text-gray-700 leading-relaxed text-justify">
          Experiență în producție muzicală și gastronomie. Pasionat de IT,
          creativ, organizat, cu abilități excelente de comunicare și o dorință
          continuă de a învăța și inova.
        </p>
      </div>
    </div>
  );
}
