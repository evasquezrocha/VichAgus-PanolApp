"use client";

import { useState } from "react";

type PublicUrlCopyButtonProps = {
  url: string;
};

export function PublicUrlCopyButton({ url }: PublicUrlCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={() => {
        void handleCopy();
      }}
      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-50"
    >
      {copied ? "Copiado" : "Copiar URL"}
    </button>
  );
}
