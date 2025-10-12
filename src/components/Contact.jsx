import { MailIcon, PhoneIcon } from "@heroicons/react/solid";
import { LocationMarkerIcon } from "@heroicons/react/outline";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";

export default function Contact() {
  return (
    <div className="relative z-10 w-full bg-slate-100 shadow-sm">
      {/* Mobile: stacked layout, Desktop: horizontal layout */}
      <div className="w-full px-4 py-3 flex flex-col md:flex-row justify-center items-center gap-3 md:gap-6 text-gray-700 text-xs md:text-sm">
        {/* First row - Email and Phone */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <MailIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
            <span className="text-xs md:text-sm">dan_22@yahoo.com</span>
          </div>

          <div className="flex items-center gap-2">
            <PhoneIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
            <span className="text-xs md:text-sm">077205910</span>
          </div>
        </div>

        {/* Second row - Location and Social */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <LocationMarkerIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
            <span className="text-xs md:text-sm">Brașov, România</span>
          </div>

          {/* Social media with smaller text on mobile */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            <div className="flex items-center gap-1 group">
              <FaFacebook className="w-4 h-4 md:w-5 md:h-5 text-blue-600 transform transition-transform duration-200 group-hover:scale-110" />
              <a
                href="https://www.facebook.com/striblea.danut"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-blue-600 text-xs md:text-sm"
              >
                striblea.danut
              </a>
            </div>

            <div className="flex items-center gap-1 group">
              <FaInstagram className="w-4 h-4 md:w-5 md:h-5 text-pink-500 transform transition-transform duration-200 group-hover:scale-110" />
              <a
                href="https://www.instagram.com/danut_striblea/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-pink-600 text-xs md:text-sm"
              >
                danut_striblea
              </a>
            </div>

            <div className="flex items-center gap-1 group">
              <FaTiktok className="w-4 h-4 md:w-5 md:h-5 text-black transform transition-transform duration-200 group-hover:scale-110" />
              <a
                href="https://www.tiktok.com/@the.broken.vinyl"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-black text-xs md:text-sm"
              >
                @the.broken.vinyl
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
