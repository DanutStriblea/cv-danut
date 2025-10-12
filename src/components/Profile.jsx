import React, { useState, useRef, useEffect } from "react";
import profilePic from "../assets/profile.png";
import monkeyPic from "../assets/monkey.jpg";

export default function Profile() {
  const [flash, setFlash] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener("resize", checkMobile);
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

  // Mobile layout: Chenar Profil -> Poza -> Text (vertical)
  if (isMobile) {
    return (
      <div className="w-full px-4 mb-1">
        {/* Chenarul "Profil" - centrat */}
        <div className="text-center mb-4">
          <h2 className="bg-slate-300 py-1 rounded text-lg font-semibold font-montserrat inline-block px-8">
            Profil
          </h2>
        </div>

        {/* Poza - centrată */}
        <div className="flex justify-center mb-4">
          <div
            className="relative w-24 h-24"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={profilePic}
              alt="Dănuț Striblea"
              className="w-24 h-24 rounded-full object-cover transform rotate-[-20deg] scale-x-[-1]"
            />

            <img
              src={monkeyPic}
              alt="monkey flash"
              className={
                "absolute inset-0 w-24 h-24 rounded-full object-cover transform origin-center " +
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
        </div>

        {/* Textul - centrat */}
        <div className="text-center">
          <p className="text-xs text-gray-700 leading-relaxed">
            Experiență în producție muzicală și gastronomie. Pasionat de IT,
            creativ, organizat, cu abilități excelente de comunicare și o
            dorință continuă de a învăța și inova.
          </p>
        </div>
      </div>
    );
  }

  // Desktop layout: original (imagine + text orizontal)
  return (
    <div className="flex flex-row items-start gap-10 mt-5.5 bg-white w-full px-22 mb-1">
      {/* Poza */}
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

      {/* Textul cu chenar "Profil" centrat */}
      <div className="flex-1 text-center">
        <h2 className="bg-slate-300 py-1 rounded text-lg font-semibold font-montserrat mb-2">
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
