"use client";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { hashString } from "../lib/mock/chart";

const PLANET_SYMBOLS = ["Su", "Mo", "Ma", "Me", "Ju", "Ve", "Sa", "Ra", "Ke"];
const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 130;

function planetPositions(birthDetails) {
  const key = `${birthDetails?.date || ""}|${birthDetails?.time || ""}|${birthDetails?.place?.name || ""}`;
  const h = hashString(key || "default");
  return PLANET_SYMBOLS.map((symbol, i) => {
    const angle = (((h >> (i * 2)) % 360) * Math.PI) / 180;
    const r = RADIUS - 28;
    return {
      symbol,
      x: CENTER + r * Math.cos(angle),
      y: CENTER + r * Math.sin(angle),
    };
  });
}

function houseLineEndpoints() {
  const lines = [];
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 * Math.PI) / 180;
    lines.push({
      x1: CENTER,
      y1: CENTER,
      x2: CENTER + RADIUS * Math.cos(angle),
      y2: CENTER + RADIUS * Math.sin(angle),
    });
  }
  return lines;
}

export function ChartWheel({ birthDetails, chartReady, onDone, onSkip, t }) {
  const circleRef = useRef(null);
  const groupRef = useRef(null);
  const linesRef = useRef([]);
  const planetsRef = useRef([]);
  const [reduced, setReduced] = useState(false);
  const introDoneRef = useRef(false);
  const chartReadyRef = useRef(chartReady);
  const planets = planetPositions(birthDetails);
  const lines = houseLineEndpoints();
  const circumference = 2 * Math.PI * RADIUS;

  useGSAP(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(prefersReduced);
    if (prefersReduced) {
      onDone();
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        introDoneRef.current = true;
        if (chartReadyRef.current) {
          onDone();
        } else {
          gsap.to(groupRef.current, { rotate: 360, duration: 8, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
        }
      },
    });

    tl.fromTo(circleRef.current, { strokeDashoffset: circumference }, { strokeDashoffset: 0, duration: 1 });
    tl.fromTo(
      linesRef.current,
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, transformOrigin: "50% 50%" },
      "-=0.2",
    );
    tl.fromTo(
      planetsRef.current,
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 0.5, stagger: 0.07 },
      "-=0.3",
    );

    return () => {
      tl.kill();
    };
     
  }, []);

  // Once chart data arrives, stop any idle rotation and finish. If the
  // intro animation already completed (we're mid-rotation), move on now;
  // otherwise the timeline's own onComplete above will call onDone.
  useGSAP(() => {
    chartReadyRef.current = chartReady;
    if (chartReady && groupRef.current) {
      gsap.killTweensOf(groupRef.current);
      gsap.set(groupRef.current, { rotate: 0 });
      if (introDoneRef.current) onDone();
    }
  }, [chartReady]);

  if (reduced) return null;

  return (
    <div className="flex flex-col items-center gap-6">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-64 h-64" role="img" aria-label="Drawing your birth chart">
        <g ref={groupRef}>
          <circle
            ref={circleRef}
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeDasharray={circumference}
          />
          {lines.map((l, i) => (
            <line
              key={i}
              ref={(el) => (linesRef.current[i] = el)}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
          ))}
        </g>
        {planets.map((p, i) => (
          <text
            key={p.symbol}
            ref={(el) => (planetsRef.current[i] = el)}
            x={p.x}
            y={p.y}
            fill="var(--color-fg)"
            fontSize="14"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {p.symbol}
          </text>
        ))}
      </svg>
      <button type="button" onClick={onSkip} className="text-base underline text-fg-muted">
        {t("skip")}
      </button>
    </div>
  );
}
