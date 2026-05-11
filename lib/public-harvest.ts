import { getAirtableBase, getHarvestNameField, getHarvestsTableName } from "@/lib/airtable";
import { messageFromUnknown } from "@/lib/airtable-errors";
import { getHarvestNameFromAirtableFields, getStringField } from "@/lib/harvest-display";

export type PublicHarvestPayload = {
  recordId: string;
  name: string;
  startDate: string | null;
  startTime: string | null;
  endTime: string | null;
  /** Airtable "Header Image URL" (same field as gng-dashboard). */
  headerImageUrl: string | null;
};

function mapFieldsToPayload(recordId: string, fields: Record<string, unknown>): PublicHarvestPayload {
  return {
    recordId,
    name: getHarvestNameFromAirtableFields(fields),
    startDate: getStringField(fields, "Start Date"),
    startTime: getStringField(fields, "Start Time"),
    endTime: getStringField(fields, "End Time"),
    headerImageUrl: getStringField(fields, "Header Image URL"),
  };
}

function defaultCurrentHarvestFilterFormula(): string {
  const override = process.env.AIRTABLE_CURRENT_HARVEST_FILTER?.trim();
  if (override) return override;
  // Thank-you page reflects the active “sent” harvest cycle (matches gng-dashboard live/outbox).
  return "{Status} = 'Sent'";
}

export async function fetchHarvestByRecordId(recordId: string): Promise<PublicHarvestPayload | null> {
  const base = getAirtableBase();
  const tableName = getHarvestsTableName();
  const record = await base(tableName).find(recordId);
  const fields = (record.fields || {}) as Record<string, unknown>;
  return mapFieldsToPayload(record.id, fields);
}

function currentHarvestSelectOptions(narrowFields: boolean) {
  const formula = defaultCurrentHarvestFilterFormula();
  const baseOpts = {
    filterByFormula: formula,
    sort: [{ field: "Last Modified", direction: "desc" as const }],
    maxRecords: 1,
  };
  if (!narrowFields) return baseOpts;
  const nameField = getHarvestNameField();
  const fieldSet = new Set([
    nameField,
    "Last Modified",
    "Start Date",
    "Start Time",
    "End Time",
    "Header Image URL",
  ]);
  return {
    ...baseOpts,
    fields: Array.from(fieldSet),
  };
}

export async function fetchCurrentPublicHarvest(): Promise<PublicHarvestPayload | null> {
  const base = getAirtableBase();
  const tableName = getHarvestsTableName();

  let records: readonly { id: string; fields: Record<string, unknown> }[];

  try {
    records = (await base(tableName).select(currentHarvestSelectOptions(true)).firstPage()) as unknown as readonly {
      id: string;
      fields: Record<string, unknown>;
    }[];
  } catch {
    try {
      records = (await base(tableName).select(currentHarvestSelectOptions(false)).firstPage()) as unknown as readonly {
        id: string;
        fields: Record<string, unknown>;
      }[];
    } catch (wideErr) {
      throw new Error(messageFromUnknown(wideErr));
    }
  }

  const first = records[0];
  if (!first) return null;

  const fields = (first.fields || {}) as Record<string, unknown>;
  return mapFieldsToPayload(first.id, fields);
}
