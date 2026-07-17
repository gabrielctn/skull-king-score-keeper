/**
 * Official round/card-count structures from the 2022 rulebook's "Variable Card
 * Counts" section (FR: « Nombre de cartes »). Each structure fixes how many
 * rounds are played and how many cards are dealt in each; `cardsDealt` on the
 * game remains the single source of truth once the game is created.
 */

export type RoundStructureId =
  | "classic"
  | "evenKeeled"
  | "brawl"
  | "skirmish"
  | "barrage"
  | "whirlpool"
  | "bedtime";

/** Setup-screen display order; classic first since it is the default. */
export const ROUND_STRUCTURE_IDS: RoundStructureId[] = [
  "classic",
  "evenKeeled",
  "brawl",
  "skirmish",
  "barrage",
  "whirlpool",
  "bedtime",
];

const STRUCTURES: Record<RoundStructureId, number[]> = {
  // Standard game: 1 card in round 1 up to 10 cards in round 10.
  classic: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  // EN "Even Keeled" / FR « Pas d'impair » — two rounds each of 2, 4, 6, 8, 10.
  evenKeeled: [2, 2, 4, 4, 6, 6, 8, 8, 10, 10],
  // EN "Skip to the Brawl" / FR « Prêt au combat » — one round each of 6-10.
  brawl: [6, 7, 8, 9, 10],
  // EN "Swift-n-Salty Skirmish" / FR « Attaque éclair » — five rounds of 5.
  skirmish: [5, 5, 5, 5, 5],
  // EN "Broadside Barrage" / FR « Tir de barrage » — ten rounds of 10.
  barrage: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  // EN "Whirlpool" / FR « Tourbillon » — two rounds each of 9, 7, 5, 3, 1.
  whirlpool: [9, 9, 7, 7, 5, 5, 3, 3, 1, 1],
  // EN "Past Your Bedtime" / FR « L'heure du dodo » — one round of 1 card.
  bedtime: [1],
};

/**
 * Cards dealt per round for a structure. The classic game can be shortened
 * (the pre-existing rounds stepper); every other structure is fixed.
 */
export function structureCards(
  id: RoundStructureId,
  classicRounds = 10
): number[] {
  if (id === "classic") return STRUCTURES.classic.slice(0, classicRounds);
  return [...STRUCTURES[id]];
}
