import styles from "./template.module.scss";

// Re-mounts on every navigation → fade + rise entrance for the page content.
// Safe to use transform here: the header/footer live in the layout, outside
// this wrapper, so their backdrop-filter is unaffected.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}
