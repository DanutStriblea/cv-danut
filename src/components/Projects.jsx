// src/components/Projects.jsx
import React, { useState, useRef } from "react";
import { FaSpotify, FaYoutube } from "react-icons/fa";
import LogoFun from "./LogoFun";

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
        className="relative w-full overflow-hidden popup-inner-wrapper"
        style={{ paddingTop: "85%" }}
      >
        <iframe
          src="https://dan-store-lyart.vercel.app/#/"
          className="absolute top-0 left-0 w-full h-full scale-98 popup-iframe"
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

export default function Projects() {
  const [hovered, setHovered] = useState(null);
  const timeoutRef = useRef(null);

  const handleEnter = (idx) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHovered(idx);
  };

  const handleLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setHovered(null);
    }, 300);
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

            {/* popup container always in DOM; animate both frame and inner content */}
            <div
              aria-hidden={hovered !== idx}
              className={`
                absolute z-10 ${
                  project.width
                } bg-white rounded-lg overflow-hidden
                ${project.position === "left" ? "top-0 right-full mr-1" : ""}
                ${project.position === "right" ? "top-0 left-full ml-1" : ""}
                ${
                  project.position === "bottom-right"
                    ? "top-full mt-2 right-0"
                    : ""
                }
                ${project.position === undefined ? "top-full mt-2" : ""}
                popup-frame
                ${hovered === idx ? "popup-visible" : "popup-hidden"}
              `}
            >
              <div className="popup-frame-shadow" />
              <div className="popup-content">{project.embed}</div>
            </div>
          </li>
        ))}

        <li className="flex justify-center mt-6 relative">
          <LogoFun className="w-35" noteContainerClass="" />
        </li>
      </ul>

      <style>{`
        .w-35 { width: 140px; }

        /* Frame + content transitions */
        .popup-frame {
          transition: opacity 360ms cubic-bezier(.2,.9,.3,1), transform 360ms cubic-bezier(.2,.9,.3,1), box-shadow 360ms;
          transform-origin: top center;
          opacity: 0;
          transform: translateY(6px) scale(0.98);
          pointer-events: none;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          border-radius: 10px;
        }

        .popup-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
          box-shadow: 0 14px 40px rgba(2,6,23,0.12);
        }

        .popup-hidden {
          opacity: 0;
          transform: translateY(6px) scale(0.98);
          pointer-events: none;
        }

        /* Inner content fades a bit later for smoother feel */
        .popup-content {
          transition: opacity 320ms cubic-bezier(.2,.9,.3,1) 80ms, transform 320ms cubic-bezier(.2,.9,.3,1) 80ms;
          opacity: 0;
          transform: translateY(6px) scale(0.995);
        }
        .popup-visible .popup-content {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* small drop shadow element to visually separate frame from content (optional) */
        .popup-frame-shadow {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        /* responsive tweaks */
        @media (max-width: 640px) {
          .w-[500px] { width: 90vw; }
          .w-[700px] { width: 95vw; }
        }
      `}</style>
    </div>
  );
}
