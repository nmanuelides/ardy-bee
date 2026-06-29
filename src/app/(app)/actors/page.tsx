import ActorCard from "@/components/actor/ActorCard";
import Reveal from "@/components/motion/Reveal";
import { getPopularPeople } from "@/lib/tmdb/people";
import { getT } from "@/lib/i18n/server";
import styles from "../movies/browse.module.scss";

export async function generateMetadata() {
  const t = await getT();
  return { title: t.meta.actors };
}

export default async function ActorsPage() {
  const t = await getT();
  const people = await getPopularPeople().catch(() => []);
  // only actors with a photo, de-duplicated
  const seen = new Set<number>();
  const actors = people.filter((p) => {
    if (!p.profile_path || seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>{t.actors.title}</h1>
        <p className={styles.lead}>{t.actors.lead}</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.actors.popularThisWeek}</h2>
        <Reveal stagger className={styles.grid}>
          {actors.map((person) => (
            <ActorCard key={person.id} person={person} />
          ))}
        </Reveal>
      </section>
    </main>
  );
}
