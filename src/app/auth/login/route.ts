import { buildFlashPath } from "@/lib/flash";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import type { Database } from "@/types/database";
import { getSupabasePublicConfig } from "@/lib/env";
import { withSharedSupabaseCookieDomain } from "@/lib/supabase/cookies";
import {
  isLocalDevelopmentRoot,
  LOCAL_DEV_PROFILE_COOKIE,
  LOCAL_DEV_USER_COOKIE,
  getLocalDevRoleName,
  getLocalDevRolePermissions,
  prependLocalTenantPathPrefix,
  serializeLocalDevProfileSnapshot,
} from "@/lib/tenant";

const signInSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

function createRouteSupabaseClient(request: NextRequest) {
  const { url, anonKey } = getSupabasePublicConfig();
  const pendingCookies: Array<{
    name: string;
    value: string;
    options: Record<string, unknown>;
  }> = [];

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        cookiesToSet.forEach(({ name, value, options }) => {
          pendingCookies.push({
            name,
            value,
            options: withSharedSupabaseCookieDomain(options),
          });
        });
      },
    },
  });

  return { supabase, pendingCookies };
}

function redirect303(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return redirect303(
      request,
      buildFlashPath(
        "/login",
        "error",
        parsed.error.issues[0]?.message ?? "No se pudo iniciar sesion.",
      ),
    );
  }

  const { supabase, pendingCookies } = createRouteSupabaseClient(request);
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  const applyCookies = (response: NextResponse) => {
    for (const cookie of pendingCookies) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }

    return response;
  };

  if (error) {
    return applyCookies(
      NextResponse.redirect(
        new URL(
          buildFlashPath("/login", "error", "Credenciales invalidas."),
          request.url,
        ),
        303,
      ),
    );
  }

  const userId = data.user?.id;

  if (!userId) {
    return applyCookies(
      NextResponse.redirect(
        new URL(
          buildFlashPath(
            "/login",
            "error",
            "No se pudo resolver el usuario autenticado.",
          ),
          request.url,
        ),
        303,
      ),
    );
  }

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, company_id, role_id, full_name, email, role, companies(slug, name)")
    .eq("id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    return applyCookies(
      NextResponse.redirect(
        new URL(
          buildFlashPath(
            "/login",
            "error",
            "Tu usuario no tiene perfil asignado. Contacta a un administrador.",
          ),
          request.url,
        ),
        303,
      ),
    );
  }

  revalidatePath("/", "layout");

  const localRoot = isLocalDevelopmentRoot();
  const companySlug = profile.companies?.slug ?? null;
  const snapshot = profile
    ? {
        id: profile.id,
        company_id: profile.company_id,
        role_id: profile.role_id ?? null,
        full_name: profile.full_name ?? null,
        email: profile.email,
        role: profile.role,
        company_slug: profile.companies?.slug ?? null,
        company_custom_domain: null,
        company_name: profile.companies?.name ?? null,
        role_name: getLocalDevRoleName(profile.role),
        permissions: getLocalDevRolePermissions(profile.role),
      }
    : null;
  const next = formData.get("next");
  const requestedNextPath =
    typeof next === "string" && next.startsWith("/") ? next : "/dashboard";
  const nextPath =
    localRoot && companySlug && !requestedNextPath.startsWith("/t/")
      ? prependLocalTenantPathPrefix(companySlug, requestedNextPath)
      : requestedNextPath;

  const response = NextResponse.redirect(new URL(nextPath, request.url), 303);

  if (localRoot && companySlug) {
    response.cookies.set("panolapp_dev_tenant", companySlug, {
      path: "/",
    });
  }

  if (localRoot) {
    response.cookies.set(LOCAL_DEV_USER_COOKIE, userId, {
      path: "/",
    });
    if (snapshot) {
      response.cookies.set(
        LOCAL_DEV_PROFILE_COOKIE,
        serializeLocalDevProfileSnapshot(snapshot),
        {
          path: "/",
        },
      );
    }
  }

  return applyCookies(response);
}
