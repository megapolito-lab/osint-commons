-- OSINT Commons schema
create extension if not exists "pgcrypto";

create type post_type as enum ('brief', 'discussion');
create type report_status as enum ('open', 'reviewed', 'actioned');
create type user_role as enum ('user', 'moderator', 'admin');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 32),
  display_name text not null,
  bio text,
  avatar_url text,
  role user_role not null default 'user',
  created_at timestamptz not null default now()
);

create table if not exists public.topics (
  id bigint generated always as identity primary key,
  name text not null unique,
  slug text not null unique
);

create table if not exists public.follows_topics (
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id bigint not null references public.topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create table if not exists public.posts (
  id bigint generated always as identity primary key,
  author_id uuid not null references public.profiles(id) on delete cascade,
  type post_type not null,
  title text not null check (char_length(title) between 5 and 140),
  body text not null check (char_length(body) between 10 and 5000),
  topic_id bigint not null references public.topics(id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.votes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id bigint not null references public.posts(id) on delete cascade,
  value int not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists public.reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  post_id bigint references public.posts(id) on delete set null,
  comment_id bigint references public.comments(id) on delete set null,
  reason text not null,
  status report_status not null default 'open',
  created_at timestamptz not null default now(),
  constraint report_target_check check (
    (post_id is not null and comment_id is null)
    or (post_id is null and comment_id is not null)
  )
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 6)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_moderator(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p where p.id = uid and p.role in ('moderator', 'admin')
  );
$$;

alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.follows_topics enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.votes enable row level security;
alter table public.reports enable row level security;

create policy "profiles are viewable by everyone" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "topics readable by everyone" on public.topics for select using (true);

create policy "users manage own topic follows" on public.follows_topics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "posts readable by everyone" on public.posts for select using (deleted_at is null or public.is_moderator(auth.uid()));
create policy "users create own posts" on public.posts for insert with check (auth.uid() = author_id);
create policy "users update own posts" on public.posts for update using (auth.uid() = author_id or public.is_moderator(auth.uid())) with check (auth.uid() = author_id or public.is_moderator(auth.uid()));

create policy "comments readable by everyone" on public.comments for select using (deleted_at is null or public.is_moderator(auth.uid()));
create policy "users create own comments" on public.comments for insert with check (auth.uid() = author_id);
create policy "users update own comments" on public.comments for update using (auth.uid() = author_id or public.is_moderator(auth.uid())) with check (auth.uid() = author_id or public.is_moderator(auth.uid()));

create policy "users manage own votes" on public.votes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "authenticated can create reports" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "users view own reports or mods all" on public.reports for select using (auth.uid() = reporter_id or public.is_moderator(auth.uid()));
create policy "mods update reports" on public.reports for update using (public.is_moderator(auth.uid())) with check (public.is_moderator(auth.uid()));
