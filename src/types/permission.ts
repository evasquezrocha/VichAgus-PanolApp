export const PERMISSIONS = [
  "platform.access",
  "platform.manage",
  "companies.read",
  "companies.manage",
  "users.read.global",
  "users.manage.global",
  "roles.read.global",
  "roles.manage.global",
  "company.access",
  "company.users.read",
  "company.users.manage",
  "company.roles.read",
  "company.roles.manage",
] as const;

export type AppPermission = (typeof PERMISSIONS)[number];

export type PermissionGroupDefinition = {
  id: string;
  label: string;
  permissions: AppPermission[];
};

export const TENANT_ROLE_PERMISSIONS: AppPermission[] = [
  "company.access",
  "company.users.read",
  "company.users.manage",
  "company.roles.read",
  "company.roles.manage",
];

export const PLATFORM_PERMISSION_GROUPS: PermissionGroupDefinition[] = [
  {
    id: "platform",
    label: "Plataforma",
    permissions: ["platform.access", "platform.manage"],
  },
  {
    id: "companies",
    label: "Empresas",
    permissions: ["companies.read", "companies.manage"],
  },
  {
    id: "global-users",
    label: "Usuarios globales",
    permissions: ["users.read.global", "users.manage.global"],
  },
  {
    id: "global-roles",
    label: "Roles globales",
    permissions: ["roles.read.global", "roles.manage.global"],
  },
  {
    id: "tenant-company",
    label: "Empresa",
    permissions: ["company.access"],
  },
  {
    id: "tenant-users",
    label: "Usuarios de empresa",
    permissions: ["company.users.read", "company.users.manage"],
  },
  {
    id: "tenant-roles",
    label: "Roles de empresa",
    permissions: ["company.roles.read", "company.roles.manage"],
  },
];

export const TENANT_PERMISSION_GROUPS: PermissionGroupDefinition[] = [
  {
    id: "tenant-company",
    label: "Empresa",
    permissions: ["company.access"],
  },
  {
    id: "tenant-users",
    label: "Usuarios",
    permissions: ["company.users.read", "company.users.manage"],
  },
  {
    id: "tenant-roles",
    label: "Roles",
    permissions: ["company.roles.read", "company.roles.manage"],
  },
];

export const PERMISSION_LABELS: Record<AppPermission, string> = {
  "platform.access": "Acceso panel plataforma",
  "platform.manage": "Control total plataforma",
  "companies.read": "Ver empresas",
  "companies.manage": "Crear y editar empresas",
  "users.read.global": "Ver usuarios globalmente",
  "users.manage.global": "Gestionar usuarios globalmente",
  "roles.read.global": "Ver roles globales",
  "roles.manage.global": "Crear y editar roles globales",
  "company.access": "Acceso panel empresa",
  "company.users.read": "Ver usuarios de empresa",
  "company.users.manage": "Gestionar usuarios de empresa",
  "company.roles.read": "Ver roles de empresa",
  "company.roles.manage": "Gestionar roles de empresa",
};
