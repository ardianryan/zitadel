import { Alert, AlertType } from "@/components/alert";
import { DynamicTheme } from "@/components/dynamic-theme";
import { SetPasswordForm } from "@/components/set-password-form";
import { Translated } from "@/components/translated";
import { UserAvatar } from "@/components/user-avatar";
import { UNKNOWN_USER_ID } from "@/lib/constants";
import { getServiceConfig } from "@/lib/service-url";
import { loadMostRecentSession } from "@/lib/session";
import {
  getBrandingSettings,
  getDefaultOrg,
  getLegalAndSupportSettings,
  getLoginSettings,
  getOrgById,
  getPasswordComplexitySettings,
  getUserByID,
  searchUsers,
} from "@/lib/zitadel";
import { Organization } from "@zitadel/proto/zitadel/org/v2/org_pb";
import { Session } from "@zitadel/proto/zitadel/session/v2/session_pb";
import { User } from "@zitadel/proto/zitadel/user/v2/user_pb";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

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
  const t = await getTranslations("password");
  return {
    title: orgName ? `${orgName} - ${t("set.title")}` : t("set.title"),
  };
}

export default async function Page(props: { searchParams: Promise<Record<string | number | symbol, string | undefined>> }) {
  const searchParams = await props.searchParams;

  let { userId, loginName, organization, requestId, code, initial } = searchParams;

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
  let session: Session | undefined;
  if (loginName) {
    session = await loadMostRecentSession({
      serviceConfig,
      sessionParams: {
        loginName,
        organization,
      },
    });
  }

  const effectiveOrgId = organization ?? session?.factors?.user?.organizationId ?? defaultOrganization;

  const branding = await getBrandingSettings({ serviceConfig, organization: effectiveOrgId });
  const legal = await getLegalAndSupportSettings({ serviceConfig, organization: effectiveOrgId });

  const passwordComplexity = await getPasswordComplexitySettings({
    serviceConfig,
    organization: effectiveOrgId,
  });

  const loginSettings = await getLoginSettings({
    serviceConfig,
    organization: effectiveOrgId,
  });

  if (!loginSettings) {
    return (
      <DynamicTheme branding={branding} orgName={orgName} appName={orgName || "ZITADEL"} legal={legal} bannerPosition="left">
        <div className="mx-auto flex max-w-sm flex-col space-y-4 pt-4">
          <Alert>
            <Translated i18nKey="errors.couldNotGetLoginSettings" namespace="loginname" />
          </Alert>
        </div>
      </DynamicTheme>
    );
  }

  let user: User | undefined;
  if (userId) {
    const userResponse = await getUserByID({ serviceConfig, userId });
    user = userResponse.user;
  } else if (loginName) {
    const users = await searchUsers({
      serviceConfig,
      searchValue: loginName,
      loginSettings: loginSettings,
      organizationId: organization,
    });

    if (users.result && users.result.length === 1) {
      const foundUser = users.result[0];
      userId = foundUser.userId;
      user = foundUser;
    } else if (loginSettings?.ignoreUnknownUsernames) {
      // Prevent enumeration by pretending we found a user
      userId = UNKNOWN_USER_ID;
    }
  }

  return (
    <DynamicTheme branding={branding} orgName={orgName} appName={orgName || "ZITADEL"} legal={legal} bannerPosition="left">
      <div className="flex flex-col space-y-4">
        <h1 className="text-xl font-extrabold tracking-tight text-[#081242] sm:text-2xl dark:text-white">
          {session?.factors?.user?.displayName ?? <Translated i18nKey="set.title" namespace="password" />}
        </h1>
        <p className="text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400">
          <Translated i18nKey="set.description" namespace="password" />
        </p>

        {session ? (
          <UserAvatar
            loginName={loginName ?? session.factors?.user?.loginName}
            displayName={session.factors?.user?.displayName}
            showDropdown
            searchParams={searchParams}
          />
        ) : loginName ? (
          <UserAvatar loginName={loginName} displayName={loginName} showDropdown searchParams={searchParams} />
        ) : null}
      </div>

      <div className="w-full">
        {!initial && (
          <Alert type={AlertType.INFO}>
            <Translated i18nKey="set.codeSent" namespace="password" />
          </Alert>
        )}

        {passwordComplexity &&
        (loginName ?? user?.preferredLoginName) &&
        (userId ?? session?.factors?.user?.id ?? (loginSettings?.ignoreUnknownUsernames ? UNKNOWN_USER_ID : undefined)) ? (
          <SetPasswordForm
            code={code}
            userId={userId ?? (session?.factors?.user?.id as string) ?? UNKNOWN_USER_ID}
            loginName={loginName ?? (user?.preferredLoginName as string)}
            requestId={requestId}
            organization={organization}
            defaultOrganization={defaultOrganization}
            passwordComplexitySettings={passwordComplexity}
            codeRequired={!(initial === "true")}
          />
        ) : (
          <div className="py-4">
            <Alert>
              <Translated i18nKey="failedLoading" namespace="error" />
            </Alert>
          </div>
        )}
      </div>
    </DynamicTheme>
  );
}
