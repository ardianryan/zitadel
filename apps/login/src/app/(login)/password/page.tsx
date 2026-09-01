import { Alert } from "@/components/alert";
import { DynamicTheme } from "@/components/dynamic-theme";
import { PasswordForm } from "@/components/password-form";
import { Translated } from "@/components/translated";
import { UserAvatar } from "@/components/user-avatar";
import { getServiceConfig } from "@/lib/service-url";
import { loadMostRecentSession } from "@/lib/session";
import { getBrandingSettings, getDefaultOrg, getLegalAndSupportSettings, getLoginSettings, getOrgById } from "@/lib/zitadel";
import { Organization } from "@zitadel/proto/zitadel/org/v2/org_pb";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("password");
  return { title: t("verify.title") };
}

export default async function Page(props: { searchParams: Promise<Record<string | number | symbol, string | undefined>> }) {
  const searchParams = await props.searchParams;
  let { loginName, organization, requestId } = searchParams;

  const _headers = await headers();
  const { serviceConfig } = getServiceConfig(_headers);

  let activeOrg: Organization | null = null;
  if (organization) {
    activeOrg = await getOrgById({ serviceConfig, orgId: organization });
  }
  if (!activeOrg) {
    activeOrg = await getDefaultOrg({ serviceConfig });
  }

  const defaultOrganization = activeOrg?.id;
  const orgName = activeOrg?.name || "ZITADEL";

  // also allow no session to be found (ignoreUnkownUsername)
  const sessionFactors = await loadMostRecentSession({
    serviceConfig,
    sessionParams: {
      loginName,
      organization,
    },
  });

  const effectiveOrgId = organization ?? sessionFactors?.factors?.user?.organizationId ?? defaultOrganization;

  const branding = await getBrandingSettings({
    serviceConfig,
    organization: effectiveOrgId,
  });
  const loginSettings = await getLoginSettings({
    serviceConfig,
    organization: effectiveOrgId,
  });
  const legal = await getLegalAndSupportSettings({
    serviceConfig,
    organization: effectiveOrgId,
  });

  return (
    <DynamicTheme branding={branding} orgName={orgName} appName={orgName || "ZITADEL"} legal={legal}>
      <div className="flex flex-col space-y-4">
        <h1 className="text-xl font-extrabold tracking-tight text-[#081242] sm:text-2xl dark:text-white">
          <Translated i18nKey="verify.title" namespace="password" />
        </h1>
        <p className="text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400">
          <Translated i18nKey="verify.description" namespace="password" />
        </p>

        {sessionFactors ? (
          <UserAvatar
            loginName={loginName ?? sessionFactors.factors?.user?.loginName}
            displayName={sessionFactors.factors?.user?.displayName}
            showDropdown
            searchParams={searchParams}
          ></UserAvatar>
        ) : loginName ? (
          <UserAvatar loginName={loginName} displayName={loginName} showDropdown searchParams={searchParams}></UserAvatar>
        ) : null}
      </div>

      <div className="w-full">
        {/* Only warn when there is no loginName to continue with (e.g. a direct visit
            without searchParams). A failed session lookup alone is not an error: the
            form still works via the user-search fallback in sendPassword, and under
            enumeration protection no session exists by design. */}
        {!loginName && (
          <div className="py-4">
            <Alert>
              <Translated i18nKey="unknownContext" namespace="error" />
            </Alert>
          </div>
        )}

        {loginName && (
          <PasswordForm
            loginName={loginName}
            requestId={requestId}
            organization={organization}
            defaultOrganization={defaultOrganization}
            loginSettings={loginSettings}
          />
        )}
      </div>
    </DynamicTheme>
  );
}
