"use client";

import { EduBanner } from "@/components/edu/edu-banner";
import { EduMobileHeader } from "@/components/edu/edu-mobile-header";
import { LanguageSwitcher } from "@/components/language-switcher";
import ThemeSwitch from "@/components/theme-switch";
import { LANGS } from "@/lib/i18n";
import { resolveLocalizedLegalLink } from "@/lib/legal-links";
import { BrandingSettings } from "@zitadel/proto/zitadel/settings/v2/branding_settings_pb";
import { LegalAndSupportSettings } from "@zitadel/proto/zitadel/settings/v2/legal_settings_pb";
import { useLocale } from "next-intl";
import React, { Children, ReactNode } from "react";
import { ThemeWrapper } from "./theme-wrapper";

type Props = {
  children: ReactNode | ((isSideBySide: boolean) => ReactNode);
  branding?: BrandingSettings;
  orgName?: string;
  appName?: string;
  legal?: LegalAndSupportSettings;
};

/**
 * DynamicTheme renders the true Kredensia-SSO Edu-Variant layout:
 * - Desktop (>= 1024px): Fullscreen 50/50 dual pane.
 *   - Left: Full-height signature Kotak Biru with constellation net, floating carousel & slogan.
 *   - Right: Full-height clean form container with footer & controls.
 * - Mobile (< 1024px): Full-screen responsive layout with EduMobileHeader.
 */
export function DynamicTheme({ branding, children, orgName, appName, legal }: Props) {
  const locale = useLocale();

  const actualChildren: ReactNode = React.useMemo(() => {
    if (typeof children === "function") {
      return (children as (isSideBySide: boolean) => ReactNode)(true);
    }
    return children;
  }, [children]);

  const displayName = orgName || "ZITADEL";
  const displayApp = appName || "ZITADEL";

  const privacyPolicyLink = resolveLocalizedLegalLink(legal?.privacyPolicyLink, locale);
  const tosLink = resolveLocalizedLegalLink(legal?.tosLink, locale);
  const helpLink = resolveLocalizedLegalLink(legal?.helpLink, locale);
  const supportEmail = legal?.supportEmail;

  const childArray = Children.toArray(actualChildren);
  const leftContent = childArray[0] || null;
  const rightContent = childArray[1] || null;
  const hasLeftRightStructure = childArray.length === 2;

  return (
    <ThemeWrapper branding={branding}>
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white transition-colors lg:flex-row dark:bg-slate-900">
        {/* Left Pane: Kotak Biru Edu Banner (Desktop Full-Height) */}
        <div className="relative hidden w-full lg:flex lg:w-1/2">
          <EduBanner orgName={displayName} appName={displayApp} branding={branding} legal={legal} />
        </div>

        {/* Right Pane: Form & Interactive Area */}
        <div className="relative flex min-h-screen w-full flex-col justify-between bg-white px-6 py-6 sm:px-10 sm:py-8 lg:w-1/2 lg:px-14 lg:py-10 dark:bg-slate-900">
          {/* Top: Mobile Header for < 1024px */}
          <div>
            <EduMobileHeader appName={displayApp} branding={branding} />
          </div>

          {/* Center: Main Form Content */}
          <div className="mx-auto my-auto w-full max-w-md space-y-6 py-6">
            {hasLeftRightStructure ? (
              <>
                <div className="space-y-2">{leftContent}</div>
                <div>{rightContent}</div>
              </>
            ) : (
              <div>{actualChildren}</div>
            )}
          </div>

          {/* Bottom: Organization External Links & Controls (Language & Theme) */}
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
                    Ketentuan Layanan
                  </a>
                )}
                {privacyPolicyLink && (
                  <a
                    href={privacyPolicyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-slate-700 hover:underline dark:hover:text-slate-200"
                  >
                    Kebijakan Privasi
                  </a>
                )}
                {helpLink && (
                  <a href={helpLink} target="_blank" rel="noreferrer" className="font-medium text-[#0F91FC] hover:underline">
                    Bantuan
                  </a>
                )}
                {supportEmail && (
                  <a
                    href={`mailto:${supportEmail}`}
                    className="transition-colors hover:text-slate-700 hover:underline dark:hover:text-slate-200"
                  >
                    Email Dukungan
                  </a>
                )}
              </div>
            )}

            {/* Language Switcher & Dark/Light Mode Switch */}
            <div className="flex flex-row items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                {displayName} © {new Date().getFullYear()}
              </span>
              <div className="flex items-center gap-3">
                <LanguageSwitcher languages={LANGS} />
                <ThemeSwitch />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
