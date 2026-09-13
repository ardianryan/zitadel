"use client";

import { handleServerActionResponse } from "@/lib/client-utils";
import { resetPassword, sendPassword } from "@/lib/server/password";
import { create } from "@zitadel/client";
import { ChecksSchema } from "@zitadel/proto/zitadel/session/v2/session_service_pb";
import { LoginSettings } from "@zitadel/proto/zitadel/settings/v2/login_settings_pb";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertType } from "./alert";
import { AutoSubmitForm } from "./auto-submit-form";
import { BackButton } from "./back-button";
import { Button, ButtonVariants } from "./button";
import { TextInput } from "./input";
import { Spinner } from "./spinner";
import { Translated } from "./translated";

type Inputs = {
  password: string;
};

type Props = {
  loginSettings: LoginSettings | undefined;
  loginName: string;
  organization?: string;
  defaultOrganization?: string;
  requestId?: string;
  helpLink?: string;
};

export function PasswordForm({
  loginSettings,
  loginName,
  organization,
  defaultOrganization,
  requestId,
  helpLink,
}: Props) {
  const { register, handleSubmit, formState } = useForm<Inputs>({
    mode: "onChange",
  });

  const t = useTranslations("password");

  const [info, setInfo] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [samlData, setSamlData] = useState<{ url: string; fields: Record<string, string> } | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  async function submitPassword(values: Inputs) {
    setError("");
    setLoading(true);

    try {
      const response = await sendPassword({
        loginName,
        organization,
        defaultOrganization,
        checks: create(ChecksSchema, {
          password: { password: values.password },
        }),
        requestId,
      });

      handleServerActionResponse(response, router, setSamlData, setError);
    } catch {
      setError(t("verify.errors.couldNotVerifyPassword"));
    } finally {
      setLoading(false);
    }
  }

  async function resetPasswordAndContinue() {
    setError("");
    setInfo("");
    setLoading(true);

    const response = await resetPassword({
      loginName,
      organization,
      defaultOrganization,
      requestId,
    })
      .catch(() => {
        setError(t("errors.couldNotSendResetLink"));
        return;
      })
      .finally(() => {
        setLoading(false);
      });

    if (response && "error" in response) {
      setError(response.error as string);
      return;
    }

    setInfo(t("verify.info.passwordResetSent"));

    const params = new URLSearchParams({
      loginName: loginName,
    });

    if (organization) {
      params.append("organization", organization);
    }

    if (requestId) {
      params.append("requestId", requestId);
    }

    return router.push("/password/set?" + params);
  }

  return (
    <>
      {samlData && <AutoSubmitForm url={samlData.url} fields={samlData.fields} />}
      <form className="w-full">
        <div className={`${error && "animate-shake transform-gpu"}`}>
          <TextInput
            type="password"
            autoComplete="password"
            autoFocus
            {...register("password", { required: t("verify.required.password") })}
            label={t("verify.labels.password")}
            data-testid="password-text-input"
          />
          {!loginSettings?.hidePasswordReset && (
            <div className="mt-2 text-right">
              <button
                className="text-xs font-semibold text-[#0F91FC] transition-colors hover:underline dark:text-[#38BDF8]"
                onClick={() => resetPasswordAndContinue()}
                type="button"
                disabled={loading}
                data-testid="reset-button"
              >
                <Translated i18nKey="verify.resetPassword" namespace="password" />
              </button>
            </div>
          )}

          {loginName && <input type="hidden" name="loginName" autoComplete="username" value={loginName} />}
        </div>

        {info && (
          <div className="py-4">
            <Alert type={AlertType.INFO}>{info}</Alert>
          </div>
        )}

        {error && (
          <div className="py-3" data-testid="error">
            <Alert>{error}</Alert>
            <div className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50/80 p-3.5 text-xs text-slate-700 shadow-sm backdrop-blur transition-all dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      <Translated i18nKey="verify.helpUnlock" namespace="password" />
                    </p>
                    <p className="mt-0.5 leading-relaxed text-slate-600 dark:text-slate-400">
                      <Translated i18nKey="verify.helpUnlockDesc" namespace="password" />
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => resetPasswordAndContinue()}
                      className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:text-blue-700 dark:bg-slate-800 dark:text-sky-400 dark:ring-slate-700 dark:hover:bg-slate-700"
                    >
                      <Translated i18nKey="verify.helpActionReset" namespace="password" />
                    </button>
                    {helpLink && (
                      <a
                        href={helpLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500"
                      >
                        <span><Translated i18nKey="verify.openHelp" namespace="password" /></span>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex w-full flex-row items-center">
          <BackButton data-testid="back-button" />
          <span className="flex-grow"></span>
          <Button
            type="submit"
            className="self-end"
            variant={ButtonVariants.Primary}
            disabled={loading || !formState.isValid}
            onClick={handleSubmit(submitPassword)}
            data-testid="submit-button"
          >
            {loading && <Spinner className="mr-2 h-5 w-5" />} <Translated i18nKey="verify.submit" namespace="password" />
          </Button>
        </div>
      </form>
    </>
  );
}
