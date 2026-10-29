"use client";

import {
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  HomeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

type Props = {
  postLogoutRedirectUri?: string;
  referer?: string;
  organization?: string;
  remainingCount?: number;
};

export function LogoutDoneCard({
  postLogoutRedirectUri,
  referer,
  organization,
  remainingCount = 0,
}: Props) {
  const t = useTranslations("logout");
  const router = useRouter();

  // Determine target return URL for previous application
  const returnUrl = useMemo(() => {
    return postLogoutRedirectUri || referer;
  }, [postLogoutRedirectUri, referer]);

  // Extract hostname for readable button label (e.g. "elearning.sman1gedeg.sch.id")
  const appDisplayName = useMemo(() => {
    if (!returnUrl) return null;
    try {
      const parsed = new URL(returnUrl);
      return parsed.hostname;
    } catch {
      return null;
    }
  }, [returnUrl]);

  // Handler for return button: external URL uses window.location to prevent RSC prefetch blocks
  const handleReturnToApp = () => {
    if (returnUrl) {
      if (typeof window !== "undefined") {
        window.location.href = returnUrl;
      }
    } else {
      if (typeof window !== "undefined" && window.history.length > 1) {
        window.history.back();
      } else {
        router.push("/loginname");
      }
    }
  };

  const hasRemaining = remainingCount > 0;

  const homeParams = new URLSearchParams();
  if (organization) {
    homeParams.set("organization", organization);
  }
  const homeHref = homeParams.toString() ? `/loginname?${homeParams.toString()}` : "/loginname";

  return (
    <div className="w-full space-y-6">
      {/* Success Badge & Notification */}
      <div className="flex flex-col items-center justify-center space-y-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/30">
          <CheckCircleIcon className="h-10 w-10 stroke-[2]" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            {t("success.title")}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("success.description")}
          </p>
        </div>
      </div>

      {/* Notice if other accounts are still active */}
      {hasRemaining && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-left shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <UserGroupIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="space-y-2 text-xs">
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                {t("remainingAccounts", { count: remainingCount })}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Link
                  href={`/accounts${organization ? `?organization=${organization}` : ""}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
                >
                  <ArrowRightOnRectangleIcon className="h-3.5 w-3.5" />
                  <span>{t("switchAccount")}</span>
                </Link>
                <Link
                  href={`/logout${organization ? `?organization=${organization}` : ""}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-50 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-slate-800"
                >
                  <span>{t("clearAll")}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Action Buttons */}
      <div className="flex flex-col space-y-3 pt-2">
        {/* Button 1: Return to previous app / URL */}
        <button
          type="button"
          onClick={handleReturnToApp}
          className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#0F91FC] to-[#0A6FD8] px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30 hover:brightness-105 active:scale-[0.99] dark:from-[#0F91FC] dark:to-[#085AB8]"
        >
          <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>
            {appDisplayName
              ? t("success.backToApp", { app: appDisplayName })
              : t("success.backToPrev")}
          </span>
        </button>

        {/* Button 2: Return to Main Portal / Login */}
        <Link
          href={homeHref}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <HomeIcon className="h-4 w-4 opacity-80" />
          <span>{t("success.backToHome")}</span>
        </Link>
      </div>
    </div>
  );
}
