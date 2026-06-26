"use server";

import { buildFlashPath, getActionErrorMessage } from "@/lib/flash";
import { assetFormSchema } from "@/schemas/activos.schema";
import { createAsset } from "@/services/activos.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAssetAction(formData: FormData) {
  const returnTo = "/company/activos/listado-de-activos";

  try {
    const parsed = assetFormSchema.parse({
      af: formData.get("af"),
      patente: formData.get("patente"),
      tipo: formData.get("tipo"),
      marca: formData.get("marca"),
      modelo: formData.get("modelo"),
      anio: formData.get("anio"),
      centro_costos: formData.get("centro_costos"),
      id_gps: formData.get("id_gps"),
      horometro: formData.get("horometro"),
      kilometraje: formData.get("kilometraje"),
    });
    const imageFile = formData.get("image_file");

    await createAsset(parsed, imageFile instanceof File ? imageFile : null);
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo crear el activo."),
      ),
    );
  }

  revalidatePath(returnTo);
  redirect(buildFlashPath(returnTo, "success", "Activo creado correctamente."));
}

