const LANGUAGE_PLACEHOLDER = "{{.Lang}}";

export function resolveLocalizedLegalLink(link: string | undefined, locale: string | undefined): string | undefined {
  if (!link) {
    return undefined;
  }

  const resolved = locale ? link.replaceAll(LANGUAGE_PLACEHOLDER, locale) : link;
  const trimmed = resolved.trim();

  // Security guardrail: Only permit http, https, mailto, or relative URLs.
  // Rejects unsafe schemes like javascript:, data:, vbscript:.
  if (/^(?:https?:\/\/|\/|mailto:)/i.test(trimmed)) {
    return trimmed;
  }

  return undefined;
}
