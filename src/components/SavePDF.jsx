import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";

export default function SavePDF({
  targetRef,
  fileName = "DanutStriblea_CV.pdf",
  className = "",
}) {
  const handleSavePDF = async () => {
    if (!targetRef?.current) {
      console.error("SavePDF: targetRef not found");
      return;
    }

    try {
      const dpr = window.devicePixelRatio || 1;
      const scale = Math.max(1, Math.min(2, dpr));

      const canvas = await html2canvas(targetRef.current, {
        scale,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pxToMm = (px) => (px * 25.4) / 96;

      const imgWidthMm = pxToMm(canvas.width);
      const imgHeightMm = pxToMm(canvas.height);

      const pageWidth = 210;
      const pageHeight = 297;

      let renderWidth = pageWidth;
      let renderHeight = (imgHeightMm * renderWidth) / imgWidthMm;

      if (renderHeight > pageHeight) {
        renderHeight = pageHeight;
        renderWidth = (imgWidthMm * renderHeight) / imgHeightMm;
      }

      const xOffset = (pageWidth - renderWidth) / 2;
      const yOffset = (pageHeight - renderHeight) / 2;

      pdf.addImage(imgData, "PNG", xOffset, yOffset, renderWidth, renderHeight);
      pdf.save(fileName);
    } catch (err) {
      console.error("Error saving PDF:", err);
    }
  };

  return (
    <button
      onClick={handleSavePDF}
      className={`absolute top-6 left-6 flex items-center gap-2 text-white hover:scale-110 transition-transform duration-200 group print:hidden ${className}`}
    >
      <Download className="text-2xl" />
      <span className="opacity-0 group-hover:opacity-100 text-sm ml-2 transition-opacity duration-200">
        Download this CV
      </span>
    </button>
  );
}
