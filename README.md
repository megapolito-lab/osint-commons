# Orien
<<<<<<< HEAD
=======

OSINT Commons is a structured, global discourse platform

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth)

## Features

- Supabase Auth:
  - Email/password signup + login
  - Google OAuth login
- Feed and posting:
  - Home feed with latest posts
  - Filter feed to followed topics only
  - Create new brief/discussion posts
  - Upvote/downvote and comments
- Topics:
  - Browse topics
  - Follow/unfollow topics
- Profile:
  - Edit profile fields
- Safety + policy:
  - Rules page with explicit no-doxxing policy
  - Report posts/comments
  - Moderator-only moderation queue
  - Soft delete post/comment actions

## Supabase schema + RLS

Schema and RLS policies live in:

- `supabase/migrations/202602120001_init.sql`

Tables:

- `profiles`
- `topics`
- `follows_topics`
- `posts`
- `comments`
- `votes`
- `reports`

Includes:

- Enum types (`post_type`, `report_status`, `user_role`)
- Automatic profile creation trigger on new auth users
- Row-level security policies for all tables
- Moderator/admin role checks via `profiles.role`

## Getting started

### 1) Install dependencies

```bash
npm install
```

### 2) Create environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> Do **not** expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code.

### 3) Apply migration

Use Supabase CLI or SQL editor to run:

- `supabase/migrations/202602120001_init.sql`

### 4) Seed initial topics

```bash
npm run seed
```

### 5) Run local dev server

```bash
npm run dev
```

Open http://localhost:3000

## Role-based moderation access

`/moderation` is only accessible for users with role `moderator` or `admin` in `profiles.role`.

Example SQL to promote a user:

```sql
update public.profiles
set role = 'moderator'
where username = 'your_username';
```

## Notes

- This MVP intentionally emphasizes community safety.
- No-doxxing policy is enforced by rules and reporting/moderation workflows.
- Add custom moderation automations and richer validation as next steps.
>>>>>>> 28b2108 (Initial Orien MVP)
