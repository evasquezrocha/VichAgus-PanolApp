"use server";

import { buildFlashPath, getActionErrorMessage } from "@/lib/flash";
import {
  companyInputSchema,
  companySettingsSchema,
} from "@/schemas/company.schema";
import {
  createCompany,
  updateCompanySettings,
  uploadCompanyLogo,
} from "@/services/companies.service";
import { getDefaultDashboardPath } from "@/lib/site";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCompanyAction(formData: FormData) {
  try {
    const parsed = companyInputSchema.parse({
      name: formData.get("name"),
      is_active: formData.get("is_active") === "true",
    });

    await createCompany(parsed);
  } catch (error) {
    redirect(
      buildFlashPath(
        "/admin/companies",
        "error",
        getActionErrorMessage(error, "No se pudo crear la empresa."),
      ),
    );
  }

  revalidatePath("/admin/companies");
  redirect(
    buildFlashPath("/admin/companies", "success", "Empresa creada correctamente."),
  );
}

export async function updateCompanySettingsAction(formData: FormData) {
  const returnTo = "/company/settings/parametros-generales";

  try {
    const logoFile = formData.get("logo_file");
    const currentLogoUrl = String(formData.get("logo_url") ?? "").trim() || null;
    let logoUrl = currentLogoUrl;

    if (logoFile instanceof File && logoFile.size > 0) {
      logoUrl = await uploadCompanyLogo(logoFile);
    }

    const parsed = companySettingsSchema.parse({
      name: formData.get("name"),
      rut: String(formData.get("rut") ?? "").trim() || null,
      logo_url: logoUrl,
      button_background_color: formData.get("button_background_color"),
      button_text_color: formData.get("button_text_color"),
      tab_background_color: formData.get("tab_background_color"),
      tab_text_color: formData.get("tab_text_color"),
      tab_active_background_color: formData.get("tab_active_background_color"),
      tab_active_text_color: formData.get("tab_active_text_color"),
      popup_background_color: formData.get("popup_background_color"),
      popup_text_color: formData.get("popup_text_color"),
      sidebar_bg_color: formData.get("sidebar_bg_color"),
      sidebar_text_color: formData.get("sidebar_text_color"),
      sidebar_active_bg_color: formData.get("sidebar_active_bg_color"),
      sidebar_active_text_color: formData.get("sidebar_active_text_color"),
      platform_background_color: formData.get("platform_background_color"),
    });

    await updateCompanySettings(parsed);
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudieron actualizar los parametros."),
      ),
    );
  }

  revalidatePath("/company/settings/parametros-generales");
  revalidatePath(getDefaultDashboardPath());
  redirect(
    buildFlashPath(
      returnTo,
      "success",
      "Parametros de empresa actualizados correctamente.",
    ),
  );
}
