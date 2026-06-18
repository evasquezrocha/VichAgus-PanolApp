"use client";
/* eslint-disable @next/next/no-img-element */

import type { CurrentProfile } from "@/types/auth";
import type { CSSProperties } from "react";
import { useState } from "react";
import { CompanySidebar } from "./company-sidebar";
import { CompanyUserMenu } from "./company-user-menu";

type CompanyShellProps = {
  children: React.ReactNode;
  profile: CurrentProfile;
  title?: string;
  subtitle?: string;
};

function getInitials(companyName: string) {
  const initials = companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "E";
}

export function CompanyShell({
  children,
  profile,
  title,
  subtitle,
}: CompanyShellProps) {
  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.localStorage.getItem("company-sidebar-pinned") !== "false";
  });
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isPinned || isHovered;

  const companyName = profile.company_name ?? "Sin empresa";
  const companyLogoUrl = profile.company_logo_url ?? null;
  const sidebarBackground = profile.company_sidebar_bg_color ?? "#2b3a44";
  const sidebarTextColor = profile.company_sidebar_text_color ?? "#ffffff";
  const platformBackground =
    profile.company_platform_background_color ?? "#f6f3ed";
  const companyInitials = getInitials(companyName);

  function togglePinned() {
    setIsPinned((currentPinned) => {
      const nextValue = !currentPinned;
      window.localStorage.setItem("company-sidebar-pinned", String(nextValue));

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
          style={{ backgroundColor: sidebarBackground, color: sidebarTextColor } as CSSProperties}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-center gap-3">
              <div className="flex min-w-0 flex-1 justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                  {companyLogoUrl ? (
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.75rem] border border-current/15 bg-current/10">
                      <img
                        alt={companyName}
                        className="h-full w-full object-contain p-3"
                        src={companyLogoUrl}
                      />
                    </div>
                  ) : (
                    <div className="grid h-20 w-20 place-items-center rounded-[1.75rem] border border-current/15 bg-current/10 text-2xl font-semibold">
                      {companyInitials}
                    </div>
                  )}

                  {isExpanded ? (
                    <p className="truncate text-sm font-semibold uppercase tracking-[0.22em] opacity-80">
                      {companyName}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <CompanySidebar
                isExpanded={isExpanded}
                permissions={profile.permissions}
                activeBgColor={profile.company_sidebar_active_bg_color ?? "#52d6a4"}
                activeTextColor={profile.company_sidebar_active_text_color ?? "#2b3a44"}
              />
            </div>

            <div className="mt-3">
              <button
                aria-label={isPinned ? "Desfijar menu lateral" : "Fijar menu lateral"}
                title={isPinned ? "Desfijar menu lateral" : "Fijar menu lateral"}
                aria-pressed={isPinned}
                className={[
                  "mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-current/15 text-current transition hover:bg-current/10",
                ].join(" ")}
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

            <CompanyUserMenu profile={profile} isExpanded={isExpanded} />
          </div>
        </aside>

        <main className="min-h-screen p-5 md:p-8">
          {title || subtitle ? (
            <header className="mb-8 pb-3">
              {title ? (
                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  {title}
                </h2>
              ) : null}
              {subtitle ? (
                <p className={title ? "mt-3 max-w-3xl text-muted" : "max-w-3xl text-muted"}>
                  {subtitle}
                </p>
              ) : null}
            </header>
          ) : null}

          {children}
        </main>
      </div>
    </div>
  );
}
