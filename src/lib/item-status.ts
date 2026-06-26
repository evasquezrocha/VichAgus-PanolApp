const INACTIVE_STATUS_VALUES = new Set([
  "inactivo",
  "inactive",
  "desactivado",
  "disabled",
  "false",
  "0",
]);

export const ITEM_STATUS_OPTIONS = [
  { value: "Activo", label: "Activo" },
  { value: "Inactivo", label: "Inactivo" },
] as const;

export function normalizeItemStatus(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function isKnownItemStatus(value: string | null | undefined) {
  const normalized = normalizeItemStatus(value);

  return ITEM_STATUS_OPTIONS.some((option) => option.value.toLowerCase() === normalized);
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
