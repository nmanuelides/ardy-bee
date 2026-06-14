import WebGLBackdrop from "./WebGLBackdrop";
import styles from "./Backdrop.module.scss";

/**
 * Fixed, behind-everything background: an animated WebGL gradient field in the
 * brand palette. It animates pixels (not transformed DOM), so glass surfaces
 * can still frost it. A CSS vignette keeps content legible.
 */
export default function Backdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <WebGLBackdrop />
      <span className={styles.vignette} />
    </div>
  );
}
