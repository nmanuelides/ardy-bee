alter table public.profiles      enable row level security;
alter table public.movies        enable row level security;
alter table public.people        enable row level security;
alter table public.performances  enable row level security;
alter table public.ratings       enable row level security;

-- --- profiles: public read, owner write ---
create policy "profiles_select_all"  on public.profiles for select using (true);
create policy "profiles_insert_own"  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"  on public.profiles for update using (auth.uid() = id);

-- --- movies: public TMDb cache. Read by all, write by authenticated. ---
create policy "movies_select_all"     on public.movies for select using (true);
create policy "movies_insert_auth"    on public.movies for insert to authenticated with check (true);
create policy "movies_update_auth"    on public.movies for update to authenticated using (true);

-- --- people: same as movies ---
create policy "people_select_all"     on public.people for select using (true);
create policy "people_insert_auth"    on public.people for insert to authenticated with check (true);
create policy "people_update_auth"    on public.people for update to authenticated using (true);

-- --- performances: read by all, created/updated by authenticated ---
create policy "performances_select_all"  on public.performances for select using (true);
create policy "performances_insert_auth" on public.performances for insert to authenticated with check (true);
create policy "performances_update_auth" on public.performances for update to authenticated using (true);

-- --- ratings: public read, owner-only write ---
create policy "ratings_select_all"    on public.ratings for select using (true);
create policy "ratings_insert_own"    on public.ratings for insert with check (auth.uid() = user_id);
create policy "ratings_update_own"    on public.ratings for update using (auth.uid() = user_id);
create policy "ratings_delete_own"    on public.ratings for delete using (auth.uid() = user_id);
