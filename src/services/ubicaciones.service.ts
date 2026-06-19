import "server-only";

import {
  createPanolLocationForCurrentCompanyAdmin,
  getDefaultPanolLocationForCurrentCompanyAdmin,
  listPanolLocationsForCurrentCompanyAdmin,
  updatePanolLocationForCurrentCompanyAdmin,
} from "@/server/dal/ubicaciones.dal";

export async function listPanolLocations() {
  return listPanolLocationsForCurrentCompanyAdmin();
}

export async function getDefaultPanolLocationId() {
  const location = await getDefaultPanolLocationForCurrentCompanyAdmin();
  return location.id;
}

export async function createPanolLocation(input: {
  nombre: string;
  responsible_user_id: string | null;
}) {
  return createPanolLocationForCurrentCompanyAdmin(input);
}

export async function updatePanolLocation(input: {
  id: string;
  nombre: string;
  responsible_user_id: string | null;
}) {
  return updatePanolLocationForCurrentCompanyAdmin(input);
}
