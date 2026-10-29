import { DynamicTheme } from "@/components/dynamic-theme";
import { LogoutDoneCard } from "@/components/logout-done-card";
import { getAllSessions } from "@/lib/cookies";
import { getServiceConfig } from "@/lib/service-url";
import { getBrandingSettings } from "@/lib/zitadel";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("logout");
  return { title: t("success.title") };
}

export default async function Page(props: { searchParams: Promise<Record<string, string | undefined>> }) {
  const searchParams = await props.searchParams;

  const _headers = await headers();
  const { serviceConfig } = getServiceConfig(_headers);

  const organization = searchParams?.organization;
  const postLogoutRedirectUri = searchParams?.post_logout_redirect_uri || searchParams?.redirect_uri;
  const referer = searchParams?.referer;

  let remainingCount = searchParams?.remaining ? parseInt(searchParams.remaining, 10) : undefined;
  if (remainingCount === undefined || isNaN(remainingCount)) {
    try {
      const activeSessions = await getAllSessions(true);
      remainingCount = activeSessions.filter((s) => !!s.loginName).length;
    } catch {
      remainingCount = 0;
    }
  }

  const branding = await getBrandingSettings({ serviceConfig, organization });

  return (
    <DynamicTheme branding={branding}>
      <LogoutDoneCard
        postLogoutRedirectUri={postLogoutRedirectUri}
        referer={referer}
        organization={organization}
        remainingCount={remainingCount}
      />
    </DynamicTheme>
  );
}
