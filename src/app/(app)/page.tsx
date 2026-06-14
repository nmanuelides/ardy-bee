import Hero from "@/components/home/Hero";
import SectionRail from "@/components/home/SectionRail";
import Reveal from "@/components/motion/Reveal";
import { getPopularMovies, getUpcomingMovies } from "@/lib/tmdb/movies";
import { getTopActors, getTopMovies } from "@/lib/rankings/queries";

export default async function HomePage() {
  const [popular, upcoming, topActors, topMovies] = await Promise.allSettled([
    getPopularMovies(),
    getUpcomingMovies(),
    getTopActors(5),
    getTopMovies(5),
  ]);

  const popularMovies = popular.status === "fulfilled" ? popular.value : [];
  // TMDb "upcoming" includes already-released titles — keep only future ones.
  const today = new Date().toISOString().slice(0, 10);
  const upcomingMovies = (upcoming.status === "fulfilled" ? upcoming.value : [])
    .filter((m) => m.release_date && m.release_date > today)
    .sort((a, b) => a.release_date.localeCompare(b.release_date));

  return (
    <main>
      <Hero
        topActors={topActors.status === "fulfilled" ? topActors.value : []}
        topMovies={topMovies.status === "fulfilled" ? topMovies.value : []}
      />
      <Reveal>
        <SectionRail title="Popular now" movies={popularMovies} />
      </Reveal>
      <Reveal>
        <SectionRail title="Upcoming" movies={upcomingMovies} />
      </Reveal>
    </main>
  );
}
