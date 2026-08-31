"use client";

import { EduBanner } from "@/components/edu/edu-banner";
import { EduMobileHeader } from "@/components/edu/edu-mobile-header";
import { useResponsiveLayout } from "@/lib/theme-hooks";
import { BrandingSettings } from "@zitadel/proto/zitadel/settings/v2/branding_settings_pb";
import { LegalAndSupportSettings } from "@zitadel/proto/zitadel/settings/v2/legal_settings_pb";
import React, { Children, ReactNode } from "react";
import { Card } from "./card";
import { ThemeWrapper } from "./theme-wrapper";

type Props = {
  children: ReactNode | ((isSideBySide: boolean) => ReactNode);
  branding?: BrandingSettings;
  orgName?: string;
  appName?: string;
  legal?: LegalAndSupportSettings;
};

/**
 * DynamicTheme component handles layout switching between traditional top-to-bottom
 * and modern Edu-Variant side-by-side layouts.
 */
export function DynamicTheme({ branding, children, orgName, appName, legal }: Props) {
  const { isSideBySide } = useResponsiveLayout();

  const actualChildren: ReactNode = React.useMemo(() => {
    if (typeof children === "function") {
      return (children as (isSideBySide: boolean) => ReactNode)(isSideBySide);
    }
    return children;
  }, [children, isSideBySide]);

  const displayName = orgName || "ZITADEL";
  const displayApp = appName || "ZITADEL";

  return (
    <ThemeWrapper branding={branding}>
      {isSideBySide
        ? // Side-by-side layout (Edu-Variant Dual-Pane)
          (() => {
            const childArray = Children.toArray(actualChildren);
            const leftContent = childArray[0] || null;
            const rightContent = childArray[1] || null;
            const hasLeftRightStructure = childArray.length === 2;

            return (
              <div className="relative mx-auto w-full max-w-[1280px] px-4 py-4 lg:px-8">
                <div className="flex min-h-[640px] flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl transition-all duration-500 lg:flex-row lg:rounded-[3.5rem] dark:border-slate-800 dark:bg-slate-900">
                  {/* Left side: Edu Banner with Constellation particles and carousel */}
                  <div className="relative hidden w-full p-3 lg:flex lg:w-1/2 lg:p-4">
                    <EduBanner orgName={displayName} appName={displayApp} branding={branding} legal={legal} />
                  </div>

                  {/* Right side: Form Container */}
                  <div className="relative flex w-full flex-col justify-center px-6 py-8 sm:px-10 lg:w-1/2 lg:px-14 lg:py-12">
                    {/* Mobile header visible on <1024px */}
                    <EduMobileHeader appName={displayApp} branding={branding} />

                    <div className="mx-auto w-full max-w-md space-y-6">
                      {hasLeftRightStructure ? (
                        <>
                          <div className="space-y-2">{leftContent}</div>
                          <div>{rightContent}</div>
                        </>
                      ) : (
                        <div>{leftContent}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        : // Top-to-bottom layout
          (() => {
            const childArray = Children.toArray(actualChildren);
            const titleContent = childArray[0] || null;
            const formContent = childArray[1] || null;
            const hasMultipleChildren = childArray.length > 1;

            return (
              <div className="relative mx-auto w-full max-w-[480px] px-4 py-6">
                <Card className="rounded-3xl border border-slate-100 shadow-xl dark:border-slate-800">
                  <div className="mx-auto flex flex-col items-center space-y-6 p-2 sm:p-4">
                    <EduMobileHeader appName={displayApp} branding={branding} />

                    {hasMultipleChildren ? (
                      <>
                        <div className="mb-2 flex w-full flex-col items-center text-center">{titleContent}</div>
                        <div className="w-full">{formContent}</div>
                      </>
                    ) : (
                      <div className="w-full">{actualChildren}</div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })()}
    </ThemeWrapper>
  );
}
