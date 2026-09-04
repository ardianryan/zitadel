"use client";

import { handleServerActionResponse } from "@/lib/client-utils";
import { sendLoginname } from "@/lib/server/loginname";
import { LoginSettings } from "@zitadel/proto/zitadel/settings/v2/login_settings_pb";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "./alert";
import { AutoSubmitForm } from "./auto-submit-form";
import { BackButton } from "./back-button";
import { Button, ButtonVariants } from "./button";
import { TextInput } from "./input";
import { Spinner } from "./spinner";
import { Translated } from "./translated";

type Inputs = {
  loginName: string;
};

type Props = {
  loginName: string | undefined;
  requestId: string | undefined;
  loginSettings: LoginSettings | undefined;
  organization?: string;
  defaultOrganization?: string;
  suffix?: string;
  hideSuffix?: boolean;
  submit: boolean;
  allowRegister: boolean;
  helpLink?: string;
};

export function UsernameForm({
  loginName,
  requestId,
  organization,
  defaultOrganization,
  suffix,
  hideSuffix,
  loginSettings,
  submit,
  allowRegister,
  helpLink,
}: Props) {
  const { register, handleSubmit, formState } = useForm<Inputs>({
    mode: "onChange",
    defaultValues: {
      loginName: loginName ? loginName : "",
    },
  });

  const t = useTranslations("loginname");

  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [samlData, setSamlData] = useState<{ url: string; fields: Record<string, string> } | null>(null);

  const submitLoginName = useCallback(
    async (values: Inputs, organization?: string) => {
      setLoading(true);

      try {
        const res = await sendLoginname({
          loginName: values.loginName,
          organization,
          defaultOrganization,
          requestId,
          suffix,
        });

        handleServerActionResponse(res, router, setSamlData, setError);
        return res;
      } catch {
        setError(t("errors.internalError"));
      } finally {
        setLoading(false);
      }
    },
    [defaultOrganization, requestId, suffix, router, t],
  );

  useEffect(() => {
    if (submit && loginName) {
      // When we navigate to this page, we always want to be redirected if submit is true and the parameters are valid.
      submitLoginName({ loginName }, organization);
    }
  }, [submit, loginName, organization, submitLoginName]);

  let inputLabel = t("labels.loginname");
  if (loginSettings?.disableLoginWithEmail && loginSettings?.disableLoginWithPhone) {
    inputLabel = t("labels.username");
  } else if (loginSettings?.disableLoginWithEmail) {
    inputLabel = t("labels.usernameOrPhoneNumber");
  } else if (loginSettings?.disableLoginWithPhone) {
    inputLabel = t("labels.usernameOrEmail");
  }

  return (
    <>
      {samlData && <AutoSubmitForm url={samlData.url} fields={samlData.fields} />}
      <form className="w-full">
        <div className="">
          <TextInput
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            {...register("loginName", { required: t("required.loginName") })}
            label={inputLabel}
            data-testid="username-text-input"
            suffix={hideSuffix ? undefined : suffix}
          />
          {allowRegister && (
            <div className="mt-2 text-right">
              <button
                className="text-xs font-semibold text-[#0F91FC] transition-colors hover:underline dark:text-[#38BDF8]"
                onClick={() => {
                  const registerParams = new URLSearchParams();
                  if (organization) {
                    registerParams.append("organization", organization);
                  }
                  if (requestId) {
                    registerParams.append("requestId", requestId);
                  }

                  router.push("/register?" + registerParams);
                }}
                type="button"
                disabled={loading}
                data-testid="register-button"
              >
                <Translated i18nKey="register" namespace="loginname" />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="space-y-3 py-3" data-testid="error">
            <Alert>{error}</Alert>
            {helpLink && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs dark:border-blue-900/40 dark:bg-blue-950/40">
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0F91FC]/10 text-[#0F91FC] dark:bg-[#0F91FC]/20 dark:text-[#38BDF8]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    <Translated i18nKey="accountNotFound.needHelpVerification" namespace="idp" />
                  </span>
                </div>
                <a
                  href={helpLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#0F91FC] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#0866C6] hover:shadow-md"
                >
                  <span><Translated i18nKey="accountNotFound.helpAndVerification" namespace="idp" /></span>
                  <span className="text-[11px]">↗</span>
                </a>
              </div>
            )}
          </div>
        )}
        <div className="mt-4 flex w-full flex-row items-center">
          <BackButton data-testid="back-button" />
          <span className="flex-grow"></span>
          <Button
            data-testid="submit-button"
            type="submit"
            className="self-end"
            variant={ButtonVariants.Primary}
            disabled={loading || !formState.isValid}
            onClick={handleSubmit((e) => submitLoginName(e, organization))}
          >
            {loading && <Spinner className="mr-2 h-5 w-5" />}
            <Translated i18nKey="submit" namespace="loginname" />
          </Button>
        </div>
      </form>
    </>
  );
}
