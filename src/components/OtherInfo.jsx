import React from "react";
import {
  FaPiano,
  FaGuitar,
  FaBicycle,
  FaSwimmer,
  FaMountain,
  FaPlane,
} from "react-icons/fa";

export default function OtherInfo() {
  return (
    <section className="px-8 py-6 w-full">
      <h2 className="mb-6 text-lg font-semibold font-montserrat bg-stone-200 w-full py-2 rounded-md text-center">
        Alte informații
      </h2>

      <div className="grid grid-cols-2 gap-4 w-full">
        {/* Card 1 - Limbi străine */}
        <div className="bg-stone-50 rounded-md shadow-sm px-4 py-3 text-left w-full">
          <h3 className="text-sm font-semibold mb-2">Limbi străine</h3>
          <div className="space-y-2 text-xs">
            <div>
              <span className="font-medium">Engleză</span>
              <div className="w-full bg-stone-200 rounded h-2 mt-1">
                <div className="bg-green-600 h-2 rounded w-[90%]" />
              </div>
            </div>
            <div>
              <span className="font-medium">Italiană</span>
              <div className="w-full bg-stone-200 rounded h-2 mt-1">
                <div className="bg-green-600 h-2 rounded w-[70%]" />
              </div>
            </div>
            <div>
              <span className="font-medium">Spaniolă</span>
              <div className="w-full bg-stone-200 rounded h-2 mt-1">
                <div className="bg-green-600 h-2 rounded w-[50%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 - Pasiuni */}
        <div className="bg-stone-50 rounded-md shadow-sm px-4 py-3 text-left w-full">
          <h3 className="text-sm font-semibold mb-2">Pasiuni</h3>
          <div className="flex flex-wrap gap-4 text-gray-700 text-lg">
            <FaPiano title="Pian" />
            <FaGuitar title="Chitară" />
            <FaBicycle title="Ciclism" />
            <FaSwimmer title="Înot" />
            <FaMountain title="Drumeții" />
            <FaPlane title="Călătorii" />
          </div>
        </div>

        {/* Card 3 - Permis auto */}
        <div className="bg-stone-50 rounded-md shadow-sm px-4 py-3 text-left w-full">
          <h3 className="text-sm font-semibold mb-2">Permis auto</h3>
          <p className="text-xs text-gray-700">Categoria B</p>
        </div>
      </div>
    </section>
  );
}
