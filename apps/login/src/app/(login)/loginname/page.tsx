import { DynamicTheme } from "@/components/dynamic-theme";
import { SignInWithIdp } from "@/components/sign-in-with-idp";
import { UsernameForm } from "@/components/username-form";
import { getLanguage, Lang, LANGS } from "@/lib/i18n";
import { resolveLocalizedLegalLink } from "@/lib/legal-links";
import { getServiceConfig } from "@/lib/service-url";
import {
  getActiveIdentityProviders,
  getAllowedLanguages,
  getBrandingSettings,
  getDefaultOrg,
  getLegalAndSupportSettings,
  getLoginSettings,
  getOrgById,
} from "@/lib/zitadel";
import { Organization } from "@zitadel/proto/zitadel/org/v2/org_pb";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import Link from "next/link";

export async function generateMetadata(props: {
  searchParams: Promise<Record<string | number | symbol, string | undefined>>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const organization = searchParams?.organization;
  const _headers = await headers();
  const { serviceConfig } = getServiceConfig(_headers);

  let activeOrg: Organization | null = null;
  if (organization) {
    activeOrg = await getOrgById({ serviceConfig, orgId: organization });
  }
  if (!activeOrg) {
    activeOrg = await getDefaultOrg({ serviceConfig });
  }

  const orgName = activeOrg?.name;
  const t = await getTranslations("loginname");
  return {
    title: orgName ? `${orgName} - ${t("title")}` : t("title"),
  };
}

export default async function Page(props: { searchParams: Promise<Record<string | number | symbol, string | undefined>> }) {
  const searchParams = await props.searchParams;

  const loginName = searchParams?.loginName;
  const requestId = searchParams?.requestId;
  const organization = searchParams?.organization;
  const orgDomain = searchParams?.orgDomain;
  const submit: boolean = searchParams?.submit === "true";

  const _headers = await headers();
  const { serviceConfig } = getServiceConfig(_headers);
  const locale = await getLocale();

  let activeOrg: Organization | null = null;
  if (organization) {
    activeOrg = await getOrgById({ serviceConfig, orgId: organization });
  }
  if (!activeOrg) {
    activeOrg = await getDefaultOrg({ serviceConfig });
  }

  const defaultOrganization = activeOrg?.id;
  const orgName = activeOrg?.name || "ZITADEL";

  const loginSettings = await getLoginSettings({ serviceConfig, organization: organization ?? defaultOrganization });

  const identityProviders = await getActiveIdentityProviders({
    serviceConfig,
    orgId: organization ?? defaultOrganization,
  }).then((resp) => {
    return resp.identityProviders;
  });

  const branding = await getBrandingSettings({ serviceConfig, organization: organization ?? defaultOrganization });
  const legal = await getLegalAndSupportSettings({ serviceConfig, organization: organization ?? defaultOrganization });

  let allowedLanguages: Lang[] = LANGS.filter((l) => l.code === "id" || l.code === "en");
  try {
    const langSettings = await getAllowedLanguages({ serviceConfig });
    if (langSettings.allowedLanguages?.length) {
      allowedLanguages = langSettings.allowedLanguages.map((code) => getLanguage(code)).filter((l): l is Lang => Boolean(l));
    }
  } catch (e) {
    console.warn("Failed to load allowed languages", e);
  }

  const helpLink = resolveLocalizedLegalLink(legal?.helpLink, locale);

  const hasIdp = loginSettings?.allowExternalIdp && !!identityProviders?.length;
  const hasLocal = loginSettings?.allowLocalAuthentication;

  const tEdu = await getTranslations("edu");

  return (
    <DynamicTheme
      branding={branding}
      orgName={orgName}
      appName={orgName || "ZITADEL"}
      legal={legal}
      allowedLanguages={allowedLanguages}
    >
      <div className="flex flex-col space-y-1.5 text-left">
        <h1 className="text-xl font-black tracking-tight text-[#081242] sm:text-2xl dark:text-white">
          {tEdu("singleSignOnTitle")}
        </h1>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{tEdu("singleSignOnSubtitle")}</p>
      </div>

      <div className="w-full space-y-5 text-left">
        {/* Dynamic IDP Login (Google, Azure AD, SAML, etc. from ZITADEL) */}
        {hasIdp && (
          <div className="w-full space-y-3">
            <SignInWithIdp
              identityProviders={identityProviders}
              requestId={requestId}
              organization={organization}
              postErrorRedirectUrl="/loginname"
              showLabel={false}
            />

            {/* Quick helper links resolved dynamically from ZITADEL settings */}
            <div className="flex items-center justify-center gap-3 py-1 text-xs font-semibold text-slate-500 select-none dark:text-slate-400">
              {helpLink && (
                <>
                  <a href={helpLink} target="_blank" rel="noreferrer" className="transition-colors hover:text-[#0F91FC]">
                    {tEdu("helpAndVerification")}
                  </a>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                </>
              )}
              {loginSettings?.allowRegister && (
                <Link href="/register" className="transition-colors hover:text-[#0F91FC]">
                  {tEdu("registerNewAccount")}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Divider if both IDP and Local Auth exist */}
        {hasIdp && hasLocal && (
          <div className="relative flex items-center justify-center py-2 select-none">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            <span className="absolute bg-white px-3 text-[11px] font-semibold text-slate-400 dark:bg-slate-900 dark:text-slate-500">
              {tEdu("orSignInWithEmail")}
            </span>
          </div>
        )}

        {/* Local Username Form */}
        {hasLocal && (
          <UsernameForm
            loginName={loginName}
            requestId={requestId}
            organization={organization}
            defaultOrganization={defaultOrganization}
            loginSettings={loginSettings}
            suffix={orgDomain}
            hideSuffix={branding?.hideLoginNameSuffix}
            submit={submit}
            allowRegister={!!loginSettings?.allowRegister}
          />
        )}
      </div>
    </DynamicTheme>
  );
}
