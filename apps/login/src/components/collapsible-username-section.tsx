"use client";

import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";

type Props = {
  defaultOpen?: boolean;
  toggleText: string;
  children: React.ReactNode;
};

export function CollapsibleUsernameSection({ defaultOpen = false, toggleText, children }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  return (
    <div className="w-full">
      <div className="relative flex items-center justify-center py-2 select-none">
        <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="collapsible-username-form"
          data-testid="toggle-username-form"
          className="absolute inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-4 py-1.5 text-xs font-semibold text-[#0F91FC] shadow-sm transition-all hover:border-[#0F91FC]/50 hover:bg-blue-50/50 hover:shadow dark:border-slate-700 dark:bg-slate-900 dark:text-[#38BDF8] dark:hover:bg-slate-800"
        >
          <span>{toggleText}</span>
          {isOpen ? (
            <ChevronUpIcon className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
          ) : (
            <ChevronDownIcon className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
          )}
        </button>
      </div>

      {isOpen && (
        <div
          id="collapsible-username-form"
          data-testid="collapsible-content"
          className="pt-3"
        >
          {children}
        </div>
      )}
    </div>
  );
}
