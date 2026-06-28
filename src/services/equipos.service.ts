import "server-only";

import {
  createEquipmentCustomFieldForCurrentCompanyAdmin,
  createEquipmentForCurrentCompanyAdmin,
  createEquipmentGroupForCurrentCompanyAdmin,
  deleteEquipmentForCurrentCompanyAdmin,
  deleteEquipmentCustomFieldForCurrentCompanyAdmin,
  getCurrentCompanySlugForCurrentCompanyAdmin,
  getEquipmentDetailForCurrentCompanyAdmin,
  listEquipmentCustomFieldValuesForCurrentCompanyAdmin,
  listEquipmentCustomFieldsForCurrentCompanyAdmin,
  listEquipmentGroupsForCurrentCompanyAdmin,
  listEquipmentsForCurrentCompanyAdmin,
  reorderEquipmentCustomFieldForCurrentCompanyAdmin,
  replaceEquipmentCustomFieldValuesForCurrentCompanyAdmin,
  updateEquipmentCustomFieldForCurrentCompanyAdmin,
  updateEquipmentForCurrentCompanyAdmin,
} from "@/server/dal/equipos.dal";
import type {
  EquipmentCustomFieldInput,
  EquipmentGroupInput,
  EquipmentInput,
} from "@/schemas/equipos.schema";
import { uploadFileToStorage } from "@/lib/storage";

function getStorageBaseFolder() {
  return (process.env.STORAGE_BASE_FOLDER ?? "/PanolApp").replace(/\/$/, "");
}

async function getEquipmentImagesFolder() {
  const companySlug = await getCurrentCompanySlugForCurrentCompanyAdmin();
  return `${getStorageBaseFolder()}/${companySlug}/Equipos`;
}

export async function listEquipmentGroups() {
  return listEquipmentGroupsForCurrentCompanyAdmin();
}

export async function listEquipments() {
  return listEquipmentsForCurrentCompanyAdmin();
}

export async function getEquipmentDetail(equipmentId: string) {
  return getEquipmentDetailForCurrentCompanyAdmin(equipmentId);
}

export async function listEquipmentCustomFields() {
  return listEquipmentCustomFieldsForCurrentCompanyAdmin();
}

export async function listEquipmentCustomFieldValues() {
  return listEquipmentCustomFieldValuesForCurrentCompanyAdmin();
}

export async function createEquipmentGroup(input: EquipmentGroupInput) {
  return createEquipmentGroupForCurrentCompanyAdmin(input);
}

export async function createEquipmentCustomField(input: EquipmentCustomFieldInput) {
  return createEquipmentCustomFieldForCurrentCompanyAdmin(input);
}

export async function updateEquipmentCustomField(
  input: EquipmentCustomFieldInput & { id: string },
) {
  return updateEquipmentCustomFieldForCurrentCompanyAdmin(input);
}

export async function deleteEquipmentCustomField(id: string) {
  return deleteEquipmentCustomFieldForCurrentCompanyAdmin(id);
}

export async function reorderEquipmentCustomField(
  id: string,
  direction: "up" | "down",
) {
  return reorderEquipmentCustomFieldForCurrentCompanyAdmin(id, direction);
}

export async function createEquipment(
  input: EquipmentInput,
  customFieldValues: Record<string, string | null>,
  imageFile?: File | null,
) {
  let imageUrl: string | null = null;
  let imageStoragePath: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const uploaded = await uploadFileToStorage(imageFile, await getEquipmentImagesFolder());
    imageUrl = uploaded.url;
    imageStoragePath = uploaded.path;
  }

  return createEquipmentForCurrentCompanyAdmin({
    ...input,
    image_url: imageUrl,
    image_storage_path: imageStoragePath,
  }).then(async (tool) => {
    await replaceEquipmentCustomFieldValuesForCurrentCompanyAdmin(
      tool.id,
      customFieldValues,
    );
    return tool;
  });
}

export async function updateEquipment(
  input: EquipmentInput & {
    id: string;
    image_url: string | null;
    image_storage_path: string | null;
  },
  customFieldValues: Record<string, string | null>,
  imageFile?: File | null,
) {
  let imageUrl = input.image_url;
  let imageStoragePath = input.image_storage_path;

  if (imageFile && imageFile.size > 0) {
    const uploaded = await uploadFileToStorage(imageFile, await getEquipmentImagesFolder());
    imageUrl = uploaded.url;
    imageStoragePath = uploaded.path;
  }

  return updateEquipmentForCurrentCompanyAdmin({
    ...input,
    image_url: imageUrl,
    image_storage_path: imageStoragePath,
  }).then(async (tool) => {
    await replaceEquipmentCustomFieldValuesForCurrentCompanyAdmin(
      tool.id,
      customFieldValues,
    );
    return tool;
  });
}

export async function deleteEquipment(id: string) {
  return deleteEquipmentForCurrentCompanyAdmin(id);
}

