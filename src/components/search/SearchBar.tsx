"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { tmdbImage } from "@/lib/tmdb/image";
import { useT } from "@/lib/i18n/provider";
import type { SearchHit } from "@/app/api/search/route";
import styles from "./SearchBar.module.scss";

export default function SearchBar() {
  const t = useT();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top: number; width: number } | null>(null);

  const fieldRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

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

  // position the portalled dropdown under the field; track scroll/resize
  useEffect(() => {
    if (!open) return;
    const update = () => {
      const el = fieldRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setCoords({ left: r.left, top: r.bottom + 8, width: r.width });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, results]);

  // close on outside click (account for the portalled dropdown)
  useEffect(() => {
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (fieldRef.current?.contains(t) || dropdownRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function go(hit: SearchHit) {
    setOpen(false);
    setQuery("");
    router.push(hit.type === "movie" ? `/movies/${hit.id}` : `/actors/${hit.id}`);
  }

  const showDropdown = open && query.trim().length >= 2 && coords;

  return (
    <div className={styles.root}>
      <div className={styles.field} ref={fieldRef}>
        <svg viewBox="0 0 24 24" width="16" height="16" className={styles.icon} aria-hidden="true">
          <path
            d="M10 4a6 6 0 104.5 9.9l4.3 4.3 1.4-1.4-4.3-4.3A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z"
            fill="currentColor"
          />
        </svg>
        <input
          className={styles.input}
          type="search"
          placeholder={t.search.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          aria-label={t.search.aria}
        />
      </div>

      {showDropdown &&
        createPortal(
          <ul
            ref={dropdownRef}
            className={styles.dropdown}
            style={{ left: coords.left, top: coords.top, width: coords.width }}
          >
            {results.length === 0 && !loading && (
              <li className={styles.empty}>{t.search.noMatches}</li>
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
                        {hit.type === "person" ? t.search.actor : t.search.movie} · {hit.sub}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}
