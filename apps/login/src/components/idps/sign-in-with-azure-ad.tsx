"use client";

import { forwardRef } from "react";
import { Translated } from "../translated";
import { BaseButton, SignInWithIdentityProviderProps } from "./base-button";

export const SignInWithAzureAd = forwardRef<HTMLButtonElement, SignInWithIdentityProviderProps>(
  function SignInWithAzureAd(props, ref) {
    const { children, name, ...restProps } = props;

    return (
      <BaseButton {...restProps} ref={ref}>
        <div className="flex h-5 w-5 shrink-0 items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" className="h-4 w-4">
            <path fill="#f25022" d="M1 1H10V10H1z" />
            <path fill="#00a4ef" d="M1 11H10V20H1z" />
            <path fill="#7fba00" d="M11 1H20V10H11z" />
            <path fill="#ffb900" d="M11 11H20V20H11z" />
          </svg>
        </div>
        {children ? (
          children
        ) : (
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {name ? name : <Translated i18nKey="signInWithAzureAD" namespace="idp" />}
          </span>
        )}
      </BaseButton>
    );
  },
);
