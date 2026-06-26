"use server";

import { buildFlashPath, getActionErrorMessage } from "@/lib/flash";
import { transferHeaderSchema } from "@/schemas/traspasos.schema";
import { createEmployeeTransfer } from "@/services/traspasos.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function extractTransferItems(formData: FormData) {
  const items: Array<
    | { item_type: "equipment"; equipment_id: string }
    | { item_type: "tool"; tool_id: string; quantity: number }
  > = [];

  for (const [key, rawValue] of formData.entries()) {
    if (key.startsWith("equipment_selected_")) {
      if (rawValue === "true" || rawValue === "on") {
        items.push({
          item_type: "equipment",
          equipment_id: key.slice("equipment_selected_".length),
        });
      }
      continue;
    }

    if (key.startsWith("tool_quantity_")) {
      const toolId = key.slice("tool_quantity_".length);
      const quantity = Number(String(rawValue).trim());

      if (Number.isInteger(quantity) && quantity > 0) {
        items.push({
          item_type: "tool",
          tool_id: toolId,
          quantity,
        });
      }
    }
  }

  return items;
}

function parseTransferEndpoint(value: FormDataEntryValue | null, label: string) {
  const rawValue = String(value ?? "").trim();
  const [type, ...idParts] = rawValue.split(":");
  const endpointId = idParts.join(":").trim();

  if (type === "employee" && endpointId) {
    return { type: "employee" as const, employee_id: endpointId };
  }

  if (type === "location" && endpointId) {
    return { type: "location" as const, location_id: endpointId };
  }

  throw new Error(`${label} inválido.`);
}

export async function createEmployeeTransferAction(formData: FormData) {
  const returnTo = "/company/panol/traspasos?tab=nuevo";

  try {
    const parsed = transferHeaderSchema.parse({
      origin_endpoint: formData.get("origin_endpoint"),
      destination_endpoint: formData.get("destination_endpoint"),
      transfer_date: formData.get("transfer_date"),
      transfer_time: formData.get("transfer_time"),
      signature_data: formData.get("signature_data"),
      observations: formData.get("observations"),
    });
    const items = extractTransferItems(formData);
    const origin = parseTransferEndpoint(parsed.origin_endpoint, "Origen");
    const destination = parseTransferEndpoint(parsed.destination_endpoint, "Destino");

    if (items.length === 0) {
      throw new Error("Debes seleccionar al menos un equipo o una herramienta.");
    }

    await createEmployeeTransfer({
      origin,
      destination,
      transfer_date: parsed.transfer_date,
      transfer_time: parsed.transfer_time,
      signature_data: parsed.signature_data,
      observations: parsed.observations,
      items,
    });
  } catch (error) {
    redirect(
      buildFlashPath(
        returnTo,
        "error",
        getActionErrorMessage(error, "No se pudo crear el traspaso."),
      ),
    );
  }

  revalidatePath("/company/panol/traspasos");
  redirect(buildFlashPath(returnTo, "success", "Traspaso creado correctamente."));
}
