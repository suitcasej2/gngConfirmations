import { corsHeadersForRequest } from "@/lib/cors";
import { fetchCurrentPublicHarvest, fetchHarvestByRecordId } from "@/lib/public-harvest";

export const dynamic = "force-dynamic";

function json(data: unknown, request: Request, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  const cors = corsHeadersForRequest(request);
  for (const [k, v] of Object.entries(cors)) {
    headers.set(k, v);
  }
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export async function OPTIONS(request: Request) {
  const headers = new Headers(corsHeadersForRequest(request));
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

    return json({ ok: true as const, harvest }, request);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Failed to load harvest.";
    return json({ ok: false as const, error: message }, request, { status: 500 });
  }
}
