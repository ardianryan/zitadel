"use client";

import { useEffect, useRef } from "react";

/**
 * Komponen Partikel Sintesa Canvas
 * Menampilkan efek partikel melayang dan constellation net khusus di bagian banner biru
 */
export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    const particleCount = Math.min(Math.floor((width * height) / 8000), 65);
    const particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      alpha: number;
      targetAlpha: number;
      alphaSpeed: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.2 + 1.2;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.speedY = -Math.random() * 0.5 - 0.2;
        this.alpha = Math.random() * 0.5 + 0.25;
        this.targetAlpha = this.alpha;
        this.alphaSpeed = Math.random() * 0.01 + 0.005;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Reset when out of bounds
        if (this.y < -10) {
          this.y = height + 10;
          this.x = Math.random() * width;
        }
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;

        // Subtle twinkling animation
        if (Math.abs(this.alpha - this.targetAlpha) < 0.01) {
          this.targetAlpha = Math.random() * 0.6 + 0.2;
        }
        if (this.alpha < this.targetAlpha) {
          this.alpha += this.alphaSpeed;
        } else {
          this.alpha -= this.alphaSpeed;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const connectLines = () => {
      if (!ctx) return;
      const maxDistance = 110;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.22;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      connectLines();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full rounded-[3rem] lg:rounded-[4rem]"
    />
  );
}
