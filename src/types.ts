export interface Player {
  id: string;
  name: string;
}

/**
 * Structured bonus / special-card events captured by a player in one round.
 * Every field is something the player observes at the table; the app turns
 * them into points so there's no mental math.
 */
export interface BonusInput {
  /** Colored 14s (yellow / purple / green) captured — +10 each (max 3). */
  colored14: number;
  /** Black 14 (Jolly Roger trump) captured — +20. */
  black14: boolean;
  /** Mermaids captured by one of this player's pirates — +20 each (max 2). */
  mermaidByPirate: number;
  /** Pirates captured by this player's Skull King — +30 each (max 6). */
  pirateBySkullKing: number;
  /** This player's mermaid captured the Skull King — +40. */
  mermaidCapturesSkullKing: boolean;
  /** Successful Loot/Butin alliances — +20 each, only if THIS bid is made. */
  loot: number;
  /** Rascal pirate side-wager: gained if bid made, lost if missed. */
  rascalWager: 0 | 10 | 20;
}

export interface RoundEntry {
  /** Tricks the player bid they would win. */
  bid: number;
  /** Tricks the player actually won. */
  tricks: number;
  bonus: BonusInput;
  /** True once the round result has been recorded for this player. */
  recorded: boolean;
}

/** Map of playerId -> RoundEntry for a single round. */
export type RoundEntries = Record<string, RoundEntry>;

export interface Game {
  id: string;
  players: Player[];
  totalRounds: number;
  /** 1-based index of the round currently being played. */
  currentRound: number;
  /** rounds[r - 1] holds the entries for round number r. */
  rounds: RoundEntries[];
  /**
   * Cards dealt per round. cardsDealt[r - 1] defaults to r, but can be fewer
   * in late rounds for 7-8 players, or anything for custom round structures.
   * The zero-bid multiplier and the bid/trick caps use this value.
   */
  cardsDealt: number[];
  /** Show Loot & Rascal-wager fields in the bonus editor. */
  advancedCards: boolean;
  /**
   * Official 2-player variant: a non-scoring "Greybeard" ghost plays a third
   * hand and wins some tricks, so the two real players' tricks may sum to less
   * than the cards dealt. Only meaningful when there are exactly 2 players.
   */
  twoPlayerGhost: boolean;
  status: "in_progress" | "finished";
  createdAt: number;
  updatedAt: number;
}

/** Current persisted-game schema version (for save migrations). */
export const GAME_SCHEMA_VERSION = 3;
