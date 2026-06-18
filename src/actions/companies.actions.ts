"use server";

import { buildFlashPath, getActionErrorMessage } from "@/lib/flash";
import {
  companyInputSchema,
  companyAdminUpdateSchema,
  companySettingsSchema,
} from "@/schemas/company.schema";
import {
  createCompany,
  updateCompanySettings,
  updateCompany,
  uploadCompanyLogo,
} from "@/services/companies.service";
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

export async function updateCompanyAction(formData: FormData) {
  try {
    const parsed = companyAdminUpdateSchema.parse({
      id: formData.get("id"),
      name: formData.get("name"),
      slug: formData.get("slug"),
      is_active: formData.get("is_active") === "true",
    });

    await updateCompany(parsed);
  } catch (error) {
    redirect(
      buildFlashPath(
        "/admin/companies",
        "error",
        getActionErrorMessage(error, "No se pudo actualizar la empresa."),
      ),
    );
  }

  revalidatePath("/admin/companies");
  redirect(
    buildFlashPath(
      "/admin/companies",
      "success",
      "Empresa actualizada correctamente.",
    ),
  );
}

export async function updateCompanySettingsAction(formData: FormData) {
  const returnTo = "/company/settings/parametros-generales";

  try {
    const logoFile = formData.get("logo_file");
    const currentLogoUrl = String(formData.get("logo_url") ?? "").trim() || null;
    let logoUrl = currentLogoUrl;

    if (logoFile instanceof File && logoFile.size > 0) {
      try {
        logoUrl = await uploadCompanyLogo(logoFile);
      } catch {
        logoUrl = currentLogoUrl;
      }
    }

    const parsed = companySettingsSchema.parse({
      name: formData.get("name"),
      rut: String(formData.get("rut") ?? "").trim() || null,
      logo_url: logoUrl,
      sidebar_bg_color: formData.get("sidebar_bg_color"),
      sidebar_text_color: formData.get("sidebar_text_color"),
      sidebar_active_bg_color: formData.get("sidebar_active_bg_color"),
      sidebar_active_text_color: formData.get("sidebar_active_text_color"),
      platform_background_color: formData.get("platform_background_color"),
      popup_bg_color: formData.get("popup_bg_color"),
      popup_text_color: formData.get("popup_text_color"),
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
  revalidatePath("/dashboard");
  redirect(
    buildFlashPath(
      returnTo,
      "success",
      "Parametros de empresa actualizados correctamente.",
    ),
  );
}
