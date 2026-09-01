"use client";

import { BrandingSettings } from "@zitadel/proto/zitadel/settings/v2/branding_settings_pb";
import { useTranslations } from "next-intl";

type Props = {
  appName?: string;
  branding?: BrandingSettings;
};

/**
 * Clean & Minimalist Mobile Header for < 1024px
 * Uses clean typography, crisp organization logo, and vibrant #0F91FC blue accents.
 */
export function EduMobileHeader({ appName, branding }: Props) {
  const displayApp = appName || "ZITADEL";
  const lightLogo = branding?.lightTheme?.logoUrl;
  const darkLogo = branding?.darkTheme?.logoUrl || lightLogo;
  const t = useTranslations("edu");

  return (
    <div className="mb-6 flex w-full flex-col items-center text-center select-none lg:hidden">
      {/* Organization Logo & Name */}
      <div className="mb-1.5 flex items-center justify-center gap-3">
        {lightLogo ? (
          <>
            <img src={lightLogo} alt={displayApp} className="h-10 w-10 object-contain drop-shadow-sm dark:hidden" />
            {darkLogo && (
              <img src={darkLogo} alt={displayApp} className="hidden h-10 w-10 object-contain drop-shadow-sm dark:block" />
            )}
          </>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F91FC] text-base font-black text-white shadow-sm">
            Z
          </div>
        )}
        <h1 className="text-xl font-extrabold tracking-tight text-[#081242] uppercase dark:text-white">{displayApp}</h1>
      </div>

      {/* Subtle Portal Sub-tagline */}
      <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
        {t("portalTagline")}
      </span>

      {/* Slogan with Refined Edu Blue #0F91FC Accents */}
      <div className="mt-2 space-y-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <p>
          One <span className="font-extrabold text-[#0F91FC]">Data</span> ♦ One{" "}
          <span className="font-extrabold text-[#0F91FC]">App</span> ♦ One{" "}
          <span className="font-extrabold text-[#0F91FC]">Network</span>
        </p>
        <p>
          One <span className="font-extrabold text-[#0F91FC]">Platform</span> ♦ One{" "}
          <span className="font-extrabold text-[#0F91FC]">Screen</span>
        </p>
      </div>
    </div>
  );
}
