// src/components/Projects.jsx
import React, { useState, useRef, useEffect } from "react";
import { FaSpotify, FaYoutube } from "react-icons/fa";
import logo from "../assets/logo.png";
import audioFile from "../assets/DrinksAndFlowers.mp3";

const CartOutline = ({ className = "w-6 h-6 text-gray-500" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M3 3h2l1.6 9.6A2 2 0 0 0 8.6 15h8.8a2 2 0 0 0 2-1.6L21 6H6" />
    <circle cx="10" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
  </svg>
);

const PROJECTS = [
  {
    name: "The Broken Vinyl",
    url: "https://open.spotify.com/artist/3fPcnUFKjZegfNMpx7lea3",
    embed: (
      <iframe
        style={{ borderRadius: "12px" }}
        src="https://open.spotify.com/embed/artist/3fPcnUFKjZegfNMpx7lea3?utm_source=generator"
        className="w-full h-[352px]"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify Preview"
      />
    ),
    icon: <FaSpotify className="text-green-500 text-2xl" />,
    width: "w-[500px]",
    position: "left",
  },
  {
    name: "The Broken Vinyl",
    url: "https://www.youtube.com/TheBrokenVinyl",
    embed: (
      <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
        <iframe
          src="https://www.youtube.com/embed/JMm1a_4sh7Y?si=JmDzyfvzGHrYbCRi"
          className="absolute top-0 left-0 w-full h-full"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    ),
    icon: <FaYoutube className="text-red-600 text-2xl" />,
    width: "w-[500px]",
    position: "left",
  },
  {
    name: (
      <span className="font-semibold">
        <span className="text-green-500">Dan</span>
        <span className="text-green-900">Store</span>
      </span>
    ),
    type: "E-commerce",
    url: "https://dan-store-lyart.vercel.app/#/",
    embed: (
      <div
        className="relative w-full overflow-hidden"
        style={{ paddingTop: "85%" }}
      >
        <iframe
          src="https://dan-store-lyart.vercel.app/#/"
          className="absolute top-0 left-0 w-full h-full scale-98"
          style={{ transformOrigin: "top center" }}
          title="DanStore Preview"
        />
      </div>
    ),
    icon: <CartOutline className="w-6 h-6 text-gray-500" />,
    width: "w-[700px]",
    position: "bottom-right",
  },
];

const NOTES = ["♪", "♫", "♩", "♬", "♭", "♯"];

export default function Projects() {
  const [hovered, setHovered] = useState(null);
  const [notes, setNotes] = useState([]);

  const spawnIntervalRef = useRef(null);
  const periodicRef = useRef(null);
  const cleanupTimersRef = useRef(new Set());
  const timeoutRef = useRef(null);

  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  const logoRef = useRef(null);
  const logoHoveredRef = useRef(false);

  useEffect(() => {
    // initialize audio safely
    try {
      const a = new Audio(audioFile);
      a.preload = "auto";
      a.loop = false;
      a.volume = 1;
      audioRef.current = a;
    } catch (initErr) {
      console.warn("audio init failed", initErr);
    }

    // periodic burst and synchronized pulse every 10s
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

    // snapshots for cleanup closure
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
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
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

  const handleEnter = (idx) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHovered(idx);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHovered(null);
    }, 400);
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
    <div className="flex-1 w-full relative bg-slate-100 rounded-lg p-6 pt-10 shadow-lg">
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-300 rounded px-12 py-1 shadow-lg">
        <h2 className="text-lg font-semibold font-montserrat">Proiecte</h2>
      </div>

      <ul className="space-y-3 text-sm text-gray-700">
        <div className="h-1" />
        {PROJECTS.map((project, idx) => (
          <li
            key={idx}
            className="relative cursor-pointer"
            onMouseEnter={() => handleEnter(idx)}
            onMouseLeave={handleLeave}
          >
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-semibold hover:text-green-600"
            >
              {project.icon}
              {project.name}
            </a>

            {hovered === idx && (
              <div
                className={`absolute z-10 ${
                  project.width
                } bg-white shadow-lg rounded-lg p-2 ${
                  project.position === "left"
                    ? "top-0 right-full mr-1"
                    : project.position === "right"
                    ? "top-0 left-full ml-1"
                    : project.position === "bottom-right"
                    ? "top-full mt-2 right-0"
                    : "top-full mt-2"
                }`}
              >
                {project.embed}
              </div>
            )}
          </li>
        ))}

        <li
          className="flex justify-center mt-6 relative"
          onMouseEnter={onLogoMouseEnter}
          onMouseLeave={onLogoMouseLeave}
        >
          <img
            ref={logoRef}
            src={logo}
            alt="DanStore Logo"
            className="w-35 h-auto object-contain filter opacity-50 cursor-pointer"
          />

          <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
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
        </li>
      </ul>

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
