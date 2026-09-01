import { Alert } from "@/components/alert";
import { DynamicTheme } from "@/components/dynamic-theme";
import { RegistrationDisabledCard } from "@/components/edu/registration-disabled-card";
import { RegisterForm } from "@/components/register-form";
import { SignInWithIdp } from "@/components/sign-in-with-idp";
import { Translated } from "@/components/translated";
import { getServiceConfig } from "@/lib/service-url";
import {
  getActiveIdentityProviders,
  getBrandingSettings,
  getDefaultOrg,
  getLegalAndSupportSettings,
  getLoginSettings,
  getOrgById,
  getPasswordComplexitySettings,
} from "@/lib/zitadel";
import { Organization } from "@zitadel/proto/zitadel/org/v2/org_pb";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("register");
  return { title: t("title") };
}

export default async function Page(props: { searchParams: Promise<Record<string | number | symbol, string | undefined>> }) {
  const searchParams = await props.searchParams;

  let { firstname, lastname, email, organization, requestId } = searchParams;

  const _headers = await headers();
  const { serviceConfig } = getServiceConfig(_headers);

  let activeOrg: Organization | null = null;
  if (organization) {
    activeOrg = await getOrgById({ serviceConfig, orgId: organization });
  }
  if (!activeOrg) {
    activeOrg = await getDefaultOrg({ serviceConfig });
  }

  if (activeOrg && !organization) {
    organization = activeOrg.id;
  }

  const orgName = activeOrg?.name || "ZITADEL";

  const legal = await getLegalAndSupportSettings({ serviceConfig, organization });
  const passwordComplexitySettings = await getPasswordComplexitySettings({ serviceConfig, organization });
  const branding = await getBrandingSettings({ serviceConfig, organization });
  const loginSettings = await getLoginSettings({ serviceConfig, organization });

  const identityProviders = await getActiveIdentityProviders({ serviceConfig, orgId: organization }).then((resp) => {
    return resp.identityProviders.filter((idp) => {
      return idp.options?.isAutoCreation || idp.options?.isCreationAllowed;
    });
  });

  const loginUrl = requestId ? `/loginname?requestId=${requestId}` : "/loginname";

  if (!loginSettings) {
    return (
      <DynamicTheme branding={branding} orgName={orgName} appName={orgName || "ZITADEL"} legal={legal} bannerPosition="left">
        <div className="flex flex-col space-y-4">
          <h1>
            <Translated i18nKey="title" namespace="register" />
          </h1>
          <Alert>
            <Translated i18nKey="unknownContext" namespace="error" />
          </Alert>
        </div>
        <div className="w-full"></div>
      </DynamicTheme>
    );
  }

  if (!loginSettings?.allowRegister && (!loginSettings.allowExternalIdp || identityProviders.length === 0)) {
    return (
      <DynamicTheme branding={branding} orgName={orgName} appName={orgName || "ZITADEL"} legal={legal} bannerPosition="left">
        <RegistrationDisabledCard orgName={orgName} legal={legal} loginUrl={loginUrl} />
      </DynamicTheme>
    );
  }

  return (
    <DynamicTheme branding={branding} orgName={orgName} appName={orgName || "ZITADEL"} legal={legal}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-xl font-extrabold tracking-tight text-[#081242] sm:text-2xl dark:text-white">
          <Translated i18nKey="title" namespace="register" />
        </h1>
        <p className="text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400">
          <Translated i18nKey="description" namespace="register" />
        </p>
      </div>

      <div className="w-full">
        {!organization && (
          <Alert>
            <Translated i18nKey="unknownContext" namespace="error" />
          </Alert>
        )}

        {legal && passwordComplexitySettings && organization && loginSettings.allowLocalAuthentication && (
          <RegisterForm
            idpCount={!loginSettings?.allowExternalIdp ? 0 : identityProviders.length}
            legal={legal}
            organization={organization}
            firstname={firstname}
            lastname={lastname}
            email={email}
            requestId={requestId}
            loginSettings={loginSettings}
          ></RegisterForm>
        )}

        {loginSettings?.allowExternalIdp && !!identityProviders.length && (
          <>
            <SignInWithIdp
              identityProviders={identityProviders}
              requestId={requestId}
              organization={organization}
            ></SignInWithIdp>
          </>
        )}
      </div>
    </DynamicTheme>
  );
}
