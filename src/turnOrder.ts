import { Game, Player } from "./types";

/**
 * Indicative dealer & first-trick order for each round — Grandpa Beck's 2022
 * rulebook.
 *
 * The dealer role passes clockwise every round (p.13), and the player to the
 * dealer's left leads the first trick. Seating is the order players were
 * entered (clockwise), the first dealer is `players[0]`, and everything here is
 * derived from `game.players` + the round number — nothing is stored.
 *
 * In the 2-player variant (p.21) the two real players start alternately and the
 * Greybeard ghost always plays his card second. The normal rotation over the
 * two real players already alternates the leader each round; the ghost is just
 * inserted at display position 2.
 */

/** One slot in a round's first-trick play order. */
export type PlaySlot =
  | { kind: "player"; player: Player }
  | { kind: "ghost" };

/** Index (into game.players) of the dealer for a 1-based round. */
export function dealerIndex(game: Game, round: number): number {
  const n = game.players.length;
  if (n === 0) return 0;
  return (round - 1) % n;
}

/** Index of the player who leads the first trick (clockwise after the dealer). */
export function leaderIndex(game: Game, round: number): number {
  const n = game.players.length;
  if (n === 0) return 0;
  return (dealerIndex(game, round) + 1) % n;
}

/**
 * Ordered first-trick play list for a round: leader first, dealer last. In
 * 2-player ghost mode the Greybeard ghost is inserted at position 2.
 */
export function playOrder(game: Game, round: number): PlaySlot[] {
  const n = game.players.length;
  const slots: PlaySlot[] = [];
  const start = leaderIndex(game, round);
  for (let i = 0; i < n; i++) {
    slots.push({ kind: "player", player: game.players[(start + i) % n] });
  }
  if (game.twoPlayerGhost) {
    // Greybeard always plays second, after the leader.
    slots.splice(1, 0, { kind: "ghost" });
  }
  return slots;
}
