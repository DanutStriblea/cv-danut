// src/components/Education.jsx
const EDUCATION = [
  {
    years: "2024 – 2025",
    degree: "The Ultimate React Course 2025: React, Next.js, Redux",
    institution: "Jonas Schmedtmann – Udemy",
  },
  {
    years: "2022 – 2024",
    degree: "Web Developer with HTML, CSS, JavaScript, React, Node.js",
    institution: "Andrei Neagoie – Udemy",
  },
  {
    years: "2003 – 2007",
    degree: "Licență în Turism și Servicii",
    institution: "FACULTATEA DE ECONOMIE George Baritiu – Brașov",
  },
  {
    years: "2001 – 2007",
    degree: "Pian Clasic și Jazz",
    institution: "ȘCOALA DE ARTE – Brașov",
  },
];

export default function Education() {
  return (
    <div className="flex-1 w-full relative bg-slate-100 rounded-lg p-6 pt-10 pb-2 shadow-lg">
      {/* Titlu „lipit” */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-slate-300 px-12 py-1 rounded shadow-lg">
        <h2 className="text-lg font-semibold font-montserrat">Educație</h2>
      </div>

      {/* Conținutul cardului */}
      <ul className="space-y-3 text-xs text-center text-gray-500">
        {EDUCATION.map(({ years, degree, institution, details }) => (
          <li key={degree} className="space-y-0.3">
            <p className="text-center font-semibold text-gray-400">{years}</p>
            <p className="font-bold">{degree}</p>
            <p className="italic">{institution}</p>
            <p className="text-gray-400">{details}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
