import { normalizeGame } from "./storage";
import { BonusInput, Game, GAME_SCHEMA_VERSION, RoundEntry } from "./types";

/** Stable identity for portable Skull King Scorekeeper backups. */
export const BACKUP_FORMAT = "skull-king-scorekeeper";
export const BACKUP_FORMAT_VERSION = 1 as const;

/** Import guards: large enough for years of normal use, small enough to parse safely. */
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
export const MAX_BACKUP_GAMES = 500;
export const MAX_PLAYERS_PER_GAME = 20;
export const MAX_ROUNDS_PER_GAME = 100;

const MAX_IDENTIFIER_LENGTH = 200;
const MAX_PLAYER_NAME_LENGTH = 100;
const MAX_CARDS_PER_ROUND = 100;
const MAX_BONUS_COUNT = 1_000;
const MAX_LOOT_USES_PER_RAW_ROUND = 10;

export interface BackupData {
  currentGame: Game | null;
  history: Game[];
}

export interface BackupPayloadV1 extends BackupData {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_FORMAT_VERSION;
  gameSchemaVersion: number;
  exportedAt: number;
}

export type BackupErrorCode =
  | "too_large"
  | "invalid_json"
  | "invalid_format"
  | "unsupported_version"
  | "unsupported_game_schema"
  | "too_many_games"
  | "invalid_backup"
  | "invalid_game"
  | "unsupported_environment"
  | "file_read_failed";

/** A machine-readable error that an import UI can translate without string matching. */
export class BackupError extends Error {
  constructor(
    public readonly code: BackupErrorCode,
    message: string,
    options?: { cause?: unknown }
  ) {
    super(message, options);
    this.name = "BackupError";
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function failGame(path: string, reason: string): never {
  throw new BackupError("invalid_game", `${path}: ${reason}`);
}

function assertPlainObject(
  value: unknown,
  path: string
): asserts value is Record<string, unknown> {
  if (!isPlainObject(value)) failGame(path, "expected an object");
}

function assertString(
  value: unknown,
  path: string,
  maxLength: number,
  allowEmpty = false
): asserts value is string {
  if (
    typeof value !== "string" ||
    value.length > maxLength ||
    (!allowEmpty && value.length === 0)
  ) {
    failGame(path, `expected a string of at most ${maxLength} characters`);
  }
}

function isBoundedInteger(
  value: unknown,
  minimum: number,
  maximum: number
): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= minimum &&
    value <= maximum
  );
}

function assertOptionalInteger(
  value: unknown,
  path: string,
  minimum: number,
  maximum: number
): void {
  if (value !== undefined && !isBoundedInteger(value, minimum, maximum)) {
    failGame(path, `expected an integer between ${minimum} and ${maximum}`);
  }
}

function assertOptionalBoolean(value: unknown, path: string): void {
  if (value !== undefined && typeof value !== "boolean") {
    failGame(path, "expected a boolean");
  }
}

function assertOptionalTimestamp(value: unknown, path: string): void {
  assertOptionalInteger(value, path, 0, Number.MAX_SAFE_INTEGER);
}

function validateRawBonus(value: unknown, path: string): void {
  if (value === undefined || value === null) return;
  if (typeof value === "number") {
    if (!Number.isFinite(value) || Math.abs(value) > MAX_BONUS_COUNT * 10) {
      failGame(path, "legacy bonus is outside the supported range");
    }
    return;
  }

  assertPlainObject(value, path);
  for (const field of [
    "colored14",
    "mermaidByPirate",
    "pirateBySkullKing",
    "expansion7",
    "expansion8",
    "davyJonesLeviathans",
    "loot",
  ]) {
    assertOptionalInteger(value[field], `${path}.${field}`, 0, MAX_BONUS_COUNT);
  }
  for (const field of [
    "black14",
    "mermaidCapturesSkullKing",
    "secondCaptured",
  ]) {
    assertOptionalBoolean(value[field], `${path}.${field}`);
  }
  if (
    value.rascalWager !== undefined &&
    value.rascalWager !== 0 &&
    value.rascalWager !== 10 &&
    value.rascalWager !== 20
  ) {
    failGame(`${path}.rascalWager`, "expected 0, 10, or 20");
  }
}

