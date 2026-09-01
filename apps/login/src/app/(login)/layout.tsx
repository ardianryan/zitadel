import "@/styles/globals.scss";

import { LanguageProvider } from "@/components/language-provider";
import { PersistentEduLayout } from "@/components/persistent-edu-layout";
import { ThemeProvider } from "@/components/theme-provider";
import { getServiceConfig } from "@/lib/service-url";
import { getBrandingSettings, getDefaultOrg, getLegalAndSupportSettings } from "@/lib/zitadel";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { headers } from "next/headers";
import React, { Suspense } from "react";

const lato = Lato({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const _headers = await headers();
  const { serviceConfig } = getServiceConfig(_headers);
  const activeOrg = await getDefaultOrg({ serviceConfig });
  const orgName = activeOrg?.name || "ZITADEL";
  return {
    title: {
      template: `%s | ${orgName}`,
      default: orgName,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const _headers = await headers();
  const { serviceConfig } = getServiceConfig(_headers);
  const activeOrg = await getDefaultOrg({ serviceConfig });
  const orgName = activeOrg?.name || "ZITADEL";
  const defaultOrgId = activeOrg?.id;

  const branding = await getBrandingSettings({ serviceConfig, organization: defaultOrgId });
  const legal = await getLegalAndSupportSettings({ serviceConfig, organization: defaultOrgId });

  return (
    <html className={`${lato.className}`} suppressHydrationWarning>
      <head />
      <body className="min-h-screen w-full bg-white text-slate-900 antialiased transition-colors dark:bg-slate-900 dark:text-slate-100">
        <ThemeProvider>
          <Tooltip.Provider>
            <Suspense fallback={<div className="min-h-screen w-full bg-white dark:bg-slate-900" />}>
              <LanguageProvider>
                <PersistentEduLayout branding={branding} orgName={orgName} appName={orgName} legal={legal}>
                  {children}
                </PersistentEduLayout>
              </LanguageProvider>
            </Suspense>
          </Tooltip.Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
