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
    period: "2010-2025",
    role: "Producție Muzicală",
    place: "The Broken Vinyl - Music Production (home studio)",
    details: "Producție muzicală, orchestrație, aranjamente instrumentale.",
  },
  {
    period: "2020-2021",
    role: "Sous Chef",
    place: "CHUCS RESTAURANT (Italian Cuisine) - London, Kensington",
    details:
      "Gestionarea alimentelor și comenzilor à la carte pentru mic dejun, prânz și cină. Prepararea deserturilor și a mise en place-ului cu specific italian.",
  },
  {
    period: "2012-2019",
    role: "Sous Chef",
    place: "THE BENTLEY HOTEL - London, Kensington",
    details:
      "Gestionarea alimentelor și prepararea comenzilor. English breakfast, room service și petreceri pentru restaurantul de 5 stele Peridot. Preluarea atribuțiilor bucătarului-șef în lipsa acestuia.",
  },
  {
    period: "2010-2012",
    role: "Supervizor Vânzări - Telemarketing",
    place: "ASTRA ASIGURĂRI (Online) - București",
    details:
      "Supervizarea și conducerea unei echipe de 20 de agenți de vânzări. Monitorizarea directă a calității apelurilor. Feedback individual și meeting-uri de echipă pentru motivare și atingerea obiectivelor lunare.",
  },
  {
    period: "2008-2010",
    role: "Consultant Vânzări / Mentor",
    place: "LINEA DIRECTA COMUNICATION - București",
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

  const SHARP_PERIODS = new Set(["2020-2021", "2012-2019"]);
  const SALE_PERIODS = new Set(["2010-2012", "2008-2010"]);
  const BUSTED_PERIOD = "2010-2025";

  useEffect(() => {
    const initAudio = (src, ref, loop = true) => {
      try {
        const a = new Audio(src);
        a.preload = "auto";
        a.loop = loop;
        a.volume = 0.2;
        ref.current.audio = a;
      } catch (err) {
        console.warn("audio init failed", err);
      }
    };

    initAudio(sharpKnifeMp3, sharpRef);
    initAudio(saleSoundMp3, saleRef);
    initAudio(bustedSantaMp3, bustedRef);

    return () => {
      [sharpRef, saleRef, bustedRef].forEach((r) => {
        try {
          if (r.current.timer) clearTimeout(r.current.timer);
          if (r.current.audio) {
            r.current.audio.pause();
            r.current.audio.src = "";
          }
          if (r.current.ctx) r.current.ctx.close();
        } catch (err) {
          console.warn("cleanup failed", err);
        }
      });
    };
  }, []);

  const ensureAudioNodes = async (refObj) => {
    if (refObj.ready) return;
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
      const src = ctx.createMediaElementSource(a);
      src.connect(gain).connect(ctx.destination);
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
      const steps = 20;
      const stepTime = Math.max(10, Math.floor(duration / steps));
      let step = 0;
      const start = target === "in" ? 0 : TARGET_VOL;
      const end = target === "in" ? TARGET_VOL : 0;
      const timer = setInterval(() => {
        step++;
        const v = Math.max(
          0,
          Math.min(1, start + (end - start) * (step / steps))
        );
        a.volume = v;
        if (step >= steps) {
          clearInterval(timer);
          if (target === "out") {
            a.pause();
            a.currentTime = 0;
          }
          resolve();
        }
      }, stepTime);
    });

  const fadeInRef = async (refObj, duration = FADE_MS, randomStart = false) => {
    const a = refObj.audio;
    if (!a) return;
    await ensureAudioNodes(refObj);
    if (refObj.ctx?.state === "suspended") await refObj.ctx.resume();

    if (randomStart && a.duration > 0 && isFinite(a.duration))
      a.currentTime = Math.random() * a.duration;
    else a.currentTime = 0;

    try {
      await a.play();
    } catch (err) {
      console.warn("play failed", err);
    }

    if (refObj.gain) {
      const now = refObj.ctx.currentTime;
      refObj.gain.gain.cancelScheduledValues(now);
      refObj.gain.gain.setValueAtTime(0, now);
      refObj.gain.gain.linearRampToValueAtTime(
        TARGET_VOL,
        now + duration / 1000
      );
    } else await fadeVolumeFallback(refObj, "in", duration);
  };

  const fadeOutRef = async (refObj, duration = FADE_MS) => {
    const a = refObj.audio;
    if (!a) return;
    if (refObj.gain) {
      const now = refObj.ctx.currentTime;
      refObj.gain.gain.cancelScheduledValues(now);
      refObj.gain.gain.linearRampToValueAtTime(0, now + duration / 1000);
      await new Promise((r) => setTimeout(r, duration + 50));
      a.pause();
      a.currentTime = 0;
    } else await fadeVolumeFallback(refObj, "out", duration);
  };

  const stopOtherSounds = (exceptRef) => {
    [sharpRef, saleRef, bustedRef].forEach((r) => {
      if (r.current === exceptRef) return;
      try {
        r.current.audio?.pause();
        r.current.audio.currentTime = 0;
      } catch (err) {
        console.warn("stopOtherSounds cleanup failed", err);
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
      fadeInRef(bustedRef.current, FADE_MS, true);
    } else if (SHARP_PERIODS.has(period)) {
      stopOtherSounds(sharpRef.current);
      fadeInRef(sharpRef.current, FADE_MS, false);
    } else if (SALE_PERIODS.has(period)) {
      stopOtherSounds(saleRef.current);
      fadeInRef(saleRef.current, FADE_MS, false);
    }
  };

  const handleLeave = (period) => {
    if (
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    )
      return;

    if (period === BUSTED_PERIOD) fadeOutRef(bustedRef.current, FADE_MS);
    else if (SHARP_PERIODS.has(period)) fadeOutRef(sharpRef.current, FADE_MS);
    else if (SALE_PERIODS.has(period)) fadeOutRef(saleRef.current, FADE_MS);
  };

  return (
    <section className="px-4 sm:px-6 pt-2 w-full pb-6">
      <h2 className="mb-3 text-lg font-semibold font-montserrat bg-slate-300 shadow-sm w-full py-2 rounded-md text-center">
        Experiență profesională
      </h2>

      {/* ✅ Responsive grid fix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full text-xs">
        {WORKS.map(({ period, role, place, details }, idx) => (
          <div
            key={idx}
            className={
              // ADDED: card-print-fix + transition-shadow + desktop hover shadow color
              "bg-slate-100 rounded-md shadow-sm px-3 py-2 text-left card-print-fix transition-shadow lg:hover:shadow-blue-500/10"
            }
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

        {/* Limbi, Pasiuni, Permis */}
        <div className="flex flex-col gap-3">
          <div
            className={
              // ADDED: la cardul Limbi
              "bg-slate-200 rounded-md shadow-sm px-3 py-2 text-left card-print-fix transition-shadow lg:hover:shadow-blue-500/10"
            }
          >
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

          <div
            className={
              // ADDED: la cardul Pasiuni
              "bg-slate-200 rounded-md shadow-sm px-3 py-2 text-left card-print-fix transition-shadow lg:hover:shadow-blue-500/10"
            }
          >
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

          <div
            className={
              // ADDED: la cardul Permis
              "bg-slate-200 rounded-md shadow-sm px-3 py-2 text-left card-print-fix transition-shadow lg:hover:shadow-blue-500/10 mb-4"
            }
          >
            <p className="font-bold">
              Permis auto: <span className="font-normal">Categoria B</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
