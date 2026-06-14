import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ActorCard from "@/components/actor/ActorCard";
import Reveal from "@/components/motion/Reveal";
import { getPopularPeople } from "@/lib/tmdb/people";
import styles from "../movies/browse.module.scss";

export const metadata = { title: "Actors · Ardy Bee" };

export default async function ActorsPage() {
  const people = await getPopularPeople().catch(() => []);
  // only actors with a photo, de-duplicated
  const seen = new Set<number>();
  const actors = people.filter((p) => {
    if (!p.profile_path || seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <header className={styles.header}>
          <h1>Actors</h1>
          <p className={styles.lead}>
            Discover performers and rate their work across every film.
          </p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Popular this week</h2>
          <Reveal stagger className={styles.grid}>
            {actors.map((person) => (
              <ActorCard key={person.id} person={person} />
            ))}
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
