"use client";

import type { FlashMessage } from "@/lib/flash";
import { useEffect, useState } from "react";

type FlashBannerProps = {
  flash: FlashMessage | null;
  dismissAfterMs?: number;
};

export function FlashBanner({
  flash,
  dismissAfterMs = 10_000,
}: FlashBannerProps) {
  const [visible, setVisible] = useState(Boolean(flash));

  useEffect(() => {
    if (!flash) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const timeoutId = window.setTimeout(() => {
      setVisible(false);
    }, dismissAfterMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [dismissAfterMs, flash]);

  if (!flash) {
    return null;
  }

  if (!visible) {
    return null;
  }

  const tone =
    flash.intent === "success"
      ? "border-[#52D6A4]/45 bg-[#52D6A4]/12 text-[#1d4335]"
      : "border-[#c86f5d]/35 bg-[#c86f5d]/10 text-[#7b3428]";

  return (
    <div
      className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${tone}`}
      role={flash.intent === "error" ? "alert" : "status"}
    >
      {flash.message}
    </div>
  );
}
