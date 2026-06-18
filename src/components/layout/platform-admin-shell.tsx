"use client";

import { signOutAction } from "@/actions/auth.actions";
import type { CurrentProfile } from "@/types/auth";
import type { CSSProperties } from "react";
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
  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.localStorage.getItem("platform-sidebar-pinned") !== "false";
  });
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isPinned || isHovered;

  const platformBackground = "#ece4d8";

  function togglePinned() {
    setIsPinned((currentPinned) => {
      const nextValue = !currentPinned;
      window.localStorage.setItem("platform-sidebar-pinned", String(nextValue));

      if (!nextValue) {
        setIsHovered(false);
      }

      return nextValue;
    });
  }

  return (
    <div
      className={[
        "min-h-screen px-0 py-0 transition-[padding] duration-300",
        isPinned ? "lg:pl-[20.5rem]" : "lg:pl-[6.75rem]",
      ].join(" ")}
      style={{ backgroundColor: platformBackground }}
    >
      <div className="min-h-screen w-full">
        <aside
          className={[
            "p-3 shadow-2xl shadow-black/20 transition-all duration-300 md:p-4",
            "lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:h-screen",
            isExpanded ? "lg:w-[19rem]" : "lg:w-[5.25rem]",
          ].join(" ")}
          style={{ backgroundColor: "#2b3a44", color: "#ffffff" } as CSSProperties}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-center gap-3">
              <div className="flex min-w-0 flex-1 justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="grid h-20 w-20 place-items-center rounded-[1.75rem] border border-current/15 bg-current/10 text-2xl font-semibold">
                    PA
                  </div>

                  {isExpanded ? (
                    <p className="truncate text-sm font-semibold uppercase tracking-[0.22em] opacity-80">
                      PanolApp
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <PlatformAdminSidebar
                isOpen={isPinned || isHovered}
                isExpanded={isExpanded}
                isSuperAdmin={profile.role === "super_admin"}
                onNavigate={() => setIsHovered(false)}
                permissions={profile.permissions}
              />
            </div>

            <div className="mt-3">
              <button
                aria-label={isPinned ? "Desfijar menu lateral" : "Fijar menu lateral"}
                title={isPinned ? "Desfijar menu lateral" : "Fijar menu lateral"}
                aria-pressed={isPinned}
                className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-current/15 text-current transition hover:bg-current/10"
                onClick={togglePinned}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className={["h-4 w-4 shrink-0 transition-transform", isPinned ? "rotate-45" : ""].join(" ")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 4l6 6m-8.5-3.5l6 6M7 13l4 4M5 19l5-5m-1-7l8 8-3 3-8-8 3-3z"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-8">
              <form action={signOutAction}>
                <button
                  className={[
                    "flex w-full items-center gap-3 rounded-2xl border border-white/12 px-4 py-3 text-left font-semibold text-white transition hover:bg-white/10",
                    isExpanded ? "" : "justify-center px-0",
                  ].join(" ")}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10 text-sm">
                    S
                  </span>
                  {isExpanded ? <span>Cerrar sesion</span> : null}
                </button>
              </form>
            </div>
          </div>
        </aside>

        <main className="min-h-screen p-5 md:p-8">
          <header className="mb-8 pb-3">
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

          {children}
        </main>
      </div>
    </div>
  );
}
