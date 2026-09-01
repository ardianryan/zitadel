"use client";

import { setTheme } from "@/helpers/colors";
import { BrandingSettings, ThemeMode } from "@zitadel/proto/zitadel/settings/v2/branding_settings_pb";
import { useTheme } from "next-themes";
import { ReactNode, useEffect, useLayoutEffect } from "react";
import { setThemeMode } from "./branding-context";

type Props = {
  branding: BrandingSettings | undefined;
  children: ReactNode;
};

export const ThemeWrapper = ({ children, branding }: Props) => {
  const { setTheme: setNextTheme } = useTheme();

  useEffect(() => {
    setTheme(document, branding);
  }, [branding]);

  // Dynamically update favicon from ZITADEL branding settings
  useEffect(() => {
    const iconUrl = branding?.lightTheme?.iconUrl || branding?.darkTheme?.iconUrl || branding?.lightTheme?.logoUrl;
    if (iconUrl) {
      const existingIcons = document.querySelectorAll(
        "link[rel*='icon'], link[rel='apple-touch-icon'], link[rel='shortcut icon']",
      );
      if (existingIcons.length > 0) {
        existingIcons.forEach((el) => {
          (el as HTMLLinkElement).href = iconUrl;
        });
      } else {
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = iconUrl;
        document.head.appendChild(link);
      }
    }
  }, [branding]);

  // Apply custom font from branding settings before paint to avoid FOUC.
  useLayoutEffect(() => {
    const STYLE_ID = "zitadel-custom-font";

    if (branding?.fontUrl) {
      let fontSrc: string;
      try {
        fontSrc = new URL(branding.fontUrl).href;
      } catch {
        // Malformed URL — skip custom font
        return;
      }

      let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = STYLE_ID;
        document.head.appendChild(styleEl);
      }
      const existingFont = getComputedStyle(document.documentElement).fontFamily || "sans-serif";
      const fontStack = `'ZitadelCustomFont', ${existingFont}`;

      styleEl.textContent = `
        @font-face {
          font-family: 'ZitadelCustomFont';
          font-style: normal;
          font-display: swap;
          src: url('${fontSrc}');
        }
      `;

      document.documentElement.style.setProperty("--zitadel-font-family", fontStack);
      document.documentElement.style.setProperty("font-family", fontStack);
    }
  }, [branding?.fontUrl]);

  // Only force theme if admin strictly enforces DARK or LIGHT in branding policy.
  // If AUTO or UNSPECIFIED, let the user's manual selection in next-themes persist.
  useEffect(() => {
    if (!branding) {
      return;
    }

    if (branding.themeMode === ThemeMode.DARK) {
      setNextTheme("dark");
    } else if (branding.themeMode === ThemeMode.LIGHT) {
      setNextTheme("light");
    }
  }, [branding, setNextTheme]);

  useEffect(() => {
    setThemeMode(branding?.themeMode);
  }, [branding?.themeMode]);

  return <>{children}</>;
};
