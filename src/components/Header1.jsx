import { FiPrinter } from "react-icons/fi";

export default function Header1() {
  return (
    <header className="relative w-full bg-gray-900 text-white p-6 text-center">
      {/* Buton print în colțul dreapta sus */}
      <button
        onClick={() => window.print()}
        className="absolute top-6 right-6 flex items-center gap-2 text-white 
                   hover:scale-110 transition-transform duration-200 group print:hidden"
      >
        {/* Textul apare în stânga iconului */}
        <span className="opacity-0 group-hover:opacity-100 text-sm transition-opacity duration-200">
          Print this page
        </span>
        <FiPrinter className="text-2xl" />
      </button>

      <h1 className="text-3xl font-bold font-montserrat tracking-wide">
        Dănuț Striblea
      </h1>
      <p className="text-sm text-gray-300 uppercase tracking-wider mt-2">
        Music Producer · IT Passionate · Culinary Artist
      </p>
    </header>
  );
}
