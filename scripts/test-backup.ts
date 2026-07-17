/**
 * Portable backup format, validation, and merge checks.
 * Run with: npm run test:backup
 */
import {
  BACKUP_FORMAT,
  BACKUP_FORMAT_VERSION,
  BackupError,
  BackupErrorCode,
  MAX_BACKUP_BYTES,
  MAX_BACKUP_GAMES,
  createBackupPayload,
  deduplicateGames,
  mergeBackupData,
  parseBackup,
  serializeBackup,
} from "../src/backup";
import { createGame } from "../src/scoring";
import { Game, GAME_SCHEMA_VERSION } from "../src/types";

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean): void {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}`);
  }
}

function expectBackupError(
  label: string,
  operation: () => unknown,
  code: BackupErrorCode
): void {
  try {
    operation();
    check(label, false);
  } catch (error) {
    check(label, error instanceof BackupError && error.code === code);
  }
}

const players = [
  { id: "a", name: "Anne" },
  { id: "b", name: "Bonny" },
  { id: "c", name: "Calico" },
];

function game(id: string, updatedAt: number, playerName = "Anne"): Game {
  const value = createGame(
    [{ id: "a", name: playerName }, players[1], players[2]],
    2,
    true
  );
  value.id = id;
  value.createdAt = Math.max(0, updatedAt - 10);
  value.updatedAt = updatedAt;
  return value;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

console.log("Versioned JSON round trip");
const current = game("current", 200);
current.rounds[0].a.bid = 1;
current.rounds[0].a.tricks = 1;
current.rounds[0].a.recorded = true;
current.rounds[0].a.bonus.black14 = true;
current.lootUses[0] = [
  { id: "loot-1", playedById: "a", boundToId: "b" },
];
current.discardedTricks[1] = 1;
const finished = game("finished", 100);
finished.status = "finished";
finished.currentRound = 2;

const json = serializeBackup(
  { currentGame: current, history: [finished, clone(current)] },
  1_750_000_000_000
);
const parsed = parseBackup(json);
check("format marker survives", parsed.format === BACKUP_FORMAT);
check("backup version survives", parsed.version === BACKUP_FORMAT_VERSION);
check("game schema is recorded", parsed.gameSchemaVersion === GAME_SCHEMA_VERSION);
check("export timestamp survives", parsed.exportedAt === 1_750_000_000_000);
check("current game survives", parsed.currentGame?.id === "current");
check(
  "round data survives",
  parsed.currentGame?.rounds[0].a.bid === 1 &&
    parsed.currentGame.rounds[0].a.bonus.black14
);
check(
  "special-card state survives",
  parsed.currentGame?.lootUses[0][0]?.boundToId === "b" &&
    parsed.currentGame.discardedTricks[1] === 1
);
check(
  "history round trip is deterministic",
  serializeBackup(parsed, parsed.exportedAt) === json
);

console.log("Defensive parsing");
expectBackupError("malformed JSON is rejected", () => parseBackup("{"), "invalid_json");
expectBackupError(
  "wrong product marker is rejected",
  () =>
    parseBackup(
      JSON.stringify({
        ...createBackupPayload({ currentGame: null, history: [] }, 1),
        format: "some-other-app",
      })
    ),
  "invalid_format"
);
expectBackupError(
  "future backup versions are rejected",
  () =>
    parseBackup(
      JSON.stringify({
        ...createBackupPayload({ currentGame: null, history: [] }, 1),
        version: BACKUP_FORMAT_VERSION + 1,
      })
    ),
  "unsupported_version"
);
expectBackupError(
  "future game schemas are rejected",
  () =>
    parseBackup(
      JSON.stringify({
        ...createBackupPayload({ currentGame: null, history: [] }, 1),
        gameSchemaVersion: GAME_SCHEMA_VERSION + 1,
      })
    ),
  "unsupported_game_schema"
);
expectBackupError(
  "missing collections are rejected",
  () =>
    parseBackup(
      JSON.stringify({
        format: BACKUP_FORMAT,
        version: BACKUP_FORMAT_VERSION,
        gameSchemaVersion: GAME_SCHEMA_VERSION,
        exportedAt: 1,
      })
    ),
  "invalid_backup"
);
expectBackupError(
  "oversized text is rejected before parsing",
  () => parseBackup(" ".repeat(MAX_BACKUP_BYTES + 1)),
  "too_large"
);

const invalidGame = clone(current) as any;
invalidGame.players[0].id = invalidGame.players[1].id;
expectBackupError(
  "duplicate player IDs are rejected",
  () =>
    parseBackup(
      JSON.stringify({
        ...createBackupPayload({ currentGame: null, history: [] }, 1),
        currentGame: invalidGame,
      })
    ),
  "invalid_game"
);

const tooManyRawGames = Array.from(
  { length: MAX_BACKUP_GAMES + 1 },
  () => finished
);
expectBackupError(
  "excessive history count is rejected before normalization",
  () =>
    parseBackup(
      JSON.stringify({
        ...createBackupPayload({ currentGame: null, history: [] }, 1),
        history: tooManyRawGames,
      })
    ),
  "too_many_games"
);

console.log("Legacy game normalization");
const legacyPayload = {
  format: BACKUP_FORMAT,
  version: BACKUP_FORMAT_VERSION,
  gameSchemaVersion: 1,
  exportedAt: 123,
  currentGame: null,
  history: [
    {
      id: "legacy",
      players,
      totalRounds: 2,
      currentRound: 1,
      rounds: [
        {
          a: { bid: 1, tricks: 1, bonus: 30, recorded: true },
          b: {
            bid: 0,
            tricks: 0,
            bonus: { loot: 2 },
            recorded: true,
          },
          c: { bid: 0, tricks: 0, recorded: true },
        },
        {},
      ],
    },
  ],
};
const migrated = parseBackup(JSON.stringify(legacyPayload)).history[0];
check("legacy game imports", migrated.id === "legacy");
check("numeric bonus migrates", migrated.rounds[0].a.bonus.colored14 === 3);
check("legacy Loot count migrates", migrated.rounds[0].b.legacyLoot === 2);
check(
  "missing arrays receive current defaults",
  migrated.cardsDealt.join(",") === "1,2" &&
    migrated.lootUses.length === 2 &&
    migrated.discardedTricks.every((count) => count === 0)
);
check(
  "missing timestamps normalize deterministically",
  migrated.createdAt === 0 && migrated.updatedAt === 0
);
check(
  "unknown legacy fields do not leak into current bonus",
  !("loot" in migrated.rounds[0].b.bonus)
);

console.log("Deduplication");
const older = game("same", 10, "Older");
const newer = game("same", 20, "Newer");
const unique = game("unique", 15);
const deduped = deduplicateGames([older, unique, newer, clone(newer)]);
check("one game remains per ID", deduped.length === 2);
check(
  "newest revision wins",
  deduped.find((item) => item.id === "same")?.players[0].name === "Newer"
);
check("games are ordered by recent activity", deduped[0].id === "same");

const tiedA = game("tie", 50, "Anne");
const tiedZ = game("tie", 50, "Zoe");
check(
  "equal timestamps resolve independently of input order",
  JSON.stringify(deduplicateGames([tiedA, tiedZ])) ===
    JSON.stringify(deduplicateGames([tiedZ, tiedA]))
);

console.log("Deterministic merge");
const localCurrent = game("local-current", 30);
const importedCurrent = game("imported-current", 50);
const localShared = game("shared", 20, "Local revision");
const importedShared = game("shared", 40, "Imported revision");
const localOnly = game("local-only", 10);
const importedOnly = game("imported-only", 35);

const merged = mergeBackupData(
  {
    currentGame: localCurrent,
    history: [localShared, localOnly, localCurrent],
  },
  {
    currentGame: importedCurrent,
    history: [importedOnly, importedShared, importedCurrent],
  }
);
check("freshest active game wins", merged.currentGame?.id === "imported-current");
check("history union keeps every game ID", merged.history.length === 5);
check(
  "merge keeps newest shared revision",
  merged.history.find((item) => item.id === "shared")?.players[0].name ===
    "Imported revision"
);
check(
  "both current pointers remain recoverable in history",
  merged.history.some((item) => item.id === "local-current") &&
    merged.history.some((item) => item.id === "imported-current")
);

const reverseMerged = mergeBackupData(
  {
    currentGame: importedCurrent,
    history: [importedOnly, importedShared, importedCurrent],
  },
  {
    currentGame: localCurrent,
    history: [localShared, localOnly, localCurrent],
  }
);
check(
  "merge is independent of source order",
  JSON.stringify(reverseMerged) === JSON.stringify(merged)
);

const manyLocalGames = Array.from({ length: 300 }, (_, index) =>
  game(`local-${index}`, index)
);
const manyImportedGames = Array.from({ length: 300 }, (_, index) =>
  game(`imported-${index}`, 1_000 + index)
);
expectBackupError(
  "merge rejects a union beyond the durable backup limit",
  () =>
    mergeBackupData(
      { currentGame: null, history: manyLocalGames },
      { currentGame: null, history: manyImportedGames }
    ),
  "too_many_games"
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
