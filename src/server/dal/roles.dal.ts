import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireCompanyAdmin, requirePermission } from "@/server/auth/guards";
import type { RoleInput, UpdateRoleInput } from "@/schemas/role.schema";
import {
  TENANT_ROLE_PERMISSIONS,
  type AppPermission,
} from "@/types/permission";
import type { AppRoleDefinition } from "@/types/role";
import { generateUniqueRoleSlug } from "./role-slug";

function mapRolePermissions(role: AppRoleDefinition) {
  return {
    ...role,
    permissions: role.permissions as AppPermission[],
  };
}

async function fetchGlobalRoles() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("app_roles")
    .select(
      "id, company_id, name, slug, description, permissions, is_system, is_active, created_at, updated_at",
    )
    .is("company_id", null)
    .order("is_system", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((role) => mapRolePermissions(role as AppRoleDefinition));
}

function isTenantSafeRole(role: AppRoleDefinition) {
  return role.permissions.every((permission) =>
    TENANT_ROLE_PERMISSIONS.includes(permission),
  );
}

async function fetchTenantRoles(companyId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("app_roles")
    .select(
      "id, company_id, name, slug, description, permissions, is_system, is_active, created_at, updated_at",
    )
    .eq("company_id", companyId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((role) => mapRolePermissions(role as AppRoleDefinition));
}

export async function ensureTenantDefaultRoles(companyId: string) {
  const admin = createSupabaseAdminClient();
  const globalRoles = (await fetchGlobalRoles()).filter((role) => isTenantSafeRole(role));
  const tenantRoles = await fetchTenantRoles(companyId);

  const existingBySlug = new Map(tenantRoles.map((role) => [role.slug, role]));
  const missingRoles = globalRoles.filter((role) => !existingBySlug.has(role.slug));

  if (missingRoles.length > 0) {
    const { error } = await admin.from("app_roles").insert(
      missingRoles.map((role) => ({
        company_id: companyId,
        name: role.name,
        slug: role.slug,
        description: role.description,
        permissions: role.permissions,
        // Tenant copies of base roles must remain editable by the tenant.
        is_system: false,
        is_active: role.is_active,
      })),
    );

    if (error) {
      throw new Error(error.message);
    }
  }

  const freshTenantRoles = await fetchTenantRoles(companyId);
  const tenantRoleBySlug = new Map(freshTenantRoles.map((role) => [role.slug, role]));

  const { data: companyProfiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, role, role_id")
    .eq("company_id", companyId);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  for (const profile of companyProfiles ?? []) {
    const mappedRole = tenantRoleBySlug.get(profile.role);

    if (!mappedRole || profile.role_id === mappedRole.id) {
      continue;
    }

    const { error } = await admin
      .from("profiles")
      .update({
        role_id: mappedRole.id,
        role: mappedRole.slug,
      })
      .eq("id", profile.id);

    if (error) {
      throw new Error(error.message);
    }
  }

  return freshTenantRoles;
}

export async function listGlobalRolesForPlatformAdmin(): Promise<
  AppRoleDefinition[]
> {
  await requirePermission("roles.read.global");
  return fetchGlobalRoles();
}

export async function listAssignableRolesForPlatformAdmin(): Promise<
  AppRoleDefinition[]
> {
  await requirePermission("users.manage.global");
  return fetchGlobalRoles();
}

export async function createGlobalRoleForPlatformAdmin(input: RoleInput) {
  await requirePermission("roles.manage.global");

  const admin = createSupabaseAdminClient();
  const slug = await generateUniqueRoleSlug({
    companyId: null,
    baseName: input.name,
  });
  const { data, error } = await admin
    .from("app_roles")
    .insert({
      company_id: null,
      name: input.name,
      slug,
      description: input.description,
      permissions: input.permissions,
      is_system: false,
      is_active: input.is_active,
    })
    .select(
      "id, company_id, name, slug, description, permissions, is_system, is_active, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRolePermissions(data as AppRoleDefinition);
}

export async function updateGlobalRoleForPlatformAdmin(input: UpdateRoleInput) {
  await requirePermission("roles.manage.global");

  const admin = createSupabaseAdminClient();

  const { data: currentRole, error: currentError } = await admin
    .from("app_roles")
    .select("id, is_system")
    .eq("id", input.role_id)
    .is("company_id", null)
    .single();

  if (currentError || !currentRole) {
    throw new Error("Role does not exist.");
  }

  if (currentRole.is_system) {
    throw new Error("System roles cannot be edited from this screen.");
  }

  const { data, error } = await admin
    .from("app_roles")
    .update({
      name: input.name,
      description: input.description,
      permissions: input.permissions,
      is_active: input.is_active,
    })
    .eq("id", input.role_id)
    .select(
      "id, company_id, name, slug, description, permissions, is_system, is_active, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRolePermissions(data as AppRoleDefinition);
}

export async function listCompanyRolesForCompanyAdmin(): Promise<
  AppRoleDefinition[]
> {
  const currentProfile = await requirePermission("company.roles.read");

  if (!currentProfile.company_id) {
    throw new Error("Current profile does not have a valid company.");
  }

  return ensureTenantDefaultRoles(currentProfile.company_id);
}

export async function createCompanyRoleForCompanyAdmin(input: RoleInput) {
  const currentProfile = await requirePermission("company.roles.manage");

  if (!currentProfile.company_id) {
    throw new Error("Current profile does not have a valid company.");
  }

  if (!input.permissions.every((permission) => TENANT_ROLE_PERMISSIONS.includes(permission))) {
    throw new Error("Tenant roles can only include tenant-level permissions.");
  }

  const admin = createSupabaseAdminClient();
  const slug = await generateUniqueRoleSlug({
    companyId: currentProfile.company_id,
    baseName: input.name,
  });
  const { data, error } = await admin
    .from("app_roles")
    .insert({
      company_id: currentProfile.company_id,
      name: input.name,
      slug,
      description: input.description,
      permissions: input.permissions,
      is_system: false,
      is_active: input.is_active,
    })
    .select(
      "id, company_id, name, slug, description, permissions, is_system, is_active, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRolePermissions(data as AppRoleDefinition);
}

export async function updateCompanyRoleForCompanyAdmin(input: UpdateRoleInput) {
  const currentProfile = await requireCompanyAdmin();

  if (!currentProfile.company_id) {
    throw new Error("Current profile does not have a valid company.");
  }

  if (!input.permissions.every((permission) => TENANT_ROLE_PERMISSIONS.includes(permission))) {
    throw new Error("Tenant roles can only include tenant-level permissions.");
  }

  const admin = createSupabaseAdminClient();
  const { data: currentRole, error: currentError } = await admin
    .from("app_roles")
    .select("id, is_system")
    .eq("id", input.role_id)
    .eq("company_id", currentProfile.company_id)
    .single();

  if (currentError || !currentRole) {
    throw new Error("Role does not belong to your company.");
  }

  if (currentRole.is_system) {
    throw new Error("System roles cannot be edited from this screen.");
  }

  const { data, error } = await admin
    .from("app_roles")
    .update({
      name: input.name,
      description: input.description,
      permissions: input.permissions,
      is_active: input.is_active,
    })
    .eq("id", input.role_id)
    .eq("company_id", currentProfile.company_id)
    .select(
      "id, company_id, name, slug, description, permissions, is_system, is_active, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRolePermissions(data as AppRoleDefinition);
}

export async function listAssignableRolesForCompanyAdmin(): Promise<
  AppRoleDefinition[]
> {
  const currentProfile = await requirePermission("company.users.manage");

  if (!currentProfile.company_id) {
    throw new Error("Current profile does not have a valid company.");
  }

  const roles = await ensureTenantDefaultRoles(currentProfile.company_id);

  return roles.filter((role) => role.slug !== "super_admin" && isTenantSafeRole(role));
}
