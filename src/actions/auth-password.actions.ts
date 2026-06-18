"use server";

import { buildFlashPath, getActionErrorMessage } from "@/lib/flash";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const changePasswordSchema = z
  .object({
    password: z.string().min(8).max(128),
    password_confirmation: z.string().min(8).max(128),
  })
  .refine((value) => value.password === value.password_confirmation, {
    message: "Las contraseñas no coinciden.",
    path: ["password_confirmation"],
  });

export async function changeCurrentPasswordAction(formData: FormData) {
  try {
    const parsed = changePasswordSchema.parse({
      password: formData.get("password"),
      password_confirmation: formData.get("password_confirmation"),
    });

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.updateUser({
      password: parsed.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    await supabase.auth.signOut();
  } catch (error) {
    redirect(
      buildFlashPath(
        "/login",
        "error",
        getActionErrorMessage(error, "No se pudo cambiar la contraseña."),
      ),
    );
  }

  revalidatePath("/", "layout");
  redirect(
    buildFlashPath(
      "/login",
      "success",
      "Contraseña actualizada. Inicia sesion nuevamente.",
    ),
  );
}
