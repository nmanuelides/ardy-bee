import Link from "next/link";
import Wordmark from "@/components/brand/Wordmark";
import Button from "@/components/ui/Button";
import styles from "./SiteHeader.module.scss";

const NAV = [
  { href: "/movies", label: "Movies" },
  { href: "/actors", label: "Actors" },
  { href: "/rankings", label: "Rankings" },
];

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <Wordmark size="sm" />
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={styles.link}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Button variant="accent">Sign in</Button>
        </div>
      </div>
    </header>
  );
}
