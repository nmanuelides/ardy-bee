import Link from "next/link";
import Wordmark from "@/components/brand/Wordmark";
import Button from "@/components/ui/Button";
import SearchBar from "@/components/search/SearchBar";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/server";
import styles from "./SiteHeader.module.scss";

export default async function SiteHeader() {
  const t = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nav = [
    { href: "/movies", label: t.nav.movies },
    { href: "/actors", label: t.nav.actors },
    { href: "/rankings", label: t.nav.rankings },
    { href: "/recommendations", label: t.nav.forYou },
  ];

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

        <nav className={styles.nav} aria-label={t.nav.primary}>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={styles.link}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.search}>
          <SearchBar />
        </div>

        <div className={styles.actions}>
          <LanguageToggle />
          <ThemeToggle />
          {user ? (
            <UserMenu label={label} />
          ) : (
            <Link href="/login">
              <Button variant="accent">{t.common.signIn}</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
