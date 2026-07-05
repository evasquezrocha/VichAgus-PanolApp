"use client";

import { signOutAction } from "@/actions/auth.actions";
import { changeCurrentPasswordAction } from "@/actions/auth-password.actions";
import type { CurrentProfile } from "@/types/auth";
import { useEffect, useRef, useState } from "react";

type TdpUserMenuProps = {
  profile: CurrentProfile;
};

export function TdpUserMenu({ profile }: TdpUserMenuProps) {
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

  const userLabel = profile.full_name ?? "Sin nombre";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
            Usuario activo
          </p>
          <p className="mt-2 truncate text-sm font-semibold text-white">{userLabel}</p>
        </div>

        <svg
          aria-hidden="true"
          className={["h-4 w-4 shrink-0 transition-transform", isOpen ? "rotate-180" : ""].join(
            " ",
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(20rem,calc(100vw-2rem))] rounded-[1.5rem] border border-sky-950/50 bg-slate-900/95 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          {isChangingPassword ? (
            <form action={changeCurrentPasswordAction} className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                  Cambiar Contraseña
                </p>
                <p className="mt-1 text-xs text-white/65">
                  Define una nueva contraseña para tu usuario activo.
                </p>
              </div>

              <label className="block">
                <span className="text-xs font-medium text-white/80">Nueva contraseña</span>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none ring-blue-400/25 transition placeholder:text-white/30 focus:ring-4"
                  minLength={8}
                  name="password"
                  type="password"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-white/80">Confirmar contraseña</span>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none ring-blue-400/25 transition placeholder:text-white/30 focus:ring-4"
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
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  onClick={() => setIsChangingPassword(false)}
                  type="button"
                >
                  Volver
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setIsChangingPassword(true)}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10">
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
                Cambiar Contraseña
              </button>

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10">
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
                  Cerrar Sesión
                </button>
              </form>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
