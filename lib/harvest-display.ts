import { getHarvestNameField } from "@/lib/airtable";

function normalizeFieldKey(k: string) {
  return k.replace(/^\uFEFF+/, "").trim();
}

/**
 * Mirrors gng-dashboard: uses AIRTABLE_HARVEST_NAME_FIELD (default "Harvest Name") and BOM-safe keys.
 */
export function getHarvestNameFromAirtableFields(
  fields: Record<string, unknown> | null | undefined,
) {
  if (!fields) return "Untitled harvest";

  const configured = normalizeFieldKey(getHarvestNameField());
  const legacy = "Harvest Name";

  for (const [k, v] of Object.entries(fields)) {
    const key = normalizeFieldKey(k);
    if ((key === configured || key === legacy) && typeof v === "string" && v.trim()) {
      return v.trim();
    }
  }

  return "Untitled harvest";
}

export function getStringField(
  fields: Record<string, unknown> | null | undefined,
  name: string,
) {
  if (!fields) return null;
  const want = normalizeFieldKey(name);
  for (const [k, v] of Object.entries(fields)) {
    if (normalizeFieldKey(k) !== want) continue;
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}
