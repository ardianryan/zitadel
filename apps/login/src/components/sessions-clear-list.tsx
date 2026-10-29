"use client";

import { clearSession } from "@/lib/server/session";
import { ArrowLeftIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { timestampDate } from "@zitadel/client";
import { Session } from "@zitadel/proto/zitadel/session/v2/session_pb";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Alert, AlertType } from "./alert";
import { SessionClearItem } from "./session-clear-item";
import { Translated } from "./translated";

type Props = {
  sessions: Session[];
  postLogoutRedirectUri?: string;
  referer?: string;
  logoutHint?: string;
  organization?: string;
};

export function SessionsClearList({
  sessions,
  logoutHint,
  postLogoutRedirectUri,
  referer,
  organization,
}: Props) {
  const [list, setList] = useState<Session[]>(sessions);
  const [error, setError] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const router = useRouter();
  const tError = useTranslations("error");
  const tLogout = useTranslations("logout");

  const clearHintedSession = useCallback(async () => {
    console.log("Clearing session for login hint:", logoutHint);
    const sessionIdToBeCleared = sessions.find((session) => {
      return session.factors?.user?.loginName === logoutHint;
    })?.id;

    if (sessionIdToBeCleared) {
      let clearError: string | undefined;
      try {
        const clearSessionResponse = await clearSession({ sessionId: sessionIdToBeCleared });
        if (clearSessionResponse && "error" in clearSessionResponse) {
          clearError = clearSessionResponse.error;
        }
      } catch (error) {
        console.error("Error clearing session:", error);
        clearError = tError("couldNotClearSession");
      }

      if (clearError) {
        setError(clearError);
        return;
      }

      const params = new URLSearchParams();
      if (organization) {
        params.set("organization", organization);
      }
      if (postLogoutRedirectUri) {
        params.set("post_logout_redirect_uri", postLogoutRedirectUri);
      }
      if (referer) {
        params.set("referer", referer);
      }

      return router.push("/logout/done?" + params.toString());
    } else {
      console.warn(`No session found for login hint: ${logoutHint}`);
    }
  }, [logoutHint, sessions, postLogoutRedirectUri, referer, organization, router, tError]);

  useEffect(() => {
    if (logoutHint) {
      clearHintedSession();
    }
  }, [logoutHint, clearHintedSession]);

  const handleClearAll = async () => {
    setClearingAll(true);
    setError(null);
    try {
      await Promise.all(
        list
          .filter((s) => Boolean(s.id))
          .map((s) => clearSession({ sessionId: s.id }).catch((e) => console.error(e))),
      );
      const params = new URLSearchParams();
      if (organization) params.set("organization", organization);
      if (postLogoutRedirectUri) params.set("post_logout_redirect_uri", postLogoutRedirectUri);
      if (referer) params.set("referer", referer);
      params.set("remaining", "0");
      router.push("/logout/done?" + params.toString());
    } catch (err) {
      console.error("Error clearing all sessions:", err);
      setError(tError("couldNotClearSession"));
      setClearingAll(false);
    }
  };

  const handleCancel = () => {
    const target = postLogoutRedirectUri || referer;
    if (target) {
      if (typeof window !== "undefined") {
        window.location.href = target;
      }
    } else {
      if (typeof window !== "undefined" && window.history.length > 1) {
        window.history.back();
      } else {
        router.push("/loginname");
      }
    }
  };

  const activeSessions = list.filter((session) => session?.factors?.user?.loginName);

  return (
    <div className="flex flex-col space-y-3">
      {activeSessions.length > 0 ? (
        <div className="flex flex-col space-y-2">
          {activeSessions
            .sort((a, b) => {
              const dateA = a.changeDate ? timestampDate(a.changeDate).getTime() : 0;
              const dateB = b.changeDate ? timestampDate(b.changeDate).getTime() : 0;
              return dateB - dateA;
            })
            .map((session, index) => {
              return (
                <SessionClearItem
                  session={session}
                  reload={() => {
                    const updated = list.filter((s) => s.id !== session.id);
                    setList(updated);
                    const params = new URLSearchParams();
                    if (organization) params.set("organization", organization);
                    if (postLogoutRedirectUri)
                      params.set("post_logout_redirect_uri", postLogoutRedirectUri);
                    if (referer) params.set("referer", referer);
                    params.set("remaining", updated.length.toString());
                    router.push("/logout/done?" + params.toString());
                  }}
                  key={"session-" + index}
                />
              );
            })}

          {/* Button: Sign out of all accounts (if > 1 accounts) */}
          {activeSessions.length > 1 && (
            <div className="pt-2">
              <button
                type="button"
                disabled={clearingAll}
                onClick={handleClearAll}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/70 px-4 py-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700 active:scale-[0.99] disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span>{clearingAll ? "Memproses..." : tLogout("clearAll")}</span>
              </button>
            </div>
          )}

          {/* Button: Cancel / Return to previous application */}
          {(postLogoutRedirectUri || referer) && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleCancel}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2 px-4 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                <span>{tLogout("cancel")}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <Alert type={AlertType.INFO}>
          <Translated i18nKey="noResults" namespace="logout" />
        </Alert>
      )}

      {error && <Alert>{error}</Alert>}
    </div>
  );
}
