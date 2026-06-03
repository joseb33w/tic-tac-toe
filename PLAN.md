# Goal

Build a tic-tac-toe game with:
- Single-player vs the computer (easy / medium / unbeatable AI).
- Online multiplayer against other signed-in players (realtime).
- A points wallet earned by playing.
- A souvenir store where points buy collectibles.

Stack: Vite + React + Supabase (email/password auth, Postgres, RLS, SECURITY DEFINER
RPCs, Realtime), matching the conventions of the user's other Gogi app.

# Files to touch

- `index.html`, `vite.config.js`, `package.json` — Vite + React scaffold.
- `src/lib/game.js` (+ `game.test.js`) — pure board logic and minimax AI.
- `src/lib/store.js`, `src/lib/points.js` — souvenir catalog + point values.
- `src/lib/supabase.js`, `src/lib/api.js` — Supabase client + prefixed data layer.
- `src/context/AuthContext.jsx`, `src/context/ToastContext.jsx` — app-wide state.
- `src/components/*` — board, screens (vs-computer, lobby, online game, store,
  collection, leaderboard, auth) and chrome (header, bottom nav, modal).
- `src/App.jsx`, `src/main.jsx`, `src/index.css` — orchestration + theme.
- `supabase/migrations/0001_init.sql` — tables, RLS, grants, RPCs, trigger,
  realtime publication, souvenir seed (all prefixed `usr_nmexs7bytxq2_ttt_`).

# Verification approach

- Unit tests (`node --test`) for win detection and the unbeatable AI.
- Production build with Vite.
- Headless Chromium drives the guest flow: play a full game vs the computer,
  confirm the AI responds and points are awarded, browse the 10-item store,
  and exercise navigation — asserting a clean console.
- Deploy the build to the R2 preview and re-run the guest flow against the live URL.
- Backend RPCs/RLS verified by driving real authenticated requests against Supabase.

# Out of scope

- Rematch inside an online game (players return to the lobby to start a new match).
- In-app username editing after signup (a `set_username` RPC exists; no UI yet).
- Spectating other players' live games.

---

# Session: backend verification + creative/interactive UI

## Goal
Verify the Supabase backend works end-to-end, and make the UI more creative and
interactive.

## Backend verification
- Applied `0001_init.sql` to the shared Supabase project (idempotent) and reloaded
  the PostgREST schema cache.
- Drove every RPC + RLS path with real authenticated users (create / join / move /
  settle online games, `award_vs_computer`, `buy_souvenir`, `ensure_profile`,
  `set_username`), plus negative cases (wrong turn, square taken, already owned,
  insufficient points, cross-user purchase reads, direct point tampering). All
  passed; all test users + rows cleaned up afterward.

## Creative / interactive UI changes
- `src/components/Square.jsx` — X/O rendered as self-drawing glowing SVG strokes.
- `src/components/Board.jsx` — animated winning-line strike overlay.
- `src/lib/confetti.js` (new) — dependency-free canvas confetti burst on wins/buys.
- `src/lib/sound.js` (new) — Web Audio arcade SFX with a persisted mute toggle.
- `src/components/Header.jsx` — sound toggle + points pill that pulses on gain.
- `src/components/Home.jsx` — floating background marks + shimmering title.
- `GameVsComputer`, `GameOnline`, `Store`, `BottomNav`, `App` — wired sound,
  confetti, and per-view entrance animations.
- `src/index.css` — mark-draw, strike, confetti origin, hover sheen, modal/emoji
  pop, reduced-motion fallbacks.

## Out of scope (this session)
- Disabling email confirmation (project-level auth config; requires dashboard).
- Background music / volume slider (kept to lightweight one-shot SFX).
