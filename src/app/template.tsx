import styles from "./template.module.scss";

// A template re-mounts on every navigation, so this gives each route a smooth
// fade + rise entrance.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}
