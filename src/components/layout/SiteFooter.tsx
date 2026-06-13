import Wordmark from "@/components/brand/Wordmark";
import styles from "./SiteFooter.module.scss";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Wordmark size="sm" />

        {/* TMDb attribution is required by their terms of use. */}
        <p className={styles.attribution}>
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </p>
      </div>
    </footer>
  );
}
