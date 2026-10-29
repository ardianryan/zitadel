import { DynamicTheme } from "@/components/dynamic-theme";
import { ActivationHelpCard } from "@/components/edu/activation-help-card";
import { resolveLocalizedLegalLink } from "@/lib/legal-links";
import { getServiceConfig } from "@/lib/service-url";
import { loadMostRecentSession } from "@/lib/session";
import { getBrandingSettings, getDefaultOrg, getLegalAndSupportSettings, getOrgById } from "@/lib/zitadel";
import { Organization } from "@zitadel/proto/zitadel/org/v2/org_pb";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("activation");
  return { title: t("title") };
}

export default async function Page(props: {
  searchParams: Promise<Record<string | number | symbol, string | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const loginName = searchParams?.loginName;
  const organization = searchParams?.organization;
  const requestId = searchParams?.requestId;

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
  const orgName = activeOrg?.name || "SMAN 1 Gedeg";

  const branding = await getBrandingSettings({
    serviceConfig,
    organization: organization ?? defaultOrganization,
  });
  const legal = await getLegalAndSupportSettings({
    serviceConfig,
    organization: organization ?? defaultOrganization,
  });

  const sessionFactors = loginName
    ? await loadMostRecentSession({
        serviceConfig,
        sessionParams: {
          loginName,
          organization,
        },
      })
    : null;

  const helpLink = resolveLocalizedLegalLink(legal?.helpLink, locale);
  const supportEmail = legal?.supportEmail;

  return (
    <DynamicTheme
      branding={branding}
      orgName={orgName}
      appName={orgName}
      legal={legal}
      bannerPosition="left"
    >
      <ActivationHelpCard
        loginName={loginName}
        displayName={sessionFactors?.factors?.user?.displayName}
        helpLink={helpLink}
        supportEmail={supportEmail}
        orgName={orgName}
        requestId={requestId}
        organization={organization ?? defaultOrganization}
      />
    </DynamicTheme>
  );
}
