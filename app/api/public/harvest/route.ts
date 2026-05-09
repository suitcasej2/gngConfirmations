import { fetchCurrentPublicHarvest, fetchHarvestByRecordId } from "@/lib/public-harvest";

export const dynamic = "force-dynamic";

/**
 * Wildcard CORS: this route is a public read-only JSON API meant to be called from
 * SquareSpace and other static hosts (wildcard avoids brittle per-domain setup).
 */
function publicCorsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
}

function json(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  for (const [k, v] of Object.entries(publicCorsHeaders())) {
    headers.set(k, v);
  }
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export async function OPTIONS() {
  const headers = new Headers(publicCorsHeaders());
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(null, { status: 204, headers });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const recordId = url.searchParams.get("recordId")?.trim();

    const harvest = recordId
      ? await fetchHarvestByRecordId(recordId)
      : await fetchCurrentPublicHarvest();

    return json({ ok: true as const, harvest });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Failed to load harvest.";
    return json({ ok: false as const, error: message }, { status: 500 });
  }
}
