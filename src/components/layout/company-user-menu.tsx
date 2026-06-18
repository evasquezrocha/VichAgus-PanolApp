"use client";

import { signOutAction } from "@/actions/auth.actions";
import { changeCurrentPasswordAction } from "@/actions/auth-password.actions";
import type { CurrentProfile } from "@/types/auth";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

type CompanyUserMenuProps = {
  profile: CurrentProfile;
  isExpanded: boolean;
};

function getInitials(fullName: string | null, email: string) {
  const source = fullName?.trim() || email;
  const initials = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "U";
}

export function CompanyUserMenu({ profile, isExpanded }: CompanyUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsChangingPassword(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const userLabel = profile.full_name ?? profile.email;
  const initials = getInitials(profile.full_name, profile.email);
  const popupBackground = profile.company_popup_bg_color ?? "#2b3a44";
  const popupTextColor = profile.company_popup_text_color ?? "#ffffff";

  return (
    <div ref={menuRef} className="relative mt-8 lg:mt-auto">
      <button
        aria-expanded={isOpen}
        className="flex w-full items-center gap-3 rounded-2xl border border-current/15 px-4 py-3 text-left text-sm font-semibold text-current transition hover:bg-current/10"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-current/10 text-xs">
          {initials}
        </span>
        {isExpanded ? (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm">{userLabel}</span>
            <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.25em] opacity-60">
              Usuario activo
            </span>
          </span>
        ) : null}
        <svg
          aria-hidden="true"
          className={["h-4 w-4 shrink-0 transition-transform", isOpen ? "rotate-180" : ""].join(" ")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen ? (
        <div
          className="absolute bottom-[calc(100%+0.75rem)] left-0 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-[1.5rem] border p-4 shadow-2xl shadow-black/25 backdrop-blur"
          style={
            {
              backgroundColor: popupBackground,
              color: popupTextColor,
              borderColor: popupTextColor,
            } as CSSProperties
          }
        >
          {isChangingPassword ? (
            <form action={changeCurrentPasswordAction} className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Cambiar contrasena
                </p>
                <p className="mt-1 text-xs opacity-70">
                  Define una nueva contrasena para tu usuario activo.
                </p>
              </div>

              <label className="block">
                <span className="text-xs font-medium">Nueva contrasena</span>
                <input
                  className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-[#1c2830] outline-none ring-accent/25 transition focus:ring-4"
                  minLength={8}
                  name="password"
                  type="password"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium">Confirmar contrasena</span>
                <input
                  className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-[#1c2830] outline-none ring-accent/25 transition focus:ring-4"
                  minLength={8}
                  name="password_confirmation"
                  type="password"
                  required
                />
              </label>

              <div className="flex gap-2">
                <button
                  className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
                  type="submit"
                >
                  Guardar
                </button>
                <button
                  className="rounded-full border border-current/15 px-4 py-2 text-sm font-semibold text-current transition hover:bg-current/10"
                  onClick={() => setIsChangingPassword(false)}
                  type="button"
                >
                  Volver
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold">{userLabel}</p>
                <p className="mt-1 text-xs opacity-70">{profile.role_name ?? profile.role}</p>
              </div>

              <button
                className="flex w-full items-center gap-3 rounded-2xl border border-current/15 px-4 py-3 text-left text-xs font-semibold text-current transition hover:bg-current/10"
                onClick={() => setIsChangingPassword(true)}
                type="button"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-current/10">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v-2m0-4a2 2 0 1 0-2-2" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V8a5 5 0 0 1 10 0v3" />
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                  </svg>
                </span>
                Cambiar contrasena
              </button>

              <form action={signOutAction}>
                <button className="flex w-full items-center gap-3 rounded-2xl border border-current/15 px-4 py-3 text-left text-xs font-semibold text-current transition hover:bg-current/10">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-current/10">
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l5-5-5-5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 4v16" />
                    </svg>
                  </span>
                  Cerrar sesion
                </button>
              </form>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
