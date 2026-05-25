# TeacherTrack

Lightweight school-admin dashboard for tracking dynamic per-teacher qualification checklists with red / yellow / green progress states.

Built with **Next.js 16**, **Supabase**, and **Tailwind v4**. Deploys to **Vercel** in one click.

---

## What it does

- **Dashboard** — at-a-glance view of every teacher, their assigned qualifications, and current status (incomplete / in progress / done). Click any status pill to cycle it.
- **Manage** — create teachers, define qualifications, and assign qualifications to teachers. Each teacher can have a different set.
- **Dynamic** — qualifications are not hard-coded. Add new ones any time; assign per-teacher.

### Status semantics

| Status        | Color  |
| ------------- | ------ |
| Incomplete    | Red    |
| In progress   | Yellow |
| Done          | Green  |

---

## Stack

- **Next.js 16** (App Router, Server Components + Route Handlers)
- **Supabase** (Postgres + RLS, accessed via `@supabase/supabase-js`)
- **Tailwind v4** (white-theme card-based UI)
- **TypeScript**, deployed on **Vercel**

---

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL + keys
npm run dev
```

Open <http://localhost:3000>.

### Environment variables

| Var                            | Purpose                                       |
| ------------------------------ | --------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`     | Project URL                                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Anon key (client-side reads)                  |
| `SUPABASE_SERVICE_ROLE_KEY`    | Service role key (server-side writes — secret)|

---

## Database schema

Three tables (created automatically via the bundled migration):

- `teachers` — `id`, `name`, `email`, `created_at`
- `qualifications` — `id`, `name`, `description`, `created_at`
- `teacher_qualifications` — `id`, `teacher_id`, `qualification_id`, `status` (`incomplete` / `in_progress` / `done`), `updated_at` — unique on `(teacher_id, qualification_id)`

RLS is enabled. Server-side routes use the service role key.

---

## Project structure

```
src/
  app/
    page.tsx              # dashboard
    manage/page.tsx       # CRUD + assignment UI
    api/
      teachers/           # GET, POST, DELETE
      qualifications/     # GET, POST, DELETE
      assignments/        # POST, PATCH (status), DELETE
      dashboard/          # aggregated GET
  lib/
    supabase.ts           # anon + service clients
    types.ts              # shared TS types
```

---

## Deploy

```bash
npm i -g vercel
vercel
```

Set the three env vars in the Vercel dashboard. Done.
