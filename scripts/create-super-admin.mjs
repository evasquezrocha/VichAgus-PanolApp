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

const email = requiredEnv("SUPER_ADMIN_EMAIL").toLowerCase();
const password = requiredEnv("SUPER_ADMIN_PASSWORD");
const fullName = process.env.SUPER_ADMIN_FULL_NAME ?? null;

const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

if (password.length < 8) {
  throw new Error("SUPER_ADMIN_PASSWORD must be at least 8 characters long.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const { data: createdUser, error: createUserError } =
  await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

if (createUserError) {
  throw new Error(`Could not create auth user: ${createUserError.message}`);
}

const user = createdUser.user;

if (!user) {
  throw new Error("Supabase did not return a created user.");
}

const { error: profileError } = await supabase.from("profiles").upsert(
  {
    id: user.id,
    company_id: null,
    full_name: fullName,
    email,
    role: "super_admin",
    is_active: true,
  },
  {
    onConflict: "id",
  },
);

if (profileError) {
  throw new Error(`Could not create profile: ${profileError.message}`);
}

console.log(`Super admin created: ${email}`);
