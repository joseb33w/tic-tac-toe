// Souvenir catalog. This list is the canonical display source and is mirrored
// exactly by the seed in supabase/migrations/0001_init.sql. The buy_souvenir RPC
// validates the price server-side against that seeded table, so prices here are
// for display only and cannot be tampered with to cheat the store.
export const SOUVENIRS = [
  { id: 'lucky-star', emoji: '\u2B50', name: 'Lucky Star', price: 30, description: 'A little sparkle for good fortune.' },
  { id: 'top-hat', emoji: '\uD83C\uDFA9', name: 'Top Hat', price: 50, description: 'Classy headwear for champions.' },
  { id: 'medal', emoji: '\uD83C\uDF96\uFE0F', name: 'Champion Medal', price: 75, description: 'Proof you came, saw, and conquered.' },
  { id: 'trophy', emoji: '\uD83C\uDFC6', name: 'Golden Trophy', price: 100, description: 'The classic symbol of victory.' },
  { id: 'rocket', emoji: '\uD83D\uDE80', name: 'Pocket Rocket', price: 120, description: 'To the moon and back.' },
  { id: 'crown', emoji: '\uD83D\uDC51', name: 'Royal Crown', price: 150, description: 'Rule the tic-tac-toe kingdom.' },
  { id: 'console', emoji: '\uD83C\uDFAE', name: 'Retro Console', price: 180, description: 'For the true arcade soul.' },
  { id: 'unicorn', emoji: '\uD83E\uDD84', name: 'Unicorn Plush', price: 200, description: 'Rare, magical, and very cuddly.' },
  { id: 'diamond', emoji: '\uD83D\uDC8E', name: 'Brilliant Diamond', price: 250, description: 'Forever shiny, forever yours.' },
  { id: 'dragon', emoji: '\uD83D\uDC09', name: 'Dragon Figurine', price: 300, description: 'Legendary loot for legends.' }
];

export function souvenirById(id) {
  return SOUVENIRS.find((s) => s.id === id) || null;
}
