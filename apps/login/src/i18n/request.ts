import { LANGS, LANGUAGE_COOKIE_NAME, LANGUAGE_HEADER_NAME } from "@/lib/i18n";
import { getServiceConfig } from "@/lib/service-url";
import { getAllowedLanguages, getHostedLoginTranslation } from "@/lib/zitadel";
import { JsonObject } from "@zitadel/client";
import deepmerge from "deepmerge";
import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export default getRequestConfig(async () => {
  const fallback = "id";
  const cookiesList = await cookies();

  const _headers = await headers();
  const { serviceConfig } = getServiceConfig(_headers);

  let allowedLanguages = LANGS.map((l) => l.code);
  let defaultLanguage = fallback;

  try {
    const settings = await getAllowedLanguages({ serviceConfig });
    if (settings.allowedLanguages?.length) {
      const localLanguageCodes = LANGS.map((l) => l.code);
      allowedLanguages = settings.allowedLanguages.filter((l) => localLanguageCodes.includes(l));
    }
    if (settings.defaultLanguage) {
      defaultLanguage = settings.defaultLanguage;
    }
  } catch (e) {
    console.warn("Failed to load global settings", e);
  }

  // Priority 1: User's explicit cookie selection (if within allowed languages)
  // Priority 2: Admin-configured default language from ZITADEL settings
  // Priority 3: Accept-Language header (only if matches allowed languages)
  // Priority 4: Fallback ("id")
  let locale: string = defaultLanguage;

  const languageCookie = cookiesList?.get(LANGUAGE_COOKIE_NAME);
  if (languageCookie && languageCookie.value && allowedLanguages.includes(languageCookie.value)) {
    locale = languageCookie.value;
  } else if (defaultLanguage && allowedLanguages.includes(defaultLanguage)) {
    locale = defaultLanguage;
  } else {
    const languageHeader = await (await headers()).get(LANGUAGE_HEADER_NAME);
    if (languageHeader) {
      const headerLocale = languageHeader.split(",")[0].split("-")[0];
      if (allowedLanguages.includes(headerLocale)) {
        locale = headerLocale;
      }
    }
  }

  const i18nOrganization = _headers.get("x-zitadel-i18n-organization") || "";

  let translations: JsonObject | Record<string, never> = {};
  try {
    const i18nJSON = await getHostedLoginTranslation({
      serviceConfig,
      locale,
      organization: i18nOrganization,
    });

    if (i18nJSON) {
      translations = i18nJSON;
    }
  } catch (error) {
    console.warn("Error fetching custom translations:", error);
  }

  const customMessages = translations;

  // Load locale messages, fall back to default language messages if locale not found
  let localeMessages;
  try {
    localeMessages = (await import(`../../locales/${locale}.json`)).default;
  } catch {
    try {
      localeMessages = (await import(`../../locales/${defaultLanguage}.json`)).default;
    } catch {
      localeMessages = (await import(`../../locales/${fallback}.json`)).default;
    }
  }

  const fallbackMessages = (await import(`../../locales/${fallback}.json`)).default;

  return {
    locale,
    messages: deepmerge.all([fallbackMessages, localeMessages, customMessages]) as Record<string, string>,
  };
});
