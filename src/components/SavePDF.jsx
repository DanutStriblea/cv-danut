import React from "react";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import * as htmlToImage from "html-to-image";

export default function SavePDF({ className = "" }) {
  const handleSavePDF = async () => {
    const root = document.documentElement;
    const originalCursor = document.body.style.cursor;

    try {
      const el = document.querySelector(".a4-frame");
      if (!el) {
        alert("Nu s-a găsit conținutul CV-ului");
        return;
      }

      // Activează modul 'exporting' DOAR pe durata capturii
      root.classList.add("exporting");

      // Cursor busy
      document.body.style.cursor = "wait";

      // Așteaptă fonturile
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // Conversie OKLCH -> RGB (local)
      const all = el.querySelectorAll("*");
      const original = [];
      all.forEach((node) => {
        const style = getComputedStyle(node);
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
            original.push([node, prop, node.style.getPropertyValue(prop)]);
            node.style.setProperty(prop, val);
            const rgb = getComputedStyle(node).getPropertyValue(prop);
            node.style.setProperty(prop, rgb);
          }
        }
      });

      // Captură la rezoluție mare
      const dataUrl = await htmlToImage.toPng(el, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      // Restaurează stilurile locale
      original.forEach(([node, prop, val]) => {
        if (val) node.style.setProperty(prop, val);
        else node.style.removeProperty(prop);
      });

      // Generează PDF A4
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((r) => (img.onload = r));

      // Convert CSS px (96dpi) -> mm
      const pxToMm = (px) => (px * 25.4) / 96;
      const imgWmm = pxToMm(img.width);
      const imgHmm = pxToMm(img.height);

      const pageW = 210;
      const pageH = 297;
      const scale = Math.min(pageW / imgWmm, pageH / imgHmm);
      const w = imgWmm * scale;
      const h = imgHmm * scale;
      const x = (pageW - w) / 2;
      const y = (pageH - h) / 2;

      pdf.addImage(img, "PNG", x, y, w, h, "", "FAST");
      pdf.save("DanutStriblea_CV.pdf");
    } catch (e) {
      console.error("Eroare la generarea PDF:", e);
      alert("Eroare PDF — vezi consola pentru detalii.");
    } finally {
      // Dezactivează modul exporting și cursorul
      document.documentElement.classList.remove("exporting");
      document.body.style.cursor = originalCursor;
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
