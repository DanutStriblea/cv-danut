// src/components/Projects.jsx
import React from "react";
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
    icon: <FaSpotify className="text-green-500 text-2xl" />,
    description: "Producție muzicală pe Spotify",
  },
  {
    name: "The Broken Vinyl",
    url: "https://www.youtube.com/channel/UC8MdjvdBFYWYMWFU6fKHWlg",
    icon: <FaYoutube className="text-red-600 text-2xl" />,
    description: "Canal YouTube cu compoziții originale",
  },
  {
    name: (
      <span className="font-semibold">
        <span className="text-green-500">Dan</span>
        <span className="text-green-900">Store</span>
      </span>
    ),
    url: "https://dan-store-lyart.vercel.app/#/",
    icon: <CartOutline className="w-6 h-6 text-gray-500" />,
    description: "Magazin online e-commerce",
  },
];

export default function Projects() {
  return (
    <div className="flex-1 w-full relative bg-slate-100 rounded-lg p-6 pt-10 shadow-lg project-blue-hover">
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-300 rounded px-12 py-1 shadow-lg">
        <h2 className="text-lg font-semibold font-montserrat">Proiecte</h2>
      </div>

      <ul className="space-y-4 text-sm text-gray-700">
        <div className="h-1" />
        {PROJECTS.map((project, idx) => (
          <li key={idx} className="relative">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-200 transition-colors duration-200 group"
            >
              <div className="flex-shrink-0">{project.icon}</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                  {project.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {project.description}
                </div>
              </div>
              <div className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                ↗
              </div>
            </a>
          </li>
        ))}

        <li className="flex justify-center mt-6 relative">
          <LogoFun className="w-35" noteContainerClass="" />
        </li>
      </ul>

      <style>{`
        .w-35 { width: 140px; }

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
      `}</style>
    </div>
  );
}
