"use client";

import { Avatar } from "@/components/avatar";
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon, ShieldExclamationIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import Link from "next/link";

type Props = {
  loginName?: string;
  displayName?: string;
  helpLink?: string;
  supportEmail?: string;
  orgName?: string;
  requestId?: string;
  organization?: string;
};

export function ActivationHelpCard({
  loginName,
  displayName,
  helpLink,
  supportEmail,
  orgName = "SMAN 1 Gedeg",
  requestId,
  organization,
}: Props) {
  const t = useTranslations("activation");

  const targetHelpLink = helpLink || (supportEmail ? `mailto:${supportEmail}` : "https://sman1gedeg.sch.id");

  const backParams = new URLSearchParams();
  if (requestId) backParams.set("requestId", requestId);
  if (organization) backParams.set("organization", organization);
  const backHref = backParams.toString() ? `/loginname?${backParams.toString()}` : "/loginname";

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-start space-y-6 text-left">
      <div className="flex w-full flex-col items-start select-none">
        <span className="mb-1 text-[10px] font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
          {t("badge")}
        </span>
        <h1 className="text-xl font-extrabold tracking-tight text-[#081242] sm:text-2xl dark:text-white">
          {t("notActiveTitle")}
        </h1>
        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          {orgName} • {t("subtitle")}
        </p>
      </div>

      {/* User Identity Preview */}
      {loginName && (
        <div className="flex w-full items-center gap-3.5 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 backdrop-blur dark:border-slate-800 dark:bg-slate-800/40">
          <Avatar size="small" loginName={loginName} name={displayName || loginName} />
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
              {displayName || loginName}
            </span>
            <span className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {loginName}
            </span>
          </div>
        </div>
      )}

      {/* Educational Notice Card */}
      <div className="w-full space-y-3.5 rounded-2xl border border-amber-200/90 bg-amber-50/60 p-5 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
            <ShieldExclamationIcon className="h-5 w-5" />
          </div>
          <div className="space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {t("notActiveDesc")}
            </p>
            <p className="rounded-lg bg-white/70 p-2.5 font-medium text-amber-900 ring-1 ring-amber-200/60 dark:bg-slate-900/60 dark:text-amber-200 dark:ring-amber-800/40">
              {t("emailNotice")}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              {t("instruction")}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full flex-col gap-3 pt-1">
        <a
          href={targetHelpLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F91FC] to-[#0A6FD8] px-5 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30 hover:brightness-105 active:scale-[0.99]"
        >
          <span>{t("openHelp")}</span>
          <ArrowTopRightOnSquareIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>

        <Link
          href={backHref}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 opacity-80" />
          <span>{t("backToLogin")}</span>
        </Link>
      </div>
    </div>
  );
}

