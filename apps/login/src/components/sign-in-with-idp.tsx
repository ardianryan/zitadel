"use client";

import { idpTypeToSlug } from "@/lib/idp";
import { redirectToIdp } from "@/lib/server/idp";
import { IdentityProvider, IdentityProviderType } from "@zitadel/proto/zitadel/settings/v2/login_settings_pb";
import { ReactNode, useActionState } from "react";
import { Alert } from "./alert";
import { AutoSubmitForm } from "./auto-submit-form";
import { SignInWithIdentityProviderProps } from "./idps/base-button";
import { SignInWithApple } from "./idps/sign-in-with-apple";
import { SignInWithAzureAd } from "./idps/sign-in-with-azure-ad";
import { SignInWithGeneric } from "./idps/sign-in-with-generic";
import { SignInWithGithub } from "./idps/sign-in-with-github";
import { SignInWithGitlab } from "./idps/sign-in-with-gitlab";
import { SignInWithGoogle } from "./idps/sign-in-with-google";
import { SignInWithZitadel } from "./idps/sign-in-with-zitadel";
import { Translated } from "./translated";

export interface SignInWithIDPProps {
  children?: ReactNode;
  identityProviders: IdentityProvider[];
  requestId?: string;
  organization?: string;
  sessionId?: string;
  postErrorRedirectUrl?: string;
  showLabel?: boolean;
}

export function SignInWithIdp({
  identityProviders,
  requestId,
  organization,
  sessionId,
  postErrorRedirectUrl,
  showLabel = false,
}: Readonly<SignInWithIDPProps>) {
  const [state, action, _isPending] = useActionState(redirectToIdp, {});

  const renderIDPButton = (idp: IdentityProvider, index: number) => {
    const { id, name, type } = idp;

    const components: Partial<Record<IdentityProviderType, (props: SignInWithIdentityProviderProps) => ReactNode>> = {
      [IdentityProviderType.APPLE]: SignInWithApple,
      [IdentityProviderType.OAUTH]: SignInWithGeneric,
      [IdentityProviderType.OIDC]: SignInWithGeneric,
      [IdentityProviderType.GITHUB]: SignInWithGithub,
      [IdentityProviderType.GITHUB_ES]: SignInWithGithub,
      [IdentityProviderType.AZURE_AD]: SignInWithAzureAd,
      [IdentityProviderType.GOOGLE]: (props) => <SignInWithGoogle {...props} e2e="google" />,
      [IdentityProviderType.GITLAB]: SignInWithGitlab,
      [IdentityProviderType.GITLAB_SELF_HOSTED]: SignInWithGitlab,
      [IdentityProviderType.SAML]: SignInWithGeneric,
      [IdentityProviderType.LDAP]: SignInWithGeneric,
      [IdentityProviderType.JWT]: SignInWithGeneric,
      [IdentityProviderType.ZITADEL]: SignInWithZitadel,
    };

    const Component = components[type];
    return Component ? (
      <form action={action} className="flex w-full" key={`idp-${index}`}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="provider" value={idpTypeToSlug(type)} />
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="organization" value={organization} />
        {sessionId && <input type="hidden" name="sessionId" value={sessionId} />}
        {postErrorRedirectUrl && <input type="hidden" name="postErrorRedirectUrl" value={postErrorRedirectUrl} />}
        <Component key={id} name={name} />
      </form>
    ) : null;
  };

  const isMultiGrid = (identityProviders?.length || 0) >= 2;

  return (
    <div className="flex w-full flex-col space-y-3 text-sm">
      {state?.samlData && <AutoSubmitForm url={state.samlData.url} fields={state.samlData.fields} />}
      {showLabel && (
        <p className="ztdl-p text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
          <Translated i18nKey="orSignInWith" namespace="idp" />
        </p>
      )}

      <div className={isMultiGrid ? "grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2" : "flex w-full flex-col space-y-2.5"}>
        {!!identityProviders?.length && identityProviders?.map(renderIDPButton)}
      </div>

      {state?.error && (
        <div className="py-4">
          <Alert>{state?.error}</Alert>
        </div>
      )}
    </div>
  );
}

SignInWithIdp.displayName = "SignInWithIDP";
