import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const TABLE_PREFIX = import.meta.env.VITE_TABLE_PREFIX || 'usr_nmexs7bytxq2';

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase = supabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    })
  : null;

const p = (name) => `${TABLE_PREFIX}_ttt_${name}`;

export const TABLES = {
  profiles: p('profiles'),
  games: p('games'),
  purchases: p('purchases'),
  souvenirs: p('souvenirs')
};

export const RPC = {
  ensureProfile: p('ensure_profile'),
  setUsername: p('set_username'),
  awardVsComputer: p('award_vs_computer'),
  createOnlineGame: p('create_online_game'),
  joinOnlineGame: p('join_online_game'),
  makeOnlineMove: p('make_online_move'),
  buySouvenir: p('buy_souvenir')
};
