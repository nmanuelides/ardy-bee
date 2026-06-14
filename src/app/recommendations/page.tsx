import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import Button from "@/components/ui/Button";
import RecommendationCard from "@/components/recommendations/RecommendationCard";
import { getRecommendations } from "@/lib/recommendations/queries";
import styles from "./page.module.scss";

export const metadata = {
  title: "For You · Ardy Bee",
};

export default async function RecommendationsPage() {
  const { recommendations, favorites, isAuthenticated } =
    await getRecommendations();

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <header className={styles.header}>
          <h1>For you</h1>
          <p className={styles.lead}>
            Movies where two or more of your favorite actors share the screen —
            drawn from the performances you&apos;ve rated highest.
          </p>
        </header>

        {!isAuthenticated ? (
          <div className={styles.empty}>
            <p>Sign in and rate a few performances to unlock recommendations.</p>
            <Link href="/login">
              <Button variant="accent">Sign in</Button>
            </Link>
          </div>
        ) : favorites.length < 2 ? (
          <div className={styles.empty}>
            <p>
              Rate performances from at least two actors you love (a 7 or
              higher), and we&apos;ll find films where they co-star.
            </p>
            {favorites.length === 1 && (
              <p className={styles.hint}>
                So far your favorite is <strong>{favorites[0].name}</strong> —
                rate one more great performance to get started.
              </p>
            )}
            <Link href="/rankings">
              <Button variant="ghost">Browse rankings</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.favorites}>
              <span className={styles.favLabel}>Your favorites</span>
              {favorites.map((f) => (
                <span key={f.personId} className={styles.chip}>
                  {f.name}
                </span>
              ))}
            </div>

            {recommendations.length > 0 ? (
              <div className={styles.grid}>
                {recommendations.map((rec) => (
                  <RecommendationCard key={rec.movieId} rec={rec} />
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <p>
                  None of your favorites have shared the screen yet. Rate more
                  performances to widen the net!
                </p>
              </div>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
