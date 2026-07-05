"use server";

import { buildFlashPath, getActionErrorMessage } from "@/lib/flash";
import { deleteFileFromStorage, uploadFileToStorage } from "@/lib/storage";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireCurrentProfile } from "@/server/auth/guards";
import { saveTdpProfileConfig } from "@/server/dal/tdp-profile-configs.dal";
import {
  DEFAULT_TDP_PROFILE_CONFIG,
  TDP_WIDGET_IDS,
  createDefaultTdpWidgetConfig,
  normalizeTdpWidgetConfigMap,
  type TdpProfileConfig,
  type TdpWidgetId,
} from "@/types/tdp-profile";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { buildStorageProxyUrl } from "@/lib/storage";

const widgetIdSchema = z.enum(TDP_WIDGET_IDS);

const tdpProfileConfigSchema = z.object({
  full_name: z.string().trim().max(120),
  company_name: z.string().trim().max(120),
  description: z.string().trim().max(120),
  background_1: z.string().trim().max(16),
  use_second_background: z.boolean(),
  background_2: z.string().trim().max(16),
  text_color: z.string().trim().max(16),
  main_button_color: z.string().trim().max(16),
  icon_color: z.string().trim().max(16),
  widget_button_bg: z.string().trim().max(16),
  widget_button_text: z.string().trim().max(16),
  widget_button_hover: z.string().trim().max(16),
  show_save_contact: z.boolean(),
  contact_title: z.string().trim().max(120),
  widget_ids: z.array(widgetIdSchema),
  widget_configs: z.record(z.string(), z.unknown()).default({}),
  profile_code: z.string().trim().max(32).default(""),
});

function parseConfigJson(rawValue: FormDataEntryValue | null): TdpProfileConfig {
  if (typeof rawValue !== "string" || rawValue.trim().length === 0) {
    return { ...DEFAULT_TDP_PROFILE_CONFIG };
  }

  const parsed = JSON.parse(rawValue) as unknown;
  const result = tdpProfileConfigSchema.parse(parsed);

  return {
    ...DEFAULT_TDP_PROFILE_CONFIG,
    ...result,
    profile_code: result.profile_code,
    widget_ids: result.widget_ids as TdpWidgetId[],
    widget_configs: normalizeTdpWidgetConfigMap(
      result.widget_configs as TdpProfileConfig["widget_configs"],
    ),
  };
}

function generateProfileCode() {
  return randomBytes(6).toString("hex");
}

function getFormFile(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);

  if (value instanceof File && value.size > 0 && value.name.trim().length > 0) {
    return value;
  }

  return null;
}

export async function saveTdpProfileConfigAction(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();
    const currentProfile = await requireCurrentProfile();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Debes iniciar sesion para guardar el perfil.");
    }

    const targetUserId = String(formData.get("target_user_id") ?? user.id);

    if (targetUserId !== user.id && !currentProfile.is_tdp_admin) {
      throw new Error("No tienes permisos para editar el perfil de otro usuario.");
    }

    const currentConfig = parseConfigJson(formData.get("config_json"));
    const nextWidgetConfigs = { ...currentConfig.widget_configs };

    const photoFile = getFormFile(formData, "widget_photo_file");
    if (photoFile) {
      const previousPhoto = nextWidgetConfigs.photo;
      const uploadedPhoto = await uploadFileToStorage(
        photoFile,
        `tdp/${targetUserId}/widgets/photo`,
      );

      nextWidgetConfigs.photo = {
        ...createDefaultTdpWidgetConfig("photo"),
        file_name: photoFile.name,
        file_url: buildStorageProxyUrl(uploadedPhoto.path),
        storage_path: uploadedPhoto.path,
      };

      if (previousPhoto?.storage_path && previousPhoto.storage_path !== uploadedPhoto.path) {
        await deleteFileFromStorage(previousPhoto.storage_path).catch(() => undefined);
      }
    }

    const pdfFile = getFormFile(formData, "widget_pdf_file");
    if (pdfFile) {
      const previousPdf = nextWidgetConfigs.pdf;
      const uploadedPdf = await uploadFileToStorage(
        pdfFile,
        `tdp/${targetUserId}/widgets/pdf`,
      );

      nextWidgetConfigs.pdf = {
        ...createDefaultTdpWidgetConfig("pdf"),
        file_name: pdfFile.name,
        file_url: buildStorageProxyUrl(uploadedPdf.path),
        storage_path: uploadedPdf.path,
        title: previousPdf?.title ?? "Documento adjunto",
        description: previousPdf?.description ?? "",
      };

      if (previousPdf?.storage_path && previousPdf.storage_path !== uploadedPdf.path) {
        await deleteFileFromStorage(previousPdf.storage_path).catch(() => undefined);
      }
    }

    const config: TdpProfileConfig = {
      ...currentConfig,
      profile_code: currentConfig.profile_code || generateProfileCode(),
      widget_configs: nextWidgetConfigs,
    };

    await saveTdpProfileConfig(targetUserId, config);
  } catch (error) {
    redirect(
      buildFlashPath(
        String(formData.get("return_to") ?? "/tdp/panel/perfil"),
        "error",
        getActionErrorMessage(error, "No se pudo guardar el perfil."),
      ),
    );
  }

  revalidatePath("/tdp/panel/perfil");
  revalidatePath("/tdp/panel/usuarios");
  redirect(
    buildFlashPath(
      String(formData.get("return_to") ?? "/tdp/panel/perfil"),
      "success",
      "Perfil digital guardado correctamente.",
    ),
  );
}
