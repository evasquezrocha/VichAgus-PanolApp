import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireTdpAdmin } from "@/server/auth/guards";
import type { User } from "@supabase/supabase-js";

export type TdpAuthUserListItem = {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_admin: boolean;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UpsertTdpAuthUserInput = {
  email: string;
  password: string;
  full_name: string;
  is_admin: boolean;
};

function getBooleanMetadataFlag(value: unknown) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function isTdpAuthUser(user: User) {
  return (
    user.app_metadata?.site_variant === "tdp" ||
    user.user_metadata?.site_variant === "tdp" ||
    getBooleanMetadataFlag(user.app_metadata?.tdp_admin) ||
    getBooleanMetadataFlag(user.user_metadata?.tdp_admin)
  );
}

function toTdpAuthUserListItem(user: User): TdpAuthUserListItem {
  return {
    id: user.id,
    email: user.email ?? "",
    full_name: (user.user_metadata?.full_name as string | undefined)?.trim() || null,
    is_active: user.banned_until == null,
    is_admin:
      getBooleanMetadataFlag(user.app_metadata?.tdp_admin) ||
      getBooleanMetadataFlag(user.user_metadata?.tdp_admin),
    email_confirmed_at: user.email_confirmed_at ?? null,
    last_sign_in_at: user.last_sign_in_at ?? null,
    created_at: user.created_at ?? new Date(0).toISOString(),
    updated_at: user.updated_at ?? user.created_at ?? new Date(0).toISOString(),
  };
}

async function findUserByEmail(targetEmail: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw new Error(`Could not list auth users: ${error.message}`);
  }

  return data.users.find((candidate) => candidate.email?.toLowerCase() === targetEmail) ?? null;
}

export async function listTdpAuthUsers(): Promise<TdpAuthUserListItem[]> {
  await requireTdpAdmin();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw new Error(`Could not list auth users: ${error.message}`);
  }

  return (data.users ?? [])
    .filter(isTdpAuthUser)
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
    .map(toTdpAuthUserListItem);
}

export async function upsertTdpAuthUser(
  input: UpsertTdpAuthUserInput,
): Promise<TdpAuthUserListItem> {
  await requireTdpAdmin();

  const admin = createSupabaseAdminClient();
  const existingUser = await findUserByEmail(input.email);
  const metadata = {
    full_name: input.full_name,
    site_variant: "tdp",
    tdp_admin: input.is_admin,
  };

  if (existingUser) {
    const { data, error } = await admin.auth.admin.updateUserById(existingUser.id, {
      password: input.password,
      email_confirm: true,
      app_metadata: {
        ...(existingUser.app_metadata ?? {}),
        site_variant: "tdp",
        tdp_admin: input.is_admin,
      },
      user_metadata: {
        ...(existingUser.user_metadata ?? {}),
        ...metadata,
      },
    });

    if (error) {
      throw new Error(`Could not update auth user: ${error.message}`);
    }

    if (!data.user) {
      throw new Error("Supabase did not return an updated user.");
    }

    return toTdpAuthUserListItem(data.user);
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    app_metadata: {
      site_variant: "tdp",
      tdp_admin: input.is_admin,
    },
    user_metadata: metadata,
  });

  if (error) {
    throw new Error(`Could not create auth user: ${error.message}`);
  }

  if (!data.user) {
    throw new Error("Supabase did not return a created user.");
  }

  return toTdpAuthUserListItem(data.user);
}
