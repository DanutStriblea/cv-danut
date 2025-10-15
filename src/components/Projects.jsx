import React, { useState, useRef, useEffect } from "react";
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
    description: "Compoziții originale",
  },
  {
    name: "The Broken Vinyl",
    url: "https://www.youtube.com/channel/UC8MdjvdBFYWYMWFU6fKHWlg",
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
    description: "Compoziții originale",
  },
  {
    name: (
      <span className="font-semibold">
        <span className="text-green-500">Dan</span>
        <span className="text-green-900">Store</span>
      </span>
    ),
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
    description: "Magazin online e-commerce",
  },
];

export default function Projects() {
  const [hovered, setHovered] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleEnter = (idx) => {
    if (isMobile) return; // Ignore hover on mobile
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHovered(idx);
  };

  const handleLeave = () => {
    if (isMobile) return; // Ignore hover on mobile
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setHovered(null), 300);
  };

  // Mobile: Simple links (no arrow) — extra top spacing only for first project
  const renderMobileLink = (project, idx) => (
    <li
      key={idx}
      className={`relative ${idx === 0 ? "pt-4 md:pt-0" : ""}`} // pt-4 only on mobile, reset on md+
    >
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-200 transition-colors duration-150 group"
      >
        <div className="flex-shrink-0">{project.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-800 group-hover:text-green-600 truncate">
            {project.name}
          </div>
          <div className="text-xs text-gray-500 mt-0.5 truncate">
            {project.description}
          </div>
        </div>
        {/* Arrow intentionally omitted on mobile */}
      </a>
    </li>
  );

  // Desktop: Popup previews (unchanged)
  const renderDesktopLink = (project, idx) => (
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

      <div
        aria-hidden={hovered !== idx}
        className={`absolute z-10 ${
          project.width
        } bg-white rounded-lg overflow-hidden
        ${project.position === "left" ? "top-0 right-full mr-1" : ""}
        ${project.position === "right" ? "top-0 left-full ml-1" : ""}
        ${project.position === "bottom-right" ? "top-full mt-2 right-0" : ""}
        ${project.position === undefined ? "top-full mt-2" : ""}
        popup-frame
        ${hovered === idx ? "popup-visible" : "popup-hidden"}`}
      >
        <div className="popup-frame-shadow" />
        <div className="popup-content">{project.embed}</div>
      </div>
    </li>
  );

  return (
    <div className="flex-1 w-full relative bg-slate-100 rounded-lg p-6 pt-10 shadow-lg project-blue-hover project-mobile-restrict">
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-300 rounded px-12 py-1 shadow-lg">
        <h2 className="text-lg font-semibold font-montserrat">Proiecte</h2>
      </div>

      <ul className="space-y-3 text-sm text-gray-700">
        <div className="h-1" />
        {PROJECTS.map((project, idx) =>
          isMobile
            ? renderMobileLink(project, idx)
            : renderDesktopLink(project, idx)
        )}

        <li className="flex justify-center mt-6 relative">
          <LogoFun className="w-35" noteContainerClass="" />
        </li>
      </ul>

      <style>{`
        .w-35 { width: 140px; }

        /* Mobile-only adjustments */
        @media (max-width: 768px) {
          .project-mobile-restrict {
            max-width: 420px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
            padding-top: 10px !important;
            padding-bottom: 12px !important;

            /* Match height/visual weight with Education and Skills cards */
            min-height: 220px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
          }

          /* Tighter vertical spacing between project items (mobile only) */
          .project-mobile-restrict ul.space-y-3 {
            gap: 4px !important;
          }
          .project-mobile-restrict .space-y-3 > li {
            margin-bottom: 4px !important;
          }

          /* Reduce padding inside each project link on mobile */
          .project-mobile-restrict .space-y-3 > li a {
            padding-top: 6px !important;
            padding-bottom: 6px !important;
            padding-left: 8px !important;
            padding-right: 8px !important;
          }

          /* Reduce distance between icon and text */
          .project-mobile-restrict .space-y-3 > li a .flex-shrink-0 {
            margin-right: 6px !important;
          }

          /* Make logo spacing smaller */
          .project-mobile-restrict li.flex.justify-center {
            margin-top: 8px !important;
          }

          /* Hide heavy embedded previews on mobile */
          .project-mobile-restrict iframe {
            max-height: 0;
            height: 0;
            visibility: hidden;
            pointer-events: none;
          }

          /* Smaller widths for popup frames on small screens if somehow visible */
          .w-[500px] { width: 90vw !important; }
          .w-[700px] { width: 95vw !important; }
        }

        /* Efect umbră albastră doar la hover (desktop) */
        .project-blue-hover {
          transition: box-shadow 220ms ease;
        }

        @media (hover: hover) and (pointer: fine) {
          .project-blue-hover:hover {
            box-shadow:
              var(--tw-shadow),
              0 6px 20px rgba(67, 108, 197, 0.13),
              0 2px 6px rgba(6,182,212,0.08);
          }
        }

        @media (hover: none) and (pointer: coarse) {
          .project-blue-hover {
            box-shadow: var(--tw-shadow);
          }
        }

        /* Desktop popup transitions (unchanged) */
        @media (min-width: 769px) {
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

          .popup-content {
            transition: opacity 320ms cubic-bezier(.2,.9,.3,1) 80ms, transform 320ms cubic-bezier(.2,.9,.3,1) 80ms;
            opacity: 0;
            transform: translateY(6px) scale(0.995);
          }

          .popup-visible .popup-content {
            opacity: 1;
            transform: translateY(0) scale(1);
          }

          .popup-frame-shadow {
            position: absolute;
            inset: 0;
            pointer-events: none;
          }
        }
      `}</style>
    </div>
  );
}
