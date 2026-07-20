/**
 * Live-follow share code checks: round-trip fidelity, QR-friendly size,
 * hardening against tampered codes, and URL helpers.
 * Run with: npm run test:sharelink
 */
import { createGame, playerScoreHistory, standings } from "../src/scoring";
import {
  MAX_SHARE_CODE_CHARS,
  ShareCodeError,
  buildShareUrl,
  decodeShareCode,
  encodeShareCode,
  extractShareCode,
} from "../src/shareLink";
import { qrCodeDataUrl } from "../src/qr";
import { Game } from "../src/types";

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}${detail ? `: ${detail}` : ""}`);
  }
}

function makeRichGame(): Game {
  const players = [
    { id: "anne", name: "Anne-Sophie" },
    { id: "bonny", name: "Bönny 🦜" },
    { id: "calico", name: "كاليكو" },
    { id: "drake", name: "" },
  ];
  const game = createGame(players, 5, true, false, true, undefined, "rascal", true);
  game.createdAt = 1_770_000_123_456;
  game.updatedAt = 1_770_003_456_789;
  game.currentRound = 3;
  game.cardsDealt = [1, 2, 3, 4, 6];
  game.discardedTricks = [0, 1, 0, 0, 0];
  for (let round = 0; round < 2; round++) {
    for (const player of players) {
      const entry = game.rounds[round][player.id];
      entry.recorded = true;
      entry.bid = (round + 1) % (game.cardsDealt[round] + 1);
      entry.tricks = round === 0 ? 0 : 1;
    }
  }
  const anne = game.rounds[1].anne;
  anne.bonus = {
    colored14: 2,
    black14: true,
    mermaidByPirate: 1,
    pirateBySkullKing: 2,
    mermaidCapturesSkullKing: true,
    rascalWager: 20,
    expansion7: 1,
    expansion8: 2,
    davyJonesLeviathans: 1,
    secondCaptured: true,
  };
  anne.rascalBet = "cannonball";
  game.rounds[1].bonny.legacyLoot = 2;
  game.lootUses[1] = [
    { id: "loot_a", playedById: "anne", boundToId: "calico" },
    { id: "loot_b", playedById: "drake", boundToId: null },
  ];
  return game;
}

console.log("Round-trip fidelity");
const original = makeRichGame();
const code = encodeShareCode(original);
const decoded = decodeShareCode(code);

check(
  "share codes only use URL-safe base64 characters",
  /^[A-Za-z0-9_-]+$/.test(code)
);
check(
  "player names survive, in seating order (unicode included)",
  decoded.players.map((p) => p.name).join("|") ===
    original.players.map((p) => p.name).join("|")
);
check(
  "player IDs are regenerated with the shared prefix",
  decoded.players.every((p, i) => p.id === `shared_p${i + 1}`)
);
check("game ID derives from creation time", decoded.id === "shared_1770000123");
check(
  "timestamps survive at second precision",
  decoded.createdAt === 1_770_000_123_000 &&
    decoded.updatedAt === 1_770_003_456_000
);
check(
  "round structure survives",
  decoded.totalRounds === original.totalRounds &&
    decoded.currentRound === original.currentRound &&
    decoded.cardsDealt.join(",") === original.cardsDealt.join(",") &&
    decoded.discardedTricks.join(",") === original.discardedTricks.join(",")
);
check(
  "options survive",
  decoded.scoringMode === "rascal" &&
    decoded.rascalBets &&
    decoded.advancedCards &&
    decoded.newExpansion &&
    !decoded.twoPlayerGhost &&
    decoded.status === "in_progress"
);

const entriesMatch = original.players.every((player, seat) =>
  original.rounds.every((round, roundIndex) => {
    const source = round[player.id];
    const target = decoded.rounds[roundIndex][`shared_p${seat + 1}`];
    return (
      source.bid === target.bid &&
      source.tricks === target.tricks &&
      source.recorded === target.recorded &&
      source.rascalBet === target.rascalBet &&
      source.legacyLoot === target.legacyLoot &&
      JSON.stringify(source.bonus) === JSON.stringify(target.bonus)
    );
  })
);
check("every bid, trick, bonus and declaration survives", entriesMatch);
check(
  "loot alliances survive with seats remapped",
  decoded.lootUses[1].length === 2 &&
    decoded.lootUses[1][0].playedById === "shared_p1" &&
    decoded.lootUses[1][0].boundToId === "shared_p3" &&
    decoded.lootUses[1][1].playedById === "shared_p4" &&
    decoded.lootUses[1][1].boundToId === null
);

const originalBoard = standings(original);
const decodedBoard = standings(decoded);
check(
  "standings computed from the snapshot match the game master's",
  originalBoard.length === decodedBoard.length &&
    originalBoard.every(
      (row, index) =>
        row.total === decodedBoard[index].total &&
        row.rank === decodedBoard[index].rank &&
        row.player.name === decodedBoard[index].player.name
    )
);
check(
  "per-round score details match (loot and bonuses included)",
  original.players.every((player, seat) => {
    const source = playerScoreHistory(original, player.id);
    const target = playerScoreHistory(decoded, `shared_p${seat + 1}`);
    return (
      source.length === target.length &&
      source.every(
        (round, index) =>
          round.total === target[index].total &&
          round.runningTotal === target[index].runningTotal &&
          round.items.length === target[index].items.length
      )
    );
  })
);

console.log("Second-scan stability");
check("encoding is deterministic", encodeShareCode(original) === code);
check(
  "re-encoding a decoded snapshot round-trips again",
  JSON.stringify(decodeShareCode(encodeShareCode(decoded))) ===
    JSON.stringify(decoded)
);

console.log("QR-friendly size");
const emptyGame = createGame(
  [
    { id: "a", name: "Anne" },
    { id: "b", name: "Bonny" },
  ],
  10
);
check(
  `fresh 2-player game stays tiny (${encodeShareCode(emptyGame).length} chars)`,
  encodeShareCode(emptyGame).length < 300
);

const worstCase = createGame(
  Array.from({ length: 8 }, (_, i) => ({
    id: `p${i}`,
    name: `Pirate Player ${i + 1}`,
  })),
  10,
  true,
  false,
  true,
  undefined,
  "rascal",
  true
);
worstCase.rounds.forEach((round, roundIndex) => {
  for (const player of worstCase.players) {
    const entry = round[player.id];
    entry.recorded = true;
    entry.bid = Math.min(roundIndex + 1, 10);
    entry.tricks = Math.min(roundIndex, 10);
    entry.rascalBet = "cannonball";
    entry.legacyLoot = 1;
    entry.bonus = {
      colored14: 3,
      black14: true,
      mermaidByPirate: 2,
      pirateBySkullKing: 6,
      mermaidCapturesSkullKing: true,
      rascalWager: 20,
      expansion7: 4,
      expansion8: 4,
      davyJonesLeviathans: 3,
      secondCaptured: true,
    };
  }
});
worstCase.lootUses = worstCase.lootUses.map((_, roundIndex) => [
  {
    id: `l${roundIndex}a`,
    playedById: "p0",
    boundToId: "p1",
  },
  {
    id: `l${roundIndex}b`,
    playedById: "p2",
    boundToId: "p3",
  },
]);
const worstCode = encodeShareCode(worstCase);
check(
  `8 players x 10 rounds, every bonus set, fits a scannable QR (${worstCode.length} chars)`,
  worstCode.length < 1900
);
check(
  "the worst case still round-trips",
  standings(decodeShareCode(worstCode)).length === 8
);

console.log("QR image generation");
const url = buildShareUrl(worstCase, "https://example.test/skull-king/");
const dataUrl = qrCodeDataUrl(url, 264);
check(
  "worst-case URL renders to an image data URL",
  dataUrl !== null && dataUrl.startsWith("data:image/gif;base64,")
);
check(
  "over-capacity input reports failure instead of throwing",
  qrCodeDataUrl("x".repeat(4000), 264) === null
);

console.log("URL helpers");
check(
  "share URLs put the code in the #skl= hash",
  url.startsWith("https://example.test/skull-king/#skl=")
);
check(
  "extractShareCode reads back the code from a hash",
  extractShareCode(`#skl=${worstCode}`) === worstCode &&
    extractShareCode(`skl=${worstCode}`) === worstCode
);
check(
  "unrelated or empty hashes yield no code",
  extractShareCode("#settings") === null &&
    extractShareCode("#skl=") === null &&
    extractShareCode("") === null &&
    extractShareCode(null) === null
);

