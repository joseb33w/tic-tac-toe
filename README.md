# Tic-Tac-Toe Arcade 🎮

A neon-themed tic-tac-toe game built with **Vite + React + Supabase**.

- 🤖 **Vs Computer** — play against an AI with three difficulty levels. *Hard* uses
  minimax and is unbeatable (you can only draw).
- 🌐 **Vs Players** — create or join a live match and play other signed-in users in
  realtime.
- ⭐ **Points** — earn points for every game. Win more, earn more.
- 🛍️ **Souvenir Store** — spend points on 10 collectible souvenirs.
- 🏆 **Leaderboard** — see who rules the arcade.

You can play the computer as a **guest** with no account. Sign in (email + password)
to save points, shop the store, and play online.

## Point values

| Mode        | Win | Draw | Loss |
| ----------- | --- | ---- | ---- |
| Vs Computer | 10  | 4    | 1    |
| Online      | 25  | 6    | 2    |

## Tech

- **Frontend:** Vite, React 18, plain CSS (no UI framework).
- **Backend:** Supabase — email/password Auth, Postgres with Row Level Security,
  `SECURITY DEFINER` RPCs for all point/score/store mutations (so points can't be
  tampered with from the client), and Realtime for live multiplayer.
- Pure game logic lives in `src/lib/game.js` and is covered by unit tests.

## Setup

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>
VITE_TABLE_PREFIX=usr_nmexs7bytxq2
```

### 3. Apply the database schema

Run `supabase/migrations/0001_init.sql` against your Supabase project (SQL Editor,
`psql`, or the Management API). It is idempotent and safe to re-run. It creates the
prefixed tables, RLS policies, grants, RPCs, the new-user trigger, the souvenir
catalog seed, and adds the games table to the `supabase_realtime` publication.

> For instant play, disable **email confirmation** in
> *Authentication → Providers → Email* so new accounts can sign in immediately.

### 4. Run

```bash
npm run dev      # local dev server
npm test         # game-logic unit tests
npm run build    # production build to dist/
```

## Data model

All objects are prefixed with `usr_nmexs7bytxq2_ttt_`:

- `profiles` — one row per user: `username`, `points`, `wins`, `losses`, `draws`.
- `games` — online matches: board (jsonb), `current_turn`, both players, `winner`,
  `status` (`waiting` → `active` → `finished`).
- `souvenirs` — store catalog (seeded by the migration).
- `purchases` — souvenirs each user owns (one of each, enforced by a unique index).

RLS keeps purchases private to their owner; profiles and games are readable by any
signed-in user (for the leaderboard, opponent names, and realtime). All writes that
affect points or game state go through `SECURITY DEFINER` RPCs.
