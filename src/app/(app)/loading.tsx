import Bee from "@/components/brand/Bee";
import { getT } from "@/lib/i18n/server";
import styles from "./loading.module.scss";

export default async function Loading() {
  const t = await getT();
  return (
    <div className={styles.wrap} aria-label={t.common.loadingShort} role="status">
      <div className={styles.bee}>
        <Bee px={4} />
      </div>
      <div className={styles.track}>
        <span className={styles.fill} />
      </div>
    </div>
  );
}
