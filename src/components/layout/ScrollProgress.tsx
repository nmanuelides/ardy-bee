import styles from "./ScrollProgress.module.scss";

/** Thin accent bar at the top that fills as you scroll the page. */
export default function ScrollProgress() {
  return <div className={styles.bar} aria-hidden="true" />;
}
