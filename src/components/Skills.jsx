// src/components/Skills.jsx
import React, { useEffect, useRef } from "react";
import skillSoundMp3 from "../assets/SkillSound.mp3";

const SKILLS = [
  "Compoziție și Producție muzicală",
  "Pian, Chitară, Cubase 12",
  "Mixing & Mastering",
  "Web Development: JS, React, Supabase, Stripe, Resend, Vercel",
  "Precizie și rigoare vizuală",
  "Planificare structurată și eficiență",
  "Perseverență și calm în proces",
  "Colaborare empatică și claritate în dialog",
  "Tehnici culinare și management efectiv",
];

export default function Skills() {
  const audioRef = useRef(null);
  const ctxRef = useRef(null);
  const gainRef = useRef(null);
  const timerRef = useRef(null);
  const initializedRef = useRef(false);
  const TARGET_VOLUME = 0.6;

  useEffect(() => {
    try {
      const a = new Audio(skillSoundMp3);
      a.preload = "auto";
      a.loop = true;
      a.volume = TARGET_VOLUME;
      audioRef.current = a;
    } catch (initErr) {
      console.warn("skill audio init failed", initErr);
    }

    return () => {
      try {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (audioRef.current) {
          try {
            audioRef.current.pause();
            audioRef.current.src = "";
          } catch (cleanupErr) {
            console.warn("skill audio cleanup failed", cleanupErr);
          }
        }
        if (ctxRef.current) {
          try {
            ctxRef.current.close();
          } catch (closeErr) {
            console.warn("audioCtx close failed", closeErr);
          }
          ctxRef.current = null;
          gainRef.current = null;
        }
      } catch (outerErr) {
        console.warn("skills teardown failed", outerErr);
      }
    };
  }, []);

  const ensureAudioNodes = async () => {
    if (initializedRef.current) return;
    const a = audioRef.current;
    if (!a) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        initializedRef.current = true;
        return;
      }
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1, ctx.currentTime);
      try {
        const src = ctx.createMediaElementSource(a);
        src.connect(gain).connect(ctx.destination);
      } catch (sourceErr) {
        console.warn("createMediaElementSource failed for skills", sourceErr);
      }
      ctxRef.current = ctx;
      gainRef.current = gain;
    } catch (err) {
      console.warn("ensureAudioNodes failed", err);
    } finally {
      initializedRef.current = true;
    }
  };

  const fadeVolumeFallback = (target, duration = 1000) =>
    new Promise((resolve) => {
      const a = audioRef.current;
      if (!a) return resolve();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const steps = 20;
      const stepTime = Math.max(10, Math.floor(duration / steps));
      let step = 0;
      const start =
        typeof a.volume === "number"
          ? a.volume
          : target === "in"
          ? 0
          : TARGET_VOLUME;
      const end = target === "in" ? TARGET_VOLUME : 0;
      timerRef.current = setInterval(() => {
        step++;
        const t = step / steps;
        const v = Math.max(0, Math.min(1, start + (end - start) * t));
        try {
          a.volume = v;
        } catch (volErr) {
          console.warn("skills volume set failed", volErr);
        }
        if (step >= steps) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          try {
            if (target === "out") {
              a.pause();
              a.currentTime = 0;
            } else {
              a.volume = TARGET_VOLUME;
            }
          } catch (finalErr) {
            console.warn("final fallback action failed for skills", finalErr);
          }
          resolve();
        }
      }, stepTime);
    });

  const fadeIn = async (duration = 1000) => {
    const a = audioRef.current;
    if (!a) return;
    await ensureAudioNodes();
    try {
      if (ctxRef.current && ctxRef.current.state === "suspended") {
        try {
          await ctxRef.current.resume();
        } catch (resumeErr) {
          console.warn("skills audioCtx resume failed", resumeErr);
        }
      }
    } catch (err) {
      console.warn("resume check failed for skills", err);
    }

    try {
      a.currentTime = 0;
    } catch (err) {
      console.warn("set currentTime failed for skills", err);
    }
    try {
      const p = a.play();
      if (p && typeof p.then === "function") await p;
    } catch (playErr) {
      console.warn("skills play() failed", playErr);
    }

    if (ctxRef.current && gainRef.current) {
      try {
        const now = ctxRef.current.currentTime;
        gainRef.current.gain.cancelScheduledValues(now);
        gainRef.current.gain.setValueAtTime(0, now);
        gainRef.current.gain.linearRampToValueAtTime(
          TARGET_VOLUME,
          now + duration / 1000
        );
        await new Promise((r) => {
          timerRef.current = setTimeout(r, duration + 50);
        });
      } catch (err) {
        console.warn("gain fadeIn failed for skills", err);
        await fadeVolumeFallback("in", duration);
      }
    } else {
      await fadeVolumeFallback("in", duration);
    }
  };

  const fadeOut = async (duration = 1000) => {
    const a = audioRef.current;
    if (!a) return;
    if (ctxRef.current && gainRef.current) {
      try {
        const now = ctxRef.current.currentTime;
        gainRef.current.gain.cancelScheduledValues(now);
        const current =
          typeof gainRef.current.gain.value === "number"
            ? gainRef.current.gain.value
            : TARGET_VOLUME;
        gainRef.current.gain.setValueAtTime(current, now);
        gainRef.current.gain.linearRampToValueAtTime(0, now + duration / 1000);
        await new Promise((r) => {
          timerRef.current = setTimeout(r, duration + 50);
        });
        try {
          a.pause();
          a.currentTime = 0;
          a.volume = TARGET_VOLUME;
        } catch (pauseErr) {
          console.warn("pause after fadeOut failed for skills", pauseErr);
        }
      } catch (err) {
        console.warn("gain fadeOut failed for skills", err);
        await fadeVolumeFallback("out", duration);
      }
    } else {
      await fadeVolumeFallback("out", duration);
    }
  };

  const handleMouseEnter = () => {
    if (
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    )
      return;
    void fadeIn(1000);
  };

  const handleMouseLeave = () => {
    if (
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    )
      return;
    void fadeOut(1000);
  };

  return (
    <div
      className="flex-1 relative bg-slate-100 rounded-lg p-6 pt-10 shadow-lg skill-blue-hover"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Titlu „lipit” */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-300 rounded px-12 py-1 shadow-lg">
        <h2 className="text-lg font-semibold font-montserrat">Abilități</h2>
      </div>

      {/* Conținutul cardului */}
      <ul className="text-gray-600 text-xs space-y-1.5 -mx-1">
        <div className="h-1" />
        {SKILLS.map((skill) => (
          <li key={skill}>• {skill}</li>
        ))}
      </ul>

      <style>{`
        .skill-blue-hover {
          transition: box-shadow 220ms ease;
        }

        /* doar la hover (pe desktop) */
        @media (hover: hover) and (pointer: fine) {
          .skill-blue-hover:hover {
            box-shadow:
              var(--tw-shadow),
              0 6px 20px rgba(67, 108, 197, 0.13),
              0 2px 6px rgba(6,182,212,0.08);
          }
        }

        /* pe touch rămâne doar umbra implicită Tailwind */
        @media (hover: none) and (pointer: coarse) {
          .skill-blue-hover {
            box-shadow: var(--tw-shadow);
          }
        }
      `}</style>
    </div>
  );
}
