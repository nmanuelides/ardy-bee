-- ===========================================================================
-- Ardy Bee core schema
-- profiles · movies/people (TMDb cache) · performances · ratings
-- ===========================================================================

-- User profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Cached TMDb movies (id = TMDb movie id)
create table public.movies (
  id bigint primary key,
  title text not null,
  original_title text,
  overview text,
  poster_path text,
  backdrop_path text,
  release_date date,
  runtime int,
  popularity numeric,
  tmdb_vote_average numeric,
  cached_at timestamptz not null default now()
);

-- Cached TMDb people (id = TMDb person id)
create table public.people (
  id bigint primary key,
  name text not null,
  profile_path text,
  known_for_department text,
  popularity numeric,
  cached_at timestamptz not null default now()
);

-- A performance is an actor's work in one movie: the rated entity.
-- rating_count / rating_sum are maintained by trigger for fast rankings.
create table public.performances (
  id bigint generated always as identity primary key,
  movie_id bigint not null references public.movies (id) on delete cascade,
  person_id bigint not null references public.people (id) on delete cascade,
  character_name text,
  credit_order int,
  rating_count int not null default 0,
  rating_sum numeric not null default 0,
  rating_avg numeric generated always as (
    case when rating_count > 0 then rating_sum / rating_count else null end
  ) stored,
  created_at timestamptz not null default now(),
  unique (movie_id, person_id)
);
create index performances_person_idx on public.performances (person_id);
create index performances_movie_idx on public.performances (movie_id);

-- One rating per user per performance. 1..10 in 0.5 steps.
create table public.ratings (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  performance_id bigint not null references public.performances (id) on delete cascade,
  score numeric(3, 1) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, performance_id),
  constraint score_range check (score >= 1 and score <= 10),
  constraint score_half_step check ((score * 2) = floor(score * 2))
);
create index ratings_performance_idx on public.ratings (performance_id);
create index ratings_user_idx on public.ratings (user_id);
