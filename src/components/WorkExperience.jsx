// src/components/WorkExperience.jsx
import React, { useEffect, useRef } from "react";
import {
  FaMusic,
  FaBicycle,
  FaSwimmer,
  FaMountain,
  FaPlane,
} from "react-icons/fa";
import sharpKnifeMp3 from "../assets/SharpKnife.mp3";
import saleSoundMp3 from "../assets/SaleSound.mp3";
import bustedSantaMp3 from "../assets/BustedSanta.mp3";

const WORKS = [
  {
    period: "2010–2025",
    role: "Producție Muzicală",
    place: "The Broken Vinyl – Music Production (home studio)",
    details: "Producție muzicală, orchestrație, aranjamente instrumentale.",
  },
  {
    period: "2020–2021",
    role: "Sous Chef",
    place: "CHUCS RESTAURANT (Italian Cuisine) – London, Kensington",
    details:
      "Gestionarea alimentelor și comenzilor à la carte pentru mic dejun, prânz și cină. Prepararea deserturilor și a mise en place-ului cu specific italian.",
  },
  {
    period: "2012–2019",
    role: "Sous Chef",
    place: "THE BENTLEY HOTEL – London, Kensington",
    details:
      "Gestionarea alimentelor și prepararea comenzilor. English breakfast, room service și petreceri pt restaurantul de 5 stele Peridot. Preluarea atribuțiilor bucătarului-șef în lipsa acestuia.",
  },
  {
    period: "2010–2012",
    role: "Supervizor Vânzări – Telemarketing",
    place: "ASTRA ASIGURĂRI (Online) – București",
    details:
      "Supervizarea și conducerea unei echipe de 20 de agenți de vânzări. Monitorizarea directă a calității apelurilor. Feedback individual și meeting-uri de echipă pentru motivare și atingerea obiectivelor lunare.",
  },
  {
    period: "2008–2010",
    role: "Consultant Vânzări / Mentor",
    place: "LINEA DIRECTA COMUNICATION – București",
    details:
      "Vânzarea serviciilor de telefonie/internet Vodafone. Training-uri periodice în tehnici de vânzare și relaționare. Gestionarea apelurilor in-out. Mentoring pentru agenții noi sau neproductivi. Implementarea și actualizarea scenariilor de apel.",
  },
];

