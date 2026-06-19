/**
 * Test harness for the Skull King scoring engine.
 * Run with:  npm run test:scoring
 *
 * Cases are checked against Grandpa Beck's 2022 rulebook, including the
 * worked examples and the tricky edge cases (bonus on a missed bid,
 * zero-bid failures, Loot gating, Rascal wager, 7-8 player card counts).
 */
import {
  captureBonus,
  createGame,
  emptyBonus,
  madeBid,
  playerTotal,
  scoreRound,
  standings,
} from "../src/scoring";
import { BonusInput, RoundEntry } from "../src/types";

let passed = 0;
let failed = 0;

function eq(label: string, actual: number, expected: number) {
  if (actual === expected) {
    passed++;
    console.log(`  ✓ ${label} = ${actual}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}: expected ${expected}, got ${actual}`);
  }
}

const E = (
  bid: number,
  tricks: number,
  bonus: Partial<BonusInput> = {},
  recorded = true
): RoundEntry => ({
  bid,
  tricks,
  bonus: { ...emptyBonus(), ...bonus },
  recorded,
});

console.log("Bid scoring (rulebook examples)");
eq("Felix: bid 3 won 3 (cards 5)", scoreRound(5, E(3, 3)), 60);
eq("Pauline: bid 2 won 4", scoreRound(5, E(2, 4)), -20);
eq("under: bid 3 won 1", scoreRound(5, E(3, 1)), -20);
eq("zero bid success, round 7", scoreRound(7, E(0, 0)), 70);
eq("zero bid fail, round 9 won 2", scoreRound(9, E(0, 2)), -90);
eq("bid 1 won 1 (cards 1)", scoreRound(1, E(1, 1)), 20);

console.log("\nCapture bonuses count regardless of bid");
eq("hit bid + colored14 + black14", scoreRound(5, E(3, 3, { colored14: 1, black14: true })), 60 + 10 + 20);
eq("MISSED bid still keeps capture bonus", scoreRound(5, E(3, 5, { colored14: 1 })), -20 + 10);
eq("zero-bid FAIL but captured a 14", scoreRound(9, E(0, 2, { colored14: 1 })), -90 + 10);

console.log("\nPersonnage capture bonuses");
eq("mermaid captures Skull King (+40)", scoreRound(5, E(1, 1, { mermaidCapturesSkullKing: true })), 20 + 40);
eq("Skull King takes 2 pirates (+60)", scoreRound(5, E(2, 2, { pirateBySkullKing: 2 })), 40 + 60);
eq("pirate takes 2 mermaids (+40)", scoreRound(5, E(2, 2, { mermaidByPirate: 2 })), 40 + 40);
// Rulebook p.16 example: Pippa's mermaid wins, capturing a yellow 14 and the Skull King.
eq("rulebook p16 capture bonus = 50", captureBonus({ ...emptyBonus(), colored14: 1, mermaidCapturesSkullKing: true }), 50);

console.log("\nLoot / Butin (only when bid is hit)");
eq("loot counts when bid hit", scoreRound(5, E(2, 2, { loot: 1 })), 40 + 20);
eq("loot ignored when bid missed", scoreRound(5, E(2, 1, { loot: 1 })), -10);

console.log("\nRascal wager (+ if hit, - if missed)");
eq("rascal +10 when hit", scoreRound(5, E(1, 1, { rascalWager: 10 })), 20 + 10);
eq("rascal -10 when missed", scoreRound(5, E(1, 0, { rascalWager: 10 })), -10 - 10);
eq("rascal +20 on a made zero-bid", scoreRound(5, E(0, 0, { rascalWager: 20 })), 50 + 20);

console.log("\nEverything stacked");
eq(
  "max combo, bid 3 cards 7",
  scoreRound(
    7,
    E(3, 3, {
      colored14: 2,
      black14: true,
      mermaidByPirate: 1,
      pirateBySkullKing: 1,
      mermaidCapturesSkullKing: true,
      loot: 1,
      rascalWager: 20,
    })
  ),
  60 + (20 + 20 + 20 + 30 + 40) + 20 + 20
);

console.log("\nmadeBid helper");
eq("made: bid 0 won 0", madeBid(E(0, 0)) ? 1 : 0, 1);
eq("not made: bid 0 won 1", madeBid(E(0, 1)) ? 1 : 0, 0);
eq("made: bid 4 won 4", madeBid(E(4, 4)) ? 1 : 0, 1);

console.log("\n7-8 players: zero-bid uses cards dealt, not round number");
eq("round 10 but only 8 cards, success", scoreRound(8, E(0, 0)), 80);
eq("round 10 but only 8 cards, fail", scoreRound(8, E(0, 3)), -80);

console.log("\nRunning totals + custom cardsDealt");
const g = createGame(
  [
    { id: "a", name: "Anne" },
    { id: "b", name: "Blackbeard" },
  ],
  10
);
// Simulate 7-8 player short rounds: round 9 deals 8 cards.
g.cardsDealt[8] = 8;
g.rounds[0] = { a: E(1, 1), b: E(0, 0) }; // r1: Anne +20, Black zero-success +10
g.rounds[1] = { a: E(0, 2), b: E(2, 2, { black14: true }) }; // r2: Anne -20, Black +40+20
g.rounds[8] = { a: E(0, 0), b: E(0, 1) }; // r9 (8 cards): Anne +80, Black -80
g.rounds[2] = { a: E(3, 3, {}, false), b: E(3, 3, {}, false) }; // not recorded -> ignored
eq("Anne total", playerTotal(g, "a"), 20 - 20 + 80);
eq("Blackbeard total", playerTotal(g, "b"), 10 + 60 - 80);

console.log("\nStandings + tie ranks");
const g2 = createGame(
  [
    { id: "x", name: "X" },
    { id: "y", name: "Y" },
    { id: "z", name: "Z" },
  ],
  10
);
g2.rounds[0] = { x: E(1, 1), y: E(1, 1), z: E(0, 2) }; // X+20, Y+20, Z-10
const b2 = standings(g2);
eq("tie: leader total", b2[0].total, 20);
eq("tie: both rank 1", b2[0].rank + b2[1].rank, 2);
eq("tie: third ranked 3", b2[2].rank, 3);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
