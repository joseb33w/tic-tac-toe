// Point awards. Mirrors the values used server-side in the award RPCs
// (supabase/migrations/0001_init.sql). Single-player awards are applied by the
// award_vs_computer RPC; online awards are settled authoritatively by the
// make_online_move RPC when a game reaches a terminal state.
export const POINTS = {
  vsComputer: { win: 10, draw: 4, loss: 1 },
  online: { win: 25, draw: 6, loss: 2 }
};

export function vsComputerReward(result) {
  return POINTS.vsComputer[result] ?? 0;
}
