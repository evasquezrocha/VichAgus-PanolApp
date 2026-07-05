"use server";

import { buildFlashPath, getActionErrorMessage } from "@/lib/flash";
import { upsertTdpAuthUser } from "@/server/dal/tdp-users.dal";
import { saveTdpProfileConfig } from "@/server/dal/tdp-profile-configs.dal";
import { DEFAULT_TDP_PROFILE_CONFIG } from "@/types/tdp-profile";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { randomBytes } from "node:crypto";

const createTdpUserSchema = z.object({
  full_name: z.string().trim().min(2).max(160),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(128),
  is_admin: z.boolean().default(false),
});

export async function createTdpUserAction(formData: FormData) {
  const errorReturnTo = "/tdp/panel/usuarios?create=1";
  let successReturnTo = "/tdp/panel/usuarios";

  try {
    const parsed = createTdpUserSchema.parse({
      full_name: formData.get("full_name"),
      email: formData.get("email"),
      password: formData.get("password"),
      is_admin: formData.get("is_admin") === "true",
    });

    const user = await upsertTdpAuthUser(parsed);
    successReturnTo = `/tdp/panel/usuarios?user=${encodeURIComponent(user.email)}`;
  } catch (error) {
    redirect(
      buildFlashPath(
        errorReturnTo,
        "error",
        getActionErrorMessage(error, "No se pudo crear el usuario TDP."),
      ),
    );
  }

  revalidatePath("/tdp/panel/usuarios");
  revalidatePath("/tdp/panel");
  redirect(buildFlashPath(successReturnTo, "success", "Usuario TDP creado correctamente."));
}

const createTdpProfileSchema = z.object({
  user_id: z.string().trim().min(1).max(64),
  return_to: z.string().trim().min(1).default("/tdp/panel/usuarios"),
});

function generateProfileCode() {
  return randomBytes(6).toString("hex");
}

export async function createTdpProfileAction(formData: FormData) {
  try {
    const parsed = createTdpProfileSchema.parse({
      user_id: formData.get("user_id"),
      return_to: formData.get("return_to"),
    });

    await saveTdpProfileConfig(parsed.user_id, {
      ...DEFAULT_TDP_PROFILE_CONFIG,
      profile_code: generateProfileCode(),
    });
  } catch (error) {
    redirect(
      buildFlashPath(
        String(formData.get("return_to") ?? "/tdp/panel/usuarios"),
        "error",
        getActionErrorMessage(error, "No se pudo crear el perfil publico."),
      ),
    );
  }

  revalidatePath("/tdp/panel/usuarios");
  revalidatePath("/tdp/panel/perfil");
  redirect(
    buildFlashPath(
      String(formData.get("return_to") ?? "/tdp/panel/usuarios"),
      "success",
      "Perfil publico creado correctamente.",
    ),
  );
}
