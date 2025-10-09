import React from "react";
import {
  FaMusic,
  FaBicycle,
  FaSwimmer,
  FaMountain,
  FaPlane,
} from "react-icons/fa";

const WORKS = [
  {
    period: "2010–2025",
    role: "Producție Muzicală",
    place: "The Broken Vinyl – Music Production (home studio)",
    details: "Producție muzicală, orchestrație, aranjamente instrumentale.",
  },
  {
    period: "2020–2021",
    role: "Sous Chef",
    place: "CHUCS RESTAURANT (Italian Cuisine) – London, Kensington",
    details:
      "Gestionarea alimentelor și comenzilor à la carte pentru mic dejun, prânz și cină. Prepararea deserturilor și a mise en place-ului cu specific italian.",
  },
  {
    period: "2012–2019",
    role: "Sous Chef",
    place: "THE BENTLEY HOTEL – London, Kensington",
    details:
      "Gestionarea alimentelor și prepararea comenzilor. English breakfast, room service și petreceri pt restaurantul de 5 stele Peridot. Preluarea atribuțiilor bucătarului-șef în lipsa acestuia.",
  },
  {
    period: "2010–2012",
    role: "Supervizor Vânzări – Telemarketing",
    place: "ASTRA ASIGURĂRI (Online) – București",
    details:
      "Supervizarea și conducerea unei echipe de 20 de agenți de vânzări. Monitorizarea directă a calității apelurilor. Feedback individual și meeting-uri de echipă pentru motivare și atingerea obiectivelor lunare.",
  },
  {
    period: "2008–2010",
    role: "Consultant Vânzări / Mentor",
    place: "LINEA DIRECTA COMUNICATION – București",
    details:
      "Vânzarea serviciilor de telefonie/internet Vodafone. Training-uri periodice în tehnici de vânzare și relaționare. Gestionarea apelurilor in-out. Mentoring pentru agenții noi sau neproductivi. Implementarea și actualizarea scenariilor de apel.",
  },
];

export default function WorkExperience() {
  return (
    <section className="px-6 pt-2 w-full">
      <h2 className="mb-3 text-lg font-semibold font-montserrat bg-slate-300 shadow-sm w-full py-2 rounded-md text-center">
        Experiență profesională
      </h2>

      <div className="grid grid-cols-3 gap-3 w-full text-xs">
        {/* Cele 5 experiențe */}
        {WORKS.map(({ period, role, place, details }, idx) => (
          <div
            key={idx}
            className="bg-slate-100 rounded-md shadow-sm px-3 py-2 text-left"
          >
            <p className="text-gray-900 mb-1">
              <span className="font-bold">{period}</span> —{" "}
              <span className="font-bold">{role}</span>
            </p>
            <p className="text-gray-700 italic mb-1">{place}</p>
            <p className="text-gray-400 leading-snug">{details}</p>
          </div>
        ))}

        {/* Coloana specială cu 3 carduri separate */}
        <div className="flex flex-col gap-3">
          {/* Card - Engleză/Italiană/Spaniolă */}

          <div className="bg-slate-100 rounded-md shadow-sm px-3 py-2 text-left">
            <div className="space-y-1">
              <div>
                <span>Engleză</span>
                <div className="w-full bg-slate-200 rounded h-1 mt-1">
                  <div className="bg-gray-400 h-1 rounded w-[95%]" />
                </div>
              </div>
              <div>
                <span>Italiană</span>
                <div className="w-full bg-slate-200 rounded h-1 mt-1">
                  <div className="bg-gray-400 h-1 rounded w-[70%]" />
                </div>
              </div>
              <div>
                <span>Spaniolă</span>
                <div className="w-full bg-slate-200 rounded h-1 mt-1">
                  <div className="bg-gray-400 h-1 rounded w-[70%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Pasiuni */}
          <div className="bg-slate-100 rounded-md shadow-sm px-3 py-2 text-left">
            <div className="flex items-center gap-3 text-gray-700">
              <span className="font-bold">Pasiuni:</span>
              <div className="flex gap-3 text-xl">
                <FaMusic title="Muzică" />
                <FaBicycle title="Ciclism" />
                <FaSwimmer title="Înot" />
                <FaMountain title="Drumeții" />
                <FaPlane title="Călătorii" />
              </div>
            </div>
          </div>

          {/* Permis auto */}
          <div className="bg-slate-100 rounded-md shadow-sm px-3 py-2 text-left">
            <p className="font-bold">
              Permis auto: <span className="font-normal">Categoria B</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
