"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type PendingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: string;
  pendingIcon?: ReactNode;
};

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

export function PendingButton({
  children,
  pendingIcon,
  pendingLabel,
  className,
  disabled,
  ...props
}: PendingButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = Boolean(disabled || pending);

  const content = pending ? (
    <span className="inline-flex items-center gap-2">
      {pendingIcon ?? <Spinner />}
      {pendingLabel ? <span>{pendingLabel}</span> : null}
    </span>
  ) : (
    children
  );

  return (
    <button
      {...props}
      aria-busy={pending ? true : undefined}
      className={[
        className ?? "",
        pending ? "cursor-wait opacity-80" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={isDisabled}
    >
      {content}
    </button>
  );
}
