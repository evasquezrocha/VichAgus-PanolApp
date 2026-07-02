import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return;
  }

  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");

    process.env[key] ??= value;
  }
}

function requiredEnv(key) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

loadEnvFile(resolve(process.cwd(), ".env.local"));

const email = requiredEnv("TDP_USER_EMAIL").toLowerCase();
const password = requiredEnv("TDP_USER_PASSWORD");
const fullName = process.env.TDP_USER_FULL_NAME ?? null;

const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

if (password.length < 8) {
  throw new Error("TDP_USER_PASSWORD must be at least 8 characters long.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findUserByEmail(targetEmail) {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw new Error(`Could not list auth users: ${error.message}`);
  }

  return data.users.find((candidate) => candidate.email?.toLowerCase() === targetEmail) ?? null;
}

let user = null;

const { data: createdUser, error: createUserError } =
  await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      site_variant: "tdp",
    },
  });

if (createUserError) {
  const existingUser = await findUserByEmail(email);

  if (!existingUser) {
    throw new Error(`Could not create auth user: ${createUserError.message}`);
  }

  const { data: updatedUser, error: updateUserError } =
    await supabase.auth.admin.updateUserById(existingUser.id, {
      user_metadata: {
        ...(existingUser.user_metadata ?? {}),
        full_name: fullName ?? existingUser.user_metadata?.full_name ?? null,
        site_variant: "tdp",
      },
      password,
      email_confirm: true,
    });

  if (updateUserError) {
    throw new Error(`Could not update auth user: ${updateUserError.message}`);
  }

  user = updatedUser.user ?? existingUser;
} else {
  user = createdUser.user;
}

if (!user) {
  throw new Error("Supabase did not return a created user.");
}

console.log(`TDP user created: ${email}`);
