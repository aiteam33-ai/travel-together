"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  phase: number;
  opacity: number;
}

const COUNT = 46;

// Ambient drifting golden dust over the hero video — pure canvas, no extra
// dependency (tsParticles et al. are overkill for ~45 soft dots). Skipped
// entirely under prefers-reduced-motion, same as the other welcome motion.
export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles: Particle[] = [];
    let raf = 0;

    function seed() {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.6 + Math.random() * 1.8,
        speed: 6 + Math.random() * 14,
        drift: (Math.random() - 0.5) * 10,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.15 + Math.random() * 0.35,
      }));
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width;
      canvas!.height = height;
      seed();
    }

    resize();
    window.addEventListener("resize", resize);

    let last = performance.now();
    function tick(now: number) {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.phase += dt * 0.6;
        p.y -= p.speed * dt;
        p.x += Math.sin(p.phase) * p.drift * dt;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 230, 190, ${p.opacity})`;
        ctx!.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
      aria-hidden="true"
    />
  );
}
