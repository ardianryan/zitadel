"use client";

import { resolveLocalizedLegalLink } from "@/lib/legal-links";
import { BrandingSettings } from "@zitadel/proto/zitadel/settings/v2/branding_settings_pb";
import { LegalAndSupportSettings } from "@zitadel/proto/zitadel/settings/v2/legal_settings_pb";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ParticleCanvas } from "./particle-canvas";

const DEFAULT_SLIDES = [
  {
    src: "/images/edu/login-1.png",
    alt: "Layanan Akses Terpadu",
  },
  {
    src: "/images/edu/login-2.png",
    alt: "Keamanan Identitas Digital",
  },
  {
    src: "/images/edu/login-3.png",
    alt: "Ekosistem Pendidikan & Organisasi",
  },
];

type Props = {
  orgName?: string;
  appName?: string;
  branding?: BrandingSettings;
  legal?: LegalAndSupportSettings;
  className?: string;
};

export function EduBanner({ orgName, appName, branding, legal, className = "" }: Props) {
  const locale = useLocale();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % DEFAULT_SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const displayName = orgName || "ZITADEL";
  const displayApp = appName || "ZITADEL";

  const privacyPolicyLink = resolveLocalizedLegalLink(legal?.privacyPolicyLink, locale);
  const tosLink = resolveLocalizedLegalLink(legal?.tosLink, locale);

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-[3rem] p-6 text-center text-white select-none lg:rounded-[4rem] lg:p-12 ${className}`}
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
      <div className="relative z-10 my-auto flex h-[38vh] w-full max-w-sm items-center justify-center py-4">
        {DEFAULT_SLIDES.map((slide, idx) => (
          <div
            key={slide.src}
            className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${
              currentSlide === idx ? "scale-100 transform opacity-100" : "pointer-events-none scale-95 transform opacity-0"
            }`}
          >
            <img src={slide.src} alt={slide.alt} className="max-h-[36vh] w-auto object-contain drop-shadow-2xl" />
          </div>
        ))}
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center space-y-3 pb-2 text-center">
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

        {/* Organization Name & Legal Links */}
        <p className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold tracking-wider text-white/90 uppercase sm:text-[11px]">
          <span>{displayName}</span>
          {privacyPolicyLink ? (
            <>
              <span className="text-white/50">|</span>
              <Link
                href={privacyPolicyLink}
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer transition-all hover:text-white hover:underline"
              >
                Privacy Policy
              </Link>
            </>
          ) : null}
          {tosLink ? (
            <>
              <span className="text-white/50">|</span>
              <Link
                href={tosLink}
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer transition-all hover:text-white hover:underline"
              >
                Terms of Service
              </Link>
            </>
          ) : null}
        </p>

        {/* Slider Indicator Dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {DEFAULT_SLIDES.map((_, idx) => (
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
