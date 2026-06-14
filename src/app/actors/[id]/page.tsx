import Image from "next/image";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import MovieCard from "@/components/movie/MovieCard";
import Reveal from "@/components/motion/Reveal";
import { tmdbImage } from "@/lib/tmdb/image";
import { getPersonDetails, getPersonMovieCredits } from "@/lib/tmdb/people";
import styles from "./page.module.scss";

export default async function ActorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const personId = Number(id);
  if (!Number.isFinite(personId)) notFound();

  const [person, credits] = await Promise.all([
    getPersonDetails(personId).catch(() => null),
    getPersonMovieCredits(personId).catch(() => ({ id: personId, cast: [] })),
  ]);
  if (!person) notFound();

  const photo = tmdbImage(person.profile_path, "h632");

  // de-dupe by movie id, prefer those with a poster, sort by popularity
  const seen = new Set<number>();
  const knownFor = [...credits.cast]
    .filter((m) => {
      if (!m.poster_path || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    })
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, 18);

  const facts = [person.known_for_department, person.place_of_birth]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.photo}>
            {photo ? (
              <Image src={photo} alt={person.name} fill sizes="240px" className={styles.photoImg} />
            ) : (
              <span className={styles.initial}>{person.name.charAt(0)}</span>
            )}
          </div>
          <div className={styles.meta}>
            <h1 className={styles.name}>{person.name}</h1>
            {facts && <p className={styles.facts}>{facts}</p>}
            {person.biography && (
              <p className={styles.bio}>{person.biography}</p>
            )}
          </div>
        </header>

        {knownFor.length > 0 && (
          <Reveal>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Known for</h2>
              <div className={styles.grid}>
                {knownFor.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </section>
          </Reveal>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