function validateRawEntry(value: unknown, path: string): void {
  if (value === undefined || value === null) return;
  assertPlainObject(value, path);
  assertOptionalInteger(value.bid, `${path}.bid`, 0, MAX_CARDS_PER_ROUND);
  assertOptionalInteger(
    value.tricks,
    `${path}.tricks`,
    0,
    MAX_CARDS_PER_ROUND
  );
  assertOptionalInteger(
    value.legacyLoot,
    `${path}.legacyLoot`,
    0,
    MAX_BONUS_COUNT
  );
  assertOptionalBoolean(value.recorded, `${path}.recorded`);
  if (
    value.rascalBet !== undefined &&
    value.rascalBet !== "buckshot" &&
    value.rascalBet !== "cannonball"
  ) {
    failGame(`${path}.rascalBet`, 'expected "buckshot" or "cannonball"');
  }
  validateRawBonus(value.bonus, `${path}.bonus`);
}

/**
 * Validate the dangerous dimensions and primitive types before normalizeGame
 * allocates arrays or spreads nested input. Unknown future fields are ignored.
 */
function validateRawGame(value: unknown, path: string): Record<string, unknown> {
  assertPlainObject(value, path);
  assertString(value.id, `${path}.id`, MAX_IDENTIFIER_LENGTH);

  if (
    !Array.isArray(value.players) ||
    value.players.length === 0 ||
    value.players.length > MAX_PLAYERS_PER_GAME
  ) {
    failGame(
      `${path}.players`,
      `expected 1 to ${MAX_PLAYERS_PER_GAME} players`
    );
  }

  const playerIds = new Set<string>();
  value.players.forEach((player, index) => {
    const playerPath = `${path}.players[${index}]`;
    assertPlainObject(player, playerPath);
    assertString(player.id, `${playerPath}.id`, MAX_IDENTIFIER_LENGTH);
    assertString(
      player.name,
      `${playerPath}.name`,
      MAX_PLAYER_NAME_LENGTH,
      true
    );
    if (playerIds.has(player.id)) {
      failGame(`${playerPath}.id`, "player IDs must be unique");
    }
    playerIds.add(player.id);
  });

  if (
    !Array.isArray(value.rounds) ||
    value.rounds.length === 0 ||
    value.rounds.length > MAX_ROUNDS_PER_GAME
  ) {
    failGame(
      `${path}.rounds`,
      `expected 1 to ${MAX_ROUNDS_PER_GAME} rounds`
    );
  }

  const roundCount = value.rounds.length;
  if (
    value.totalRounds !== undefined &&
    (!isBoundedInteger(value.totalRounds, 1, MAX_ROUNDS_PER_GAME) ||
      value.totalRounds !== roundCount)
  ) {
    failGame(`${path}.totalRounds`, "must match the rounds array length");
  }
  assertOptionalInteger(value.currentRound, `${path}.currentRound`, 1, roundCount);

  value.rounds.forEach((round, roundIndex) => {
    const roundPath = `${path}.rounds[${roundIndex}]`;
    if (round === null) return;
    assertPlainObject(round, roundPath);
    for (const [playerId, entry] of Object.entries(round)) {
      if (!playerIds.has(playerId)) {
        failGame(roundPath, `contains unknown player ID ${JSON.stringify(playerId)}`);
      }
      validateRawEntry(entry, `${roundPath}.${playerId}`);
    }
  });

  if (value.cardsDealt !== undefined) {
    if (!Array.isArray(value.cardsDealt) || value.cardsDealt.length !== roundCount) {
      failGame(`${path}.cardsDealt`, "must match the rounds array length");
    }
    value.cardsDealt.forEach((cards, index) => {
      if (!isBoundedInteger(cards, 1, MAX_CARDS_PER_ROUND)) {
        failGame(
          `${path}.cardsDealt[${index}]`,
          `expected an integer between 1 and ${MAX_CARDS_PER_ROUND}`
        );
      }
    });
  }

  if (value.lootUses !== undefined) {
    if (!Array.isArray(value.lootUses) || value.lootUses.length > roundCount) {
      failGame(`${path}.lootUses`, "has too many rounds");
    }
    value.lootUses.forEach((roundUses, roundIndex) => {
      const usesPath = `${path}.lootUses[${roundIndex}]`;
      if (
        !Array.isArray(roundUses) ||
        roundUses.length > MAX_LOOT_USES_PER_RAW_ROUND
      ) {
        failGame(usesPath, "expected a bounded array");
      }
      roundUses.forEach((use, useIndex) => {
        const usePath = `${usesPath}[${useIndex}]`;
        assertPlainObject(use, usePath);
        if (use.id !== undefined) {
          assertString(use.id, `${usePath}.id`, MAX_IDENTIFIER_LENGTH);
        }
        for (const field of ["playedById", "boundToId"] as const) {
          const id = use[field];
          if (id !== null && typeof id !== "string") {
            failGame(`${usePath}.${field}`, "expected a player ID or null");
          }
          if (typeof id === "string" && id.length > MAX_IDENTIFIER_LENGTH) {
            failGame(`${usePath}.${field}`, "player ID is too long");
          }
        }
      });
    });
  }

  if (value.discardedTricks !== undefined) {
    if (
      !Array.isArray(value.discardedTricks) ||
      value.discardedTricks.length > roundCount
    ) {
      failGame(`${path}.discardedTricks`, "has too many rounds");
    }
    value.discardedTricks.forEach((count, index) => {
      if (
        typeof count !== "number" ||
        !Number.isFinite(count) ||
        Math.abs(count) > MAX_CARDS_PER_ROUND
      ) {
        failGame(`${path}.discardedTricks[${index}]`, "invalid trick count");
      }
    });
  }

  for (const field of [
    "advancedCards",
    "newExpansion",
    "twoPlayerGhost",
    "rascalBets",
  ]) {
    assertOptionalBoolean(value[field], `${path}.${field}`);
  }
  if (
    value.scoringMode !== undefined &&
    value.scoringMode !== "classic" &&
    value.scoringMode !== "rascal"
  ) {
    failGame(`${path}.scoringMode`, 'expected "classic" or "rascal"');
  }
  if (
    value.status !== undefined &&
    value.status !== "in_progress" &&
    value.status !== "finished"
  ) {
    failGame(`${path}.status`, "invalid game status");
  }
  assertOptionalTimestamp(value.createdAt, `${path}.createdAt`);
  assertOptionalTimestamp(value.updatedAt, `${path}.updatedAt`);

  return value;
}