export default function WorkExperience() {
  const TARGET_VOL = 0.98;
  const FADE_MS = 1000;

  const sharpRef = useRef({
    audio: null,
    ctx: null,
    gain: null,
    timer: null,
    ready: false,
  });
  const saleRef = useRef({
    audio: null,
    ctx: null,
    gain: null,
    timer: null,
    ready: false,
  });
  const bustedRef = useRef({
    audio: null,
    ctx: null,
    gain: null,
    timer: null,
    ready: false,
  });

  const SHARP_PERIODS = new Set(["2020–2021", "2012–2019"]);
  const SALE_PERIODS = new Set(["2010–2012", "2008–2010"]);
  const BUSTED_PERIOD = "2010–2025";

  useEffect(() => {
    try {
      const a1 = new Audio(sharpKnifeMp3);
      a1.preload = "auto";
      a1.loop = true;
      a1.volume = TARGET_VOL;
      sharpRef.current.audio = a1;
    } catch (err) {
      console.warn("sharp audio init failed", err);
    }

    try {
      const a2 = new Audio(saleSoundMp3);
      a2.preload = "auto";
      a2.loop = true;
      a2.volume = TARGET_VOL;
      saleRef.current.audio = a2;
    } catch (err) {
      console.warn("sale audio init failed", err);
    }

    try {
      const a3 = new Audio(bustedSantaMp3);
      a3.preload = "metadata";
      a3.loop = true;
      a3.volume = TARGET_VOL;
      bustedRef.current.audio = a3;
    } catch (err) {
      console.warn("busted audio init failed", err);
    }

    return () => {
      [sharpRef, saleRef, bustedRef].forEach((r) => {
        try {
          if (r.current.timer) {
            clearTimeout(r.current.timer);
            r.current.timer = null;
          }
          if (r.current.audio) {
            try {
              r.current.audio.pause();
              r.current.audio.src = "";
            } catch (cleanupErr) {
              console.warn("audio cleanup warning", cleanupErr);
            }
            r.current.audio = null;
          }
          if (r.current.ctx) {
            try {
              r.current.ctx.close();
            } catch (closeErr) {
              console.warn("audioCtx close failed", closeErr);
            }
            r.current.ctx = null;
            r.current.gain = null;
          }
        } catch (outerErr) {
          console.warn("workexp cleanup failed", outerErr);
        }
      });
    };
  }, []);

  const ensureAudioNodes = async (refObj) => {
    if (!refObj || refObj.ready) return;
    const a = refObj.audio;
    if (!a) {
      refObj.ready = true;
      return;
    }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        refObj.ready = true;
        return;
      }
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1, ctx.currentTime);
      try {
        const src = ctx.createMediaElementSource(a);
        src.connect(gain).connect(ctx.destination);
      } catch (sourceErr) {
        console.warn("createMediaElementSource failed", sourceErr);
      }
      refObj.ctx = ctx;
      refObj.gain = gain;
    } catch (err) {
      console.warn("ensureAudioNodes failed", err);
    } finally {
      refObj.ready = true;
    }
  };

  const fadeVolumeFallback = (refObj, target, duration = FADE_MS) =>
    new Promise((resolve) => {
      const a = refObj.audio;
      if (!a) return resolve();
      if (refObj.timer) {
        clearInterval(refObj.timer);
        refObj.timer = null;
      }
      const steps = 20;
      const stepTime = Math.max(10, Math.floor(duration / steps));
      let step = 0;
      const start =
        typeof a.volume === "number"
          ? a.volume
          : target === "in"
          ? 0
          : TARGET_VOL;
      const end = target === "in" ? TARGET_VOL : 0;
      refObj.timer = setInterval(() => {
        step++;
        const t = step / steps;
        const v = Math.max(0, Math.min(1, start + (end - start) * t));
        try {
          a.volume = v;
        } catch (volErr) {
          console.warn("volume set failed", volErr);
        }
        if (step >= steps) {
          clearInterval(refObj.timer);
          refObj.timer = null;
          try {
            if (target === "out") {
              a.pause();
              a.currentTime = 0;
            } else {
              a.volume = TARGET_VOL;
            }
          } catch (finalErr) {
            console.warn("final fallback action failed", finalErr);
          }
          resolve();
        }
      }, stepTime);
    });

  const fadeInRef = async (refObj, duration = FADE_MS, randomStart = false) => {
    const a = refObj.audio;
    if (!a) return;
    await ensureAudioNodes(refObj);
    try {
      if (refObj.ctx && refObj.ctx.state === "suspended") {
        try {
          await refObj.ctx.resume();
        } catch (resumeErr) {
          console.warn("audioCtx resume failed", resumeErr);
        }
      }
    } catch (err) {
      console.warn("ensure/resume failed", err);
    }

    try {
      if (randomStart) {
        const dur = a.duration;
        if (!isNaN(dur) && dur > 0 && isFinite(dur)) {
          a.currentTime = Math.random() * dur;
        } else {
          const onMeta = () => {
            try {
              a.currentTime = Math.random() * a.duration;
            } catch (e) {
              console.warn("random start failed after meta", e);
            }
            a.removeEventListener("loadedmetadata", onMeta);
          };
          a.addEventListener("loadedmetadata", onMeta);
        }
      } else {
        try {
          a.currentTime = 0;
        } catch (e) {
          console.warn("reset currentTime failed", e);
        }
      }
    } catch (timeErr) {
      console.warn("set currentTime failed", timeErr);
    }

    try {
      const p = a.play();
      if (p && typeof p.then === "function") await p;
    } catch (playErr) {
      console.warn("play() failed", playErr);
    }

    if (refObj.ctx && refObj.gain) {
      try {
        const now = refObj.ctx.currentTime;
        refObj.gain.gain.cancelScheduledValues(now);
        refObj.gain.gain.setValueAtTime(0, now);
        refObj.gain.gain.linearRampToValueAtTime(
          TARGET_VOL,
          now + duration / 1000
        );
        await new Promise((r) => {
          refObj.timer = setTimeout(r, duration + 50);
        });
      } catch (err) {
        console.warn("gain fadeIn failed", err);
        await fadeVolumeFallback(refObj, "in", duration);
      }
    } else {
      await fadeVolumeFallback(refObj, "in", duration);
    }
  };

  const fadeOutRef = async (refObj, duration = FADE_MS) => {
    const a = refObj.audio;
    if (!a) return;
    if (refObj.ctx && refObj.gain) {
      try {
        const now = refObj.ctx.currentTime;
        refObj.gain.gain.cancelScheduledValues(now);
        const current =
          typeof refObj.gain.gain.value === "number"
            ? refObj.gain.gain.value
            : TARGET_VOL;
        refObj.gain.gain.setValueAtTime(current, now);
        refObj.gain.gain.linearRampToValueAtTime(0, now + duration / 1000);
        await new Promise((r) => {
          refObj.timer = setTimeout(r, duration + 50);
        });
        try {
          a.pause();
          a.currentTime = 0;
          a.volume = TARGET_VOL;
        } catch (pauseErr) {
          console.warn("pause after fadeOut failed", pauseErr);
        }
      } catch (err) {
        console.warn("gain fadeOut failed", err);
        await fadeVolumeFallback(refObj, "out", duration);
      }
    } else {
      await fadeVolumeFallback(refObj, "out", duration);
    }
  };

  const stopOtherSounds = (exceptRef) => {
    [sharpRef, saleRef, bustedRef].forEach((r) => {
      const refObj = r.current;
      if (!refObj || !refObj.audio) return;
      if (refObj === exceptRef) return;
      try {
        if (refObj.timer) {
          clearTimeout(refObj.timer);
          refObj.timer = null;
        }
        refObj.audio.pause();
        refObj.audio.currentTime = 0;
      } catch (err) {
        console.warn("stopOtherSounds failed", err);
      }
    });
  };

  const handleEnter = (period) => {
    if (
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    )
      return;

    if (period === BUSTED_PERIOD) {
      stopOtherSounds(bustedRef.current);
      void fadeInRef(bustedRef.current, FADE_MS, true);
      return;
    }

    if (SHARP_PERIODS.has(period)) {
      stopOtherSounds(sharpRef.current);
      void fadeInRef(sharpRef.current, FADE_MS, false);
    } else if (SALE_PERIODS.has(period)) {
      stopOtherSounds(saleRef.current);
      void fadeInRef(saleRef.current, FADE_MS, false);
    }
  };

  const handleLeave = (period) => {
    if (
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    )
      return;

    if (period === BUSTED_PERIOD) {
      void fadeOutRef(bustedRef.current, FADE_MS);
      return;
    }

    if (SHARP_PERIODS.has(period)) {
      void fadeOutRef(sharpRef.current, FADE_MS);
    } else if (SALE_PERIODS.has(period)) {
      void fadeOutRef(saleRef.current, FADE_MS);
    }
  };

  return (
    <section className="px-6 pt-2 w-full">
      <h2 className="mb-3 text-lg font-semibold font-montserrat bg-slate-300 shadow-sm w-full py-2 rounded-md text-center">
        Experiență profesională
      </h2>

      <div className="grid grid-cols-3 gap-3 w-full text-xs">
        {WORKS.map(({ period, role, place, details }, idx) => (
          <div
            key={idx}
            className="bg-slate-100 rounded-md shadow-sm px-3 py-2 text-left card-hover-blue"
            onMouseEnter={() => handleEnter(period)}
            onMouseLeave={() => handleLeave(period)}
          >
            <p className="text-gray-900 mb-1">
              <span className="font-bold">{period}</span> —{" "}
              <span className="font-bold">{role}</span>
            </p>
            <p className="text-gray-700 italic mb-1">{place}</p>
            <p className="text-gray-400 leading-snug">{details}</p>
          </div>
        ))}

        <div className="flex flex-col gap-3">
          <div className="bg-slate-200 rounded-md shadow-sm px-3 py-2 text-left card-hover-blue">
            <div className="space-y-1">
              <div>
                <span>Engleză</span>
                <div className="w-full bg-slate-200 rounded h-1 mt-1">
                  <div className="bg-gray-400 h-1 rounded w-[95%]" />
                </div>
              </div>
              <div>
                <span>Italiană</span>
                <div className="w-full bg-slate-200 rounded h-1 mt-1">
                  <div className="bg-gray-400 h-1 rounded w-[70%]" />
                </div>
              </div>
              <div>
                <span>Spaniolă</span>
                <div className="w-full bg-slate-200 rounded h-1 mt-1">
                  <div className="bg-gray-400 h-1 rounded w-[70%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-200 rounded-md shadow-sm px-3 py-2 text-left card-hover-blue">
            <div className="flex items-center gap-3 text-gray-700">
              <span className="font-bold">Pasiuni:</span>
              <div className="flex gap-3 text-xl">
                <FaMusic title="Muzică" />
                <FaBicycle title="Ciclism" />
                <FaSwimmer title="Înot" />
                <FaMountain title="Drumeții" />
                <FaPlane title="Călătorii" />
              </div>
            </div>
          </div>

          <div className="bg-slate-200 rounded-md shadow-sm px-3 py-2 text-left card-hover-blue">
            <p className="font-bold">
              Permis auto: <span className="font-normal">Categoria B</span>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .card-hover-blue {
            transition: box-shadow 0.3s ease-in-out;
          }
          .card-hover-blue:hover {
            box-shadow: 0 0 10px rgba(37, 85, 189, 0.308);
          }
        }
      `}</style>
    </section>
  );
}
