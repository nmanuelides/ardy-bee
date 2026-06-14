"use client";

import { useState } from "react";
import MovieCard from "./MovieCard";
import Reveal from "@/components/motion/Reveal";
import MagneticButton from "@/components/ui/MagneticButton";
import type { TmdbMovie } from "@/lib/tmdb/types";
import type { MovieCategory } from "@/lib/tmdb/movies";
import styles from "./MovieSection.module.scss";

interface Props {
  title: string;
  category: MovieCategory;
  initialMovies: TmdbMovie[];
  initialPage: number;
  totalPages: number;
  /** Coming-soon list is kept sorted soonest-first as more pages load. */
  sortByDate?: boolean;
}

export default function MovieSection({
  title,
  category,
  initialMovies,
  initialPage,
  totalPages,
  sortByDate = false,
}: Props) {
  const [movies, setMovies] = useState(initialMovies);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);

  const hasMore = page < totalPages;

  async function loadMore() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/movies?category=${category}&page=${page + 1}`);
      if (!res.ok) return;
      const data: { results: TmdbMovie[]; page: number } = await res.json();
      setMovies((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const merged = [...prev, ...data.results.filter((m) => !seen.has(m.id))];
        return sortByDate
          ? merged.sort((a, b) => a.release_date.localeCompare(b.release_date))
          : merged;
      });
      setPage(data.page);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <Reveal stagger className={styles.grid}>
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </Reveal>
      {hasMore && (
        <div className={styles.more}>
          <MagneticButton onClick={loadMore} disabled={loading}>
            {loading ? "Loading…" : "See more"}
          </MagneticButton>
        </div>
      )}
    </section>
  );
}
