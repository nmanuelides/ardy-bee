import Image from "next/image";
import { notFound } from "next/navigation";
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

  // Full filmography: de-dupe by movie id; poster-bearing titles first, then
  // by popularity. No cap — show every film they acted in.
  const seen = new Set<number>();
  const knownFor = [...credits.cast]
    .filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    })
    .sort((a, b) => {
      const ap = a.poster_path ? 1 : 0;
      const bp = b.poster_path ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return (b.popularity ?? 0) - (a.popularity ?? 0);
    });

  const facts = [person.known_for_department, person.place_of_birth]
    .filter(Boolean)
    .join("  ·  ");

  return (
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
          {person.biography && <p className={styles.bio}>{person.biography}</p>}
        </div>
      </header>

      {knownFor.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Filmography <span className={styles.count}>{knownFor.length}</span>
          </h2>
          <Reveal stagger className={styles.grid}>
            {knownFor.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </Reveal>
        </section>
      )}
    </main>
  );
}
