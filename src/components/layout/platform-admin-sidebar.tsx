"use client";

import type { AppPermission } from "@/types/permission";
import Link from "next/link";
import { usePathname } from "next/navigation";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M3 13h8V3H3zM13 21h8v-6h-8zM13 11h8V3h-8zM3 21h8v-6H3z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <path d="M4 21V7l8-4 8 4v14M9 21v-4h6v4M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" />
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

const navigationItems = [
  {
    href: "/admin/parametros-generales",
    label: "Parametros Generales",
    icon: SettingsIcon,
    requiredPermissions: ["platform.access"] as AppPermission[],
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: DashboardIcon,
    requiredPermissions: ["platform.access"] as AppPermission[],
  },
  {
    href: "/admin/companies",
    label: "Empresas",
    icon: BuildingIcon,
    requiredPermissions: ["companies.read", "companies.manage"] as AppPermission[],
  },
  {
    href: "/admin/users",
    label: "Usuarios",
    icon: UsersIcon,
    requiredPermissions: ["users.read.global", "users.manage.global"] as AppPermission[],
  },
  {
    href: "/admin/roles",
    label: "Roles",
    icon: ShieldIcon,
    requiredPermissions: ["roles.read.global", "roles.manage.global"] as AppPermission[],
  },
];

type PlatformAdminSidebarProps = {
  isOpen: boolean;
  isExpanded: boolean;
  permissions: AppPermission[];
  isSuperAdmin?: boolean;
  onNavigate?: () => void;
};

function hasAnyPermission(
  currentPermissions: AppPermission[],
  requiredPermissions: AppPermission[],
) {
  return requiredPermissions.some((permission) => currentPermissions.includes(permission));
}

export function PlatformAdminSidebar({
  isOpen,
  isExpanded,
  permissions,
  isSuperAdmin = false,
  onNavigate,
}: PlatformAdminSidebarProps) {
  const pathname = usePathname();
  const visibleItems = navigationItems.filter((item) =>
    isSuperAdmin || hasAnyPermission(permissions, item.requiredPermissions),
  );

  return (
    <nav className="space-y-5">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#52D6A4]">
          Administracion
        </p>
        {isOpen && isExpanded ? (
          <p className="mt-2 text-sm leading-6 text-white/70">
            Accesos rapidos para la configuracion global de la plataforma.
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        {visibleItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                isExpanded
                  ? "flex items-center gap-3 rounded-2xl px-3 py-3 transition"
                  : "mx-auto flex h-11 w-11 items-center justify-center rounded-2xl transition",
                isActive
                  ? "bg-[#52D6A4] text-[#2b3a44]"
                  : "text-white hover:bg-white/10",
              ].join(" ")}
              onClick={onNavigate}
              title={isExpanded ? undefined : item.label}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black/10">
                <Icon />
              </span>
              {isExpanded ? <span className="font-semibold">{item.label}</span> : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
