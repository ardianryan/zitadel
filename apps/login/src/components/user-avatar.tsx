import { Avatar } from "@/components/avatar";
import { getComponentRoundness } from "@/lib/theme";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

// Helper function to get user avatar container roundness from theme
function getUserAvatarRoundness(): string {
  return getComponentRoundness("avatarContainer");
}

type Props = {
  loginName?: string;
  displayName?: string;
  email?: string;
  showDropdown: boolean;
  searchParams?: Record<string | number | symbol, string | undefined>;
};

export function UserAvatar({ loginName, displayName, email, showDropdown, searchParams }: Props) {
  const params = new URLSearchParams({});
  const userAvatarRoundness = getUserAvatarRoundness();

  if (searchParams?.sessionId) {
    params.set("sessionId", searchParams.sessionId);
  }

  if (searchParams?.organization) {
    params.set("organization", searchParams.organization);
  }

  if (searchParams?.requestId) {
    params.set("requestId", searchParams.requestId);
  }

  if (searchParams?.loginName) {
    params.set("loginName", searchParams.loginName);
  }

  const effectiveDisplayName = displayName || loginName;
  const showSubtext = Boolean(displayName && loginName && displayName !== loginName);

  return (
    <div className={`flex h-full flex-row items-center border p-[1px] dark:border-white/20 ${userAvatarRoundness}`}>
      <div>
        <Avatar
          size="small"
          name={effectiveDisplayName ?? ""}
          loginName={loginName ?? ""}
          email={email}
        />
      </div>
      <div className="ml-3 flex flex-col justify-center overflow-hidden pr-2 text-left">
        <span className="text-14px font-medium max-w-[240px] truncate text-slate-900 dark:text-white">
          {effectiveDisplayName}
        </span>
        {showSubtext && (
          <span className="text-[11px] leading-tight max-w-[240px] truncate text-slate-500 dark:text-slate-400">
            {loginName}
          </span>
        )}
      </div>
      <span className="flex-grow"></span>
      {showDropdown && (
        <Link
          href={"/accounts?" + params}
          className={`mr-1 ml-2 flex items-center justify-center p-1 transition-all hover:bg-black/10 dark:hover:bg-white/10 ${userAvatarRoundness}`}
        >
          <ChevronDownIcon className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
