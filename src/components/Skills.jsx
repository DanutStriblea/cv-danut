// src/components/Skills.jsx
const SKILLS = [
  "Compoziție și Producție muzicală",
  "Pian, Chitară, Cubase 12",
  "Mixing & Mastering",
  "Web Development: JS, React, Supabase, Stripe, Resend, Vercel",
  "Precizie și rigoare vizuală",
  "Planificare structurată și eficiență",
  "Perseverență și calm în proces",
  "Colaborare empatică și claritate în dialog",
  "Tehnici culinare și management efectiv",
];

export default function Skills() {
  return (
    <div className="flex-1 relative bg-slate-100 rounded-lg p-6 pt-10 shadow-lg">
      {/* Titlu „lipit” */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-300 rounded px-12 py-1 shadow-lg">
        <h2 className="text-lg font-semibold font-montserrat">Abilități</h2>
      </div>

      {/* Conținutul cardului */}
      <ul className="text-gray-600 text-xs  space-y-1.5 -mx-1">
        {/* Rand de spațiu la început */}
        <div className="h-1" />
        {SKILLS.map((skill) => (
          <li key={skill}>• {skill}</li>
        ))}
      </ul>
    </div>
  );
}
