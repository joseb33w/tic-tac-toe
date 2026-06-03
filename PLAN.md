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
