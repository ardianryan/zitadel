"use client";

import { EduBanner } from "@/components/edu/edu-banner";
import { EduMobileHeader } from "@/components/edu/edu-mobile-header";
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
 * DynamicTheme component renders the modern Edu-Variant dual-pane layout:
 * - Desktop (>= 1024px): Left side signature EduBanner with constellation particles and carousel, right side form
 * - Mobile (< 1024px): Clean card layout with EduMobileHeader
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
      <div className="relative mx-auto flex min-h-[calc(100vh-60px)] w-full items-center justify-center p-2 sm:p-6 lg:p-10">
        <div className="flex min-h-[660px] w-full max-w-[1240px] flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-2xl transition-all duration-500 lg:flex-row lg:rounded-[3.5rem] dark:border-slate-800 dark:bg-slate-900">
          {/* Left side: Edu Banner with Constellation particles and carousel (desktop) */}
          <div className="relative hidden w-full p-3 lg:flex lg:w-1/2 lg:p-4">
            <EduBanner orgName={displayName} appName={displayApp} branding={branding} legal={legal} />
          </div>

          {/* Right side: Form Container */}
          <div className="relative flex w-full flex-col justify-between px-6 py-8 sm:px-10 lg:w-1/2 lg:px-14 lg:py-12">
            <div>
              {/* Mobile header visible on <1024px */}
              <EduMobileHeader appName={displayApp} branding={branding} />

              <div className="mx-auto w-full max-w-md space-y-6 pt-2">
                {hasLeftRightStructure ? (
                  <>
                    <div className="space-y-2">{leftContent}</div>
                    <div>{rightContent}</div>
                  </>
                ) : (
                  <div>{actualChildren}</div>
                )}
              </div>
            </div>

            {/* Bottom Footer with External / Legal Links from Organization Settings */}
            {(tosLink || privacyPolicyLink || helpLink || supportEmail) && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-4 text-center text-xs text-slate-400 dark:text-slate-500">
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
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}
