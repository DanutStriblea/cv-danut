import { useEffect } from "react";

export function useZoomControls() {
  useEffect(() => {
    let scale = 1;

    const applyScale = () => {
      document.documentElement.style.setProperty("--scale", scale);
    };

    const zoomIn = () => {
      scale = Math.min(scale + 0.1, 2);
      applyScale();
    };

    const zoomOut = () => {
      scale = Math.max(scale - 0.1, 0.5);
      applyScale();
    };

    const resetZoom = () => {
      scale = 1;
      applyScale();
    };

    // identificăm butoanele existente
    const zoomInBtn =
      document.querySelector(".zoom-in") || document.getElementById("zoomIn");
    const zoomOutBtn =
      document.querySelector(".zoom-out") || document.getElementById("zoomOut");
    const resetBtn =
      document.querySelector(".zoom-reset") ||
      document.getElementById("zoomReset");

    if (zoomInBtn) zoomInBtn.addEventListener("click", zoomIn);
    if (zoomOutBtn) zoomOutBtn.addEventListener("click", zoomOut);
    if (resetBtn) resetBtn.addEventListener("click", resetZoom);

    // curățare la demontare
    return () => {
      if (zoomInBtn) zoomInBtn.removeEventListener("click", zoomIn);
      if (zoomOutBtn) zoomOutBtn.removeEventListener("click", zoomOut);
      if (resetBtn) resetBtn.removeEventListener("click", resetZoom);
    };
  }, []);
}
