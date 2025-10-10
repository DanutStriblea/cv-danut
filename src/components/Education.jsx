// src/components/Education.jsx
import React, { useEffect, useRef } from "react";
import bookPagesMp3 from "../assets/BookPages.mp3";

const EDUCATION = [
  {
    years: "2024 – 2025",
    degree: "The Ultimate React Course 2025: React, Next.js, Redux",
    institution: "Jonas Schmedtmann – Udemy",
  },
  {
    years: "2022 – 2024",
    degree: "Web Developer with HTML, CSS, JavaScript, React, Node.js",
    institution: "Andrei Neagoie – Udemy",
  },
  {
    years: "2003 – 2007",
    degree: "Licență în Turism și Servicii",
    institution: "FACULTATEA DE ECONOMIE George Baritiu – Brașov",
  },
  {
    years: "2001 – 2007",
    degree: "Pian Clasic și Jazz",
    institution: "ȘCOALA DE ARTE – Brașov",
  },
];

export default function Education() {
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gainRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const userInitRef = useRef(false);

  useEffect(() => {
    try {
      const a = new Audio(bookPagesMp3);
      a.preload = "auto";
      a.loop = true;
      a.volume = 0.6;
      audioRef.current = a;
    } catch (initErr) {
      console.warn("audio init failed", initErr);
    }

    return () => {
      try {
        if (fadeTimerRef.current) {
          clearInterval(fadeTimerRef.current);
          fadeTimerRef.current = null;
        }
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
            console.warn("audioCtx close failed", closeErr);
          }
          audioCtxRef.current = null;
          gainRef.current = null;
        }
      } catch (outerErr) {
        console.warn("cleanup failed", outerErr);
      }
    };
  }, []);

  const ensureAudioContext = async () => {
    if (userInitRef.current) return;
    const a = audioRef.current;
    if (!a) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        userInitRef.current = true;
        return;
      }
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gainRef.current = gain;
      try {
        const src = ctx.createMediaElementSource(a);
        src.connect(gain).connect(ctx.destination);
      } catch (sourceErr) {
        console.warn("createMediaElementSource failed", sourceErr);
      }
    } catch (err) {
      console.warn("ensureAudioContext failed", err);
    } finally {
      userInitRef.current = true;
    }
  };

  const resAfterTimeout = (fn, ms) => {
    const t = setTimeout(() => {
      try {
        fn();
      } catch (err) {
        console.warn("resAfterTimeout callback failed", err);
      }
    }, ms);
    fadeTimerRef.current = t;
  };

  const fallbackFade = (target = "in", duration = 1000) =>
    new Promise((res) => {
      const a = audioRef.current;
      if (!a) return res();
      if (fadeTimerRef.current) {
        clearInterval(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
      const steps = 20;
      const stepTime = Math.max(10, Math.floor(duration / steps));
      let currentStep = 0;
      const startVol =
        typeof a.volume === "number" ? a.volume : target === "in" ? 0 : 1;
      const endVol = target === "in" ? 0.6 : 0;
      fadeTimerRef.current = setInterval(() => {
        currentStep++;
        const frac = currentStep / steps;
        const newVol = startVol + (endVol - startVol) * frac;
        try {
          a.volume = Math.max(0, Math.min(1, newVol));
        } catch (volErr) {
          console.warn("volume set failed during fallback fade", volErr);
        }
        if (currentStep >= steps) {
          clearInterval(fadeTimerRef.current);
          fadeTimerRef.current = null;
          try {
            if (target === "out") {
              a.pause();
              a.currentTime = 0;
            } else {
              a.volume = 0.6;
            }
          } catch (finalErr) {
            console.warn("final fallback action failed", finalErr);
          }
          res();
        }
      }, stepTime);
    });

  const fadeIn = async (duration = 1000) => {
    const a = audioRef.current;
    if (!a) return;
    try {
      await ensureAudioContext();
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        try {
          await audioCtxRef.current.resume();
        } catch (resumeErr) {
          console.warn("resume failed", resumeErr);
        }
      }
    } catch (err) {
      console.warn("ensure/resume failed", err);
    }

    try {
      a.currentTime = 0;
    } catch (timeErr) {
      console.warn("set currentTime failed", timeErr);
    }
    try {
      const p = a.play();
      if (p && typeof p.then === "function") await p;
    } catch (playErr) {
      console.warn("play() failed", playErr);
    }

    if (audioCtxRef.current && gainRef.current) {
      try {
        const ctx = audioCtxRef.current;
        const gain = gainRef.current;
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.6, now + duration / 1000);
        await new Promise((resolve) => resAfterTimeout(resolve, duration + 50));
      } catch (err) {
        console.warn("gain fadeIn failed", err);
        await fallbackFade("in", duration);
      }
    } else {
      await fallbackFade("in", duration);
    }
  };

  const fadeOut = async (duration = 1000) => {
    const a = audioRef.current;
    if (!a) return;
    if (audioCtxRef.current && gainRef.current) {
      try {
        const ctx = audioCtxRef.current;
        const gain = gainRef.current;
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        const current =
          typeof gain.gain.value === "number" ? gain.gain.value : 0.6;
        gain.gain.setValueAtTime(current, now);
        gain.gain.linearRampToValueAtTime(0, now + duration / 1000);
        await new Promise((resolve) => resAfterTimeout(resolve, duration + 50));
        try {
          a.pause();
          a.currentTime = 0;
          a.volume = 0.6;
        } catch (pauseErr) {
          console.warn("pause after fadeOut failed", pauseErr);
        }
      } catch (err) {
        console.warn("gain fadeOut failed", err);
        await fallbackFade("out", duration);
      }
    } else {
      await fallbackFade("out", duration);
    }
  };

  const onMouseEnter = () => {
    if (
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    )
      return;
    void fadeIn(1000);
  };

  const onMouseLeave = () => {
    if (
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    )
      return;
    void fadeOut(1000);
  };

  return (
    <div
      className="flex-1 w-full relative bg-slate-100 rounded-lg p-6 pt-10 pb-2 shadow-lg edu-cyan-hover"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Titlu „lipit” */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-slate-300 px-12 py-1 rounded shadow-lg">
        <h2 className="text-lg font-semibold font-montserrat">Educație</h2>
      </div>

      {/* Conținutul cardului */}
      <ul className="space-y-3 text-xs text-center text-gray-500">
        {EDUCATION.map(({ years, degree, institution, details }) => (
          <li key={degree} className="space-y-0.3">
            <p className="text-center font-semibold text-gray-400">{years}</p>
            <p className="font-bold">{degree}</p>
            <p className="italic">{institution}</p>
            <p className="text-gray-400">{details}</p>
          </li>
        ))}
      </ul>

      <style>{`
        /* keep Tailwind's shadow-lg by default (Tailwind exposes --tw-shadow) */
        .edu-cyan-hover {
          transition: box-shadow 220ms ease;
        }

        /* on hover: layer Tailwind's existing shadow (var(--tw-shadow)) and add a cyan-500 tint
           using the same offset/spread pattern so layout is unchanged */
        @media (hover: hover) and (pointer: fine) {
          .edu-cyan-hover:hover {
            /* Tailwind's shadow variable kept first, then cyan overlay */
            box-shadow:
              var(--tw-shadow),
              0 6px 20px rgba(67, 108, 197, 0.13), /* cyan-500 (#36aaa4c8) at 18% */
              0 2px 6px rgba(6,182,212,0.08);  /* small cyan inner tint */
          }
        }

        /* on touch keep default Tailwind shadow */
        @media (hover: none) and (pointer: coarse) {
          .edu-cyan-hover {
            box-shadow: var(--tw-shadow);
          }
        }
      `}</style>
    </div>
  );
}