function cleanBonus(bonus: BonusInput): BonusInput {
  return {
    colored14: bonus.colored14,
    black14: bonus.black14,
    mermaidByPirate: bonus.mermaidByPirate,
    pirateBySkullKing: bonus.pirateBySkullKing,
    mermaidCapturesSkullKing: bonus.mermaidCapturesSkullKing,
    rascalWager: bonus.rascalWager,
    expansion7: bonus.expansion7,
    expansion8: bonus.expansion8,
    davyJonesLeviathans: bonus.davyJonesLeviathans,
    secondCaptured: bonus.secondCaptured,
  };
}

function cleanEntry(entry: RoundEntry): RoundEntry {
  return {
    bid: entry.bid,
    tricks: entry.tricks,
    bonus: cleanBonus(entry.bonus),
    legacyLoot: entry.legacyLoot,
    recorded: entry.recorded,
    rascalBet: entry.rascalBet,
  };
}

/** Normalize migrations, then copy only the current schema's known fields. */
function normalizeBackupGame(value: unknown, path: string): Game {
  const raw = validateRawGame(value, path);
  // normalizeGame historically fills missing timestamps with Date.now(). Use a
  // stable epoch fallback so parsing the same legacy backup is deterministic.
  const stableRaw = {
    ...raw,
    createdAt: raw.createdAt ?? 0,
    updatedAt: raw.updatedAt ?? raw.createdAt ?? 0,
  };

  let normalized: Game | null;
  try {
    normalized = normalizeGame(stableRaw);
  } catch (cause) {
    throw new BackupError("invalid_game", `${path}: could not normalize game`, {
      cause,
    });
  }
  if (!normalized) failGame(path, "could not normalize game");

  // Re-validate the values created or preserved by the migration before the
  // typed object reaches scoring/UI code.
  validateRawGame(normalized, path);

  const playerIds = normalized.players.map((player) => player.id);
  return {
    id: normalized.id,
    players: normalized.players.map((player) => ({
      id: player.id,
      name: player.name,
    })),
    totalRounds: normalized.totalRounds,
    currentRound: normalized.currentRound,
    rounds: normalized.rounds.map((round) => {
      const cleanRound: Game["rounds"][number] = {};
      for (const playerId of playerIds) {
        cleanRound[playerId] = cleanEntry(round[playerId]);
      }
      return cleanRound;
    }),
    lootUses: normalized.lootUses.map((uses) =>
      uses.map((use) => ({
        id: use.id,
        playedById: use.playedById,
        boundToId: use.boundToId,
      }))
    ),
    discardedTricks: [...normalized.discardedTricks],
    cardsDealt: [...normalized.cardsDealt],
    scoringMode: normalized.scoringMode,
    rascalBets: normalized.rascalBets,
    advancedCards: normalized.advancedCards,
    newExpansion: normalized.newExpansion,
    twoPlayerGhost: normalized.twoPlayerGhost,
    status: normalized.status,
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
  };
}

