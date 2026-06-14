import styles from "./Backdrop.module.scss";

/**
 * Fixed, behind-everything background of soft drifting gradient blobs in the
 * brand palette. Gives glass surfaces real color + depth to refract.
 */
export default function Backdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <span className={`${styles.blob} ${styles.a}`} />
      <span className={`${styles.blob} ${styles.b}`} />
      <span className={`${styles.blob} ${styles.c}`} />
      <span className={`${styles.blob} ${styles.d}`} />
      <span className={styles.vignette} />
    </div>
  );
}
