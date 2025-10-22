import React from "react";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import * as htmlToImage from "html-to-image";

export default function SavePDF({ className = "" }) {
  const handleSavePDF = async () => {
    try {
      const element = document.querySelector(".a4-frame");
      if (!element) {
        alert("Nu s-a găsit conținutul CV-ului");
        return;
      }

      const originalCursor = document.body.style.cursor;
      document.body.style.cursor = "wait";

      // Ascunde butoanele interactive
      const hiddenEls = document.querySelectorAll(".print-hidden");
      hiddenEls.forEach((el) => (el.style.visibility = "hidden"));

      // Așteaptă fonturile
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // --- CONVERSIE GLOBALĂ OKLCH -> RGB ---
      const all = element.querySelectorAll("*");
      const original = [];
      all.forEach((el) => {
        const style = getComputedStyle(el);
        for (const prop of [
          "color",
          "backgroundColor",
          "borderColor",
          "borderTopColor",
          "borderRightColor",
          "borderBottomColor",
          "borderLeftColor",
        ]) {
          const val = style.getPropertyValue(prop);
          if (val && val.includes("oklch(")) {
            // păstrăm valoarea originală
            original.push([el, prop, el.style[prop]]);
            // browserul convertește automat în rgb dacă îl aplicăm direct
            el.style[prop] = val;
            const rgb = getComputedStyle(el).getPropertyValue(prop);
            el.style[prop] = rgb;
          }
        }
      });

      // --- Captură ---
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      // --- Restaurăm culorile originale ---
      original.forEach(([el, prop, val]) => (el.style[prop] = val));
      hiddenEls.forEach((el) => (el.style.visibility = "visible"));
      document.body.style.cursor = originalCursor;

      // --- Generează PDF ---
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((r) => (img.onload = r));

      const pageWidth = 210;
      const pageHeight = (img.height * pageWidth) / img.width;
      pdf.addImage(img, "PNG", 0, 0, pageWidth, pageHeight, "", "FAST");
      pdf.save("DanutStriblea_CV.pdf");
    } catch (err) {
      console.error("Eroare la generarea PDF:", err);
      alert("Eroare PDF — vezi consola pentru detalii.");
      document.body.style.cursor = "default";
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
