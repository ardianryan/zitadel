"use client";

import { Lang } from "@/lib/i18n";
import { BrandingSettings } from "@zitadel/proto/zitadel/settings/v2/branding_settings_pb";
import { LegalAndSupportSettings } from "@zitadel/proto/zitadel/settings/v2/legal_settings_pb";
import React, { Children, ReactNode } from "react";

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
 * DynamicTheme acts as the form content wrapper for individual pages.
 * The persistent outer Edu-Variant layout (Kotak Biru & controls) is maintained at RootLayout level,
 * ensuring seamless 700ms sliding animation across SPA page transitions.
 */
export function DynamicTheme({ children }: Props) {
  const actualChildren: ReactNode = React.useMemo(() => {
    if (typeof children === "function") {
      return (children as (isSideBySide: boolean) => ReactNode)(true);
    }
    return children;
  }, [children]);

  const childArray = Children.toArray(actualChildren);
  const leftContent = childArray[0] || null;
  const rightContent = childArray[1] || null;
  const hasLeftRightStructure = childArray.length === 2;

  if (hasLeftRightStructure) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">{leftContent}</div>
        <div>{rightContent}</div>
      </div>
    );
  }

  return <div className="space-y-6">{actualChildren}</div>;
}
