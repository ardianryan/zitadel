import { DynamicTheme } from "@/components/dynamic-theme";
import { SetRegisterPasswordForm } from "@/components/set-register-password-form";
import { Translated } from "@/components/translated";
import { getServiceConfig } from "@/lib/service-url";
import {
  getBrandingSettings,
  getDefaultOrg,
  getLegalAndSupportSettings,
  getLoginSettings,
  getOrgById,
  getPasswordComplexitySettings,
} from "@/lib/zitadel";
import { Organization } from "@zitadel/proto/zitadel/org/v2/org_pb";
import { headers } from "next/headers";

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

  const defaultOrganization = activeOrg?.id;
  const orgName = activeOrg?.name || "ZITADEL";

  const effectiveOrg = organization ?? defaultOrganization;

  const missingData = !firstname || !lastname || !email || !effectiveOrg;

  const legal = await getLegalAndSupportSettings({ serviceConfig, organization: effectiveOrg });
  const passwordComplexitySettings = await getPasswordComplexitySettings({ serviceConfig, organization: effectiveOrg });

  const branding = await getBrandingSettings({ serviceConfig, organization: effectiveOrg });

  const loginSettings = await getLoginSettings({ serviceConfig, organization: effectiveOrg });

  return missingData ? (
    <DynamicTheme branding={branding} orgName={orgName} appName={orgName || "ZITADEL"} legal={legal} bannerPosition="left">
      <div className="flex flex-col items-center space-y-4">
        <h1>
          <Translated i18nKey="missingdata.title" namespace="register" />
        </h1>
        <p className="ztdl-p">
          <Translated i18nKey="missingdata.description" namespace="register" />
        </p>
      </div>
      <div className="w-full"></div>
    </DynamicTheme>
  ) : loginSettings?.allowRegister && loginSettings.allowLocalAuthentication ? (
    <DynamicTheme branding={branding} orgName={orgName} appName={orgName || "ZITADEL"} legal={legal} bannerPosition="left">
      <div className="flex flex-col space-y-4">
        <h1 className="text-xl font-extrabold tracking-tight text-[#081242] sm:text-2xl dark:text-white">
          <Translated i18nKey="password.title" namespace="register" />
        </h1>
        <p className="text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400">
          <Translated i18nKey="description" namespace="register" />
        </p>
      </div>

      <div className="w-full">
        {legal && passwordComplexitySettings && (
          <SetRegisterPasswordForm
            passwordComplexitySettings={passwordComplexitySettings}
            email={email}
            firstname={firstname}
            lastname={lastname}
            organization={effectiveOrg as string}
            requestId={requestId}
          />
        )}
      </div>
    </DynamicTheme>
  ) : (
    <DynamicTheme branding={branding} orgName={orgName} appName={orgName || "ZITADEL"} legal={legal} bannerPosition="left">
      <div className="flex flex-col space-y-4">
        <h1>
          <Translated i18nKey="disabled.title" namespace="register" />
        </h1>
        <p className="ztdl-p">
          <Translated i18nKey="disabled.description" namespace="register" />
        </p>
      </div>
      <div className="w-full"></div>
    </DynamicTheme>
  );
}
