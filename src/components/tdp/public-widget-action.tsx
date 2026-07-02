"use client";

import type { ReactNode } from "react";
import { useState } from "react";

type PublicWidgetActionProps = {
  label: string;
  href?: string;
  copyText?: string;
  subtitle?: string;
  toneClassName: string;
  icon: ReactNode;
};

function ActionIconButton({
  children,
  onClick,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
      aria-label={label}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

export function PublicWidgetAction({
  label,
  href,
  copyText,
  subtitle,
  toneClassName,
  icon,
}: PublicWidgetActionProps) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    if (!copyText) {
      return;
    }

    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const content = (
    <>
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${toneClassName} text-white shadow-lg`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="text-lg font-extrabold leading-tight">{label}</div>
        {subtitle ? <div className="mt-1 text-sm text-slate-600">{subtitle}</div> : null}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
      >
        {content}
      </a>
    );
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-4">{content}</div>
      {copyText ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <ActionIconButton
            label={copied ? "Copiado" : "Copiar datos"}
            onClick={() => {
              void copyToClipboard();
            }}
          >
            <span className="text-xs uppercase tracking-[0.2em]">{copied ? "OK" : "COPIAR"}</span>
          </ActionIconButton>
        </div>
      ) : null}
    </article>
  );
}
