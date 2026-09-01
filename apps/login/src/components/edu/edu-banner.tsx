"use client";

import { BrandingSettings } from "@zitadel/proto/zitadel/settings/v2/branding_settings_pb";
import { LegalAndSupportSettings } from "@zitadel/proto/zitadel/settings/v2/legal_settings_pb";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { EDU_SLIDES } from "./edu-assets";
import { ParticleCanvas } from "./particle-canvas";

type Props = {
  orgName?: string;
  appName?: string;
  branding?: BrandingSettings;
  legal?: LegalAndSupportSettings;
  position?: "left" | "right";
  className?: string;
};

export function EduBanner({ orgName, appName: _appName, branding, position = "right", className = "" }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const t = useTranslations("edu");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % EDU_SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const displayName = orgName || "ZITADEL";

  const roundedClasses =
    position === "left"
      ? "lg:rounded-r-[4rem] shadow-[25px_0_50px_-15px_rgba(0,0,0,0.25)]"
      : "lg:rounded-l-[4rem] shadow-[-25px_0_50px_-15px_rgba(0,0,0,0.25)]";

  return (
    <div
      className={`relative flex min-h-screen w-full flex-col items-center justify-between overflow-hidden bg-[#0F91FC] p-8 text-center text-white transition-all duration-700 select-none lg:p-12 dark:bg-slate-950 ${roundedClasses} ${className}`}
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
        <span className="text-xs font-black tracking-widest text-white/90 uppercase">{t("portalTagline")}</span>
      </div>

      {/* Center Illustration with smooth transition */}
      <div className="relative z-10 my-auto flex h-[42vh] w-full max-w-sm items-center justify-center py-4">
        {EDU_SLIDES.map((slide, idx) => (
          <div
            key={slide.alt}
            className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${
              idx === currentSlide
                ? "animate-particle pointer-events-auto scale-100 opacity-100"
                : "pointer-events-none scale-95 opacity-0"
            }`}
          >
            <img src={slide.src} alt={slide.alt} className="max-h-[38vh] w-auto object-contain drop-shadow-2xl" />
          </div>
        ))}
      </div>

      {/* Bottom Slogan & Indicators */}
      <div className="relative z-10 flex w-full flex-col items-center space-y-3 pb-2">
        <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          {t("welcome", { orgName: displayName })}
        </h2>
        <div className="text-xs font-semibold text-white/90 sm:text-sm">
          <p>
            One <span className="font-black text-white">Data</span> ♦ One <span className="font-black text-white">App</span>{" "}
            ♦ One <span className="font-black text-white">Network</span>
          </p>
          <p>
            One <span className="font-black text-white">Platform</span> ♦ One{" "}
            <span className="font-black text-white">Screen</span>
          </p>
        </div>

        {/* Slide Dots Indicator */}
        <div className="flex gap-2 pt-2">
          {EDU_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
