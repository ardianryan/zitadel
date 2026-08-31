import { DynamicTheme } from "@/components/dynamic-theme";
import { SignInWithIdp } from "@/components/sign-in-with-idp";
import { Translated } from "@/components/translated";
import { UsernameForm } from "@/components/username-form";
import { getServiceConfig } from "@/lib/service-url";
import {
  getActiveIdentityProviders,
  getBrandingSettings,
  getDefaultOrg,
  getLegalAndSupportSettings,
  getLoginSettings,
  getOrgById,
} from "@/lib/zitadel";
import { Organization } from "@zitadel/proto/zitadel/org/v2/org_pb";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("loginname");
  return { title: t("title") };
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

  return (
    <DynamicTheme branding={branding} orgName={orgName} appName={orgName || "ZITADEL"} legal={legal}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-xl font-extrabold tracking-tight text-[#081242] sm:text-2xl dark:text-white">
          <Translated i18nKey="title" namespace="loginname" />
        </h1>
        <p className="text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400">
          <Translated i18nKey="description" namespace="loginname" />
        </p>
      </div>

      <div className="w-full space-y-4">
        {loginSettings?.allowLocalAuthentication && (
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
          ></UsernameForm>
        )}

        {loginSettings?.allowExternalIdp && !!identityProviders?.length && (
          <div className="w-full pt-2">
            <SignInWithIdp
              identityProviders={identityProviders}
              requestId={requestId}
              organization={organization}
              postErrorRedirectUrl="/loginname"
              showLabel={loginSettings?.allowLocalAuthentication}
            ></SignInWithIdp>
          </div>
        )}
      </div>
    </DynamicTheme>
  );
}
