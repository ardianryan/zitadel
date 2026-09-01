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
import React, { Children, ReactNode } from "react";
import { ThemeWrapper } from "./theme-wrapper";

type Props = {
  children: ReactNode | ((isSideBySide: boolean) => ReactNode);
  branding?: BrandingSettings;
  orgName?: string;
  appName?: string;
  legal?: LegalAndSupportSettings;
  allowedLanguages?: Lang[];
  bannerPosition?: "left" | "right";
};

/**
 * DynamicTheme renders the authentic Kredensia-SSO Edu-Variant layout:
 * - Login Flow (bannerPosition="right"):
 *   - Form on Left (order-1), Kotak Biru on Right (order-2, rounded-left).
 * - Registration / Forgot Password / Verification (bannerPosition="left"):
 *   - Kotak Biru on Left (order-1, rounded-right), Form on Right (order-2).
 * - Mobile (< 1024px): Full-screen responsive layout with EduMobileHeader.
 */
export function DynamicTheme({
  branding,
  children,
  orgName,
  appName,
  legal,
  allowedLanguages,
  bannerPosition = "right",
}: Props) {
  const locale = useLocale();
  const tEdu = useTranslations("edu");

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

  // Active languages: strictly respect admin allowed languages, falling back to ID & EN
  const activeLangs = React.useMemo(() => {
    if (allowedLanguages && allowedLanguages.length > 0) {
      return allowedLanguages;
    }
    return LANGS.filter((l) => l.code === "id" || l.code === "en");
  }, [allowedLanguages]);

  const childArray = Children.toArray(actualChildren);
  const leftContent = childArray[0] || null;
  const rightContent = childArray[1] || null;
  const hasLeftRightStructure = childArray.length === 2;

  const isBannerRight = bannerPosition === "right";

  return (
    <ThemeWrapper branding={branding}>
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white transition-colors lg:flex-row dark:bg-slate-900">
        {/* Kotak Biru Edu Banner (Desktop Full-Height) */}
        <div
          className={`relative hidden w-full bg-white lg:flex lg:w-1/2 dark:bg-slate-900 ${
            isBannerRight ? "order-2" : "order-1"
          }`}
        >
          <EduBanner
            orgName={displayName}
            appName={displayApp}
            branding={branding}
            legal={legal}
            position={bannerPosition}
          />
        </div>

        {/* Form & Interactive Area */}
        <div
          className={`relative flex min-h-screen w-full flex-col justify-between bg-white px-6 py-6 sm:px-10 sm:py-8 lg:w-1/2 lg:px-14 lg:py-10 dark:bg-slate-900 ${
            isBannerRight ? "order-1" : "order-2"
          }`}
        >
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
