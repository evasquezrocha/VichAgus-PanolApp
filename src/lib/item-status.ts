const INACTIVE_STATUS_VALUES = new Set([
  "inactivo",
  "inactive",
  "desactivado",
  "disabled",
  "false",
  "0",
]);

export function normalizeItemStatus(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function isInactiveItemStatus(value: string | null | undefined) {
  return INACTIVE_STATUS_VALUES.has(normalizeItemStatus(value));
}

export function getStatusSelectValue(value: string | null | undefined) {
  const normalized = normalizeItemStatus(value);

  if (normalized === "inactivo" || normalized === "inactive") {
    return "Inactivo";
  }

  if (normalized === "activo" || normalized === "active" || normalized.length === 0) {
    return "Activo";
  }

  return value?.trim() || "Activo";
}
