import React from "react";
import { Download } from "lucide-react";

export default function SavePDF({ className = "" }) {
  const handleSavePDF = async () => {
    try {
      // Încarcă librăria dinamic
      const { jsPDF } = await import("jspdf");

      // Folosim html2canvas dintr-un CDN care să nu aibă problema cu oklch
      const html2canvasResponse = await fetch(
        "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
      );
      const html2canvasScript = await html2canvasResponse.text();

      // Execută script-ul
      eval(html2canvasScript);

      const element = document.querySelector(".a4-frame");

      if (!element) {
        alert("Nu s-a putut găsi conținutul CV-ului");
        return;
      }

      const originalCursor = document.body.style.cursor;
      document.body.style.cursor = "wait";

      // Ascunde butoanele temporar
      const elementsToHide = document.querySelectorAll(".print-hidden");
      elementsToHide.forEach((el) => {
        el.style.visibility = "hidden";
      });

      // Așteaptă puțin
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Folosește html2canvas din window (acum este disponibil)
      const canvas = await window.html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("DanutStriblea_CV.pdf");

      // Restabilește butoanele
      elementsToHide.forEach((el) => {
        el.style.visibility = "visible";
      });

      document.body.style.cursor = originalCursor;
    } catch (error) {
      console.error("Error generating PDF:", error);

      // Fallback la window.print() dacă nu merge
      alert("Se folosește metoda alternativă...");
      window.print();
    }
  };

  return (
    <button
      onClick={handleSavePDF}
      className={`absolute top-6 left-6 flex items-center gap-2 text-white hover:scale-110 transition-transform duration-200 group print-hidden ${className}`}
      title="Download PDF"
    >
      <Download className="text-2xl" />
      <span className="opacity-0 group-hover:opacity-100 text-sm ml-2 transition-opacity duration-200">
        Download PDF
      </span>
    </button>
  );
}
