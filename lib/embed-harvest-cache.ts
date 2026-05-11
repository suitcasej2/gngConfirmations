import { unstable_cache } from "next/cache";
import { fetchCurrentPublicHarvest, fetchHarvestByRecordId } from "@/lib/public-harvest";

function embedRevalidateSeconds(): number {
  const raw = parseInt(process.env.EMBED_CACHE_SECONDS || "45", 10);
  if (Number.isNaN(raw)) return 45;
  return Math.min(300, Math.max(5, raw));
}

/**
 * Short-lived cache for the embed page (and only used from server components).
 * Cuts repeat Airtable latency when many subscribers hit the same thank-you URL.
 */
export async function getPublicHarvestForEmbedCached(recordId: string | undefined) {
  const revalidate = embedRevalidateSeconds();

  if (recordId) {
    return unstable_cache(
      async () => fetchHarvestByRecordId(recordId),
      ["embed-harvest", recordId],
      { revalidate },
    )();
  }

  return unstable_cache(async () => fetchCurrentPublicHarvest(), ["embed-harvest-current"], {
    revalidate,
  })();
}
