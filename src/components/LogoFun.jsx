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
  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);
  const sourceRef = useRef(null);
  const logoRef = useRef(null);
  const logoHoveredRef = useRef(false);
  const isTouchRef = useRef(false);
  const isPlayingRef = useRef(false);
  const userGestureInitializedRef = useRef(false);
  const firstGestureHandlerRef = useRef(null);
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
      a.volume = MASTER_VOL;
      a.playsInline = true;

      // Event listeners for audio readiness
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

      // Try to load audio
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

      // Setup first-gesture listener to prepare audio context
      const onFirstGesture = async () => {
        try {
          await ensureAudioContext(true);
        } catch (err) {
          console.warn("first gesture ensureAudioContext failed", err);
        } finally {
          if (firstGestureHandlerRef.current) {
            window.removeEventListener(
              "pointerdown",
              firstGestureHandlerRef.current
            );
            window.removeEventListener(
              "touchstart",
              firstGestureHandlerRef.current
            );
            window.removeEventListener(
              "keydown",
              firstGestureHandlerRef.current
            );
            firstGestureHandlerRef.current = null;
          }
        }
      };

      firstGestureHandlerRef.current = onFirstGesture;
      window.addEventListener("pointerdown", onFirstGesture, {
        once: true,
        passive: true,
      });
      window.addEventListener("touchstart", onFirstGesture, {
        once: true,
        passive: true,
      });
      window.addEventListener("keydown", onFirstGesture, {
        once: true,
        passive: true,
      });

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

          if (firstGestureHandlerRef.current) {
            window.removeEventListener(
              "pointerdown",
              firstGestureHandlerRef.current
            );
            window.removeEventListener(
              "touchstart",
              firstGestureHandlerRef.current
            );
            window.removeEventListener(
              "keydown",
              firstGestureHandlerRef.current
            );
            firstGestureHandlerRef.current = null;
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

  // Ensure audio context (create and connect) - should be called from a user gesture
  const ensureAudioContext = async (silentResume = false) => {
    if (userGestureInitializedRef.current) {
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        try {
          await audioCtxRef.current.resume();
        } catch (resumeErr) {
          console.warn("resume failed", resumeErr);
        }
      }
      return;
    }

    const a = audioRef.current;
    if (!a) {
      userGestureInitializedRef.current = true;
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        userGestureInitializedRef.current = true;
        return;
      }

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(MASTER_VOL, ctx.currentTime);
      gainRef.current = gain;

      try {
        const source = ctx.createMediaElementSource(a);
        sourceRef.current = source;
        source.connect(gain).connect(ctx.destination);
      } catch (sourceErr) {
        console.warn("createMediaElementSource failed", sourceErr);
      }

      if (silentResume && ctx.state === "suspended") {
        try {
          await ctx.resume();
        } catch (resumeErr) {
          console.warn("silent resume failed", resumeErr);
        }
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
        gain.gain.linearRampToValueAtTime(MASTER_VOL, now + duration / 1000);
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
        const currentVal =
          typeof gain.gain.value === "number" ? gain.gain.value : MASTER_VOL;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(currentVal, now);
        gain.gain.linearRampToValueAtTime(0, now + duration / 1000);
        resAfterTimeout(async () => {
          try {
            try {
              a.pause();
              a.currentTime = 0;
            } catch (pauseErr) {
              console.warn(
                "pause/currentTime reset failed during fadeOut",
                pauseErr
              );
            }
            try {
              a.volume = MASTER_VOL;
            } catch (volErr) {
              console.warn(
                "setting element volume to MASTER_VOL failed",
                volErr
              );
            }
            res();
          } catch (innerErr) {
            console.warn("unexpected error in fadeOut completion", innerErr);
            try {
              await fallbackFadeOut(duration);
            } catch (fbErr) {
              console.warn("fallbackFadeOut also failed", fbErr);
            } finally {
              res();
            }
          }
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
        const newVol = Math.min(MASTER_VOL, MASTER_VOL * frac);
        try {
          a.volume = newVol;
        } catch (volErr) {
          console.warn("volume set failed during fallback fade-in", volErr);
        }
        if (currentStep >= steps) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
          try {
            a.volume = MASTER_VOL;
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
      const startVol = typeof a.volume === "number" ? a.volume : MASTER_VOL;
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
            a.volume = MASTER_VOL;
          } catch (stopErr) {
            console.warn("audio stop/reset failed", stopErr);
          }
          res();
        }
      }, stepTime);
    });

  const onLogoPointerEnter = () => {
    if (isTouchRef.current) return; // Prevent hover on touch devices

    logoHoveredRef.current = true;
    startSpawning();
    void handleLogoMouseEnterAudio();
  };

  const onLogoPointerLeave = () => {
    if (isTouchRef.current) return; // Prevent hover on touch devices

    logoHoveredRef.current = false;
    stopSpawning();
    void handleLogoMouseLeaveAudio();
  };

  const handleLogoMouseEnterAudio = async () => {
    const a = audioRef.current;
    if (!a) return;

    try {
      await ensureAudioContext();
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        try {
          await audioCtxRef.current.resume();
        } catch (resumeErr) {
          console.warn("resume failed on hover", resumeErr);
        }
      }
    } catch (err) {
      console.warn("ensureAudioContext failed", err);
    }

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    // Wait for audio to be ready
    if (!audioReadyRef.current) {
      try {
        await new Promise((res, rej) => {
          if (!a) return res();
          if (a.readyState >= 3) {
            // HAVE_FUTURE_DATA
            audioReadyRef.current = true;
            return res();
          }
          const onLoaded = () => {
            a.removeEventListener("canplaythrough", onLoaded);
            a.removeEventListener("error", onError);
            audioReadyRef.current = true;
            res();
          };
          const onError = (err) => {
            a.removeEventListener("canplaythrough", onLoaded);
            a.removeEventListener("error", onError);
            rej(err);
          };
          a.addEventListener("canplaythrough", onLoaded, { once: true });
          a.addEventListener("error", onError, { once: true });

          // Fallback timeout
          const timeout = setTimeout(() => {
            a.removeEventListener("canplaythrough", onLoaded);
            a.removeEventListener("error", onError);
            res(); // Resolve anyway
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
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch((playErr) => {
          console.warn("Play failed on hover:", playErr);
        });
      }

      if (audioCtxRef.current && gainRef.current) {
        await fadeInWithAudioContext(1000);
      } else {
        await fallbackFadeIn(1000);
      }
      isPlayingRef.current = true;
    } catch (err) {
      console.warn("play/fade failed on pointerenter", err);
    }
  };

  const handleLogoMouseLeaveAudio = async () => {
    try {
      await fadeOutWithAudioContext(400);
    } catch (err) {
      console.warn("fade out failed on pointerleave", err);
      try {
        await fallbackFadeOut(400);
      } catch (fallbackErr) {
        console.warn("fallback fadeOut also failed", fallbackErr);
      }
    }
    isPlayingRef.current = false;
  };

  // Desktop click handler - only visual spin, no audio interaction
  const handleDesktopClick = (e) => {
    if (isTouchRef.current) return; // Only for desktop

    e.preventDefault();
    e.stopPropagation();

    const el = logoRef.current;
    if (!el) return;

    // Only do visual spin, don't touch audio
    el.classList.remove("logo-spin");
    void el.offsetWidth;
    el.classList.add("logo-spin");
    const cleanup = setTimeout(() => {
      el.classList.remove("logo-spin");
      cleanupTimersRef.current.delete(cleanup);
    }, 1000);
    cleanupTimersRef.current.add(cleanup);
  };

  // Mobile/touch handler - toggle audio play/stop
  const handleTouchInteraction = async (e) => {
    if (!isTouchRef.current) return; // Only for touch devices

    e.preventDefault();
    e.stopPropagation();

    const el = logoRef.current;
    const a = audioRef.current;
    if (!el || !a) return;

    // Ensure audio context exists BEFORE calling play
    try {
      await ensureAudioContext(true);
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        try {
          await audioCtxRef.current.resume();
        } catch (resumeErr) {
          console.warn("resume audioCtx failed", resumeErr);
        }
      }
    } catch (err) {
      console.warn("ensureAudioContext failed (touch)", err);
    }

    // Visual spin effect
    el.classList.remove("logo-spin");
    void el.offsetWidth;
    el.classList.add("logo-spin");
    const cleanupSpin = setTimeout(() => {
      el.classList.remove("logo-spin");
      cleanupTimersRef.current.delete(cleanupSpin);
    }, 1000);
    cleanupTimersRef.current.add(cleanupSpin);

    // Toggle play/stop for touch devices
    if (isPlayingRef.current) {
      // Stop audio
      try {
        await fadeOutWithAudioContext(400);
      } catch (err) {
        console.warn("fadeOut failed on stop", err);
        try {
          await fallbackFadeOut(400);
        } catch (fallbackErr) {
          console.warn("fallback fadeOut failed on stop", fallbackErr);
        }
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
          console.warn("Audio ready check failed in touch:", err);
        }
      }

      const dur = isFinite(a.duration) && a.duration > 0 ? a.duration : 0;
      const maxStart = dur > 0.6 ? Math.max(0, dur - 0.5) : 0;
      const randomStart = maxStart > 0 ? Math.random() * maxStart : 0;

      try {
        a.currentTime = randomStart;
      } catch (timeErr) {
        console.warn("set currentTime failed", timeErr);
      }

      // Attempt to play
      try {
        const playP = a.play();
        if (playP && typeof playP.then === "function") await playP;
      } catch (playErr) {
        console.warn("play() failed at touch start", playErr);
        return; // Don't proceed if play failed
      }

      // Fade-in
      try {
        if (audioCtxRef.current && gainRef.current) {
          gainRef.current.gain.setValueAtTime(
            0,
            audioCtxRef.current.currentTime
          );
          gainRef.current.gain.linearRampToValueAtTime(
            MASTER_VOL,
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
    }
  };

  // Unified pointer down handler that routes based on device type
  const handlePointerDown = (e) => {
    if (isTouchRef.current) {
      handleTouchInteraction(e);
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
