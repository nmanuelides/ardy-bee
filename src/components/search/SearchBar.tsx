"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { tmdbImage } from "@/lib/tmdb/image";
import type { SearchHit } from "@/app/api/search/route";
import styles from "./SearchBar.module.scss";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // debounced search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { results: SearchHit[] };
        setResults(data.results);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  // close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(hit: SearchHit) {
    setOpen(false);
    setQuery("");
    router.push(hit.type === "movie" ? `/movies/${hit.id}` : `/actors/${hit.id}`);
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.field}>
        <svg viewBox="0 0 24 24" width="16" height="16" className={styles.icon} aria-hidden="true">
          <path
            d="M10 4a6 6 0 104.5 9.9l4.3 4.3 1.4-1.4-4.3-4.3A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z"
            fill="currentColor"
          />
        </svg>
        <input
          className={styles.input}
          type="search"
          placeholder="Search movies & actors…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          aria-label="Search movies and actors"
        />
      </div>

      {open && (query.trim().length >= 2) && (
        <ul className={styles.dropdown}>
          {results.length === 0 && !loading && (
            <li className={styles.empty}>No matches</li>
          )}
          {results.map((hit) => {
            const img = tmdbImage(hit.image, "w185");
            return (
              <li key={`${hit.type}-${hit.id}`}>
                <button className={styles.hit} onClick={() => go(hit)} type="button">
                  <span className={styles.thumb} data-person={hit.type === "person" || undefined}>
                    {img && (
                      <Image src={img} alt={hit.title} fill sizes="40px" className={styles.thumbImg} />
                    )}
                  </span>
                  <span className={styles.hitInfo}>
                    <span className={styles.hitTitle}>{hit.title}</span>
                    <span className={styles.hitSub}>
                      {hit.type === "person" ? "Actor" : "Movie"} · {hit.sub}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