/**
 * Validate and normalize a single game object that arrived from outside this
 * device (a backup file, a scanned share code, …). Applies the same hardening
 * as a backup import: dimension caps, primitive checks, schema migration and
 * a deep copy that drops unknown fields.
 */
export function normalizeUntrustedGame(value: unknown, path = "game"): Game {
  return normalizeBackupGame(value, path);
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function compareGamePreference(a: Game, b: Game): number {
  if (a.updatedAt !== b.updatedAt) return a.updatedAt < b.updatedAt ? -1 : 1;
  if (a.currentRound !== b.currentRound) {
    return a.currentRound < b.currentRound ? -1 : 1;
  }
  if (a.status !== b.status) return a.status === "finished" ? 1 : -1;
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1;
  return compareText(JSON.stringify(a), JSON.stringify(b));
}

function preferredGame(a: Game, b: Game): Game {
  return compareGamePreference(a, b) >= 0 ? a : b;
}

function compareHistoryOrder(a: Game, b: Game): number {
  const preference = compareGamePreference(a, b);
  if (preference !== 0) return -preference;
  return compareText(a.id, b.id);
}

/**
 * Keep one version of every game ID. This is commutative and input-order
 * independent, including the uncommon case of equal update timestamps.
 */
export function deduplicateGames(games: readonly Game[]): Game[] {
  const byId = new Map<string, Game>();
  for (const game of games) {
    const previous = byId.get(game.id);
    byId.set(game.id, previous ? preferredGame(previous, game) : game);
  }
  return [...byId.values()].sort(compareHistoryOrder);
}

function normalizeBackupData(data: BackupData, path: string): BackupData {
  if (!isPlainObject(data)) {
    throw new BackupError("invalid_backup", `${path}: expected an object`);
  }
  if (data.currentGame !== null && data.currentGame === undefined) {
    throw new BackupError(
      "invalid_backup",
      `${path}.currentGame: expected a game or null`
    );
  }
  if (!Array.isArray(data.history)) {
    throw new BackupError(
      "invalid_backup",
      `${path}.history: expected an array`
    );
  }
  if (data.history.length > MAX_BACKUP_GAMES) {
    throw new BackupError(
      "too_many_games",
      `A backup can contain at most ${MAX_BACKUP_GAMES} history entries`
    );
  }

  const currentGame =
    data.currentGame === null
      ? null
      : normalizeBackupGame(data.currentGame, `${path}.currentGame`);
  const rawHistory = data.history.map((game, index) =>
    normalizeBackupGame(game, `${path}.history[${index}]`)
  );

  // If the current pointer is also present in history, both locations receive
  // the same winning revision without forcing absent current games into it.
  const winners = deduplicateGames(
    currentGame ? [...rawHistory, currentGame] : rawHistory
  );
  const winnerById = new Map(winners.map((game) => [game.id, game]));
  return {
    currentGame: currentGame ? winnerById.get(currentGame.id)! : null,
    history: deduplicateGames(
      rawHistory.map((game) => winnerById.get(game.id) ?? game)
    ),
  };
}

function utf8ByteLength(value: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value).byteLength;
  }
  // TextEncoder is present on supported browsers and Node. This fallback keeps
  // the bound correct on older JS runtimes, including surrogate pairs.
  let bytes = 0;
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff && index + 1 < value.length) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        bytes += 4;
        index++;
      } else {
        bytes += 3;
      }
    } else {
      bytes += 3;
    }
  }
  return bytes;
}

