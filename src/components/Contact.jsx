import { MailIcon, PhoneIcon } from "@heroicons/react/solid";
import { LocationMarkerIcon } from "@heroicons/react/outline";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";

export default function Contact() {
  return (
    <div className="relative z-10 w-full bg-slate-100 shadow-sm">
      {/* întins pe toată lățimea A4 */}
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
            href="https://www.tiktok.com/@the.broken.vinyl?_r=1&_d=secCgYIASAHKAESPgo8zr9s2UHfKD4fHq%2BhHi%2Bd5IsUeUMZhbsW9Uclvaz82eqUJTY47TWUGiXGYEHjBFMKqKm4EzDFWAEFLqlZGgA%3D&_svg=2&checksum=d4dce1bfd26149629d03fef6376fb7d3fdf0f1c65beaff969e42e175f2b481d9&item_author_type=1&sec_uid=MS4wLjABAAAAOTDZ9H4dCMv4W9tWnJDAphusc3vWuo3aG6DqLJGlRtxn1KZXibX_YhLZsrRS1UAG&sec_user_id=MS4wLjABAAAAOTDZ9H4dCMv4W9tWnJDAphusc3vWuo3aG6DqLJGlRtxn1KZXibX_YhLZsrRS1UAG&share_app_id=1233&share_author_id=7457945313769309217&share_link_id=494D50F3-E7DD-4A64-86D8-0C624C71D5E2&share_scene=1&sharer_language=en&social_share_type=4&source=h5_m&timestamp=1759323969&tt_from=copy&u_code=ei7779bi21ah75&ug_btm=b8727%2Cb0&user_id=7457945313769309217&utm_campaign=client_share&utm_medium=ios&utm_source=copy"
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
