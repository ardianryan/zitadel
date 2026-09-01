import "@/styles/globals.scss";

import { LanguageProvider } from "@/components/language-provider";
import { ThemeProvider } from "@/components/theme-provider";
import * as Tooltip from "@radix-ui/react-tooltip";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Lato } from "next/font/google";
import React, { Suspense } from "react";

const lato = Lato({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");
  return { title: t("title") };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${lato.className}`} suppressHydrationWarning>
      <head />
      <body className="min-h-screen w-full bg-white text-slate-900 antialiased transition-colors dark:bg-slate-900 dark:text-slate-100">
        <ThemeProvider>
          <Tooltip.Provider>
            <Suspense fallback={<div className="min-h-screen w-full bg-white dark:bg-slate-900" />}>
              <LanguageProvider>
                <div className="relative flex min-h-screen w-full flex-col bg-white transition-colors dark:bg-slate-900">
                  {children}
                </div>
              </LanguageProvider>
            </Suspense>
          </Tooltip.Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
