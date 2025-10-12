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
    }, 400);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setFlash(false);
        timeoutRef.current = null;
      }, 400);
    } else {
      setFlash(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 mt-5.5 bg-white w-full px-4 md:px-22 mb-1">
      {/* Profile image */}
      <div
        className="relative w-24 h-24 md:w-28 md:h-28 -mt-2"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={profilePic}
          alt="Dănuț Striblea"
          className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover transform rotate-[-20deg] scale-x-[-1]"
        />

        <img
          src={monkeyPic}
          alt="monkey flash"
          className={
            "absolute inset-0 w-24 h-24 md:w-28 md:h-28 rounded-full object-cover transform origin-center " +
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

      {/* Profile text - centered on mobile */}
      <div className="flex-1 text-center md:text-left">
        <h2 className="bg-slate-300 py-1 rounded text-lg font-semibold font-montserrat mb-2 md:mb-2">
          Profil
        </h2>
        <p className="text-xs md:text-xs text-gray-700 leading-relaxed text-justify md:text-justify">
          Experiență în producție muzicală și gastronomie. Pasionat de IT,
          creativ, organizat, cu abilități excelente de comunicare și o dorință
          continuă de a învăța și inova.
        </p>
      </div>
    </div>
  );
}
