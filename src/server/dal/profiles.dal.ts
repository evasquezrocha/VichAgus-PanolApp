import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireCompanyAdmin, requirePermission } from "@/server/auth/guards";
import type {
  CreateManagedCompanyUserInput,
  CreateCompanyUserInput,
  UpdateManagedUserInput,
  UpdateUserTemporaryPasswordInput,
} from "@/schemas/profile.schema";
import type { AppPermission } from "@/types/permission";
import { TENANT_ROLE_PERMISSIONS } from "@/types/permission";
import type { AppRoleDefinition } from "@/types/role";
import { ensureTenantDefaultRoles } from "./roles.dal";
import type {
  CompanyProfileListItem,
  Profile,
  ProfileListItem,
} from "@/types/profile";

type ProfileRowWithRelations = Profile & {
  companies: {
    name: string;
  } | null;
  app_roles: {
    name: string;
    permissions: string[];
  } | null;
};

const COMPANY_ADMIN_BLOCKED_PERMISSIONS: AppPermission[] = [
  "platform.access",
  "platform.manage",
  "companies.read",
  "companies.manage",
  "users.read.global",
  "users.manage.global",
  "roles.read.global",
  "roles.manage.global",
];

function mapProfileRow(row: ProfileRowWithRelations): ProfileListItem {
  const { companies, app_roles, ...profile } = row;

  return {
    ...profile,
    company_name: companies?.name ?? null,
    role_name: app_roles?.name ?? null,
    permissions: (app_roles?.permissions ?? []) as AppPermission[],
  };
}

async function syncAuthUserProfileData(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
  updates: {
    email?: string;
    full_name?: string | null;
  },
) {
  const payload: {
    email?: string;
    user_metadata?: { full_name?: string | null };
  } = {};

  if (typeof updates.email === "string" && updates.email.length > 0) {
    payload.email = updates.email;
  }

  if (updates.full_name !== undefined) {
    payload.user_metadata = {
      full_name: updates.full_name,
    };
  }

  if (Object.keys(payload).length === 0) {
    return;
  }

  const { error } = await admin.auth.admin.updateUserById(userId, payload);

  if (error) {
    throw new Error(error.message);
  }
}

function canCompanyAdminAssignRole(role: AppRoleDefinition) {
  if (!role.is_active || role.slug === "super_admin") {
    return false;
  }

  if (role.company_id && role.company_id !== null) {
    return role.permissions.every((permission) =>
      TENANT_ROLE_PERMISSIONS.includes(permission),
    );
  }

  return !role.permissions.some((permission) =>
    COMPANY_ADMIN_BLOCKED_PERMISSIONS.includes(permission),
  );
}

async function getRoleForPlatformAssignment(roleId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("app_roles")
    .select(
      "id, company_id, name, slug, description, permissions, is_system, is_active, created_at, updated_at",
    )
    .eq("id", roleId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    throw new Error("Role does not exist or is inactive.");
  }

  return data as AppRoleDefinition;
}

function isTenantSafeRole(role: AppRoleDefinition) {
  return role.permissions.every((permission) =>
    TENANT_ROLE_PERMISSIONS.includes(permission),
  );
}

async function resolveRoleForPlatformUser(
  companyId: string | null,
  roleId: string,
) {
  const role = await getRoleForPlatformAssignment(roleId);

  if (!companyId) {
    return role;
  }

  if (role.company_id && role.company_id !== companyId) {
    throw new Error("This tenant role belongs to another company.");
  }

  if (role.company_id === companyId) {
    return role;
  }

  if (isTenantSafeRole(role)) {
    const tenantRoles = await ensureTenantDefaultRoles(companyId);
    const tenantRole = tenantRoles.find((tenantRoleItem) => tenantRoleItem.slug === role.slug);

    if (!tenantRole) {
      throw new Error("Could not resolve tenant role for this company.");
    }

    return tenantRole;
  }

  return role;
}