function assertBackupTextSize(json: string): void {
  if (utf8ByteLength(json) > MAX_BACKUP_BYTES) {
    throw new BackupError(
      "too_large",
      `Backup exceeds the ${MAX_BACKUP_BYTES}-byte import limit`
    );
  }
}

/** Build a versioned payload while applying the same checks as an import. */
export function createBackupPayload(
  data: BackupData,
  exportedAt = Date.now()
): BackupPayloadV1 {
  if (!isBoundedInteger(exportedAt, 0, Number.MAX_SAFE_INTEGER)) {
    throw new BackupError("invalid_backup", "exportedAt must be a timestamp");
  }
  const normalized = normalizeBackupData(data, "backup");
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_FORMAT_VERSION,
    gameSchemaVersion: GAME_SCHEMA_VERSION,
    exportedAt,
    ...normalized,
  };
}

/** Serialize current game + history into the portable JSON format. */
export function serializeBackup(
  data: BackupData,
  exportedAt = Date.now()
): string {
  const json = JSON.stringify(createBackupPayload(data, exportedAt), null, 2);
  assertBackupTextSize(json);
  return json;
}

/** Parse, migrate, sanitize, and deduplicate an untrusted backup string. */
export function parseBackup(json: string): BackupPayloadV1 {
  if (typeof json !== "string") {
    throw new BackupError("invalid_json", "Backup contents must be text");
  }
  assertBackupTextSize(json);

  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch (cause) {
    throw new BackupError("invalid_json", "Backup is not valid JSON", {
      cause,
    });
  }
  if (!isPlainObject(raw)) {
    throw new BackupError("invalid_format", "Backup root must be an object");
  }
  if (raw.format !== BACKUP_FORMAT) {
    throw new BackupError("invalid_format", "Not a Skull King backup");
  }
  if (raw.version !== BACKUP_FORMAT_VERSION) {
    throw new BackupError(
      "unsupported_version",
      `Unsupported backup version: ${String(raw.version)}`
    );
  }
  if (
    !isBoundedInteger(raw.gameSchemaVersion, 1, Number.MAX_SAFE_INTEGER)
  ) {
    throw new BackupError(
      "invalid_backup",
      "gameSchemaVersion must be a positive integer"
    );
  }
  if (raw.gameSchemaVersion > GAME_SCHEMA_VERSION) {
    throw new BackupError(
      "unsupported_game_schema",
      `Backup uses game schema ${raw.gameSchemaVersion}; this app supports ${GAME_SCHEMA_VERSION}`
    );
  }
  if (!isBoundedInteger(raw.exportedAt, 0, Number.MAX_SAFE_INTEGER)) {
    throw new BackupError("invalid_backup", "exportedAt must be a timestamp");
  }
  if (!("currentGame" in raw) || !("history" in raw)) {
    throw new BackupError(
      "invalid_backup",
      "Backup must contain currentGame and history"
    );
  }

  const data = normalizeBackupData(
    {
      currentGame: raw.currentGame as Game | null,
      history: raw.history as Game[],
    },
    "backup"
  );
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_FORMAT_VERSION,
    gameSchemaVersion: raw.gameSchemaVersion,
    exportedAt: raw.exportedAt,
    ...data,
  };
}

