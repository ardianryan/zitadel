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
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth / 2 || 600);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight || 800);

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
        this.size = Math.random() * 2.5 + 1.2;
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.speedY = -Math.random() * 0.5 - 0.2;
        this.alpha = Math.random() * 0.55 + 0.3;
        this.targetAlpha = this.alpha;
        this.alphaSpeed = Math.random() * 0.012 + 0.006;
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
          this.targetAlpha = Math.random() * 0.65 + 0.25;
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
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const initParticles = () => {
      particles.length = 0;
      const count = Math.min(Math.max(Math.floor((width * height) / 7000), 45), 85);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      const newWidth = canvas.parentElement?.offsetWidth || window.innerWidth / 2 || 600;
      const newHeight = canvas.parentElement?.offsetHeight || window.innerHeight || 800;
      if (newWidth > 0 && newHeight > 0 && (newWidth !== width || newHeight !== height)) {
        width = canvas.width = newWidth;
        height = canvas.height = newHeight;
        initParticles();
      }
    };

    // Initial particle creation
    initParticles();

    // Use ResizeObserver for instant responsive resize detection
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && canvas.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(canvas.parentElement);
    } else {
      window.addEventListener("resize", handleResize);
    }

    const connectLines = () => {
      if (!ctx) return;
      const maxDistance = 120;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.28;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 0.8;
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
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", handleResize);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      style={{ display: "block" }}
    />
  );
}