async function getRoleForCompanyAssignment(roleId: string) {
  const role = await getRoleForPlatformAssignment(roleId);

  if (!canCompanyAdminAssignRole(role)) {
    throw new Error("This role cannot be assigned by company_admin.");
  }

  return role;
}

export async function listProfilesForPlatformAdmin(): Promise<ProfileListItem[]> {
  await requirePermission("users.read.global");

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, company_id, role_id, full_name, email, role, is_active, created_at, updated_at, companies(name), app_roles(name, permissions)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as ProfileRowWithRelations[]).map(mapProfileRow);
}

export async function createCompanyUserForPlatformAdmin(
  input: CreateCompanyUserInput,
): Promise<Profile> {
  await requirePermission("users.manage.global");

  const admin = createSupabaseAdminClient();
  const role = await resolveRoleForPlatformUser(input.company_id, input.role_id);

  if (role.slug === "super_admin" && input.company_id !== null) {
    throw new Error("super_admin cannot be assigned to a company.");
  }

  const { data: company, error: companyError } = await admin
    .from("companies")
    .select("id")
    .eq("id", input.company_id)
    .eq("is_active", true)
    .single();

  if (companyError || !company) {
    throw new Error("Company does not exist or is inactive.");
  }

  const { data: createdUser, error: createUserError } =
    await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.full_name,
      },
    });

  if (createUserError) {
    throw new Error(createUserError.message);
  }

  const user = createdUser.user;

  if (!user) {
    throw new Error("Supabase did not return a created user.");
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .insert({
      id: user.id,
      company_id: input.company_id,
      role_id: role.id,
      full_name: input.full_name,
      email: input.email,
      role: role.slug,
      is_active: input.is_active,
    })
    .select(
      "id, company_id, role_id, full_name, email, role, is_active, created_at, updated_at",
    )
    .single();

  if (profileError) {
    await admin.auth.admin.deleteUser(user.id);
    throw new Error(profileError.message);
  }

  return profile;
}

