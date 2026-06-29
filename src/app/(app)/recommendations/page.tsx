import Link from "next/link";
import Button from "@/components/ui/Button";
import RecommendationCard from "@/components/recommendations/RecommendationCard";
import Reveal from "@/components/motion/Reveal";
import { getRecommendations } from "@/lib/recommendations/queries";
import { getT } from "@/lib/i18n/server";
import styles from "./page.module.scss";

export async function generateMetadata() {
  const t = await getT();
  return { title: t.meta.forYou };
}

export default async function RecommendationsPage() {
  const t = await getT();
  const { recommendations, favorites, isAuthenticated } =
    await getRecommendations();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>{t.recommendations.title}</h1>
          <p className={styles.lead}>{t.recommendations.lead}</p>
        </header>

        {!isAuthenticated ? (
          <div className={styles.empty}>
            <p>{t.recommendations.signInPrompt}</p>
            <Link href="/login">
              <Button variant="accent">{t.common.signIn}</Button>
            </Link>
          </div>
        ) : favorites.length < 2 ? (
          <div className={styles.empty}>
            <p>{t.recommendations.needTwo}</p>
            {favorites.length === 1 && (
              <p className={styles.hint}>
                {t.recommendations.favoriteHintPre}{" "}
                <strong>{favorites[0].name}</strong>{" "}
                {t.recommendations.favoriteHintPost}
              </p>
            )}
            <Link href="/rankings">
              <Button variant="ghost">{t.recommendations.browseRankings}</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.favorites}>
              <span className={styles.favLabel}>
                {t.recommendations.yourFavorites}
              </span>
              {favorites.map((f) => (
                <span key={f.personId} className={styles.chip}>
                  {f.name}
                </span>
              ))}
            </div>

            {recommendations.length > 0 ? (
              <Reveal stagger className={styles.grid}>
                {recommendations.map((rec) => (
                  <RecommendationCard key={rec.movieId} rec={rec} />
                ))}
              </Reveal>
            ) : (
              <div className={styles.empty}>
                <p>{t.recommendations.noCoStars}</p>
              </div>
            )}
          </>
        )}
    </main>
  );
}
