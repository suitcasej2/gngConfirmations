import { getAirtableBase, getHarvestsTableName } from "@/lib/airtable";
import { getHarvestNameFromAirtableFields, getStringField } from "@/lib/harvest-display";

export type PublicHarvestPayload = {
  recordId: string;
  name: string;
  startDate: string | null;
  startTime: string | null;
  endTime: string | null;
};

function mapFieldsToPayload(recordId: string, fields: Record<string, unknown>): PublicHarvestPayload {
  return {
    recordId,
    name: getHarvestNameFromAirtableFields(fields),
    startDate: getStringField(fields, "Start Date"),
    startTime: getStringField(fields, "Start Time"),
    endTime: getStringField(fields, "End Time"),
  };
}

function defaultCurrentHarvestFilterFormula(): string {
  const override = process.env.AIRTABLE_CURRENT_HARVEST_FILTER?.trim();
  if (override) return override;
  return "OR({Status} = 'Publish', {Status} = 'Published')";
}

export async function fetchHarvestByRecordId(recordId: string): Promise<PublicHarvestPayload | null> {
  const base = getAirtableBase();
  const tableName = getHarvestsTableName();
  const record = await base(tableName).find(recordId);
  const fields = (record.fields || {}) as Record<string, unknown>;
  return mapFieldsToPayload(record.id, fields);
}

export async function fetchCurrentPublicHarvest(): Promise<PublicHarvestPayload | null> {
  const base = getAirtableBase();
  const tableName = getHarvestsTableName();
  const formula = defaultCurrentHarvestFilterFormula();

  const records = await base(tableName)
    .select({
      filterByFormula: formula,
      sort: [{ field: "Last Modified", direction: "desc" }],
      maxRecords: 1,
    })
    .firstPage();

  const first = records[0];
  if (!first) return null;

  const fields = (first.fields || {}) as Record<string, unknown>;
  return mapFieldsToPayload(first.id, fields);
}
