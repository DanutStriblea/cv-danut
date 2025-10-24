// src/components/Comet-Neon.jsx
import React, { useId } from "react";

/**
 * CometNeon — cometă discretă pe conturul cardului (glow exterior, fade gradual, CCW).
 *
 * Ajustări principale față de versiunea anterioară:
 * - anti-clipping: rect ușor „înăuntru” (x/y=0.6, w/h=98.8) + filter extins + overflow vizibil
 * - implicit: mai scurtă (length=12), mai rapidă (speedMs=2000), mai discretă (opacity=0.26, width=0.7)
 */
export default function CometNeon({
  roundedPx = 8,
  colorClass = "text-sky-400",
  opacity = 0.26, // ↓ mai discret
  width = 0.7, // ↓ linie mai fină
  length = 12, // ↓ mai scurtă (nu mai „ocupa” mult din contur)
  speedMs = 2000, // ↑ mai rapid
}) {
  // ids sigure pt. url(#..)
  const uidRaw = useId();
  const uid = String(uidRaw).replace(/[:]/g, "");

  const len = Math.max(4, Math.min(40, Number(length) || 12));
  const gap = 100 - len;

  const FILTER_ID = `cn-outer-glow-${uid}`;
  const FADE_ID = `cn-fade-${uid}`;
  const MASK_ID = `cn-mask-${uid}`;
  const KF_NAME = `comet-ccw-${uid}`;

  // anti-alias safe-box: ușor înăuntru ca să nu „taie” pe margini
  const R = roundedPx;
  const X = 0.6;
  const Y = 0.6;
  const W = 98.8;
  const H = 98.8;

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${colorClass} opacity-0 lg:group-hover:opacity-100 transition-opacity z-10`}
      style={{
        /* nu punem borderRadius aici ca să nu influențeze masking-ul */ overflow:
          "visible",
      }}
      aria-hidden
    >
      <style>{`@keyframes ${KF_NAME} { to { stroke-dashoffset: 100; } }`}</style>

      <svg
        className="w-full h-full block overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        shapeRendering="geometricPrecision"
      >
        <defs>
          {/* Glow doar în exterior; region foarte larg ca să nu fie tăiat pe laturi */}
          <filter
            id={FILTER_ID}
            filterUnits="userSpaceOnUse"
            x="-150"
            y="-150"
            width="400"
            height="400" /* super extins */
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="1.4"
              result="blur"
            />
            <feComposite
              in="blur"
              in2="SourceGraphic"
              operator="out"
              result="outer"
            />
            <feColorMatrix
              in="outer"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 0.80 0"
              result="outerSoft"
            />
            <feMerge>
              <feMergeNode in="outerSoft" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Fade foarte gradual (5 trepte) pentru dâră */}
          <linearGradient id={FADE_ID} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="35%" stopColor="white" stopOpacity="0.55" />
            <stop offset="60%" stopColor="white" stopOpacity="0.35" />
            <stop offset="80%" stopColor="white" stopOpacity="0.18" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* MASK: difuz + clar (sincron), pentru o singură cometă continuă */}
          <mask id={MASK_ID} maskUnits="userSpaceOnUse">
            {/* strat 1: difuz, mai lung */}
            <rect
              x={X}
              y={Y}
              width={W}
              height={H}
              rx={R}
              ry={R}
              fill="none"
              stroke={`url(#${FADE_ID})`}
              strokeLinecap="round"
              pathLength="100"
              strokeWidth={width * 2.0}
              strokeDasharray={`${len} ${gap}`}
              strokeDashoffset="0"
              opacity="0.45"
              style={{ animation: `${KF_NAME} ${speedMs}ms linear infinite` }}
            />
            {/* strat 2: clar, aproape de cap */}
            <rect
              x={X}
              y={Y}
              width={W}
              height={H}
              rx={R}
              ry={R}
              fill="none"
              stroke={`url(#${FADE_ID})`}
              strokeLinecap="round"
              pathLength="100"
              strokeWidth={width * 1.1}
              strokeDasharray={`${Math.max(5, len - 7)} ${
                100 - Math.max(5, len - 7)
              }`}
              strokeDashoffset="0"
              opacity="0.88"
              style={{ animation: `${KF_NAME} ${speedMs}ms linear infinite` }}
            />
          </mask>
        </defs>

        {/* Stroke real — discret, CCW, mascat (cap + coadă = 1 singură unitate) */}
        <g
          fill="none"
          stroke="currentColor"
          vectorEffect="non-scaling-stroke"
          filter={`url(#${FILTER_ID})`}
          mask={`url(#${MASK_ID})`}
        >
          <rect
            x={X}
            y={Y}
            width={W}
            height={H}
            rx={R}
            ry={R}
            pathLength="100"
            strokeWidth={width}
            strokeOpacity={opacity}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${len} ${gap}`}
            strokeDashoffset="0"
            style={{ animation: `${KF_NAME} ${speedMs}ms linear infinite` }}
          />
        </g>
      </svg>
    </div>
  );
}
