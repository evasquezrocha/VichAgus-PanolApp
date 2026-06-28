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

function ToolboxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M10 7V6a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="M3 13h18" />
      <path d="M9 13v2h6v-2" />
    </svg>
  );
}

function ToolIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M14.7 6.3a4.5 4.5 0 0 0-6.36 6.36l-4.6 4.6a1.5 1.5 0 0 0 2.12 2.12l4.6-4.6a4.5 4.5 0 0 0 6.36-6.36l-2.3 2.3-2.12-2.12 2.3-2.3Z" />
      <path d="M16 4l4 4" />
    </svg>
  );
}

function EmployeeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M7 20v-1a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v1" />
      <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    </svg>
  );
}

function TransferIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M4 7h12" />
      <path d="M12 3l4 4-4 4" />
      <path d="M20 17H8" />
      <path d="M12 13l-4 4 4 4" />
    </svg>
  );
}

function AssetsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M12 3l8 4-8 4-8-4 8-4Z" />
      <path d="M4 11l8 4 8-4" />
      <path d="M4 15l8 4 8-4" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M12 21s6-5.1 6-11a6 6 0 0 0-12 0c0 5.9 6 11 6 11Z" />
      <path d="M12 10.5a1.5 1.5 0 1 0 0-.01Z" />
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

function LayoutEditorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 4v16" />
      <path d="M13 4v16" />
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
  const [isActivosOpen, setIsActivosOpen] = useState(false);
  const [isActivosSettingsOpen, setIsActivosSettingsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const canViewDashboard = hasAnyPermission(permissions, ["company.access"]);
  const canViewPanol = hasAnyPermission(permissions, ["company.access"]);
  const canViewActivos = canViewPanol;
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
  const canViewLayoutEditor = hasAnyPermission(permissions, [
    "company.users.manage",
  ]);
  const canViewSettings =
    canViewUsers || canViewRoles || canViewGeneralParameters || canViewLayoutEditor;
  const isPanolSectionActive =
    pathname === "/company/panol/herramientas" ||
    pathname === "/company/panol/equipos" ||
    pathname === "/company/panol/empleados" ||
    pathname === "/company/panol/ubicaciones" ||
    pathname === "/company/panol/traspasos";
  const isActivosSectionActive = pathname.startsWith("/company/activos/");
  const isToolsActive = pathname === "/company/panol/herramientas";
  const isEquiposActive = pathname === "/company/panol/equipos";
  const isEmpleadosActive = pathname === "/company/panol/empleados";
  const isLocationsActive = pathname === "/company/panol/ubicaciones";
  const isTraspasosActive = pathname === "/company/panol/traspasos";
  const isActivosActive = pathname === "/company/activos/listado-de-activos";
  const isActivosSettingsParentActive = pathname.startsWith("/company/activos/ajustes");
  const isActivosDocumentacionActive =
    pathname === "/company/activos/ajustes/documentacion";
  const isSettingsChildActive =
    pathname === "/company/settings/users" ||
    pathname === "/company/settings/roles" ||
    pathname === "/company/settings/parametros-generales" ||
    pathname === "/company/settings/campos-personalizados" ||
    pathname === "/company/settings/edicion-de-layouts";
  const showPanolChildren = isExpanded && (isPanolOpen || isPanolSectionActive);
  const showActivosChildren = isExpanded && (isActivosOpen || isActivosSectionActive);
  const showActivosSettingsChildren =
    isExpanded && (isActivosSettingsOpen || isActivosSettingsParentActive);
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
        <div className="rounded-2xl transition">
          <button
            type="button"
            className={[
              isExpanded
                ? "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm"
                : "mx-auto flex h-11 w-11 items-center justify-center rounded-2xl text-sm",
              "text-current",
            ].join(" ")}
            title={isExpanded ? undefined : "Pañol"}
            onClick={() => setIsPanolOpen((current) => !current)}
          >
            <span className={["grid shrink-0 place-items-center rounded-xl bg-current/10", isExpanded ? "h-10 w-10" : "h-9 w-9"].join(" ")}>
              <ToolboxIcon />
            </span>
            {isExpanded ? (
              <>
                <span className="font-medium">Pañol</span>
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
                  isToolsActive
                    ? "font-semibold"
                    : "text-current hover:bg-current/10",
                ].join(" ")}
                style={
                  isToolsActive
                    ? {
                        backgroundColor: activeBgColor,
                        color: activeTextColor,
                      }
                    : undefined
                }
                >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-current/10">
                  <ToolIcon />
                </span>
                <span className="font-semibold">Herramientas</span>
              </Link>
              <Link
                href="/company/panol/equipos"
                className={[
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-xs transition",
                  isEquiposActive
                    ? "font-semibold"
                    : "text-current hover:bg-current/10",
                ].join(" ")}
                style={
                  isEquiposActive
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
                <span className="font-semibold">Equipos</span>
              </Link>
              <Link
                href="/company/panol/empleados"
                className={[
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-xs transition",
                  isEmpleadosActive
                    ? "font-semibold"
                    : "text-current hover:bg-current/10",
                ].join(" ")}
                style={
                  isEmpleadosActive
                    ? {
                        backgroundColor: activeBgColor,
                        color: activeTextColor,
                      }
                    : undefined
                }
                >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-current/10">
                  <EmployeeIcon />
                </span>
                <span className="font-semibold">Empleados</span>
              </Link>
              <Link
                href="/company/panol/traspasos"
                className={[
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-xs transition",
                  isTraspasosActive
                    ? "font-semibold"
                    : "text-current hover:bg-current/10",
                ].join(" ")}
                style={
                  isTraspasosActive
                    ? {
                        backgroundColor: activeBgColor,
                        color: activeTextColor,
                      }
                    : undefined
                }
                >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-current/10">
                  <TransferIcon />
                </span>
                <span className="font-semibold">Traspasos</span>
              </Link>
              <Link
                href="/company/panol/ubicaciones"
                className={[
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-xs transition",
                  isLocationsActive
                    ? "font-semibold"
                    : "text-current hover:bg-current/10",
                ].join(" ")}
                style={
                  isLocationsActive
                    ? {
                        backgroundColor: activeBgColor,
                        color: activeTextColor,
                      }
                    : undefined
                }
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-current/10">
                  <LocationIcon />
                </span>
                <span className="font-semibold">Ubicaciones</span>
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {canViewActivos ? (
        <div className="rounded-2xl transition">
          <button
            type="button"
            className={[
              isExpanded
                ? "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm"
                : "mx-auto flex h-11 w-11 items-center justify-center rounded-2xl text-sm",
              "text-current",
            ].join(" ")}
            title={isExpanded ? undefined : "Activos"}
            onClick={() => setIsActivosOpen((current) => !current)}
          >
            <span className={["grid shrink-0 place-items-center rounded-xl bg-current/10", isExpanded ? "h-10 w-10" : "h-9 w-9"].join(" ")}>
              <AssetsIcon />
            </span>
            {isExpanded ? (
              <>
                  <span className="font-medium">Activos</span>
                <span className="ml-auto">
                  <ChevronIcon open={showActivosChildren} />
                </span>
              </>
            ) : null}
          </button>

          {showActivosChildren ? (
            <div className="space-y-1 pb-2 pl-4 pr-2">
              <Link
                href="/company/activos/listado-de-activos"
                className={[
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-xs transition",
                  isActivosActive ? "font-semibold" : "text-current hover:bg-current/10",
                ].join(" ")}
                style={
                  isActivosActive
                    ? {
                        backgroundColor: activeBgColor,
                        color: activeTextColor,
                      }
                    : undefined
                }
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-current/10">
                  <AssetsIcon />
                </span>
                <span className="font-semibold">Listado de Activos</span>
              </Link>

              <button
                type="button"
                className={[
                  "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-xs transition",
                  "text-current hover:bg-current/10",
                ].join(" ")}
                onClick={() => setIsActivosSettingsOpen((current) => !current)}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-current/10">
                  <SettingsIcon />
                </span>
                <span className="font-medium">Ajustes</span>
                <span className="ml-auto">
                  <ChevronIcon open={showActivosSettingsChildren} />
                </span>
              </button>

              {showActivosSettingsChildren ? (
                <div className="space-y-1 pl-4 pr-2">
                  <Link
                    href="/company/activos/ajustes/documentacion"
                    className={[
                      "flex items-center gap-3 rounded-2xl px-3 py-3 text-xs transition",
                      isActivosDocumentacionActive
                        ? "font-semibold"
                        : "text-current hover:bg-current/10",
                    ].join(" ")}
                    style={
                      isActivosDocumentacionActive
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
                    <span className="font-semibold">Documentación</span>
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {canViewSettings ? (
        <div className="rounded-2xl transition">
          <button
            type="button"
            className={[
              isExpanded
                ? "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm"
                : "mx-auto flex h-11 w-11 items-center justify-center rounded-2xl text-sm",
              "text-current",
            ].join(" ")}
            title={isExpanded ? undefined : "Configuración"}
            onClick={() => setIsSettingsOpen((current) => !current)}
          >
            <span className={["grid shrink-0 place-items-center rounded-xl bg-current/10", isExpanded ? "h-10 w-10" : "h-9 w-9"].join(" ")}>
              <SettingsIcon />
            </span>
            {isExpanded ? (
              <>
                <span className="font-medium">Configuración</span>
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
                  <span className="font-semibold">Parámetros Generales</span>
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
              <Link
                href="/company/settings/campos-personalizados"
                className={[
                  "flex items-center gap-3 rounded-2xl px-3 py-3 text-xs transition",
                  pathname === "/company/settings/campos-personalizados"
                    ? "font-semibold"
                    : "text-current hover:bg-current/10",
                ].join(" ")}
                style={
                  pathname === "/company/settings/campos-personalizados"
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
                <span className="font-semibold">Campos Personalizados</span>
              </Link>
              {canViewLayoutEditor ? (
                <Link
                  href="/company/settings/edicion-de-layouts"
                  className={[
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-xs transition",
                    pathname === "/company/settings/edicion-de-layouts"
                      ? "font-semibold"
                      : "text-current hover:bg-current/10",
                  ].join(" ")}
                  style={
                    pathname === "/company/settings/edicion-de-layouts"
                      ? {
                          backgroundColor: activeBgColor,
                          color: activeTextColor,
                        }
                      : undefined
                  }
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-current/10">
                    <LayoutEditorIcon />
                  </span>
                  <span className="font-semibold">Edición de Layouts</span>
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}
