"use client";

import { resolveLocalizedLegalLink } from "@/lib/legal-links";
import { LegalAndSupportSettings } from "@zitadel/proto/zitadel/settings/v2/legal_settings_pb";
import { useLocale } from "next-intl";
import Link from "next/link";

type Props = {
  orgName?: string;
  legal?: LegalAndSupportSettings;
  loginUrl?: string;
};

export function RegistrationDisabledCard({ orgName, legal, loginUrl = "/loginname" }: Props) {
  const locale = useLocale();
  const displayName = orgName || "ZITADEL";

  const resolvedHelpLink = resolveLocalizedLegalLink(legal?.helpLink, locale);
  const supportLink = resolvedHelpLink || (legal?.supportEmail ? `mailto:${legal.supportEmail}` : null);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-start space-y-6 text-left">
      <div className="flex w-full flex-col items-start select-none">
        <span className="mb-1 text-[10px] font-bold tracking-widest text-[#0F91FC] uppercase">INFORMASI PENDAFTARAN</span>
        <h1 className="text-xl font-extrabold tracking-tight text-[#081242] sm:text-2xl dark:text-white">
          Pendaftaran Akun Terpusat
        </h1>
      </div>

      {/* Main Info Card */}
      <div className="w-full space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-6 dark:border-slate-700/60 dark:bg-slate-800/60">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F91FC]/10 text-[#0F91FC] dark:bg-[#0F91FC]/20 dark:text-[#38b6ff]">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-bold text-[#081242] dark:text-white">Pendaftaran Mandiri Tidak Diizinkan</h3>
          <p className="text-xs leading-relaxed font-medium text-slate-600 dark:text-slate-300">
            Akun untuk ekosistem <span className="font-bold text-[#0F91FC]">{displayName}</span> didaftarkan dan dikelola
            secara terpusat oleh Administrator Organisasi/Sekolah.
          </p>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Jika Anda belum memiliki akun atau membutuhkan bantuan akses, silakan menghubungi administrator melalui tautan
            bantuan resmi di bawah ini.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
        <Link
          href={loginUrl}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3.5 text-center text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Masuk
        </Link>

        {supportLink ? (
          <Link
            href={supportLink}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F91FC] px-5 py-3.5 text-center text-xs font-bold text-white shadow-lg transition-all hover:bg-[#0a78d6]"
          >
            Hubungi Bantuan
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </Link>
        ) : null}
      </div>

      {/* Footer Info */}
      <div className="w-full border-t border-slate-100 pt-4 text-center dark:border-slate-800">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Layanan Otentikasi Terpadu & Terenkripsi • {displayName}
        </p>
      </div>
    </div>
  );
}
