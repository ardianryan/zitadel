import { Alert, AlertType } from "@/components/alert";
import { Button } from "@/components/button";
import { DynamicTheme } from "@/components/dynamic-theme";
import { Translated } from "@/components/translated";
import { resolveLocalizedLegalLink } from "@/lib/legal-links";
import { getServiceConfig } from "@/lib/service-url";
import { getBrandingSettings, getDefaultOrg, getLegalAndSupportSettings, getOrgById } from "@/lib/zitadel";
import { Organization } from "@zitadel/proto/zitadel/org/v2/org_pb";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("idp");
  return { title: t("accountNotFound.title") };
}

export default async function Page(props: { searchParams: Promise<Record<string | number | symbol, string | undefined>> }) {
  const searchParams = await props.searchParams;
  const { organization, postErrorRedirectUrl } = searchParams;

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

  const branding = await getBrandingSettings({ serviceConfig, organization: organization ?? defaultOrganization });
  const legal = await getLegalAndSupportSettings({ serviceConfig, organization: organization ?? defaultOrganization });

  const helpLink = resolveLocalizedLegalLink(legal?.helpLink, locale);
  const supportEmail = legal?.supportEmail;

  return (
    <DynamicTheme branding={branding} orgName={orgName} appName={orgName || "ZITADEL"} legal={legal} bannerPosition="left">
      <div className="flex flex-col space-y-6 text-center sm:text-left">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#081242] sm:text-2xl dark:text-white">
            <Translated i18nKey="accountNotFound.title" namespace="idp" />
          </h1>
          <p className="text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400">
            <Translated i18nKey="accountNotFound.description" namespace="idp" />
          </p>
        </div>

        <div className="w-full">
          <Alert type={AlertType.INFO}>
            <Translated i18nKey="accountNotFound.info" namespace="idp" />
          </Alert>
        </div>

        {/* Support & Action Links */}
        <div className="flex flex-col space-y-3 pt-2">
          {helpLink ? (
            <a
              href={helpLink}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F91FC] px-4 py-3.5 text-center text-xs font-bold text-white shadow-md transition-all hover:bg-[#0866C6] hover:shadow-lg"
            >
              <span><Translated i18nKey="accountNotFound.helpAndVerification" namespace="idp" /></span>
              <span className="text-xs">↗</span>
            </a>
          ) : supportEmail ? (
            <a
              href={`mailto:${supportEmail}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F91FC] px-4 py-3.5 text-center text-xs font-bold text-white shadow-md transition-all hover:bg-[#0866C6] hover:shadow-lg"
            >
              <span>Hubungi Dukungan ({supportEmail})</span>
            </a>
          ) : null}

          <Link href={postErrorRedirectUrl || "/loginname"} className="w-full">
            <Button
              type="button"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 text-center text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Translated i18nKey="accountNotFound.backToLogin" namespace="idp" />
            </Button>
          </Link>
        </div>
      </div>
    </DynamicTheme>
  );
}
