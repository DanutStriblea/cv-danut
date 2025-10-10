// src/components/LogoFun.jsx
import React, { useEffect, useRef, useState } from "react";
import logoSrc from "../assets/logo.png";
import audioFile from "../assets/DrinksAndFlowers.mp3";

const NOTES = ["♪", "♫", "♩", "♬", "♭", "♯"];

export default function LogoFun({
  className = "w-35",
  noteContainerClass = "",
}) {
  const [notes, setNotes] = useState([]);
  const spawnIntervalRef = useRef(null);
  const periodicRef = useRef(null);
  const cleanupTimersRef = useRef(new Set());
  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const logoRef = useRef(null);
  const logoHoveredRef = useRef(false);

  useEffect(() => {
    // initialize audio
    try {
      const a = new Audio(audioFile);
      a.preload = "auto";
      a.loop = false;
      a.volume = 1;
      audioRef.current = a;
    } catch (initErr) {
      console.warn("audio init failed", initErr);
    }

    // periodic burst + synchronized pulse every 10s
    const periodicBurst = () => {
      // spawn burst of notes
      const burstCount = 5;
      for (let i = 0; i < burstCount; i++) {
        const t = setTimeout(() => createNote(), i * 120);
        cleanupTimersRef.current.add(t);
      }

      // pulse logo in sync if not hovered
      const el = logoRef.current;
      if (el && !logoHoveredRef.current) {
        el.classList.remove("logo-pulse");
        // force reflow to retrigger
        // eslint-disable-next-line no-unused-expressions
        el.offsetWidth;
        el.classList.add("logo-pulse");
        const cleanupT = setTimeout(() => {
          el.classList.remove("logo-pulse");
          cleanupTimersRef.current.delete(cleanupT);
        }, 950);
        cleanupTimersRef.current.add(cleanupT);
      }
    };

    const initial = setTimeout(periodicBurst, 700);
    cleanupTimersRef.current.add(initial);
    periodicRef.current = setInterval(periodicBurst, 10000); // 10s

    const timersSnapshot = cleanupTimersRef.current;
    const periodicSnapshot = periodicRef.current;
    const spawnSnapshot = spawnIntervalRef.current;

    return () => {
      if (periodicSnapshot) clearInterval(periodicSnapshot);
      if (spawnSnapshot) clearInterval(spawnSnapshot);
      timersSnapshot.forEach((t) => clearTimeout(t));
      timersSnapshot.clear();
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = "";
        } catch (cleanupErr) {
          console.warn("audio cleanup warning", cleanupErr);
        }
      }
    };
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createNote = () => {
    const id = Math.random().toString(36).slice(2, 9);
    const left = `${20 + Math.random() * 60}%`;
    const xDrift = (Math.random() - 0.5) * 40;
    const rotation = -30 + Math.random() * 60;
    const size = 12 + Math.floor(Math.random() * 14);
    const colors = [
      "text-green-500",
      "text-red-500",
      "text-yellow-500",
      "text-indigo-500",
      "text-pink-500",
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const char = NOTES[Math.floor(Math.random() * NOTES.length)];
    const note = { id, left, xDrift, rotation, size, color, char };
    setNotes((s) => [...s, note]);
    const t = setTimeout(() => {
      setNotes((s) => s.filter((n) => n.id !== id));
      cleanupTimersRef.current.delete(t);
    }, 2000);
    cleanupTimersRef.current.add(t);
  };

  const startSpawning = () => {
    if (spawnIntervalRef.current) return;
    spawnIntervalRef.current = setInterval(createNote, 120);
  };

  const stopSpawning = () => {
    if (spawnIntervalRef.current) {
      const gracefulStop = setTimeout(() => {
        try {
          if (spawnIntervalRef.current) {
            clearInterval(spawnIntervalRef.current);
            spawnIntervalRef.current = null;
          }
        } catch (stopErr) {
          console.warn("stopSpawning failed", stopErr);
        }
        cleanupTimersRef.current.delete(gracefulStop);
      }, 2000);
      cleanupTimersRef.current.add(gracefulStop);
    }
  };

  const handleLogoMouseEnterAudio = async () => {
    const a = audioRef.current;
    if (!a) return;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    await new Promise((res) => {
      if (!isNaN(a.duration) && a.duration > 0) return res();
      const onLoaded = () => {
        a.removeEventListener("loadedmetadata", onLoaded);
        res();
      };
      a.addEventListener("loadedmetadata", onLoaded);
      const fallback = setTimeout(() => {
        a.removeEventListener("loadedmetadata", onLoaded);
        res();
      }, 1000);
      cleanupTimersRef.current.add(fallback);
    });

    const dur = isFinite(a.duration) && a.duration > 0 ? a.duration : 0;
    const maxStart = dur > 0.6 ? Math.max(0, dur - 0.5) : 0;
    const randomStart = maxStart > 0 ? Math.random() * maxStart : 0;
    try {
      a.currentTime = randomStart;
    } catch (timeErr) {
      console.warn("set currentTime failed", timeErr);
    }

    try {
      a.volume = 0;
    } catch (volErr) {
      console.warn("set volume failed", volErr);
    }

    const playPromise = a.play();
    if (playPromise && typeof playPromise.catch === "function")
      playPromise.catch(() => {});

    const fadeDuration = 1000;
    const steps = 20;
    const stepTime = Math.max(10, Math.floor(fadeDuration / steps));
    let currentStep = 0;
    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      const frac = currentStep / steps;
      const newVol = Math.min(1, frac);
      try {
        a.volume = newVol;
      } catch (err) {
        console.warn("volume set failed during fade-in", err);
      }
      if (currentStep >= steps) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
        try {
          a.volume = 1;
        } catch (err) {
          console.warn("final volume set failed", err);
        }
      }
    }, stepTime);
  };

  const handleLogoMouseLeaveAudio = () => {
    const a = audioRef.current;
    if (!a) return;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    const fadeDuration = 1000;
    const steps = 20;
    const stepTime = Math.max(10, Math.floor(fadeDuration / steps));
    let currentStep = 0;
    const startVol = typeof a.volume === "number" ? a.volume : 1;

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      const frac = currentStep / steps;
      const newVol = Math.max(0, startVol * (1 - frac));
      try {
        a.volume = newVol;
      } catch (err) {
        console.warn("volume set failed during fade-out", err);
      }
      if (currentStep >= steps) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
        try {
          a.pause();
          a.currentTime = 0;
          a.volume = 1;
        } catch (err) {
          console.warn("audio stop/reset failed", err);
        }
      }
    }, stepTime);
  };

  const onLogoMouseEnter = () => {
    logoHoveredRef.current = true;
    startSpawning();
    handleLogoMouseEnterAudio();
  };

  const onLogoMouseLeave = () => {
    logoHoveredRef.current = false;
    stopSpawning();
    handleLogoMouseLeaveAudio();
  };

  return (
    <div className={`relative flex justify-center items-center ${className}`}>
      <img
        ref={logoRef}
        src={logoSrc}
        alt="Logo"
        className="object-contain opacity-50 cursor-pointer"
        onMouseEnter={onLogoMouseEnter}
        onMouseLeave={onLogoMouseLeave}
      />

      <div
        className={`absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center ${noteContainerClass}`}
      >
        {notes.map((n) => (
          <span
            key={n.id}
            className={`note absolute ${n.color}`}
            style={{
              left: n.left,
              fontSize: `${n.size}px`,
              transform: `translateX(${n.xDrift}px) rotate(${n.rotation}deg)`,
            }}
          >
            {n.char}
          </span>
        ))}
      </div>

      <style>{`
        .note {
          animation: noteRise 2000ms linear forwards;
          opacity: 0.95;
          will-change: transform, opacity;
          text-shadow: 0 1px 0 rgba(255,255,255,0.2);
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
        }
        @keyframes noteRise {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120px) translateX(var(--sway, 0px)) rotate(15deg) scale(1.05);
            opacity: 0;
          }
        }
        @keyframes logoPulse {
          0% { transform: scale(1); }
          30% { transform: scale(1.08); }
          60% { transform: scale(0.98); }
          100% { transform: scale(1); }
        }
        .logo-pulse {
          animation: logoPulse 900ms cubic-bezier(.2,.9,.3,1) both;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
