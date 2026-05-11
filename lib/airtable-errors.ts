/** Airtable / SDK errors are not always `instanceof Error`. */
export function messageFromUnknown(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const o = err as Record<string, unknown>;
    if (typeof o.message === "string") return o.message;
    if (typeof o.error === "string") return o.error;
    if (typeof o.statusMessage === "string") return o.statusMessage;
  }
  return "Could not load harvest.";
}
