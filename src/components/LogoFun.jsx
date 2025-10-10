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
  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);
  const sourceRef = useRef(null);
  const logoRef = useRef(null);
  const logoHoveredRef = useRef(false);
  const isTouchRef = useRef(false);
  const isPlayingRef = useRef(false);
  const userGestureInitializedRef = useRef(false);

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
        el.classList.remove("logo-beat-2");
        // force reflow
        // eslint-disable-next-line no-unused-expressions
        el.offsetWidth;
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
        if (audioCtxRef.current) {
          try {
            audioCtxRef.current.close();
          } catch (closeErr) {
            console.warn("audio context close failed", closeErr);
          }
          audioCtxRef.current = null;
          gainRef.current = null;
          sourceRef.current = null;
        }
      } catch (cleanupOuterErr) {
        console.warn("cleanup failed", cleanupOuterErr);
      }
    };
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

  const resAfterTimeout = (fn, ms) => {
    const t = setTimeout(() => {
      try {
        fn();
      } catch (err) {
        console.warn("resAfterTimeout callback failed", err);
      }
    }, ms);
    cleanupTimersRef.current.add(t);
  };

  const ensureAudioContext = async () => {
    if (userGestureInitializedRef.current) return;
    const a = audioRef.current;
    if (!a) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        userGestureInitializedRef.current = true;
        return;
      }

      if (audioCtxRef.current && gainRef.current && sourceRef.current) {
        userGestureInitializedRef.current = true;
        try {
          if (audioCtxRef.current.state === "suspended")
            await audioCtxRef.current.resume();
        } catch (resumeErr) {
          console.warn("resume failed", resumeErr);
        }
        return;
      }

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gainRef.current = gain;

      try {
        const source = ctx.createMediaElementSource(a);
        sourceRef.current = source;
        source.connect(gain).connect(ctx.destination);
      } catch (sourceErr) {
        console.warn("createMediaElementSource failed", sourceErr);
      }

      userGestureInitializedRef.current = true;
    } catch (err) {
      console.warn("audio context init failed", err);
      userGestureInitializedRef.current = true;
    }
  };

  const fadeInWithAudioContext = (duration = 1000) =>
    new Promise((res) => {
      const ctx = audioCtxRef.current;
      const gain = gainRef.current;
      const a = audioRef.current;
      if (!a) return res();
      if (!ctx || !gain) {
        void fallbackFadeIn(duration).then(res);
        return;
      }
      try {
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(1, now + duration / 1000);
        resAfterTimeout(res, duration + 50);
      } catch (err) {
        console.warn("gain fadeIn failed", err);
        void fallbackFadeIn(duration).then(res);
      }
    });

  const fadeOutWithAudioContext = (duration = 400) =>
    new Promise((res) => {
      const ctx = audioCtxRef.current;
      const gain = gainRef.current;
      const a = audioRef.current;
      if (!a) return res();
      if (!ctx || !gain) {
        void fallbackFadeOut(duration).then(res);
        return;
      }
      try {
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value || 1, now);
        gain.gain.linearRampToValueAtTime(0, now + duration / 1000);
        resAfterTimeout(async () => {
          try {
            a.pause();
            a.currentTime = 0;
          } catch (pauseErr) {
            console.warn("pause after fadeOut failed", pauseErr);
          }
          res();
        }, duration + 50);
      } catch (err) {
        console.warn("gain fadeOut failed", err);
        void fallbackFadeOut(duration).then(res);
      }
    });

  const fallbackFadeIn = (duration = 1000) =>
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
        } catch (volErr) {
          console.warn("volume set failed during fallback fade-in", volErr);
        }
        if (currentStep >= steps) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
          try {
            a.volume = 1;
          } catch (finalErr) {
            console.warn("final volume set failed", finalErr);
          }
          res();
        }
      }, stepTime);
    });

  const fallbackFadeOut = (duration = 400) =>
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
        } catch (volErr) {
          console.warn("volume set failed during fallback fade-out", volErr);
        }
        if (currentStep >= steps) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
          try {
            a.pause();
            a.currentTime = 0;
            a.volume = 1;
          } catch (stopErr) {
            console.warn("audio stop/reset failed", stopErr);
          }
          res();
        }
      }, stepTime);
    });

  const onLogoMouseEnter = () => {
    // desktop hover start audio; keep desktop-only behavior
    logoHoveredRef.current = true;
    startSpawning();
    void handleLogoMouseEnterAudio();
  };

  const onLogoMouseLeave = () => {
    // desktop hover stop audio
    logoHoveredRef.current = false;
    stopSpawning();
    void handleLogoMouseLeaveAudio();
  };

  const handleLogoMouseEnterAudio = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      await ensureAudioContext();
    } catch (err) {
      console.warn("ensureAudioContext failed", err);
    }

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
      if (audioCtxRef.current && gainRef.current) {
        gainRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      } else {
        a.volume = 0;
      }
    } catch (err) {
      console.warn("set volume/gain failed", err);
    }

    try {
      const playPromise = a.play();
      if (playPromise && typeof playPromise.catch === "function")
        playPromise.catch(() => {});
      if (audioCtxRef.current && gainRef.current) {
        await fadeInWithAudioContext(1000);
      } else {
        await fallbackFadeIn(1000);
      }
      isPlayingRef.current = true;
    } catch (err) {
      console.warn("play/fade failed on mouseenter", err);
    }
  };

  const handleLogoMouseLeaveAudio = async () => {
    try {
      await fadeOutWithAudioContext(400);
    } catch (err) {
      console.warn("fade out failed on mouseleave", err);
      try {
        await fallbackFadeOut(400);
      } catch (fallbackErr) {
        console.warn("fallback fadeOut also failed", fallbackErr);
      }
    }
    isPlayingRef.current = false;
  };

  // touch: toggle play/pause AND spin (mobile/tablet)
  const handleTouchToggle = async (e) => {
    // do not call preventDefault to avoid passive listener errors;
    // simply stop propagation to keep click behavior isolated
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();
    const el = logoRef.current;
    if (!el) return;

    const a = audioRef.current;
    if (!a) return;

    // if currently playing -> fade out + stop + small spin-stop feedback
    if (isPlayingRef.current) {
      el.classList.remove("logo-spin");
      el.offsetWidth;
      el.classList.add("logo-spin");
      const cleanupSpinStop = setTimeout(() => {
        el.classList.remove("logo-spin");
        cleanupTimersRef.current.delete(cleanupSpinStop);
      }, 1000);
      cleanupTimersRef.current.add(cleanupSpinStop);

      try {
        await fadeOutWithAudioContext(400);
      } catch (err) {
        console.warn("fadeOut failed on touch stop", err);
        try {
          await fallbackFadeOut(400);
        } catch (fallbackErr) {
          console.warn("fallback fadeOut failed on touch stop", fallbackErr);
        }
      }
      isPlayingRef.current = false;
      return;
    }

    // start spawning notes and prepare audio
    logoHoveredRef.current = true;
    startSpawning();

    try {
      const dur = isFinite(a.duration) && a.duration > 0 ? a.duration : 0;
      const maxStart = dur > 0.6 ? Math.max(0, dur - 0.5) : 0;
      const randomStart = maxStart > 0 ? Math.random() * maxStart : 0;
      a.currentTime = randomStart;
    } catch (timeErr) {
      console.warn("set currentTime failed", timeErr);
    }

    let played = false;
    try {
      const p = a.play();
      if (p && typeof p.then === "function") await p;
      played = true;
    } catch (playErr) {
      console.warn("play() failed on first attempt", playErr);
    }

    try {
      await ensureAudioContext();
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        try {
          await audioCtxRef.current.resume();
        } catch (resumeErr) {
          console.warn("resume audioCtx failed", resumeErr);
        }
      }
    } catch (err) {
      console.warn("ensureAudioContext failed", err);
    }

    if (!played) {
      try {
        const p2 = a.play();
        if (p2 && typeof p2.then === "function") await p2;
      } catch (playErr2) {
        console.warn("play() still failed", playErr2);
      }
    }

    // spin visual on touch
    el.classList.remove("logo-spin");
    // eslint-disable-next-line no-unused-expressions
    el.offsetWidth;
    el.classList.add("logo-spin");
    const cleanupSpin = setTimeout(() => {
      el.classList.remove("logo-spin");
      cleanupTimersRef.current.delete(cleanupSpin);
    }, 1000);
    cleanupTimersRef.current.add(cleanupSpin);

    // fade audio in
    try {
      if (audioCtxRef.current && gainRef.current) {
        gainRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
        gainRef.current.gain.linearRampToValueAtTime(
          1,
          audioCtxRef.current.currentTime + 1.0
        );
        resAfterTimeout(() => {
          isPlayingRef.current = true;
        }, 1050);
      } else {
        await fallbackFadeIn(1000);
        isPlayingRef.current = true;
      }
    } catch (err) {
      console.warn("fade start failed on touch start", err);
      try {
        await fallbackFadeIn(1000);
        isPlayingRef.current = true;
      } catch (fallbackErr) {
        console.warn("fallback fadeIn failed on touch start", fallbackErr);
      }
    }
  };

  // desktop click: visual spin only — absolutely no audio interaction here
  const handleDesktopClickSpin = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isTouchRef.current) return;
    const el = logoRef.current;
    if (!el) return;

    // purely visual spin; do not touch audioRef or isPlayingRef
    el.classList.remove("logo-spin");
    // force reflow to retrigger animation
    // eslint-disable-next-line no-unused-expressions
    el.offsetWidth;
    el.classList.add("logo-spin");

    const cleanup = setTimeout(() => {
      el.classList.remove("logo-spin");
      cleanupTimersRef.current.delete(cleanup);
    }, 1000);
    cleanupTimersRef.current.add(cleanup);
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
        className="object-contain opacity-50 cursor-pointer"
        onMouseEnter={!isTouchRef.current ? onLogoMouseEnter : undefined}
        onMouseLeave={!isTouchRef.current ? onLogoMouseLeave : undefined}
        onTouchStart={isTouchRef.current ? handleTouchToggle : undefined}
        onClick={!isTouchRef.current ? handleDesktopClickSpin : undefined}
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

        /* two-beat heart: slower and larger scale for both beats */
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

        /* spin like a coin on mobile touch (1s) and desktop click visual only */
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
