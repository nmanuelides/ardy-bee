import Bee from "./Bee";
import styles from "./Wordmark.module.scss";

interface WordmarkProps {
  /** Visual size. `lg` is for the hero, `sm` for the header. */
  size?: "sm" | "lg";
}

/** The "Ardy Bee" logotype. ARDB = Actors Ratings Data Base. */
export default function Wordmark({ size = "sm" }: WordmarkProps) {
  return (
    <span className={styles.wordmark} data-size={size} aria-label="Ardy Bee">
      <span>Ardy</span>
      <span className={styles.accent}>Bee</span>
      <span className={styles.bee}>
        <Bee px={size === "lg" ? 3 : 2} />
      </span>
    </span>
  );
}
