// src/components/LogoFun.jsx
import React, { useEffect, useRef, useState } from "react";
import logoSrc from "../assets/logo.png";
import audioFile from "../assets/DrinksAndFlowers.mp3";

const NOTES = ["♪", "♫", "♩", "♬", "♭", "♯"];
const MASTER_VOL = 0.6;

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
  const audioReadyRef = useRef(false);

  useEffect(() => {
    isTouchRef.current =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    // Initialize audio element
    try {
      const a = new Audio(audioFile);
      a.preload = "auto";
      a.loop = false;
      a.volume = 0; // Start with volume 0 for fade-in
      a.playsInline = true;

      const handleCanPlay = () => {
        audioReadyRef.current = true;
      };

      const handleError = (e) => {
        console.warn("Audio loading error:", e);
        audioReadyRef.current = false;
      };

      a.addEventListener("canplaythrough", handleCanPlay);
      a.addEventListener("error", handleError);

      audioRef.current = a;

      try {
        a.load();
      } catch (loadErr) {
        console.warn("audio load() failed (non-fatal)", loadErr);
      }

      // Periodic visual burst
      const periodicBurst = () => {
        const burstCount = 5;
        for (let i = 0; i < burstCount; i++) {
          const t = setTimeout(() => createNote(), i * 120);
          cleanupTimersRef.current.add(t);
        }

        const el = logoRef.current;
        if (el && !logoHoveredRef.current) {
          el.classList.remove("logo-beat-2");
          void el.offsetWidth;
          el.classList.add("logo-beat-2");
          const cleanupT = setTimeout(() => {
            el.classList.remove("logo-beat-2");
            cleanupTimersRef.current.delete(cleanupT);
          }, 1500);
          cleanupTimersRef.current.add(cleanupT);
        }
      };

      try {
        const initial = setTimeout(periodicBurst, 700);
        cleanupTimersRef.current.add(initial);
        periodicRef.current = setInterval(periodicBurst, 10000);
      } catch (err) {
        console.warn("periodic setup failed", err);
      }

      // Cleanup
      return () => {
        try {
          if (periodicRef.current) clearInterval(periodicRef.current);
          if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
          cleanupTimersRef.current.forEach((t) => clearTimeout(t));
          cleanupTimersRef.current.clear();
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          if (audioRef.current) {
            try {
              audioRef.current.pause();
              audioRef.current.src = "";
              audioRef.current.removeEventListener(
                "canplaythrough",
                handleCanPlay
              );
              audioRef.current.removeEventListener("error", handleError);
            } catch (cleanupErr) {
              console.warn("audio cleanup warning", cleanupErr);
            }
          }
        } catch (cleanupOuterErr) {
          console.warn("cleanup failed", cleanupOuterErr);
        }
      };
    } catch (initErr) {
      console.warn("audio init failed", initErr);
    }
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
    clearInterval(spawnIntervalRef.current);
    spawnIntervalRef.current = null;
  };

  const fadeInAudio = (duration = 1000) =>
    new Promise((res) => {
      const a = audioRef.current;
      if (!a) return res();

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }

      const steps = 20;
      const stepTime = Math.max(10, Math.floor(duration / steps));
      let currentStep = 0;

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        const frac = currentStep / steps;
        const newVol = Math.min(MASTER_VOL, MASTER_VOL * frac);
        try {
          a.volume = newVol;
        } catch (volErr) {
          console.warn("volume set failed during fade-in", volErr);
        }
        if (currentStep >= steps) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
          res();
        }
      }, stepTime);
    });

  const fadeOutAudio = (duration = 1000) =>
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
      const startVol = typeof a.volume === "number" ? a.volume : MASTER_VOL;

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        const frac = currentStep / steps;
        const newVol = Math.max(0, startVol * (1 - frac));
        try {
          a.volume = newVol;
        } catch (volErr) {
          console.warn("volume set failed during fade-out", volErr);
        }
        if (currentStep >= steps) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
          try {
            a.pause();
            a.currentTime = 0;
          } catch (stopErr) {
            console.warn("audio stop/reset failed", stopErr);
          }
          res();
        }
      }, stepTime);
    });

  // ===== DESKTOP BEHAVIOR =====
  const onLogoPointerEnter = async () => {
    if (isTouchRef.current) return; // Ignore hover on touch devices

    logoHoveredRef.current = true;
    startSpawning();

    // Start audio on hover enter
    const a = audioRef.current;
    if (!a || isPlayingRef.current) return;

    // Wait for audio to be ready
    if (!audioReadyRef.current) {
      try {
        await new Promise((res) => {
          if (!a) return res();
          if (a.readyState >= 3) {
            audioReadyRef.current = true;
            return res();
          }
          const onLoaded = () => {
            a.removeEventListener("canplaythrough", onLoaded);
            audioReadyRef.current = true;
            res();
          };
          a.addEventListener("canplaythrough", onLoaded, { once: true });

          const timeout = setTimeout(() => {
            a.removeEventListener("canplaythrough", onLoaded);
            res();
          }, 2000);
          cleanupTimersRef.current.add(timeout);
        });
      } catch (err) {
        console.warn("Audio ready check failed:", err);
      }
    }

    const dur = isFinite(a.duration) && a.duration > 0 ? a.duration : 0;
    const maxStart = dur > 0.6 ? Math.max(0, dur - 0.5) : 0;
    const randomStart = maxStart > 0 ? Math.random() * maxStart : 0;

    try {
      a.currentTime = randomStart;
      a.volume = 0; // Start with volume 0 for fade-in
    } catch (timeErr) {
      console.warn("set currentTime/volume failed", timeErr);
    }

    try {
      await a.play();
      await fadeInAudio(1000);
      isPlayingRef.current = true;
    } catch (err) {
      console.warn("play/fade failed on hover start", err);
    }
  };

  const onLogoPointerLeave = async () => {
    if (isTouchRef.current) return; // Ignore hover on touch devices

    logoHoveredRef.current = false;
    stopSpawning();

    // Stop audio on hover leave
    if (!isPlayingRef.current) return;

    try {
      await fadeOutAudio(1000);
    } catch (err) {
      console.warn("fade out failed on hover end", err);
    }
    isPlayingRef.current = false;
  };

  // ===== MOBILE BEHAVIOR =====
  const handleMobileTap = async (e) => {
    if (!isTouchRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const el = logoRef.current;
    const a = audioRef.current;
    if (!el || !a) return;

    // Visual spin effect
    el.classList.remove("logo-spin");
    void el.offsetWidth;
    el.classList.add("logo-spin");
    const cleanupSpin = setTimeout(() => {
      el.classList.remove("logo-spin");
      cleanupTimersRef.current.delete(cleanupSpin);
    }, 1000);
    cleanupTimersRef.current.add(cleanupSpin);

    // Toggle play/stop
    if (isPlayingRef.current) {
      // Stop audio
      try {
        await fadeOutAudio(1000); // Changed from 400 to 1000 for mobile too
      } catch (err) {
        console.warn("fadeOut failed on mobile stop", err);
      }
      isPlayingRef.current = false;
      stopSpawning();
      logoHoveredRef.current = false;
    } else {
      // Start audio
      logoHoveredRef.current = true;
      startSpawning();

      // Wait for audio to be ready
      if (!audioReadyRef.current) {
        try {
          await new Promise((res) => {
            if (!a) return res();
            if (a.readyState >= 3) {
              audioReadyRef.current = true;
              return res();
            }
            const onLoaded = () => {
              a.removeEventListener("canplaythrough", onLoaded);
              audioReadyRef.current = true;
              res();
            };
            a.addEventListener("canplaythrough", onLoaded, { once: true });

            const timeout = setTimeout(() => {
              a.removeEventListener("canplaythrough", onLoaded);
              res();
            }, 2000);
            cleanupTimersRef.current.add(timeout);
          });
        } catch (err) {
          console.warn("Audio ready check failed on mobile:", err);
        }
      }

      const dur = isFinite(a.duration) && a.duration > 0 ? a.duration : 0;
      const maxStart = dur > 0.6 ? Math.max(0, dur - 0.5) : 0;
      const randomStart = maxStart > 0 ? Math.random() * maxStart : 0;

      try {
        a.currentTime = randomStart;
        a.volume = 0; // Start with volume 0 for fade-in
      } catch (timeErr) {
        console.warn("set currentTime/volume failed on mobile", timeErr);
      }

      try {
        await a.play();
        await fadeInAudio(1000);
        isPlayingRef.current = true;
      } catch (playErr) {
        console.warn("play() failed on mobile:", playErr);
      }
    }
  };

  // ===== DESKTOP CLICK (Visual only) =====
  const handleDesktopClick = (e) => {
    if (isTouchRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const el = logoRef.current;
    if (!el) return;

    // Only do visual spin, don't interact with audio
    el.classList.remove("logo-spin");
    void el.offsetWidth;
    el.classList.add("logo-spin");
    const cleanup = setTimeout(() => {
      el.classList.remove("logo-spin");
      cleanupTimersRef.current.delete(cleanup);
    }, 1000);
    cleanupTimersRef.current.add(cleanup);
  };

  // ===== UNIFIED HANDLER =====
  const handlePointerDown = (e) => {
    if (isTouchRef.current) {
      handleMobileTap(e);
    } else {
      handleDesktopClick(e);
    }
  };

  return (
    <div
      className={`relative flex justify-center items-center ${className}`}
      style={{ touchAction: "manipulation" }}
    >
      <img
        ref={logoRef}
        src={logoSrc}
        alt="Logo"
        className="object-contain opacity-50 cursor-pointer select-none"
        onPointerEnter={onLogoPointerEnter}
        onPointerLeave={onLogoPointerLeave}
        onPointerDown={handlePointerDown}
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

        @keyframes logoBeat2 {
          0%   { transform: scale(1); }
          18%  { transform: scale(1.18); }
          36%  { transform: scale(1); }
          54%  { transform: scale(1.12); }
          72%  { transform: scale(1); }
          100% { transform: scale(1); }
        }
        .logo-beat-2 {
          animation: logoBeat2 1.4s cubic-bezier(.2,.9,.3,1) both;
          will-change: transform;
        }

        @keyframes logoSpin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        .logo-spin {
          animation: logoSpin 1s ease both;
          transform-style: preserve-3d;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
