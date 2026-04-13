# Team Builder - TEAM Consulting

> **We Are Greater Than Me**

Africa's premier professional Learning & Development platform. 42 expert-crafted courses across 7 career segments - from youth entry-level to executive board governance.

**Organisation:** TEAM Consulting · Harare, Zimbabwe  
**Version:** 2.1.0  
**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · Supabase · Framer Motion

---

## Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your Supabase URL and anon key
npm run dev
```

## Database Setup

Run migrations in order in the Supabase SQL Editor:

1. `supabase/migrations/001_schema.sql` — tables, RLS, functions, triggers
2. `supabase/migrations/002_seed_courses.sql` — 42 courses across 7 segments
3. `supabase/migrations/003_quiz_schema.sql` — quiz_questions, quiz_attempts, 35 seed questions

```sql
-- Verify after seeding:
SELECT COUNT(*) FROM courses;          -- 42
SELECT COUNT(*) FROM quiz_questions;   -- 35
```

## Create Admin User

1. Go to **Authentication → Users → Add User** in Supabase
2. Copy the user UID
3. Run: `INSERT INTO public.user_roles (user_id, role) VALUES ('[UID]', 'super_admin');`

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJyour-anon-key
```

## Segments & Courses

| Segment    | Courses | CPD Credits | Pricing |
|------------|---------|-------------|---------------------------|
| Youth      | 6       | 1.0         | 3 Free + 3 Paid ($5) |
| Low Grade  | 6       | 1.0         | 1 Free + 5 Paid ($5) |
| Mid Grade  | 6       | 1.5         | 1 Free + 5 Paid ($5) |
| High Grade | 6       | 1.5         | 1 Free + 5 Paid ($5) |
| SME        | 6       | 2.0         | All Paid ($5) |
| Management | 6       | 3.0         | All Paid ($5) |
| Executive  | 6       | 4.0         | All Paid ($5) |

## Deployment (Netlify)

1. `npm run build`
2. Publish `dist/` folder
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in environment variables
4. The `public/_redirects` file handles SPA routing automatically

## Brand System

| Token | Value | Usage |
|-------|-------|-------|
| primary | `#02670a` | CTAs, borders |
| gold | `#c9a84c` | Prestige accents |
| depth | `#364033` | Dark backgrounds |
| Font | Montserrat | 400–800 weight |

---

*"Seek. Serve. Steward. Stand."*  
© 2026 TEAM Consulting. All rights reserved.
