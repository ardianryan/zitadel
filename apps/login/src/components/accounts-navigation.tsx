"use client";

import { ArrowLeftIcon, HomeIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

type Props = {
  returnUrl?: string;
  homeUrl?: string;
};

export function AccountsNavigation({ returnUrl, homeUrl = "/loginname" }: Props) {
  const t = useTranslations("accounts");
  const router = useRouter();

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

  const handleReturn = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else if (returnUrl) {
      if (typeof window !== "undefined") {
        window.location.href = returnUrl;
      }
    } else {
      router.push(homeUrl);
    }
  };

  return (
    <div className="mt-5 flex flex-col gap-2.5 border-t border-slate-200/80 pt-4 dark:border-slate-800">
      <button
        type="button"
        onClick={handleReturn}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0F91FC] to-[#0A6FD8] px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 transition-all hover:brightness-105 active:scale-[0.99]"
      >
        <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        <span>
          {appDisplayName ? t("backToApp", { app: appDisplayName }) : t("backToPrev")}
        </span>
      </button>

      <Link
        href={homeUrl}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <HomeIcon className="h-4 w-4" />
        <span>{t("backToHome")}</span>
      </Link>
    </div>
  );
}
