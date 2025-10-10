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
  const isTouchRef = useRef(false);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    isTouchRef.current =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    try {
      const a = new Audio(audioFile);
      a.preload = "auto";
      a.loop = false;
      a.volume = 1;
      audioRef.current = a;
    } catch (initErr) {
      console.warn("audio init failed", initErr);
    }

    const periodicBurst = () => {
      const burstCount = 5;
      for (let i = 0; i < burstCount; i++) {
        const t = setTimeout(() => createNote(), i * 120);
        cleanupTimersRef.current.add(t);
      }

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

    try {
      const initial = setTimeout(periodicBurst, 700);
      cleanupTimersRef.current.add(initial);
      periodicRef.current = setInterval(periodicBurst, 10000); // 10s
    } catch (err) {
      console.warn("periodic setup failed", err);
    }

    const timersSnapshot = cleanupTimersRef.current;
    const periodicSnapshot = periodicRef.current;
    const spawnSnapshot = spawnIntervalRef.current;

    return () => {
      try {
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
      } catch (cleanupOuterErr) {
        console.warn("cleanup failed", cleanupOuterErr);
      }
    };
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
    if (!spawnIntervalRef.current) return;
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
  };

  const fadeIn = (duration = 1000) =>
    new Promise((res) => {
      const a = audioRef.current;
      if (!a) return res();
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
      try {
        a.volume = 0;
      } catch (err) {
        console.warn("set initial volume failed", err);
      }
      const steps = 20;
      const stepTime = Math.max(10, Math.floor(duration / steps));
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
          res();
        }
      }, stepTime);
    });

  const fadeOut = (duration = 400) =>
    new Promise((res) => {
      const a = audioRef.current;
      if (!a) return res();
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
      const steps = Math.max(4, Math.floor(duration / 50));
      const stepTime = Math.max(10, Math.floor(duration / steps));
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
          res();
        }
      }, stepTime);
    });

  const onLogoMouseEnter = () => {
    logoHoveredRef.current = true;
    startSpawning();
    void handleLogoMouseEnterAudio();
  };

  const onLogoMouseLeave = () => {
    logoHoveredRef.current = false;
    stopSpawning();
    handleLogoMouseLeaveAudio();
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
    } catch (err) {
      console.warn("set volume failed", err);
    }

    const playPromise = a.play();
    if (playPromise && typeof playPromise.catch === "function")
      playPromise.catch(() => {});
    await fadeIn(1000);
    isPlayingRef.current = true;
  };

  const handleLogoMouseLeaveAudio = () => {
    void fadeOut(400).then(() => {
      isPlayingRef.current = false;
    });
  };

  const handleTouchToggle = async (e) => {
    e.preventDefault();
    const el = logoRef.current;
    if (!el) return;

    if (isPlayingRef.current) {
      el.classList.remove("logo-pulse");
      // eslint-disable-next-line no-unused-expressions
      el.offsetWidth;
      el.classList.add("logo-pulse");
      const cleanupT = setTimeout(() => {
        el.classList.remove("logo-pulse");
        cleanupTimersRef.current.delete(cleanupT);
      }, 450);
      cleanupTimersRef.current.add(cleanupT);

      await fadeOut(400);
      isPlayingRef.current = false;
      return;
    }

    logoHoveredRef.current = true;
    startSpawning();

    const a = audioRef.current;
    if (!a) return;
    try {
      const dur = isFinite(a.duration) && a.duration > 0 ? a.duration : 0;
      const maxStart = dur > 0.6 ? Math.max(0, dur - 0.5) : 0;
      const randomStart = maxStart > 0 ? Math.random() * maxStart : 0;
      a.currentTime = randomStart;
    } catch (timeErr) {
      console.warn("set currentTime failed", timeErr);
    }

    try {
      a.volume = 0;
    } catch (err) {
      console.warn("set volume failed", err);
    }

    const playPromise = a.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }

    el.classList.remove("logo-pulse");
    // eslint-disable-next-line no-unused-expressions
    el.offsetWidth;
    el.classList.add("logo-pulse");
    const cleanupT = setTimeout(() => {
      el.classList.remove("logo-pulse");
      cleanupTimersRef.current.delete(cleanupT);
    }, 950);
    cleanupTimersRef.current.add(cleanupT);

    await fadeIn(1000);
    isPlayingRef.current = true;
  };

  return (
    <div className={`relative flex justify-center items-center ${className}`}>
      <img
        ref={logoRef}
        src={logoSrc}
        alt="Logo"
        className="object-contain opacity-50 cursor-pointer"
        onMouseEnter={!isTouchRef.current ? onLogoMouseEnter : undefined}
        onMouseLeave={!isTouchRef.current ? onLogoMouseLeave : undefined}
        onTouchStart={isTouchRef.current ? handleTouchToggle : undefined}
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
          0% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); opacity: 1; }
          30% { opacity: 1; }
          100% { transform: translateY(-120px) translateX(var(--sway, 0px)) rotate(15deg) scale(1.05); opacity: 0; }
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
