// src/components/LogoFun.jsx
import React, { useEffect, useRef, useState } from "react";
import logoSrc from "../assets/logo.png";
import audioFile from "../assets/DrinksAndFlowers.mp3";

const NOTES = ["♪", "♫", "♩", "♬", "♭", "𝄞", "𝄢", "♯"];
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
  const hoverStartTimeRef = useRef(0);

  useEffect(() => {
    const cleanupTimers = cleanupTimersRef.current;

    isTouchRef.current =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    try {
      const a = new Audio(audioFile);
      a.preload = "auto";
      a.loop = false;
      a.volume = 0;
      a.playsInline = true;

      const handleCanPlay = () => (audioReadyRef.current = true);
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

      // “burst” vizual periodic când nu e interacțiune
      const periodicBurst = () => {
        const burstCount = 5;
        for (let i = 0; i < burstCount; i++) {
          const t = setTimeout(() => createNote(), i * 120);
          cleanupTimers.add(t);
        }

        const el = logoRef.current;
        if (el && !logoHoveredRef.current && !isPlayingRef.current) {
          el.classList.remove("logo-beat-2");
          void el.offsetWidth;
          el.classList.add("logo-beat-2");
          const cleanupT = setTimeout(() => {
            el.classList.remove("logo-beat-2");
            cleanupTimers.delete(cleanupT);
          }, 1500);
          cleanupTimers.add(cleanupT);
        }
      };

      const initial = setTimeout(periodicBurst, 700);
      cleanupTimers.add(initial);
      periodicRef.current = setInterval(periodicBurst, 10000);

      return () => {
        try {
          if (periodicRef.current) clearInterval(periodicRef.current);
          if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
          cleanupTimers.forEach((t) => clearTimeout(t));
          cleanupTimers.clear();
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

          const audio = audioRef.current;
          if (audio) {
            audio.pause();
            audio.src = "";
            audio.removeEventListener("canplaythrough", handleCanPlay);
            audio.removeEventListener("error", handleError);
          }
        } catch (err) {
          console.warn("cleanup failed", err);
        }
      };
    } catch (initErr) {
      console.warn("audio init failed", initErr);
    }
  }, []);

  // ===== NOTE EFERVESCENTE =====
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

  // ===== AUDIO FADES =====
  const fadeInAudio = (duration = 600) =>
    new Promise((res) => {
      const a = audioRef.current;
      if (!a) return res();

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }

      const steps = 12;
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

  const fadeOutAudio = (duration = 400) =>
    new Promise((res) => {
      const a = audioRef.current;
      if (!a) return res();

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }

      const startVol = typeof a.volume === "number" ? a.volume : MASTER_VOL;
      if (startVol === 0) {
        try {
          a.pause();
          a.currentTime = 0;
        } catch (stopErr) {
          console.warn("audio stop/reset failed", stopErr);
        }
        return res();
      }

      const steps = 8;
      const stepTime = Math.max(10, Math.floor(duration / steps));
      let currentStep = 0;

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

  // ===== HELPERE: play/stop legate de note =====
  const ensureReady = async (a) => {
    if (!a) return;
    if (audioReadyRef.current) return;
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
  };

  const playWithFade = async () => {
    const a = audioRef.current;
    if (!a) return;
    await ensureReady(a);

    const dur = isFinite(a.duration) && a.duration > 0 ? a.duration : 0;
    const maxStart = dur > 0.6 ? Math.max(0, dur - 0.5) : 0;
    const randomStart = maxStart > 0 ? Math.random() * maxStart : 0;

    try {
      a.currentTime = randomStart;
      a.volume = 0;
    } catch {
      /* noop */
    }

    try {
      await a.play();
      await fadeInAudio(600);
      isPlayingRef.current = true;
      startSpawning(); // <<< notele pornesc cât timp cântă
    } catch (err) {
      console.warn("play/fade failed:", err);
      isPlayingRef.current = false;
    }
  };

  const stopWithFade = async (dur = 500) => {
    if (!isPlayingRef.current) return;
    try {
      await fadeOutAudio(dur);
    } catch (err) {
      console.warn("fadeOut failed:", err);
    }
    isPlayingRef.current = false;
    stopSpawning(); // <<< oprește notele când nu mai cântă
  };

  // ===== DESKTOP: hover =====
  const onLogoPointerEnter = async () => {
    if (isTouchRef.current) return;
    logoHoveredRef.current = true;
    hoverStartTimeRef.current = Date.now();
    await playWithFade();
  };

  const onLogoPointerLeave = async () => {
    if (isTouchRef.current) return;
    logoHoveredRef.current = false;

    const hoverDuration = Date.now() - hoverStartTimeRef.current;
    const shouldFadeOut = hoverDuration > 300;
    if (!isPlayingRef.current) return;

    if (shouldFadeOut) await stopWithFade(400);
    else {
      // stop imediat fără fade (scurt hover)
      const a = audioRef.current;
      if (a) {
        try {
          a.pause();
          a.currentTime = 0;
          a.volume = 0;
        } catch (err) {
          console.warn("immediate stop failed", err);
        }
      }
      isPlayingRef.current = false;
      stopSpawning();
    }
  };

  // ===== TABLET/MOBILE: TAP = TOGGLE (play/pause cu fade) =====
  const onTouchToggle = async (e) => {
    if (!isTouchRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const el = logoRef.current;
    if (el) {
      el.classList.remove("logo-spin");
      void el.offsetWidth;
      el.classList.add("logo-spin");
      const cleanup = setTimeout(() => {
        el.classList.remove("logo-spin");
        cleanupTimersRef.current.delete(cleanup);
      }, 800);
      cleanupTimersRef.current.add(cleanup);
    }

    if (isPlayingRef.current) {
      await stopWithFade(600);
    } else {
      await playWithFade();
    }
  };

  // ===== DESKTOP CLICK: doar efect vizual =====
  const handleDesktopClick = (e) => {
    if (isTouchRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const el = logoRef.current;
    if (!el) return;
    el.classList.remove("logo-spin");
    void el.offsetWidth;
    el.classList.add("logo-spin");
    const cleanup = setTimeout(() => {
      el.classList.remove("logo-spin");
      cleanupTimersRef.current.delete(cleanup);
    }, 800);
    cleanupTimersRef.current.add(cleanup);
  };

  // ===== Handlere unificate =====
  const onPointerDown = (e) => {
    if (isTouchRef.current) onTouchToggle(e);
    else handleDesktopClick(e);
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
        className="object-contain opacity-50 cursor-pointer select-none transition-transform duration-200 hover:scale-105"
        onPointerEnter={onLogoPointerEnter}
        onPointerLeave={onLogoPointerLeave}
        onPointerDown={onPointerDown}
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
          animation: logoSpin 0.8s ease both;
          transform-style: preserve-3d;
          will-change: transform;
        }
      `}</style>
    </div>
  );
}
