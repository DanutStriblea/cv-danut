import React, { useState, useRef, useEffect } from "react";
import { FaSpotify, FaYoutube } from "react-icons/fa";
import logo from "../assets/logo.png";

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

/* păstrezi proiectele exact cum erau */
const PROJECTS = [
  {
    name: "The Broken Vinyl",
    type: "Spotify",
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
      ></iframe>
    ),
    icon: <FaSpotify className="text-green-500 text-2xl" />,
    width: "w-[500px]",
    position: "left",
  },
  {
    name: "The Broken Vinyl",
    type: "YouTube",
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
        ></iframe>
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
        ></iframe>
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
  const timeoutRef = useRef(null);

  // note logic for logo only
  const [notes, setNotes] = useState([]);
  const spawnIntervalRef = useRef(null);
  const cleanupTimersRef = useRef(new Set());

  useEffect(() => {
    // capturăm snapshot-urile ref în corpul efectului pentru cleanup stabil
    const intervalSnapshot = spawnIntervalRef.current;
    const timersSnapshot = cleanupTimersRef.current;
    return () => {
      if (intervalSnapshot) {
        clearInterval(intervalSnapshot);
      }
      if (timersSnapshot && typeof timersSnapshot.forEach === "function") {
        timersSnapshot.forEach((t) => clearTimeout(t));
        timersSnapshot.clear();
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
    // pornește spawn continuu atâta timp cât mouse-ul e peste logo
    if (spawnIntervalRef.current) return;
    spawnIntervalRef.current = setInterval(createNote, 120);
  };

  const stopSpawning = () => {
    // când mouse-ul pleacă, păstrăm notele deja create (ele se curăță la 2000ms fiecare)
    // dar oprim generarea după 2000ms ca să păstreze efervescența încă 2s
    if (spawnIntervalRef.current) {
      const gracefulStop = setTimeout(() => {
        if (spawnIntervalRef.current) {
          clearInterval(spawnIntervalRef.current);
          spawnIntervalRef.current = null;
        }
        cleanupTimersRef.current.delete(gracefulStop);
      }, 2000);
      cleanupTimersRef.current.add(gracefulStop);
    }
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

        {/* Logo separat, după DanStore — efervescența doar aici */}
        <li
          className="flex justify-center mt-6 relative"
          onMouseEnter={() => startSpawning()}
          onMouseLeave={() => stopSpawning()}
        >
          <img
            src={logo}
            alt="DanStore Logo"
            className="w-35 h-auto object-contain filter  opacity-50"
          />

          {/* container note muzicale doar pentru logo */}
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
    </div>
  );
}