export async function updateUserTemporaryPasswordForPlatformAdmin(
  input: UpdateUserTemporaryPasswordInput,
) {
  const currentProfile = await requirePermission("users.manage.global");

  if (input.user_id === currentProfile.id) {
    throw new Error(
      "Use account recovery to change the active super_admin password.",
    );
  }

  const admin = createSupabaseAdminClient();

  const { data: targetProfile, error: targetError } = await admin
    .from("profiles")
    .select("id")
    .eq("id", input.user_id)
    .neq("role", "super_admin")
    .single();

  if (targetError || !targetProfile) {
    throw new Error("Target user does not exist or cannot be managed here.");
  }

  const { error } = await admin.auth.admin.updateUserById(input.user_id, {
    password: input.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function listProfilesForCompanyAdmin(): Promise<
  CompanyProfileListItem[]
> {
  const currentProfile = await requireCompanyAdmin();

  if (!currentProfile.company_id || !currentProfile.company_name) {
    throw new Error("Current company_admin does not have a valid company.");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, company_id, role_id, full_name, email, role, is_active, created_at, updated_at, app_roles(name, permissions)",
    )
    .eq("company_id", currentProfile.company_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Omit<
    ProfileRowWithRelations,
    "companies"
  >[]).map(({ app_roles, ...profile }) => ({
    ...profile,
    company_name: currentProfile.company_name!,
    role_name: app_roles?.name ?? null,
    permissions: (app_roles?.permissions ?? []) as AppPermission[],
  }));
}

export async function createCompanyUserForCompanyAdmin(
  input: CreateManagedCompanyUserInput,
): Promise<Profile> {
  const currentProfile = await requireCompanyAdmin();

  if (!currentProfile.company_id) {
    throw new Error("Current company_admin does not have a valid company.");
  }

  const admin = createSupabaseAdminClient();
  const role = await getRoleForCompanyAssignment(input.role_id);

  const { data: createdUser, error: createUserError } =
    await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.full_name,
      },
    });

  if (createUserError) {
    throw new Error(createUserError.message);
  }

  const user = createdUser.user;

  if (!user) {
    throw new Error("Supabase did not return a created user.");
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .insert({
      id: user.id,
      company_id: currentProfile.company_id,
      role_id: role.id,
      full_name: input.full_name,
      email: input.email,
      role: role.slug,
      is_active: input.is_active,
    })
    .select(
      "id, company_id, role_id, full_name, email, role, is_active, created_at, updated_at",
    )
    .single();

  if (profileError) {
    await admin.auth.admin.deleteUser(user.id);
    throw new Error(profileError.message);
  }

  return profile;
}

export async function updateManagedUserForPlatformAdmin(
  input: UpdateManagedUserInput,
): Promise<Profile> {
  const currentProfile = await requirePermission("users.manage.global");

  if (input.user_id === currentProfile.id) {
    throw new Error("You cannot change your own role or active state here.");
  }

  const admin = createSupabaseAdminClient();
  const { data: targetProfile, error: targetError } = await admin
    .from("profiles")
    .select("id, role, company_id, full_name, email")
    .eq("id", input.user_id)
    .single();

  if (targetError || !targetProfile) {
    throw new Error("Target user does not exist.");
  }

  const role = await resolveRoleForPlatformUser(
    targetProfile.company_id,
    input.role_id,
  );

  if (role.slug === "super_admin") {
    throw new Error(
      "Assigning super_admin from inline user editing is not supported here.",
    );
  }

  if (targetProfile.role === "super_admin") {
    throw new Error("super_admin users cannot be edited from this table.");
  }

  const nextFullName =
    input.full_name === undefined ? targetProfile.full_name : input.full_name;
  const nextEmail = input.email ?? targetProfile.email;

  await syncAuthUserProfileData(admin, input.user_id, {
    email: nextEmail,
    full_name: nextFullName,
  });

  const { data, error } = await admin
    .from("profiles")
    .update({
      role_id: role.id,
      role: role.slug,
      full_name: nextFullName,
      email: nextEmail,
      is_active: input.is_active,
    })
    .eq("id", input.user_id)
    .select(
      "id, company_id, role_id, full_name, email, role, is_active, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update user.");
  }

  return data;
}

export async function updateManagedUserForCompanyAdmin(
  input: UpdateManagedUserInput,
): Promise<Profile> {
  const currentProfile = await requireCompanyAdmin();

  if (!currentProfile.company_id) {
    throw new Error("Current company_admin does not have a valid company.");
  }

  if (input.user_id === currentProfile.id) {
    throw new Error("You cannot change your own role or active state here.");
  }

  const admin = createSupabaseAdminClient();
  const role = await getRoleForCompanyAssignment(input.role_id);

  const { data: targetProfile, error: targetError } = await admin
    .from("profiles")
    .select("id, company_id, role, full_name, email")
    .eq("id", input.user_id)
    .eq("company_id", currentProfile.company_id)
    .single();

  if (targetError || !targetProfile) {
    throw new Error("Target user does not belong to your company.");
  }

  if (targetProfile.role === "super_admin") {
    throw new Error("super_admin users cannot be edited from this table.");
  }

  const nextFullName =
    input.full_name === undefined ? targetProfile.full_name : input.full_name;
  const nextEmail = input.email ?? targetProfile.email;

  await syncAuthUserProfileData(admin, input.user_id, {
    email: nextEmail,
    full_name: nextFullName,
  });

  const { data, error } = await admin
    .from("profiles")
    .update({
      role_id: role.id,
      role: role.slug,
      full_name: nextFullName,
      email: nextEmail,
      is_active: input.is_active,
    })
    .eq("id", input.user_id)
    .eq("company_id", currentProfile.company_id)
    .select(
      "id, company_id, role_id, full_name, email, role, is_active, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update user.");
  }

  return data;
}
