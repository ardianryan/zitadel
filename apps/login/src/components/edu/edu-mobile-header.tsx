"use client";

import { BrandingSettings } from "@zitadel/proto/zitadel/settings/v2/branding_settings_pb";
import { useTranslations } from "next-intl";
import { ParticleCanvas } from "./particle-canvas";

type Props = {
  appName?: string;
  branding?: BrandingSettings;
};

export function EduMobileHeader({ appName, branding }: Props) {
  const displayApp = appName || "ZITADEL";
  const lightLogo = branding?.lightTheme?.logoUrl;
  const t = useTranslations("edu");

  return (
    <div
      className="relative mb-6 w-full overflow-hidden rounded-2xl bg-[#0F91FC] p-4 text-center text-white shadow-[0_10px_25px_-5px_rgba(15,145,252,0.35)] select-none sm:rounded-3xl sm:p-5 lg:hidden"
      style={{
        background: "linear-gradient(135deg, #0F91FC 0%, #0866C6 100%)",
      }}
    >
      {/* Interactive Constellation Particle Canvas in Mobile Header */}
      <ParticleCanvas />

      {/* Header Content */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-2 flex items-center justify-center gap-2.5">
          {lightLogo ? (
            <img src={lightLogo} alt={displayApp} className="h-10 w-10 object-contain drop-shadow-md" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg font-black text-white shadow-inner backdrop-blur-sm">
              Z
            </div>
          )}
          <span className="text-lg font-black tracking-wide text-white uppercase drop-shadow-sm sm:text-xl">
            {displayApp}
          </span>
        </div>

        <span className="text-[10px] font-black tracking-widest text-white/90 uppercase sm:text-xs">
          {t("portalTagline")}
        </span>

        {/* Compact Slogan with Clean White Harmony */}
        <div className="mt-2 space-y-0.5 text-[11px] font-semibold text-white/90 sm:text-xs">
          <p>
            One <span className="font-black text-white">Data</span> ♦ One <span className="font-black text-white">App</span>{" "}
            ♦ One <span className="font-black text-white">Network</span>
          </p>
          <p>
            One <span className="font-black text-white">Platform</span> ♦ One{" "}
            <span className="font-black text-white">Screen</span>
          </p>
        </div>
      </div>
    </div>
  );
}
