import Wordmark from "@/components/brand/Wordmark";
import { getT } from "@/lib/i18n/server";
import styles from "./SiteFooter.module.scss";

export default async function SiteFooter() {
  const t = await getT();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Wordmark size="sm" />

        {/* TMDb attribution is required by their terms of use. */}
        <p className={styles.attribution}>{t.footer.attribution}</p>
      </div>
    </footer>
  );
}
