# Ruang Cerita — Counseling & Safe Space Platform

> *"Tempat kecil untuk cerita."* — Free web counseling platform: a friendly digital safe space, not a medical app. Simple interface, meaningful support.

## What it does

- Tell your story by category, get matched with available counselors
- Counseling via chat, simple mood check, private journal
- Educational & supportive content, counseling history
- Multi-role flows: client, counselor, admin (intake, sessions, dashboard, moderation)
- Emergency guidance & quick-help paths

## Stack

Next.js + Supabase + Vercel. Supabase Auth, Postgres, private Storage, RLS. Full spec in `PRD.md`.

## Routes

`/`, `/about`, `/intake`, `/chat`, `/journal`, `/mood`, `/counselor(s)`, `/counseling`, `/dashboard`, `/admin`, `/resources`, `/help-now`, `/privacy`, `/login`, `/register`, `/settings`, `/profile`

## Run locally

```bash
npm install
npm run dev    # http://localhost:3000
```

Copy `.env.example` to `.env.local` and point it at your own Supabase project. Never commit secrets.

## Note

Sanitized public snapshot — credentials, production URLs, and test data removed. Full git history intentionally not published.
