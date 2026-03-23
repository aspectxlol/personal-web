"use client";

import React, { useRef, useEffect } from "react";

const STAR_COUNT = 120;
const STAR_COLOR = "rgba(255,255,255,0.85)";
const STAR_SIZE = 1.2;
const STAR_SPEED = 0.15;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

interface Star {
  x: number;
  y: number;
  z: number;
  angle: number;
  speed: number;
}

function createStar(width: number, height: number): Star {
  const angle = Math.random() * 2 * Math.PI;
  const radius = randomBetween(0.2, 1);
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    z: radius,
    angle,
    speed: randomBetween(0.5, 1.5) * STAR_SPEED,
  };
}

const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const stars = useRef<Star[]>([]);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    stars.current = Array.from({ length: STAR_COUNT }, () => createStar(width, height));

    function handleResize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      stars.current = Array.from({ length: STAR_COUNT }, () => createStar(width, height));
    }
    window.addEventListener("resize", handleResize);

    function handleMouse(e: MouseEvent) {
      mouse.current.x = e.clientX / width - 0.5;
      mouse.current.y = e.clientY / height - 0.5;
    }
    window.addEventListener("mousemove", handleMouse);

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      for (let star of stars.current) {
        // Move star
        star.x += Math.cos(star.angle) * star.speed + mouse.current.x * 2 * star.z;
        star.y += Math.sin(star.angle) * star.speed + mouse.current.y * 2 * star.z;
        // Wrap around
        if (star.x < 0 || star.x > width || star.y < 0 || star.y > height) {
          Object.assign(star, createStar(width, height));
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, STAR_SIZE * star.z, 0, 2 * Math.PI);
        ctx.fillStyle = STAR_COLOR;
        ctx.shadowColor = STAR_COLOR;
        ctx.shadowBlur = 6 * star.z;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      animationRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ display: "block" }}
      aria-hidden="true"
    />
  );
};

export default Starfield;
