"use server";

import { buildFlashPath, getActionErrorMessage } from "@/lib/flash";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  LOCAL_DEV_TENANT_COOKIE,
  LOCAL_DEV_USER_COOKIE,
  isLocalDevelopmentRoot,
} from "@/lib/tenant";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";

const signInSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

export async function signInWithPasswordAction(formData: FormData) {
  try {
    const parsed = signInSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed);

    if (error) {
      throw new Error("Credenciales invalidas.");
    }

    const userId = data.user?.id;

    if (!userId) {
      throw new Error("No se pudo resolver el usuario autenticado.");
    }

    const admin = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      redirect(
        buildFlashPath(
          "/login",
          "error",
          "Tu usuario no tiene perfil asignado. Contacta a un administrador.",
        ),
      );
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      buildFlashPath(
        "/login",
        "error",
        getActionErrorMessage(error, "No se pudo iniciar sesion."),
      ),
    );
  }

  revalidatePath("/", "layout");
  const next = formData.get("next");
  const nextPath =
    typeof next === "string" && next.startsWith("/") ? next : "/dashboard";
  redirect(nextPath);
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  if (isLocalDevelopmentRoot()) {
    const cookieStore = await cookies();
    cookieStore.set(LOCAL_DEV_USER_COOKIE, "", { path: "/", maxAge: 0 });
    cookieStore.set(LOCAL_DEV_TENANT_COOKIE, "", { path: "/", maxAge: 0 });
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
