import { messageFromUnknown } from "@/lib/airtable-errors";
import { getPublicHarvestForEmbedCached } from "@/lib/embed-harvest-cache";
import styles from "./rsvp-thanks.module.css";

function formatWhen(input: {
  startDate: string | null;
  startTime: string | null;
  endTime: string | null;
}) {
  const parts: string[] = [];
  if (input.startDate) parts.push(input.startDate);
  if (input.startTime) {
    let t = input.startTime;
    if (input.endTime) t = `${t} – ${input.endTime}`;
    parts.push(t);
  }
  return parts.join(" · ");
}

type Search = { recordId?: string | string[] };

export default async function RsvpThanksEmbedPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const raw = sp.recordId;
  const recordId = Array.isArray(raw) ? raw[0]?.trim() : raw?.trim();

  let harvest = null as Awaited<ReturnType<typeof getPublicHarvestForEmbedCached>>;
  let loadError: string | null = null;

  try {
    harvest = await getPublicHarvestForEmbedCached(recordId);
  } catch (e) {
    loadError = messageFromUnknown(e);
  }

  return (
    <div className={styles.root}>
      <div className={styles.burst} aria-hidden />
      <span className={styles.sparkle} aria-hidden />
      <span className={styles.sparkle} aria-hidden />
      <span className={styles.sparkle} aria-hidden />
      <span className={styles.sparkle} aria-hidden />
      <span className={styles.sparkle} aria-hidden />

      {loadError ? (
        <>
          <p className={styles.eyebrow}>RSVP</p>
          <h1 className={styles.title}>Something went wrong</h1>
          <p className={`${styles.error} ${styles.muted}`}>{loadError}</p>
        </>
      ) : !harvest ? (
        <>
          <p className={styles.eyebrow}>You’re in</p>
          <h1 className={styles.title}>Thank you for RSVPing!</h1>
          <p className={styles.sub}>We couldn’t load pickup details.</p>
          <p className={styles.muted}>
            No harvest with status <strong>Sent</strong> was found, or add{" "}
            <code>?recordId=rec…</code> to this embed URL for a specific harvest.
          </p>
        </>
      ) : (
        <>
          <p className={styles.eyebrow}>You’re in</p>
          <h1 className={styles.title}>Thank you for RSVPing!</h1>
          <p className={styles.sub}>Here’s your harvest pickup details.</p>
          {harvest.headerImageUrl ? (
            <div className={styles.hero}>
              {/* Remote image URLs from Airtable (arbitrary hosts); next/image would require dynamic remotePatterns. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.heroImg}
                src={harvest.headerImageUrl}
                alt={`${harvest.name} harvest`}
                width={800}
                height={450}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
          ) : null}
          <div className={styles.card}>
            <p className={styles.harvestName}>{harvest.name}</p>
            <p className={styles.meta}>{formatWhen(harvest)}</p>
          </div>
        </>
      )}
    </div>
  );
}
