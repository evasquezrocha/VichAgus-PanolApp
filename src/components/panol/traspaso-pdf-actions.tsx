"use client";

import { useEffect } from "react";

export function TransferPdfActions() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.print();
    }, 300);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <button
      className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong print:hidden"
      onClick={() => window.print()}
      type="button"
    >
      Imprimir / Guardar PDF
    </button>
  );
}
