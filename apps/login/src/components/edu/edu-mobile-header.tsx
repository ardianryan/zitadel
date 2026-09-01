"use client";

import { BrandingSettings } from "@zitadel/proto/zitadel/settings/v2/branding_settings_pb";

type Props = {
  appName?: string;
  branding?: BrandingSettings;
};

export function EduMobileHeader({ appName, branding }: Props) {
  const displayApp = appName || "ZITADEL";
  const lightLogo = branding?.lightTheme?.logoUrl;
  const darkLogo = branding?.darkTheme?.logoUrl || lightLogo;

  return (
    <div className="mb-6 flex w-full flex-col items-center text-center select-none lg:hidden">
      <div className="mb-2.5 flex items-center gap-3">
        {lightLogo ? (
          <>
            <img src={lightLogo} alt={displayApp} className="h-11 w-11 rounded-xl object-contain shadow-sm dark:hidden" />
            {darkLogo && (
              <img
                src={darkLogo}
                alt={displayApp}
                className="hidden h-11 w-11 rounded-xl object-contain shadow-sm dark:block"
              />
            )}
          </>
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F91FC] text-lg font-black text-white shadow-sm">
            Z
          </div>
        )}
        <span className="text-2xl font-black tracking-wider text-[#081242] uppercase dark:text-white">{displayApp}</span>
      </div>

      {/* Slogan 2 Baris Aksen Merah #EA4335 Khusus Mobile */}
      <div className="mb-2 space-y-0.5 text-xs font-bold text-slate-700 dark:text-slate-200">
        <p>
          One <span className="font-black text-[#EA4335]">Data</span> ♦ One{" "}
          <span className="font-black text-[#EA4335]">App</span> ♦ One{" "}
          <span className="font-black text-[#EA4335]">Network</span>
        </p>
        <p>
          One <span className="font-black text-[#EA4335]">Platform</span> ♦ One{" "}
          <span className="font-black text-[#EA4335]">Screen</span>
        </p>
      </div>
    </div>
  );
}
