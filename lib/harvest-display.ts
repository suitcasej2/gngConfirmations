/**
 * Mirrors gng-dashboard field helpers so public responses stay consistent.
 */
export function getHarvestNameFromAirtableFields(
  fields: Record<string, unknown> | null | undefined,
) {
  if (!fields) return "Untitled harvest";

  for (const [k, v] of Object.entries(fields)) {
    const key = k.replace(/^\uFEFF+/, "").trim();
    if (key === "Harvest Name" && typeof v === "string" && v.trim()) {
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
  const direct = fields[name];
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  return null;
}
