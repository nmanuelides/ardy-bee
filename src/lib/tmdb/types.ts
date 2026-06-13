// Minimal TMDb response shapes. Expand as endpoints are added in Phase 2.

export interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  popularity: number;
}

export interface TmdbPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
}

export interface TmdbPaginated<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbMovieDetails extends TmdbMovie {
  runtime: number | null;
  tagline: string | null;
  genres: TmdbGenre[];
}

export interface TmdbCastMember {
  id: number; // person id
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  known_for_department: string;
}

export interface TmdbCredits {
  id: number;
  cast: TmdbCastMember[];
}

export interface TmdbPersonDetails extends TmdbPerson {
  popularity: number;
}
