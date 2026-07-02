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
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${toneClassName} text-white shadow-[0_10px_24px_rgba(0,0,0,0.25)]`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="text-[1.05rem] font-bold leading-tight text-white">{label}</div>
      </div>
      {href ? (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-white/45"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        className="flex items-center gap-4 rounded-[1.15rem] border border-[#3a3428] bg-[#171717] px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition hover:border-[#4a4336] hover:bg-[#1c1c1c]"
      >
        {content}
      </a>
    );
  }

  if (copyText) {
    return (
      <button
        type="button"
        onClick={() => {
          void copyToClipboard();
        }}
        className="w-full rounded-[1.15rem] border border-[#3a3428] bg-[#171717] px-5 py-4 text-left shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition hover:border-[#4a4336] hover:bg-[#1c1c1c]"
        aria-label={`${label}: copiar datos`}
        title={`${label}: copiar datos`}
      >
        <div className="flex items-center gap-4">{content}</div>
      </button>
    );
  }

  return (
    <article className="rounded-[1.15rem] border border-[#3a3428] bg-[#171717] px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
      <div className="flex items-center gap-4">{content}</div>
    </article>
  );
}
