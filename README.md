# AMA — Ask Me Anything

Anonymous question submission with a Bluesky-style shareable card.

## Stack

- Nuxt 4 (TypeScript)
- Supabase (Postgres + RLS)
- Vanilla CSS

## Setup

### 1. Supabase

Run `supabase/migrations/001_questions.sql` in your project's SQL editor.

### 2. Environment variables

Create `.env`:

```plaintext
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NUXT_SUPABASE_SERVICE_KEY=your-service-role-key
NUXT_PUBLIC_SITE_HANDLE=@toddl.dev
NUXT_PUBLIC_SITE_DISPLAY_NAME=Todd Libby
```

### 3. Install & run

```bash
pnpm install
pnpm dev
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Public submission form |
| `/admin` | View, answer, and preview questions |

## How it works

1. Anyone visits `/` and submits a question anonymously.
2. You go to `/admin`, select a question, optionally write an answer, and click **Mark answered**.
3. The card preview renders exactly as it will look when shared.
4. Click **Copy post text** to get a ready-to-paste Bluesky post.

## Protecting the admin route

Add Nuxt middleware or a server-side session check on `/admin`.
The simplest option: deploy with a `_redirects` rule behind Netlify basic auth, or add `nuxt-auth-utils`.
