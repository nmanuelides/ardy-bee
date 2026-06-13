import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import Hero from "@/components/home/Hero";
import SectionRail from "@/components/home/SectionRail";
import { getPopularMovies, getUpcomingMovies } from "@/lib/tmdb/movies";

export default async function HomePage() {
  // Fetch in parallel; if TMDb hiccups, fall back to skeletons rather than erroring.
  const [popular, upcoming] = await Promise.allSettled([
    getPopularMovies(),
    getUpcomingMovies(),
  ]);

  const popularMovies = popular.status === "fulfilled" ? popular.value : [];
  const upcomingMovies = upcoming.status === "fulfilled" ? upcoming.value : [];

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <SectionRail title="Popular now" movies={popularMovies} />
        <SectionRail title="Upcoming" movies={upcomingMovies} />
      </main>
      <SiteFooter />
    </>
  );
}