console.log("Tampered and hostile codes");
function decodeOutcome(candidate: string): "ok" | "rejected" | "crashed" {
  try {
    decodeShareCode(candidate);
    return "ok";
  } catch (error) {
    return error instanceof ShareCodeError ? "rejected" : "crashed";
  }
}

check("empty code is rejected", decodeOutcome("") === "rejected");
check(
  "oversized code is rejected before parsing",
  decodeOutcome("A".repeat(MAX_SHARE_CODE_CHARS + 1)) === "rejected"
);
check(
  "non-base64url characters are rejected",
  decodeOutcome(`${code.slice(0, -1)}!`) === "rejected"
);
check("truncated code is rejected", decodeOutcome(code.slice(0, 40)) === "rejected");
check(
  "future codec version is rejected",
  (() => {
    try {
      decodeShareCode(`B${code.slice(1)}`);
      return false;
    } catch (error) {
      return (
        error instanceof ShareCodeError && error.code === "unsupported_version"
      );
    }
  })()
);

let mutationCrashes = 0;
let mutationRejections = 0;
for (let index = 0; index < code.length; index += 7) {
  const flipped =
    code.slice(0, index) +
    (code[index] === "A" ? "B" : "A") +
    code.slice(index + 1);
  const outcome = decodeOutcome(flipped);
  if (outcome === "crashed") mutationCrashes++;
  if (outcome === "rejected") mutationRejections++;
}
check(
  `mutated codes never crash decoding (${mutationRejections} rejected cleanly)`,
  mutationCrashes === 0
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
