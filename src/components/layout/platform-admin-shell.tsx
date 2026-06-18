"use client";

import { signOutAction } from "@/actions/auth.actions";
import type { CurrentProfile } from "@/types/auth";
import { useState } from "react";
import { PlatformAdminSidebar } from "./platform-admin-sidebar";

type PlatformAdminShellProps = {
  children: React.ReactNode;
  profile: CurrentProfile;
  title?: string;
  subtitle?: string;
};

export function PlatformAdminShell({
  children,
  profile,
  title,
  subtitle,
}: PlatformAdminShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f3ed_0%,#ece4d8_100%)]">
      <button
        aria-expanded={isMenuOpen}
        aria-label="Abrir configuraciones"
        className="fixed right-4 top-4 z-50 grid h-12 w-12 place-items-center rounded-2xl border border-white/60 bg-white/90 text-[#2b3a44] shadow-lg shadow-black/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
        onClick={() => setIsMenuOpen((current) => !current)}
        type="button"
      >
        <svg
          aria-hidden="true"
          className={["h-5 w-5 transition-transform", isMenuOpen ? "rotate-90" : ""].join(" ")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Zm7.4-.5a1.8 1.8 0 0 0 .36 1.98l.04.04a2.2 2.2 0 0 1-1.56 3.76 2.2 2.2 0 0 1-1.56-.65l-.04-.04a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.64V20a2.2 2.2 0 0 1-4.4 0v-.05a1.8 1.8 0 0 0-1.1-1.64 1.8 1.8 0 0 0-1.98.36l-.04.04a2.2 2.2 0 0 1-3.12 0 2.2 2.2 0 0 1 0-3.12l.04-.04a1.8 1.8 0 0 0 .36-1.98 1.8 1.8 0 0 0-1.64-1.1H4a2.2 2.2 0 0 1 0-4.4h.05a1.8 1.8 0 0 0 1.64-1.1 1.8 1.8 0 0 0-.36-1.98l-.04-.04a2.2 2.2 0 0 1 0-3.12 2.2 2.2 0 0 1 3.12 0l.04.04a1.8 1.8 0 0 0 1.98.36H11a1.8 1.8 0 0 0 1.1-1.64V4a2.2 2.2 0 0 1 4.4 0v.05a1.8 1.8 0 0 0 1.1 1.64 1.8 1.8 0 0 0 1.98-.36l.04-.04a2.2 2.2 0 0 1 3.12 0 2.2 2.2 0 0 1 0 3.12l-.04.04a1.8 1.8 0 0 0-.36 1.98V11c0 .72.43 1.37 1.1 1.64.21.08.44.13.67.13H20a2.2 2.2 0 0 1 0 4.4h-.05a1.8 1.8 0 0 0-1.64 1.1Z"
          />
        </svg>
      </button>

      <main className="min-h-screen px-5 py-5 pr-20 md:px-8 md:pr-24">
        {title ? (
          <header className="mb-8 max-w-4xl pb-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">
              Super admin
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-3 max-w-3xl text-muted">{subtitle}</p>
            ) : null}
          </header>
        ) : null}

        {children}
      </main>

      <button
        aria-hidden={!isMenuOpen}
        className={[
          "fixed inset-0 z-40 bg-[#1c2830]/45 transition-opacity duration-300",
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setIsMenuOpen(false)}
        tabIndex={-1}
        type="button"
      />

      <aside
        aria-label="Administración"
        className={[
          "fixed right-0 top-0 z-50 flex h-full w-[min(24rem,calc(100vw-1rem))] translate-x-full flex-col border-l border-white/10 bg-[#2b3a44] p-4 text-white shadow-2xl shadow-[#2b3a44]/25 transition-transform duration-300 md:p-5",
          isMenuOpen ? "translate-x-0" : "",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#52D6A4]">
              PanolApp
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              Administración
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/68">
              Configuración y accesos globales de la plataforma.
            </p>
          </div>
          <button
            aria-label="Cerrar menu lateral"
            className="rounded-xl border border-white/15 bg-white/8 p-2 text-white transition hover:bg-white/15"
            onClick={() => setIsMenuOpen(false)}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-8 flex-1 overflow-y-auto pr-1">
          <PlatformAdminSidebar
            isOpen={isMenuOpen}
            onNavigate={() => setIsMenuOpen(false)}
            permissions={profile.permissions}
          />
        </div>

        <form action={signOutAction} className="mt-8">
          <button className="flex w-full items-center gap-3 rounded-2xl border border-white/12 px-4 py-3 text-left font-semibold text-white transition hover:bg-white/10">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10 text-sm">
              S
            </span>
            <span>Cerrar sesion</span>
          </button>
        </form>
      </aside>
    </div>
  );
}
