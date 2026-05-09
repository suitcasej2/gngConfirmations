/**
 * Browser requests from Squarespace send an Origin header. When
 * PUBLIC_ALLOWED_ORIGINS is set (comma-separated), only those origins are echoed;
 * otherwise Access-Control-Allow-Origin is * for simple GETs without credentials.
 */
export function corsHeadersForRequest(request: Request): HeadersInit {
  const origin = request.headers.get("origin");
  const raw = process.env.PUBLIC_ALLOWED_ORIGINS?.trim();
  if (!raw) {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    };
  }

  const allowed = raw.split(",").map((s) => s.trim()).filter(Boolean);
  const allow =
    origin && allowed.includes(origin)
      ? origin
      : !origin
        ? "*"
        : allowed.length === 1
          ? allowed[0]!
          : null;

  if (!allow) {
    return {
      "Access-Control-Allow-Origin": "null",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Vary": "Origin",
    };
  }

  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    ...(allow !== "*" ? { Vary: "Origin" } : {}),
  };
}
