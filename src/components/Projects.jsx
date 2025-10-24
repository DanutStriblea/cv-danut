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
    description: "Magazin online e-commerce",
  },
];

export default function Projects() {
  const [hovered, setHovered] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef(null);
  const popupRefs = useRef([]);

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
    if (isMobile) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHovered(idx);
  };

  const handleLeave = () => {
    if (isMobile) return;
    timeoutRef.current = setTimeout(() => {
      setHovered(null);
    }, 300);
  };

  const renderMobileLink = (project, idx) => (
    <li key={idx} className={`relative ${idx === 0 ? "pt-4 md:pt-0" : ""}`}>
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-200 transition-colors duration-150 group"
      >
        <div className="flex-shrink-0">{project.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-800 group-hover:text-green-600 truncate text-[13px] leading-tight">
            {project.name}
          </div>
          <div className="text-xs text-gray-500 mt-1 truncate text-[11px] leading-tight">
            {project.description}
          </div>
        </div>
      </a>
    </li>
  );

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
        className="flex items-center gap-3 font-semibold hover:text-green-600 text-[13px] p-1"
      >
        {project.icon}
        {project.name}
      </a>

      <div
        ref={(el) => (popupRefs.current[idx] = el)}
        onMouseEnter={() => handleEnter(idx)}
        onMouseLeave={handleLeave}
        className={`absolute z-50 ${
          project.width
        } bg-white rounded-lg overflow-hidden transition-all duration-300 ease-out border border-gray-200 shadow-2xl
          ${project.position === "left" ? "top-0 right-full mr-3" : ""}
          ${project.position === "right" ? "top-0 left-full ml-3" : ""}
          ${project.position === "bottom-right" ? "top-full mt-3 right-0" : ""}
          ${
            hovered === idx
              ? "opacity-100 visible translate-y-0 scale-100"
              : "opacity-0 invisible translate-y-2 scale-95"
          }`}
      >
        <div className="popup-content w-full h-full">{project.embed}</div>
      </div>
    </li>
  );

  return (
    <div
      className="
      flex-1 w-full relative bg-slate-100 rounded-lg
      p-3 sm:p-6 pt-6 sm:pt-10 pb-1 sm:pb-2
      shadow-lg transition-shadow duration-220
      hover:shadow-xl hover:shadow-slate-300
      project-mobile-restrict card-print-fix
    "
    >
      <div className="card-title-wrapper absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-300 px-12 py-1 rounded shadow-lg z-10 print:!left-1/2 print:!transform print:!-translate-x-1/2">
        <h2 className="text-lg font-semibold font-montserrat text-center print:!text-center print:!block print:!mx-auto">
          Proiecte
        </h2>
      </div>

      <ul
        className="
        space-y-0.5 sm:space-y-1 text-sm text-gray-700
        px-0 sm:px-1
      "
      >
        <div className="h-1 sm:h-2" />
        {PROJECTS.map((project, idx) =>
          isMobile
            ? renderMobileLink(project, idx)
            : renderDesktopLink(project, idx)
        )}

        <li className="flex justify-center mt-1 sm:mt-2 mb-1 sm:mb-2 relative print:mt-0 print:mb-0">
          <LogoFun
            className={`${isMobile ? "w-24 print:w-16" : "w-24 sm:w-30"}`}
            noteContainerClass=""
          />
        </li>
      </ul>
    </div>
  );
}
