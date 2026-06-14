import Bee from "@/components/brand/Bee";
import styles from "./loading.module.scss";

export default function Loading() {
  return (
    <div className={styles.wrap} aria-label="Loading" role="status">
      <div className={styles.bee}>
        <Bee px={4} />
      </div>
      <div className={styles.track}>
        <span className={styles.fill} />
      </div>
    </div>
  );
}
