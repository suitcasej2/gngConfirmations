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

/** Safe JSONP callback names only (prevents reflected JS injection). */
function parseJsonpCallback(request: Request): string | null {
  const raw = new URL(request.url).searchParams.get("callback")?.trim();
  if (!raw) return null;
  return /^[a-zA-Z_$][a-zA-Z0-9_$]{0,63}$/.test(raw) ? raw : null;
}

/**
 * JSONP response for hosts (e.g. SquareSpace) whose CSP blocks fetch() to external APIs
 * but still allow <script src="…">.
 */
function jsonp(callbackName: string, data: unknown) {
  const body = `${callbackName}(${JSON.stringify(data)});`;
  const headers = new Headers();
  for (const [k, v] of Object.entries(publicCorsHeaders())) {
    headers.set(k, v);
  }
  headers.set("Content-Type", "application/javascript; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(body, { status: 200, headers });
}

export async function OPTIONS() {
  const headers = new Headers(publicCorsHeaders());
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(null, { status: 204, headers });
}

export async function GET(request: Request) {
  const jsonpCallback = parseJsonpCallback(request);

  try {
    const url = new URL(request.url);
    const recordId = url.searchParams.get("recordId")?.trim();

    const harvest = recordId
      ? await fetchHarvestByRecordId(recordId)
      : await fetchCurrentPublicHarvest();

    const payload = { ok: true as const, harvest };
    return jsonpCallback ? jsonp(jsonpCallback, payload) : json(payload);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Failed to load harvest.";
    const payload = { ok: false as const, error: message };
    if (jsonpCallback) return jsonp(jsonpCallback, payload);
    return json(payload, { status: 500 });
  }
}