function chooseCurrentGame(
  local: Game | null,
  imported: Game | null
): Game | null {
  if (!local) return imported;
  if (!imported) return local;
  if (local.id === imported.id) return preferredGame(local, imported);
  const preference = compareGamePreference(local, imported);
  if (preference !== 0) return preference > 0 ? local : imported;
  return compareText(local.id, imported.id) >= 0 ? local : imported;
}

/**
 * Merge an imported backup into local data without losing either side. The
 * freshest revision wins per ID, and the freshest current pointer stays active.
 */
export function mergeBackupData(
  local: BackupData,
  imported: BackupData
): BackupData {
  const normalizedLocal = normalizeBackupData(local, "local");
  const normalizedImported = normalizeBackupData(imported, "imported");
  const currentCandidate = chooseCurrentGame(
    normalizedLocal.currentGame,
    normalizedImported.currentGame
  );
  const history = deduplicateGames([
    ...normalizedLocal.history,
    ...normalizedImported.history,
    ...(normalizedLocal.currentGame ? [normalizedLocal.currentGame] : []),
    ...(normalizedImported.currentGame ? [normalizedImported.currentGame] : []),
  ]);
  if (history.length > MAX_BACKUP_GAMES) {
    throw new BackupError(
      "too_many_games",
      `Merged data would exceed ${MAX_BACKUP_GAMES} games`
    );
  }
  const byId = new Map(history.map((game) => [game.id, game]));
  return {
    currentGame: currentCandidate
      ? byId.get(currentCandidate.id) ?? currentCandidate
      : null,
    history,
  };
}

function defaultBackupFilename(now = new Date()): string {
  const date = Number.isNaN(now.getTime())
    ? "backup"
    : now.toISOString().slice(0, 10);
  return `skull-king-backup-${date}.json`;
}

/** Trigger a browser download for already serialized backup JSON. */
export function downloadBackupJson(
  json: string,
  filename = defaultBackupFilename()
): void {
  assertBackupTextSize(json);
  if (
    typeof document === "undefined" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    throw new BackupError(
      "unsupported_environment",
      "Backup downloads are only available in a web browser"
    );
  }

  const safeFilename =
    filename
      .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
      .replace(/^\.+/, "")
      .slice(0, 180) || defaultBackupFilename();
  const finalFilename = safeFilename.toLowerCase().endsWith(".json")
    ? safeFilename
    : `${safeFilename}.json`;
  const url = URL.createObjectURL(
    new Blob([json], { type: "application/json;charset=utf-8" })
  );
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = finalFilename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function readBackupBlob(file: Blob): Promise<string> {
  if (file.size > MAX_BACKUP_BYTES) {
    throw new BackupError(
      "too_large",
      `Backup exceeds the ${MAX_BACKUP_BYTES}-byte import limit`
    );
  }
  try {
    const json = await file.text();
    assertBackupTextSize(json);
    return json;
  } catch (cause) {
    if (cause instanceof BackupError) throw cause;
    throw new BackupError("file_read_failed", "Could not read backup file", {
      cause,
    });
  }
}

/** Open the native browser file chooser. Resolves null when the user cancels. */
export function pickBackupJsonFile(): Promise<string | null> {
  if (typeof document === "undefined") {
    return Promise.reject(
      new BackupError(
        "unsupported_environment",
        "Backup file selection is only available in a web browser"
      )
    );
  }

  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.style.display = "none";
    document.body.appendChild(input);

    const finish = () => input.remove();
    input.addEventListener(
      "cancel",
      () => {
        finish();
        resolve(null);
      },
      { once: true }
    );
    input.addEventListener(
      "change",
      () => {
        const file = input.files?.[0];
        finish();
        if (!file) {
          resolve(null);
          return;
        }
        void readBackupBlob(file).then(resolve, reject);
      },
      { once: true }
    );
    input.click();
  });
}
