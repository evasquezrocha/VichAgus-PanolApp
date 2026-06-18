"use client";

import type { AppPermission } from "@/types/permission";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M3 13h8V3H3zM13 21h8v-6h-8zM13 11h8V3h-8zM3 21h8v-6H3z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.96 3a1.7 1.7 0 0 0 1-1.55V1a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 8c.13.5.56.93 1.06 1H21a2 2 0 1 1 0 4h-.54c-.5.07-.93.5-1.06 1z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={["h-4 w-4 shrink-0 transition-transform", open ? "rotate-180" : ""].join(" ")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M4 21v-7" />
      <path d="M4 10V3" />
      <path d="M12 21v-9" />
      <path d="M12 8V3" />
      <path d="M20 21v-5" />
      <path d="M20 12V3" />
      <path d="M2 14h4" />
      <path d="M10 8h4" />
      <path d="M18 16h4" />
    </svg>
  );
}

type CompanySidebarProps = {
  isExpanded: boolean;
  permissions: AppPermission[];
  activeBgColor: string;
  activeTextColor: string;
};

function hasAnyPermission(
  currentPermissions: AppPermission[],
  requiredPermissions: AppPermission[],
) {
  return requiredPermissions.some((permission) =>
    currentPermissions.includes(permission),
  );
}

export function CompanySidebar({
  isExpanded,
  permissions,
  activeBgColor,
  activeTextColor,
}: CompanySidebarProps) {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const canViewDashboard = hasAnyPermission(permissions, ["company.access"]);
  const canViewUsers = hasAnyPermission(permissions, [
    "company.users.read",
    "company.users.manage",
  ]);
  const canViewRoles = hasAnyPermission(permissions, [
    "company.roles.read",
    "company.roles.manage",
  ]);
  const canViewGeneralParameters = hasAnyPermission(permissions, [
    "company.access",
  ]);
  const canViewSettings =
    canViewUsers || canViewRoles || canViewGeneralParameters;
  const isSettingsRoute =
    pathname === "/company/settings/users" ||
    pathname === "/company/settings/roles" ||
    pathname === "/company/settings/parametros-generales";
  const showSettingsChildren = isExpanded && (isSettingsOpen || isSettingsRoute);

  return (
    <nav className="space-y-2">
      {canViewDashboard ? (
        <Link
          href="/dashboard"
          className={[
            isExpanded
              ? "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition"
              : "mx-auto flex h-11 w-11 items-center justify-center rounded-2xl text-sm transition",
            pathname === "/dashboard"
              ? "font-semibold"
              : "text-current hover:bg-current/10",
          ].join(" ")}
          title={isExpanded ? undefined : "Dashboard"}
          style={
            pathname === "/dashboard"
              ? {
                  backgroundColor: activeBgColor,
                  color: activeTextColor,
                }
              : undefined
          }
        >
          <span
            className={[
              "grid shrink-0 place-items-center rounded-xl bg-current/10",
              isExpanded ? "h-10 w-10" : "h-9 w-9",
            ].join(" ")}
          >
            <DashboardIcon />
          </span>
          {isExpanded ? <span className="font-semibold">Dashboard</span> : null}
        </Link>
      ) : null}

      {canViewSettings ? (
        <div
          className={[
            "rounded-2xl transition",
            showSettingsChildren ? "bg-current/10" : "",
          ].join(" ")}
        >
          <button
            type="button"
            className={[
              isExpanded
                ? "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm"
                : "mx-auto flex h-11 w-11 items-center justify-center rounded-2xl text-sm",
              isSettingsRoute ? "font-semibold" : "text-current",
            ].join(" ")}
            title={isExpanded ? undefined : "Configuracion"}
            onClick={() => setIsSettingsOpen((current) => !current)}
            style={
              isSettingsRoute
                ? {
                    backgroundColor: activeBgColor,
                    color: activeTextColor,
                  }
                : undefined
            }
          >
            <span
              className={[
                "grid shrink-0 place-items-center rounded-xl bg-current/10",
                isExpanded ? "h-10 w-10" : "h-9 w-9",
              ].join(" ")}
            >
              <SettingsIcon />
            </span>
            {isExpanded ? (
              <>
                <span className="font-semibold">Configuracion</span>
                <span className="ml-auto">
                  <ChevronIcon open={showSettingsChildren} />
                </span>
              </>
            ) : null}
          </button>

          {showSettingsChildren ? (
            <div className="space-y-1 pb-2 pl-4 pr-2">
              {canViewGeneralParameters ? (
                  <Link
                    href="/company/settings/parametros-generales"
                    className={[
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-xs transition",
                    pathname === "/company/settings/parametros-generales"
                      ? "font-semibold"
                      : "text-current hover:bg-current/10",
                  ].join(" ")}
                  style={
                    pathname === "/company/settings/parametros-generales"
                      ? {
                          backgroundColor: activeBgColor,
                          color: activeTextColor,
                        }
                      : undefined
                  }
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-current/10">
                    <SlidersIcon />
                  </span>
                  <span className="font-semibold">Parametros Generales</span>
                </Link>
              ) : null}
              {canViewUsers ? (
                <Link
                  href="/company/settings/users"
                  className={[
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-xs transition",
                    pathname === "/company/settings/users"
                      ? "font-semibold"
                      : "text-current hover:bg-current/10",
                  ].join(" ")}
                  style={
                    pathname === "/company/settings/users"
                      ? {
                          backgroundColor: activeBgColor,
                          color: activeTextColor,
                        }
                      : undefined
                  }
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-current/10">
                    <UsersIcon />
                  </span>
                  <span className="font-semibold">Usuarios</span>
                </Link>
              ) : null}
              {canViewRoles ? (
                <Link
                  href="/company/settings/roles"
                  className={[
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-xs transition",
                    pathname === "/company/settings/roles"
                      ? "font-semibold"
                      : "text-current hover:bg-current/10",
                  ].join(" ")}
                  style={
                    pathname === "/company/settings/roles"
                      ? {
                          backgroundColor: activeBgColor,
                          color: activeTextColor,
                        }
                      : undefined
                  }
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-current/10">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5"
                    >
                      <path d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7z" />
                      <path d="M9.5 12.5l1.5 1.5 3.5-3.5" />
                    </svg>
                  </span>
                  <span className="font-semibold">Roles</span>
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}
