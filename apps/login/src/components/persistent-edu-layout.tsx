"use client";

import { EduBanner } from "@/components/edu/edu-banner";
import { EduMobileHeader } from "@/components/edu/edu-mobile-header";
import { LanguageSwitcher } from "@/components/language-switcher";
import ThemeSwitch from "@/components/theme-switch";
import { ZitadelLogo } from "@/components/zitadel-logo";
import { Lang, LANGS } from "@/lib/i18n";
import { resolveLocalizedLegalLink } from "@/lib/legal-links";
import { BrandingSettings } from "@zitadel/proto/zitadel/settings/v2/branding_settings_pb";
import { LegalAndSupportSettings } from "@zitadel/proto/zitadel/settings/v2/legal_settings_pb";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";
import { ThemeWrapper } from "./theme-wrapper";

type Props = {
  children: ReactNode;
  branding?: BrandingSettings;
  orgName?: string;
  appName?: string;
  legal?: LegalAndSupportSettings;
  allowedLanguages?: Lang[];
};

/**
 * PersistentEduLayout wraps the entire (login) application tree at layout.tsx.
 * Because layout.tsx remains mounted across page transitions in Next.js:
 * - EduBanner & ParticleCanvas NEVER unmount or flicker.
 * - When navigating between Login (/loginname, /password) and Register/Reset (/register, /password/set, /verify):
 *   usePathname() triggers a continuous, hardware-accelerated 700ms cubic-bezier slide across the viewport!
 */
export function PersistentEduLayout({ branding, children, orgName, appName, legal, allowedLanguages }: Props) {
  const locale = useLocale();
  const tEdu = useTranslations("edu");
  const pathname = usePathname() || "";

  // Determine if banner should be on the left (Register / Reset Password / Verification / IDP) or right (Login / Password)
  const isLeftBanner =
    pathname.includes("/register") ||
    pathname.includes("/password/set") ||
    pathname.includes("/password/change") ||
    pathname.includes("/verify") ||
    pathname.includes("/idp/") ||
    pathname.includes("/passkey/set") ||
    pathname.includes("/mfa") ||
    pathname.includes("/u2f/set") ||
    pathname.includes("/authenticator/set");

  const isBannerRight = !isLeftBanner;

  const displayName = orgName || "ZITADEL";
  const displayApp = appName || "ZITADEL";

  const privacyPolicyLink = resolveLocalizedLegalLink(legal?.privacyPolicyLink, locale);
  const tosLink = resolveLocalizedLegalLink(legal?.tosLink, locale);
  const helpLink = resolveLocalizedLegalLink(legal?.helpLink, locale);
  const supportEmail = legal?.supportEmail;

  // Active languages: strictly respect admin allowed languages, falling back to ID & EN
  const activeLangs = React.useMemo(() => {
    if (allowedLanguages && allowedLanguages.length > 0) {
      return allowedLanguages;
    }
    return LANGS.filter((l) => l.code === "id" || l.code === "en");
  }, [allowedLanguages]);

  return (
    <ThemeWrapper branding={branding}>
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white transition-colors dark:bg-slate-900">
        {/* Kotak Biru Edu Banner (Desktop Full-Height) - Continuous SPA sliding transition */}
        <div
          className={`absolute top-0 bottom-0 z-20 hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex lg:w-[calc(50%+4rem)] ${
            isBannerRight ? "left-0 lg:left-1/2" : "left-0 lg:-left-[4rem]"
          }`}
        >
          <EduBanner
            orgName={displayName}
            appName={displayApp}
            branding={branding}
            legal={legal}
            position={isBannerRight ? "right" : "left"}
          />
        </div>

        {/* Form & Interactive Area (sits on Left when banner is Right, sits on Right when banner is Left) */}
        <div
          className={`relative z-10 flex min-h-screen w-full flex-col justify-between px-6 py-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-10 sm:py-8 lg:w-1/2 lg:px-14 lg:py-10 ${
            isBannerRight ? "lg:mr-auto lg:ml-0" : "lg:mr-0 lg:ml-auto"
          }`}
        >
          {/* Top: Mobile Header for < 1024px */}
          <div>
            <EduMobileHeader appName={displayApp} branding={branding} />
          </div>

          {/* Center: Main Form Content */}
          <div className="mx-auto my-auto w-full max-w-md space-y-6 py-6">{children}</div>

          {/* Bottom: Organization External Links & Controls (Language, Theme & Watermark) */}
          <div className="w-full pt-4">
            {(tosLink || privacyPolicyLink || helpLink || supportEmail) && (
              <div className="mb-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-center text-xs text-slate-400 dark:text-slate-500">
                {tosLink && (
                  <a
                    href={tosLink}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-slate-700 hover:underline dark:hover:text-slate-200"
                  >
                    {tEdu("termsOfService")}
                  </a>
                )}
                {privacyPolicyLink && (
                  <a
                    href={privacyPolicyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-slate-700 hover:underline dark:hover:text-slate-200"
                  >
                    {tEdu("privacyPolicy")}
                  </a>
                )}
                {helpLink && (
                  <a href={helpLink} target="_blank" rel="noreferrer" className="font-medium text-[#0F91FC] hover:underline">
                    {tEdu("help")}
                  </a>
                )}
                {supportEmail && (
                  <a
                    href={`mailto:${supportEmail}`}
                    className="transition-colors hover:text-slate-700 hover:underline dark:hover:text-slate-200"
                  >
                    {tEdu("supportEmail")}
                  </a>
                )}
              </div>
            )}

            {/* Language Switcher, Theme Switch & Official ZITADEL Watermark */}
            <div className="flex flex-row items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                <span>
                  {displayName} © {new Date().getFullYear()}
                </span>
                {!branding?.disableWatermark && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <a
                      href="https://zitadel.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 opacity-85 transition-opacity hover:opacity-100"
                    >
                      <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">Powered by</span>
                      <ZitadelLogo height={20} width={75} />
                    </a>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <LanguageSwitcher languages={activeLangs} />
                <ThemeSwitch />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
