-- 1. Pin search_path on the last trigger function.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Trigger functions must not be directly callable via the REST RPC API.
--    (Triggers still fire — they run as the table owner regardless of EXECUTE.)
revoke execute on function public.handle_new_user()   from public, anon, authenticated;
revoke execute on function public.apply_rating_delta() from public, anon, authenticated;

-- 3. Cache tables (movies/people/performances) become read-only to clients.
--    All writes go through trusted server code using the service-role key,
--    which bypasses RLS. This removes the "any authenticated user can write
--    arbitrary cache rows" vandalism vector.
drop policy "movies_insert_auth"       on public.movies;
drop policy "movies_update_auth"       on public.movies;
drop policy "people_insert_auth"       on public.people;
drop policy "people_update_auth"       on public.people;
drop policy "performances_insert_auth" on public.performances;
drop policy "performances_update_auth" on public.performances;
