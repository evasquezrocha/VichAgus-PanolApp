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
import { uploadFileToDropbox } from "@/lib/dropbox";

function getDropboxBaseFolder() {
  return (process.env.DROPBOX_BASE_FOLDER ?? "/PanolApp").replace(/\/$/, "");
}

async function getEquipmentImagesFolder() {
  const companySlug = await getCurrentCompanySlugForCurrentCompanyAdmin();
  return `${getDropboxBaseFolder()}/${companySlug}/Equipos`;
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
  let imageDropboxPath: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const uploaded = await uploadFileToDropbox(imageFile, await getEquipmentImagesFolder());
    imageUrl = uploaded.url;
    imageDropboxPath = uploaded.path;
  }

  return createEquipmentForCurrentCompanyAdmin({
    ...input,
    image_url: imageUrl,
    image_dropbox_path: imageDropboxPath,
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
    image_dropbox_path: string | null;
  },
  customFieldValues: Record<string, string | null>,
  imageFile?: File | null,
) {
  let imageUrl = input.image_url;
  let imageDropboxPath = input.image_dropbox_path;

  if (imageFile && imageFile.size > 0) {
    const uploaded = await uploadFileToDropbox(imageFile, await getEquipmentImagesFolder());
    imageUrl = uploaded.url;
    imageDropboxPath = uploaded.path;
  }

  return updateEquipmentForCurrentCompanyAdmin({
    ...input,
    image_url: imageUrl,
    image_dropbox_path: imageDropboxPath,
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

