-- ===========================================================================
-- Weighted (Bayesian) ranking views.
--   weighted = (v/(v+m)) * R  +  (m/(v+m)) * C
--   v = vote count, R = item mean, m = min-votes prior, C = global mean.
-- This stops a single high score from topping a deep body of work.
-- ===========================================================================

-- Per-performance ranking (best individual performances).
create view public.performance_rankings
with (security_invoker = on)
as
with params as (
  select
    5::numeric as m,
    coalesce(
      (select sum(rating_sum) / nullif(sum(rating_count), 0) from public.performances),
      7.0
    ) as c
)
select
  p.id            as performance_id,
  p.movie_id,
  p.person_id,
  p.character_name,
  pe.name         as actor_name,
  pe.profile_path,
  m.title         as movie_title,
  m.poster_path,
  m.release_date,
  p.rating_count,
  p.rating_avg,
  (p.rating_count::numeric / (p.rating_count + params.m)) * coalesce(p.rating_avg, params.c)
    + (params.m / (p.rating_count + params.m)) * params.c as weighted_score
from public.performances p
cross join params
join public.people pe on pe.id = p.person_id
join public.movies m  on m.id = p.movie_id
where p.rating_count > 0;

-- Per-actor ranking (aggregated across all their performances).
create view public.actor_rankings
with (security_invoker = on)
as
with params as (
  select
    10::numeric as m,
    coalesce(
      (select sum(rating_sum) / nullif(sum(rating_count), 0) from public.performances),
      7.0
    ) as c
),
agg as (
  select
    person_id,
    sum(rating_count)                          as total_ratings,
    sum(rating_sum)                            as total_sum,
    count(*) filter (where rating_count > 0)   as rated_performances
  from public.performances
  group by person_id
)
select
  pe.id   as person_id,
  pe.name,
  pe.profile_path,
  agg.total_ratings,
  agg.rated_performances,
  case when agg.total_ratings > 0 then agg.total_sum / agg.total_ratings end as avg_score,
  (agg.total_ratings::numeric / (agg.total_ratings + params.m))
      * coalesce(agg.total_sum / nullif(agg.total_ratings, 0), params.c)
    + (params.m / (agg.total_ratings + params.m)) * params.c as weighted_score
from agg
cross join params
join public.people pe on pe.id = agg.person_id
where agg.total_ratings > 0;

-- Per-movie ranking (best overall ensemble of performances).
create view public.movie_rankings
with (security_invoker = on)
as
with params as (
  select
    10::numeric as m,
    coalesce(
      (select sum(rating_sum) / nullif(sum(rating_count), 0) from public.performances),
      7.0
    ) as c
),
agg as (
  select
    movie_id,
    sum(rating_count)                          as total_ratings,
    sum(rating_sum)                            as total_sum,
    count(*) filter (where rating_count > 0)   as rated_performances
  from public.performances
  group by movie_id
)
select
  m.id    as movie_id,
  m.title,
  m.poster_path,
  m.release_date,
  agg.total_ratings,
  agg.rated_performances,
  case when agg.total_ratings > 0 then agg.total_sum / agg.total_ratings end as avg_score,
  (agg.total_ratings::numeric / (agg.total_ratings + params.m))
      * coalesce(agg.total_sum / nullif(agg.total_ratings, 0), params.c)
    + (params.m / (agg.total_ratings + params.m)) * params.c as weighted_score
from agg
cross join params
join public.movies m on m.id = agg.movie_id
where agg.total_ratings > 0;
