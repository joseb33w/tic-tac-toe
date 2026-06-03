import { supabase, TABLES, RPC } from './supabase.js';

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function ensureProfile(username) {
  return unwrap(await supabase.rpc(RPC.ensureProfile, { p_username: username ?? null }));
}

export async function fetchProfile(userId) {
  return unwrap(
    await supabase.from(TABLES.profiles).select('*').eq('user_id', userId).maybeSingle()
  );
}

export async function setUsername(username) {
  return unwrap(await supabase.rpc(RPC.setUsername, { p_username: username }));
}

export async function awardVsComputer(result) {
  return unwrap(await supabase.rpc(RPC.awardVsComputer, { p_result: result }));
}

export async function fetchSouvenirs() {
  return unwrap(await supabase.from(TABLES.souvenirs).select('*').order('price', { ascending: true }));
}

export async function fetchPurchases(userId) {
  return unwrap(
    await supabase
      .from(TABLES.purchases)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  );
}

export async function buySouvenir(souvenirId) {
  return unwrap(await supabase.rpc(RPC.buySouvenir, { p_souvenir_id: souvenirId }));
}

export async function fetchLeaderboard(limit = 10) {
  return unwrap(
    await supabase
      .from(TABLES.profiles)
      .select('username, points, wins, losses, draws')
      .order('points', { ascending: false })
      .limit(limit)
  );
}

export async function createOnlineGame() {
  return unwrap(await supabase.rpc(RPC.createOnlineGame));
}

export async function joinOnlineGame(gameId) {
  return unwrap(await supabase.rpc(RPC.joinOnlineGame, { p_game_id: gameId }));
}

export async function makeOnlineMove(gameId, index) {
  return unwrap(await supabase.rpc(RPC.makeOnlineMove, { p_game_id: gameId, p_index: index }));
}

export async function fetchOpenGames(excludeUserId) {
  return unwrap(
    await supabase
      .from(TABLES.games)
      .select('*')
      .eq('status', 'waiting')
      .neq('player_x', excludeUserId)
      .order('created_at', { ascending: false })
      .limit(25)
  );
}

export async function fetchGame(gameId) {
  return unwrap(await supabase.from(TABLES.games).select('*').eq('id', gameId).single());
}

export function subscribeToGame(gameId, onChange) {
  const channel = supabase
    .channel(`ttt-game-${gameId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: TABLES.games, filter: `id=eq.${gameId}` },
      (payload) => onChange(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToLobby(onChange) {
  const channel = supabase
    .channel('ttt-lobby')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLES.games },
      () => onChange()
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
