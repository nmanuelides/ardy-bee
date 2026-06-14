import Image from "next/image";
import Link from "next/link";
import Tilt from "@/components/motion/Tilt";
import { tmdbImage } from "@/lib/tmdb/image";
import type { TmdbPerson } from "@/lib/tmdb/types";
import styles from "./ActorCard.module.scss";

export default function ActorCard({ person }: { person: TmdbPerson }) {
  const photo = tmdbImage(person.profile_path, "w342");

  return (
    <Tilt className={styles.card}>
    <Link href={`/actors/${person.id}`} className={styles.cardLink}>
      <div className={styles.photoWrap}>
        {photo ? (
          <Image
            src={photo}
            alt={person.name}
            fill
            sizes="(max-width: 480px) 44vw, (max-width: 1024px) 22vw, 16vw"
            className={styles.photo}
          />
        ) : (
          <span className={styles.initial}>{person.name.charAt(0)}</span>
        )}
        <div className={styles.scrim} />
        <div className={styles.info}>
          <h3 className={styles.name}>{person.name}</h3>
          {person.known_for_department && (
            <span className={styles.dept}>{person.known_for_department}</span>
          )}
        </div>
      </div>
    </Link>
    </Tilt>
  );
}
