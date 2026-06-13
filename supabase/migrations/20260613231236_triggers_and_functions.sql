-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Keep performances.rating_count / rating_sum in sync with ratings.
create or replace function public.apply_rating_delta()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (tg_op = 'INSERT') then
    update public.performances
      set rating_count = rating_count + 1,
          rating_sum   = rating_sum + new.score
      where id = new.performance_id;
  elsif (tg_op = 'UPDATE') then
    update public.performances
      set rating_sum = rating_sum - old.score + new.score
      where id = new.performance_id;
  elsif (tg_op = 'DELETE') then
    update public.performances
      set rating_count = rating_count - 1,
          rating_sum   = rating_sum - old.score
      where id = old.performance_id;
  end if;
  return null;
end;
$$;

create trigger ratings_aggregate
after insert or update or delete on public.ratings
for each row
execute function public.apply_rating_delta();

-- Touch updated_at on rating edits.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger ratings_touch_updated_at
before update on public.ratings
for each row
execute function public.touch_updated_at();
