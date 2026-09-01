"use client";

import { BrandingSettings } from "@zitadel/proto/zitadel/settings/v2/branding_settings_pb";
import { LegalAndSupportSettings } from "@zitadel/proto/zitadel/settings/v2/legal_settings_pb";
import { useEffect, useState } from "react";
import { EDU_SLIDES } from "./edu-assets";
import { ParticleCanvas } from "./particle-canvas";

type Props = {
  orgName?: string;
  appName?: string;
  branding?: BrandingSettings;
  legal?: LegalAndSupportSettings;
  className?: string;
};

export function EduBanner({ orgName, appName, branding, className = "" }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % EDU_SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const displayName = orgName || "ZITADEL";
  const displayApp = appName || "ZITADEL";

  return (
    <div
      className={`relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden bg-[#0F91FC] p-8 text-center text-white shadow-[25px_0_50px_-15px_rgba(0,0,0,0.25)] select-none lg:rounded-r-[4rem] lg:p-12 dark:bg-slate-950 ${className}`}
      style={{
        background: "linear-gradient(135deg, #0F91FC 0%, #0866C6 100%)",
      }}
    >
      {/* Interactive Constellation Particle Canvas */}
      <ParticleCanvas />

      {/* Top Header inside Banner */}
      <div className="relative z-10 flex w-full flex-col items-center pt-2">
        {branding?.lightTheme?.logoUrl ? (
          <div className="mb-2 flex h-14 w-auto items-center justify-center">
            <img
              src={branding.lightTheme.logoUrl}
              alt={displayName}
              className="max-h-12 w-auto object-contain drop-shadow-md"
            />
          </div>
        ) : null}
        <span className="text-xs font-black tracking-widest text-white/90 uppercase">PORTAL LAYANAN IDENTITAS TERPADU</span>
      </div>

      {/* Center Illustration with smooth transition */}
      <div className="relative z-10 my-auto flex h-[42vh] w-full max-w-sm items-center justify-center py-4">
        {EDU_SLIDES.map((slide, idx) => (
          <div
            key={slide.alt}
            className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${
              currentSlide === idx ? "scale-100 transform opacity-100" : "pointer-events-none scale-95 transform opacity-0"
            }`}
          >
            <img src={slide.src} alt={slide.alt} className="max-h-[38vh] w-auto object-contain drop-shadow-2xl" />
          </div>
        ))}
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center space-y-3 pb-4 text-center">
        <h2 className="text-2xl font-black tracking-tight text-white lg:text-3xl">Selamat Datang di {displayApp}</h2>

        {/* 2-line Slogan */}
        <div className="space-y-0.5 text-xs font-semibold text-white/95 sm:text-sm">
          <p>
            One <span className="font-extrabold text-white">Data</span> ♦ One{" "}
            <span className="font-extrabold text-white">App</span> ♦ One{" "}
            <span className="font-extrabold text-white">Network</span>
          </p>
          <p>
            One <span className="font-extrabold text-white">Platform</span> ♦ One{" "}
            <span className="font-extrabold text-white">Screen</span>
          </p>
        </div>

        {/* Slider Indicator Dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {EDU_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? "w-7 bg-white shadow-sm" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
