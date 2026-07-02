"use server";

import { buildFlashPath, getActionErrorMessage } from "@/lib/flash";
import { getDefaultDashboardPath, getLoginPath } from "@/lib/site";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
    const { error } = await supabase.auth.signInWithPassword(parsed);

    if (error) {
      throw new Error("Credenciales invalidas.");
    }
  } catch (error) {
    redirect(
      buildFlashPath(
        getLoginPath(),
        "error",
        getActionErrorMessage(error, "No se pudo iniciar sesion."),
      ),
    );
  }

  revalidatePath("/", "layout");
  const next = formData.get("next");
  const nextPath =
    typeof next === "string" && next.startsWith("/")
      ? next
      : getDefaultDashboardPath();
  redirect(nextPath);
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(getLoginPath());
}
