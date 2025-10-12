import { MailIcon, PhoneIcon } from "@heroicons/react/solid";
import { LocationMarkerIcon } from "@heroicons/react/outline";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function Contact() {
  const [isMobile, setIsMobile] = useState(false);

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

  // Mobile layout: compact, EXACT 2 rows
  if (isMobile) {
    return (
      <div className="relative z-10 w-full bg-slate-100 shadow-sm">
        <div className="w-full px-3 py-2 flex flex-col gap-2 text-gray-700 text-xs">
          {/* First row - EXACTLY Email, Phone, Location */}
          <div className="flex justify-between items-center gap-1">
            <div className="flex items-center gap-1 flex-1 justify-center">
              <MailIcon className="w-3 h-3 text-gray-500 flex-shrink-0" />
              <span className="truncate">dan_22@yahoo.com</span>
            </div>

            <div className="flex items-center gap-1 flex-1 justify-center">
              <PhoneIcon className="w-3 h-3 text-gray-500 flex-shrink-0" />
              <span>077205910</span>
            </div>

            <div className="flex items-center gap-1 flex-1 justify-center">
              <LocationMarkerIcon className="w-3 h-3 text-gray-500 flex-shrink-0" />
              <span className="truncate">Brașov</span>
            </div>
          </div>

          {/* Second row - EXACTLY Facebook, Instagram, TikTok */}
          <div className="flex justify-between items-center gap-1">
            <div className="flex items-center gap-1 flex-1 justify-center">
              <FaFacebook className="w-3 h-3 text-blue-600 flex-shrink-0" />
              <a
                href="https://www.facebook.com/striblea.danut"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-blue-600 truncate"
              >
                striblea.danut
              </a>
            </div>

            <div className="flex items-center gap-1 flex-1 justify-center">
              <FaInstagram className="w-3 h-3 text-pink-500 flex-shrink-0" />
              <a
                href="https://www.instagram.com/danut_striblea/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-pink-600 truncate"
              >
                danut_striblea
              </a>
            </div>

            <div className="flex items-center gap-1 flex-1 justify-center">
              <FaTiktok className="w-3 h-3 text-black flex-shrink-0" />
              <a
                href="https://www.tiktok.com/@the.broken.vinyl"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-black truncate"
              >
                @the.broken.vinyl
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout: original, all in one row
  return (
    <div className="relative z-10 w-full bg-slate-100 shadow-sm">
      <div className="w-full px-6 py-3 flex justify-evenly items-center text-gray-700 text-xs">
        {/* Email */}
        <div className="flex items-center gap-2">
          <MailIcon className="w-5 h-5 text-gray-500" />
          <span>dan_22@yahoo.com</span>
        </div>

        {/* Telefon */}
        <div className="flex items-center gap-2">
          <PhoneIcon className="w-5 h-5 text-gray-500" />
          <span>077205910</span>
        </div>

        {/* Locație */}
        <div className="flex items-center gap-2">
          <LocationMarkerIcon className="w-5 h-5 text-gray-500" />
          <span>Brașov, România</span>
        </div>

        {/* Facebook */}
        <div className="flex items-center gap-2 group">
          <FaFacebook className="w-5 h-5 text-blue-600 transform transition-transform duration-200 group-hover:scale-110" />
          <a
            href="https://www.facebook.com/striblea.danut"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-blue-600"
          >
            striblea.danut
          </a>
        </div>

        {/* Instagram */}
        <div className="flex items-center gap-2 group">
          <FaInstagram className="w-5 h-5 text-pink-500 transform transition-transform duration-200 group-hover:scale-110" />
          <a
            href="https://www.instagram.com/danut_striblea/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-pink-600"
          >
            danut_striblea
          </a>
        </div>

        {/* TikTok */}
        <div className="flex items-center gap-2 group">
          <FaTiktok className="w-5 h-5 text-black transform transition-transform duration-200 group-hover:scale-110" />
          <a
            href="https://www.tiktok.com/@the.broken.vinyl"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-black"
          >
            @the.broken.vinyl
          </a>
        </div>
      </div>
    </div>
  );
}
