import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import Hero from "@/components/home/Hero";
import SectionRail from "@/components/home/SectionRail";
import Reveal from "@/components/motion/Reveal";
import type { Featured } from "@/components/home/HeroDemo";
import {
  getMovieCredits,
  getPopularMovies,
  getUpcomingMovies,
} from "@/lib/tmdb/movies";

export default async function HomePage() {
  // Fetch in parallel; if TMDb hiccups, fall back to skeletons rather than erroring.
  const [popular, upcoming] = await Promise.allSettled([
    getPopularMovies(),
    getUpcomingMovies(),
  ]);

  const popularMovies = popular.status === "fulfilled" ? popular.value : [];
  // TMDb "upcoming" includes already-released titles — keep only future ones.
  const today = new Date().toISOString().slice(0, 10);
  const upcomingMovies = (upcoming.status === "fulfilled" ? upcoming.value : [])
    .filter((m) => m.release_date && m.release_date > today)
    .sort((a, b) => a.release_date.localeCompare(b.release_date));

  // Feature the top-billed actor of the #1 popular movie for the live demo.
  let featured: Featured | null = null;
  const top = popularMovies[0];
  if (top) {
    try {
      const credits = await getMovieCredits(top.id);
      const actor = credits.cast?.[0];
      if (actor) {
        featured = {
          movieId: top.id,
          movieTitle: top.title,
          year: top.release_date ? top.release_date.slice(0, 4) : null,
          personId: actor.id,
          actorName: actor.name,
          character: actor.character ?? "",
          profilePath: actor.profile_path,
        };
      }
    } catch {
      /* leave featured null → hero shows copy only */
    }
  }

  return (
    <>
      <SiteHeader />
      <main>
        <Hero featured={featured} />
        <Reveal>
          <SectionRail title="Popular now" movies={popularMovies} />
        </Reveal>
        <Reveal>
          <SectionRail title="Upcoming" movies={upcomingMovies} />
        </Reveal>
      </main>
      <SiteFooter />
    </>
  );
}
