import { DynamicTheme } from "@/components/dynamic-theme";
import { SessionsClearList } from "@/components/sessions-clear-list";
import { Translated } from "@/components/translated";
import { isSafeRedirectUri } from "@/lib/client-utils";
import { getAllSessionCookieIds } from "@/lib/cookies";
import { getServiceConfig } from "@/lib/service-url";
import { getBrandingSettings, getDefaultOrg, listSessions, searchUsers, ServiceConfig } from "@/lib/zitadel";
import { verifyJwt } from "@zitadel/client/node";
import { Organization } from "@zitadel/proto/zitadel/org/v2/org_pb";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("logout");
  return { title: t("title") };
}

async function loadSessions({ serviceConfig }: { serviceConfig: ServiceConfig }) {
  const cookieIds = await getAllSessionCookieIds();

  if (cookieIds && cookieIds.length) {
    const response = await listSessions({ serviceConfig, ids: cookieIds.filter((id) => !!id) as string[] });
    const sessions = response?.sessions ?? [];

    const sessionsToEnrich = sessions.filter(
      (s) => (!s.factors?.user?.displayName || s.factors.user.displayName === s.factors.user.loginName) && s.factors?.user?.loginName,
    );

    if (sessionsToEnrich.length > 0) {
      await Promise.all(
        sessionsToEnrich.map(async (s) => {
          try {
            const res = await searchUsers({
              serviceConfig,
              searchValue: s.factors!.user!.loginName,
              organizationId: s.factors?.user?.organizationId,
              loginSettings: { disableLoginWithEmail: false, disableLoginWithPhone: false },
            });
            if (res && "result" in res && res.result && res.result.length === 1) {
              const foundUser = res.result[0];
              const human = foundUser.type.case === "human" ? foundUser.type.value : undefined;
              if (human?.profile?.displayName) {
                s.factors!.user!.displayName = human.profile.displayName;
              }
              if (human?.email?.email) {
                (s as any).email = human.email.email;
              }
            }
          } catch {
            // Gracefully ignore
          }
        }),
      );
    }

    return sessions;
  } else {
    console.info("No session cookie found.");
    return [];
  }
}

export default async function Page(props: { searchParams: Promise<Record<string | number | symbol, string | undefined>> }) {
  const searchParams = await props.searchParams;

  const organization = searchParams?.organization;
  const logoutToken = searchParams?.logout_token;
  const queryRedirectUri = searchParams?.post_logout_redirect_uri || searchParams?.redirect_uri;

  const _headers = await headers();
  const { serviceConfig } = getServiceConfig(_headers);

  let postLogoutRedirectUri = queryRedirectUri;
  let logoutHint;
  if (logoutToken) {
    try {
      const payload = await verifyJwt<{ post_logout_redirect_uri?: string; logoutHint?: string }>(
        logoutToken,
        `${serviceConfig.baseUrl}/oauth/v2/keys`,
        {
          instanceHost: serviceConfig.instanceHost,
          publicHost: serviceConfig.publicHost,
        },
      );
      console.log("logout token payload", payload);

      if (payload.post_logout_redirect_uri && typeof payload.post_logout_redirect_uri === "string") {
        postLogoutRedirectUri = payload.post_logout_redirect_uri;
      }
      if (payload.logout_hint && typeof payload.logout_hint === "string") {
        logoutHint = payload.logout_hint;
      }
    } catch (error) {
      console.error("Failed to verify logout token", error);
    }
  }

  const rawReferer = _headers.get("referer");
  let referer: string | undefined = undefined;
  if (rawReferer && isSafeRedirectUri(rawReferer)) {
    try {
      const refUrl = new URL(rawReferer);
      if (!refUrl.pathname.includes("/logout")) {
        referer = rawReferer;
      }
    } catch {
      // not a valid URL
    }
  }

  let defaultOrganization;
  if (!organization) {
    const org: Organization | null = await getDefaultOrg({ serviceConfig });
    if (org) {
      defaultOrganization = org.id;
    }
  }

  let sessions = await loadSessions({ serviceConfig });

  const branding = await getBrandingSettings({ serviceConfig, organization: organization ?? defaultOrganization });

  return (
    <DynamicTheme branding={branding}>
      <div className="flex flex-col space-y-4">
        <h1>
          <Translated i18nKey="title" namespace="logout" />
        </h1>
        <p className="ztdl-p">
          <Translated i18nKey="description" namespace="logout" />
        </p>
      </div>

      <div className="w-full">
        <div className="flex w-full flex-col space-y-2">
          <SessionsClearList
            sessions={sessions}
            logoutHint={logoutHint}
            postLogoutRedirectUri={postLogoutRedirectUri}
            referer={referer}
            organization={organization ?? defaultOrganization}
          />
        </div>
      </div>
    </DynamicTheme>
  );
}
