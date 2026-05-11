import styles from "./loading.module.css";

export default function RsvpThanksLoading() {
  return (
    <div className={styles.root} aria-busy="true" aria-label="Loading confirmation">
      <div className={styles.inner}>
        <div className={styles.shimmer} />
        <div className={styles.lineSm} />
        <div className={styles.lineLg} />
        <div className={styles.lineMd} />
        <div className={styles.card}>
          <div className={styles.cardShimmer} />
          <div className={styles.lineTitle} />
          <div className={styles.lineMeta} />
        </div>
      </div>
    </div>
  );
}
