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

function WarehouseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M3 21V8l9-4 9 4v13" />
      <path d="M5 21v-8h14v8" />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01" />
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

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M12 3l7 4v5c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7z" />
      <path d="M9.5 12.5l1.5 1.5 3.5-3.5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.04.04a2.2 2.2 0 0 1-1.56 3.76 2.2 2.2 0 0 1-1.56-.65l-.04-.04a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.64V20a2.2 2.2 0 0 1-4.4 0v-.05a1.8 1.8 0 0 0-1.1-1.64 1.8 1.8 0 0 0-1.98.36l-.04.04a2.2 2.2 0 0 1-3.12 0 2.2 2.2 0 0 1 0-3.12l.04-.04a1.8 1.8 0 0 0 .36-1.98 1.8 1.8 0 0 0-1.64-1.1H4a2.2 2.2 0 0 1 0-4.4h.05a1.8 1.8 0 0 0 1.64-1.1 1.8 1.8 0 0 0-.36-1.98l-.04-.04a2.2 2.2 0 0 1 0-3.12 2.2 2.2 0 0 1 3.12 0l.04.04a1.8 1.8 0 0 0 1.98.36H11a1.8 1.8 0 0 0 1.1-1.64V4a2.2 2.2 0 0 1 4.4 0v.05a1.8 1.8 0 0 0 1.1 1.64 1.8 1.8 0 0 0 1.98-.36l.04-.04a2.2 2.2 0 0 1 3.12 0 2.2 2.2 0 0 1 0 3.12l-.04.04a1.8 1.8 0 0 0-.36 1.98V11c0 .72.43 1.37 1.1 1.64.21.08.44.13.67.13H20a2.2 2.2 0 0 1 0 4.4h-.05a1.8 1.8 0 0 0-1.64 1.1Z" />
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
  const [isPanolOpen, setIsPanolOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const canViewDashboard = hasAnyPermission(permissions, ["company.access"]);
  const canViewPanol = hasAnyPermission(permissions, ["company.access"]);
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
  const isPanolParentActive = pathname === "/company/panol";
  const isPanolChildActive = pathname === "/company/panol/herramientas";
  const isSettingsParentActive = pathname === "/company/settings";
  const isSettingsChildActive =
    pathname === "/company/settings/users" ||
    pathname === "/company/settings/roles" ||
    pathname === "/company/settings/parametros-generales";
  const showPanolChildren = isExpanded && (isPanolOpen || isPanolChildActive);
  const showSettingsChildren = isExpanded && (isSettingsOpen || isSettingsChildActive);

  return (
    <nav className="space-y-2">
      {canViewDashboard ? (
        <Link
          href="/dashboard"
          className={[
            isExpanded
              ? "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition"
              : "mx-auto flex h-11 w-11 items-center justify-center rounded-2xl text-sm transition",
            pathname === "/dashboard" ? "font-semibold" : "text-current hover:bg-current/10",
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
          <span className={["grid shrink-0 place-items-center rounded-xl bg-current/10", isExpanded ? "h-10 w-10" : "h-9 w-9"].join(" ")}>
            <DashboardIcon />
          </span>
          {isExpanded ? <span className="font-semibold">Dashboard</span> : null}
        </Link>
      ) : null}

      {canViewPanol ? (
        <div className={["rounded-2xl transition", showPanolChildren ? "bg-current/10" : ""].join(" ")}>
          <button
            type="button"
            className={[
              isExpanded
                ? "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm"
                : "mx-auto flex h-11 w-11 items-center justify-center rounded-2xl text-sm",
              isPanolParentActive ? "font-semibold" : "text-current",
            ].join(" ")}
            title={isExpanded ? undefined : "Pañol"}
            onClick={() => setIsPanolOpen((current) => !current)}
            style={
              isPanolParentActive
                ? {
                    backgroundColor: activeBgColor,
                    color: activeTextColor,
                  }
                : undefined
            }
          >
            <span className={["grid shrink-0 place-items-center rounded-xl bg-current/10", isExpanded ? "h-10 w-10" : "h-9 w-9"].join(" ")}>
              <WarehouseIcon />
            </span>
            {isExpanded ? (
              <>
                <span className="font-semibold">Pañol</span>
                <span className="ml-auto">
                  <ChevronIcon open={showPanolChildren} />
                </span>
              </>
            ) : null}
          </button>

          {showPanolChildren ? (
            <div className="space-y-1 pb-2 pl-4 pr-2">
              <Link
                href="/company/panol/herramientas"
                className={[
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-xs transition",
                  isPanolChildActive
                    ? "font-semibold"
                    : "text-current hover:bg-current/10",
                ].join(" ")}
                style={
                  isPanolChildActive
                    ? {
                        backgroundColor: activeBgColor,
                        color: activeTextColor,
                      }
                    : undefined
                }
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-current/10">
                  <WarehouseIcon />
                </span>
                <span className="font-semibold">Herramientas</span>
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {canViewSettings ? (
        <div className={["rounded-2xl transition", showSettingsChildren ? "bg-current/10" : ""].join(" ")}>
          <button
            type="button"
            className={[
              isExpanded
                ? "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm"
                : "mx-auto flex h-11 w-11 items-center justify-center rounded-2xl text-sm",
              isSettingsParentActive ? "font-semibold" : "text-current",
            ].join(" ")}
            title={isExpanded ? undefined : "Configuracion"}
            onClick={() => setIsSettingsOpen((current) => !current)}
            style={
              isSettingsParentActive
                ? {
                    backgroundColor: activeBgColor,
                    color: activeTextColor,
                  }
                : undefined
            }
          >
            <span className={["grid shrink-0 place-items-center rounded-xl bg-current/10", isExpanded ? "h-10 w-10" : "h-9 w-9"].join(" ")}>
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
                    <ShieldIcon />
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
