import Link from "next/link";
import Wordmark from "@/components/brand/Wordmark";
import Button from "@/components/ui/Button";
import SearchBar from "@/components/search/SearchBar";
import UserMenu from "./UserMenu";
import { createClient } from "@/lib/supabase/server";
import styles from "./SiteHeader.module.scss";

const NAV = [
  { href: "/movies", label: "Movies" },
  { href: "/actors", label: "Actors" },
  { href: "/rankings", label: "Rankings" },
  { href: "/recommendations", label: "For You" },
];

export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const label =
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email ??
    "";

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

        <div className={styles.search}>
          <SearchBar />
        </div>

        <div className={styles.actions}>
          {user ? (
            <UserMenu label={label} />
          ) : (
            <Link href="/login">
              <Button variant="accent">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
