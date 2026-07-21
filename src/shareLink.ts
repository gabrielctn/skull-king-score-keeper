import {
  MAX_PLAYERS_PER_GAME,
  MAX_ROUNDS_PER_GAME,
  normalizeUntrustedGame,
} from "./backup";
import { BonusInput, Game, LootUse, RoundEntry } from "./types";
import { emptyBonus, emptyEntry } from "./scoring";

/**
 * Live-follow share links.
 *
 * The game master's device shows a QR code containing the whole current game
 * encoded in the URL hash. A player who scans it opens the app in a read-only
 * spectator view of that snapshot — no server, no connection between devices,
 * in keeping with the offline-first design. Re-scanning refreshes the view.
 *
 * The game state travels as a compact binary encoding (varints + UTF-8 names,
 * base64url alphabet) rather than JSON, so a full 8-player game still fits in
 * an easily scannable QR code. The decoder treats the data as untrusted and
 * re-validates everything through the backup import hardening.
 *
 * Binary layout (codec version 1):
 *
 *   u8      codec version (SHARE_CODEC_VERSION)
 *   u8      game flags (rascal scoring, rascal bets, advanced cards,
 *           new expansion, two-player ghost, finished)
 *   varint  currentRound (1-based)
 *   varint  createdAt, updatedAt (seconds since epoch)
 *   varint  player count, then per player: varint name byte length + UTF-8
 *   varint  round count, then per round: varint cardsDealt
 *   per round: varint discardedTricks
 *   per round x per player (seating order):
 *     u8      entry flags (recorded, cannonball, bonus block follows,
 *             legacyLoot follows)
 *     varint  bid, varint tricks
 *     [bonus] u8 bonus booleans, u8 rascalWager/10, then varints colored14,
 *             mermaidByPirate, pirateBySkullKing, expansion7, expansion8,
 *             davyJonesLeviathans
 *     [varint legacyLoot]
 *   per round: varint loot-use count, then per use two varints
 *             (player index + 1, 0 meaning "not chosen yet")
 *
 * Player IDs are not transmitted; the decoder derives stable IDs from seat
 * order. Nothing decoded here is ever merged into the device's own games.
 */

export const SHARE_CODEC_VERSION = 1;

/** URL-hash parameter carrying the share code: `#skl=<code>`. */
export const SHARE_HASH_PARAM = "skl";

/** Upper bound accepted by the decoder; far above any QR code's capacity. */
export const MAX_SHARE_CODE_CHARS = 8192;

/** sessionStorage key that keeps a scanned snapshot across a page reload. */
const SPECTATOR_SESSION_KEY = "skullking:spectatorCode";

export type ShareCodeErrorCode =
  | "encode_failed"
  | "too_long"
  | "invalid_code"
  | "unsupported_version";

/** Machine-readable error so the UI can translate without string matching. */
export class ShareCodeError extends Error {
  constructor(
    public readonly code: ShareCodeErrorCode,
    message: string,
    options?: { cause?: unknown }
  ) {
    super(message, options);
    this.name = "ShareCodeError";
  }
}

// --- byte-level helpers ----------------------------------------------------

const BASE64URL_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

const BASE64URL_VALUES = (() => {
  const values = new Map<string, number>();
  for (let index = 0; index < BASE64URL_ALPHABET.length; index++) {
    values.set(BASE64URL_ALPHABET[index], index);
  }
  return values;
})();

function bytesToBase64Url(bytes: number[]): string {
  let out = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const b0 = bytes[index];
    const b1 = bytes[index + 1];
    const b2 = bytes[index + 2];
    out += BASE64URL_ALPHABET[b0 >> 2];
    out += BASE64URL_ALPHABET[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)];
    if (b1 === undefined) break;
    out += BASE64URL_ALPHABET[((b1 & 0x0f) << 2) | ((b2 ?? 0) >> 6)];
    if (b2 === undefined) break;
    out += BASE64URL_ALPHABET[b2 & 0x3f];
  }
  return out;
}

function base64UrlToBytes(code: string): number[] {
  if (code.length % 4 === 1) {
    throw new ShareCodeError("invalid_code", "Truncated share code");
  }
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of code) {
    const value = BASE64URL_VALUES.get(char);
    if (value === undefined) {
      throw new ShareCodeError(
        "invalid_code",
        "Share code contains unexpected characters"
      );
    }
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return bytes;
}

/** UTF-8 encoding without TextEncoder, which older engines may lack. */
function encodeUtf8(text: string): number[] {
  const bytes: number[] = [];
  for (let index = 0; index < text.length; index++) {
    let code = text.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff && index + 1 < text.length) {
      const next = text.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
        index++;
      }
    }
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    } else {
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    }
  }
  return bytes;
}

function decodeUtf8(bytes: number[]): string {
  let out = "";
  for (let index = 0; index < bytes.length; ) {
    const b0 = bytes[index];
    let code: number;
    let size: number;
    if (b0 < 0x80) {
      code = b0;
      size = 1;
    } else if ((b0 & 0xe0) === 0xc0) {
      code = b0 & 0x1f;
      size = 2;
    } else if ((b0 & 0xf0) === 0xe0) {
      code = b0 & 0x0f;
      size = 3;
    } else if ((b0 & 0xf8) === 0xf0) {
      code = b0 & 0x07;
      size = 4;
    } else {
      throw new ShareCodeError("invalid_code", "Malformed text in share code");
    }
    if (index + size > bytes.length) {
      throw new ShareCodeError("invalid_code", "Malformed text in share code");
    }
    for (let offset = 1; offset < size; offset++) {
      const continuation = bytes[index + offset];
      if ((continuation & 0xc0) !== 0x80) {
        throw new ShareCodeError(
          "invalid_code",
          "Malformed text in share code"
        );
      }
      code = (code << 6) | (continuation & 0x3f);
    }
    index += size;
    if (code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) {
      throw new ShareCodeError("invalid_code", "Malformed text in share code");
    }
    if (code >= 0x10000) {
      const surrogate = code - 0x10000;
      out += String.fromCharCode(
        0xd800 + (surrogate >> 10),
        0xdc00 + (surrogate & 0x3ff)
      );
    } else {
      out += String.fromCharCode(code);
    }
  }
  return out;
}

class ByteWriter {
  readonly bytes: number[] = [];

  u8(value: number): void {
    this.bytes.push(value & 0xff);
  }

  /** Unsigned LEB128; inputs are clamped to non-negative safe integers. */
  varint(value: number): void {
    let rest = Math.max(0, Math.floor(Number(value) || 0));
    while (rest >= 0x80) {
      this.bytes.push((rest & 0x7f) | 0x80);
      rest = Math.floor(rest / 128);
    }
    this.bytes.push(rest);
  }

  text(value: string): void {
    const encoded = encodeUtf8(value);
    this.varint(encoded.length);
    this.bytes.push(...encoded);
  }
}

class ByteReader {
  private cursor = 0;

  constructor(private readonly bytes: number[]) {}

  private fail(): never {
    throw new ShareCodeError("invalid_code", "Truncated share code");
  }

  u8(): number {
    if (this.cursor >= this.bytes.length) this.fail();
    return this.bytes[this.cursor++];
  }

  varint(): number {
    let value = 0;
    let scale = 1;
    for (let count = 0; count < 8; count++) {
      const byte = this.u8();
      value += (byte & 0x7f) * scale;
      if ((byte & 0x80) === 0) {
        if (!Number.isSafeInteger(value)) this.fail();
        return value;
      }
      scale *= 128;
    }
    throw new ShareCodeError("invalid_code", "Oversized number in share code");
  }

  text(maxBytes: number): string {
    const length = this.varint();
    if (length > maxBytes || this.cursor + length > this.bytes.length) {
      this.fail();
    }
    const slice = this.bytes.slice(this.cursor, this.cursor + length);
    this.cursor += length;
    return decodeUtf8(slice);
  }

  atEnd(): boolean {
    return this.cursor >= this.bytes.length;
  }
}

// --- game <-> code ---------------------------------------------------------

const GAME_FLAG_RASCAL_SCORING = 1;
const GAME_FLAG_RASCAL_BETS = 2;
const GAME_FLAG_ADVANCED_CARDS = 4;
const GAME_FLAG_NEW_EXPANSION = 8;
const GAME_FLAG_TWO_PLAYER_GHOST = 16;
const GAME_FLAG_FINISHED = 32;

const ENTRY_FLAG_RECORDED = 1;
const ENTRY_FLAG_CANNONBALL = 2;
const ENTRY_FLAG_HAS_BONUS = 4;
const ENTRY_FLAG_HAS_LEGACY_LOOT = 8;

const BONUS_FLAG_BLACK14 = 1;
const BONUS_FLAG_MERMAID_SK = 2;
const BONUS_FLAG_SECOND = 4;

function bonusIsEmpty(bonus: BonusInput): boolean {
  return (
    bonus.colored14 === 0 &&
    !bonus.black14 &&
    bonus.mermaidByPirate === 0 &&
    bonus.pirateBySkullKing === 0 &&
    !bonus.mermaidCapturesSkullKing &&
    bonus.rascalWager === 0 &&
    bonus.expansion7 === 0 &&
    bonus.expansion8 === 0 &&
    bonus.davyJonesLeviathans === 0 &&
    !bonus.secondCaptured
  );
}

function writeEntry(writer: ByteWriter, entry: RoundEntry): void {
  const bonus = entry.bonus ?? emptyBonus();
  const legacyLoot = Math.max(0, Math.floor(entry.legacyLoot ?? 0));
  const hasBonus = !bonusIsEmpty(bonus);
  writer.u8(
    (entry.recorded ? ENTRY_FLAG_RECORDED : 0) |
      (entry.rascalBet === "cannonball" ? ENTRY_FLAG_CANNONBALL : 0) |
      (hasBonus ? ENTRY_FLAG_HAS_BONUS : 0) |
      (legacyLoot > 0 ? ENTRY_FLAG_HAS_LEGACY_LOOT : 0)
  );
  writer.varint(entry.bid);
  writer.varint(entry.tricks);
  if (hasBonus) {
    writer.u8(
      (bonus.black14 ? BONUS_FLAG_BLACK14 : 0) |
        (bonus.mermaidCapturesSkullKing ? BONUS_FLAG_MERMAID_SK : 0) |
        (bonus.secondCaptured ? BONUS_FLAG_SECOND : 0)
    );
    writer.u8(Math.round(bonus.rascalWager / 10));
    writer.varint(bonus.colored14);
    writer.varint(bonus.mermaidByPirate);
    writer.varint(bonus.pirateBySkullKing);
    writer.varint(bonus.expansion7);
    writer.varint(bonus.expansion8);
    writer.varint(bonus.davyJonesLeviathans);
  }
  if (legacyLoot > 0) writer.varint(legacyLoot);
}

function readEntry(reader: ByteReader): RoundEntry {
  const flags = reader.u8();
  const entry = emptyEntry();
  entry.recorded = (flags & ENTRY_FLAG_RECORDED) !== 0;
  entry.rascalBet =
    (flags & ENTRY_FLAG_CANNONBALL) !== 0 ? "cannonball" : "buckshot";
  entry.bid = reader.varint();
  entry.tricks = reader.varint();
  if ((flags & ENTRY_FLAG_HAS_BONUS) !== 0) {
    const bonusFlags = reader.u8();
    const wagerLevel = reader.u8();
    if (wagerLevel > 2) {
      throw new ShareCodeError("invalid_code", "Invalid wager in share code");
    }
    entry.bonus = {
      black14: (bonusFlags & BONUS_FLAG_BLACK14) !== 0,
      mermaidCapturesSkullKing: (bonusFlags & BONUS_FLAG_MERMAID_SK) !== 0,
      secondCaptured: (bonusFlags & BONUS_FLAG_SECOND) !== 0,
      rascalWager: (wagerLevel * 10) as BonusInput["rascalWager"],
      colored14: reader.varint(),
      mermaidByPirate: reader.varint(),
      pirateBySkullKing: reader.varint(),
      expansion7: reader.varint(),
      expansion8: reader.varint(),
      davyJonesLeviathans: reader.varint(),
    };
  }
  if ((flags & ENTRY_FLAG_HAS_LEGACY_LOOT) !== 0) {
    entry.legacyLoot = reader.varint();
  }
  return entry;
}

/** Stable spectator-side player ID for a seat (players never reorder mid-game). */
function sharedPlayerId(seatIndex: number): string {
  return `shared_p${seatIndex + 1}`;
}

/** Encode a game into a compact base64url share code. */
export function encodeShareCode(game: Game): string {
  if (
    game.players.length === 0 ||
    game.players.length > MAX_PLAYERS_PER_GAME ||
    game.rounds.length === 0 ||
    game.rounds.length > MAX_ROUNDS_PER_GAME
  ) {
    throw new ShareCodeError(
      "encode_failed",
      "This game is outside the shareable size limits"
    );
  }

  const writer = new ByteWriter();
  writer.u8(SHARE_CODEC_VERSION);
  writer.u8(
    (game.scoringMode === "rascal" ? GAME_FLAG_RASCAL_SCORING : 0) |
      (game.rascalBets ? GAME_FLAG_RASCAL_BETS : 0) |
      (game.advancedCards ? GAME_FLAG_ADVANCED_CARDS : 0) |
      (game.newExpansion ? GAME_FLAG_NEW_EXPANSION : 0) |
      (game.twoPlayerGhost ? GAME_FLAG_TWO_PLAYER_GHOST : 0) |
      (game.status === "finished" ? GAME_FLAG_FINISHED : 0)
  );
  writer.varint(Math.min(Math.max(game.currentRound, 1), game.rounds.length));
  writer.varint(Math.floor(game.createdAt / 1000));
  writer.varint(Math.floor(game.updatedAt / 1000));

  writer.varint(game.players.length);
  for (const player of game.players) writer.text(player.name);

  const roundCount = game.rounds.length;
  writer.varint(roundCount);
  for (let index = 0; index < roundCount; index++) {
    writer.varint(game.cardsDealt[index] ?? index + 1);
  }
  for (let index = 0; index < roundCount; index++) {
    writer.varint(game.discardedTricks[index] ?? 0);
  }
  for (let index = 0; index < roundCount; index++) {
    const round = game.rounds[index];
    for (const player of game.players) {
      writeEntry(writer, round?.[player.id] ?? emptyEntry());
    }
  }

  const seatByPlayerId = new Map(
    game.players.map((player, index) => [player.id, index])
  );
  const lootReference = (playerId: string | null): number => {
    if (playerId === null) return 0;
    const seat = seatByPlayerId.get(playerId);
    return seat === undefined ? 0 : seat + 1;
  };
  for (let index = 0; index < roundCount; index++) {
    const uses = (game.lootUses[index] ?? []).slice(0, 2);
    writer.varint(uses.length);
    for (const use of uses) {
      writer.varint(lootReference(use.playedById));
      writer.varint(lootReference(use.boundToId));
    }
  }

  return bytesToBase64Url(writer.bytes);
}

/**
 * Decode an untrusted share code into a validated, self-contained game.
 * Throws ShareCodeError when the code is malformed or fails validation.
 */
export function decodeShareCode(code: string): Game {
  if (typeof code !== "string" || code.length === 0) {
    throw new ShareCodeError("invalid_code", "Empty share code");
  }
  if (code.length > MAX_SHARE_CODE_CHARS) {
    throw new ShareCodeError("too_long", "Share code is too long");
  }

  const reader = new ByteReader(base64UrlToBytes(code));
  const version = reader.u8();
  if (version !== SHARE_CODEC_VERSION) {
    throw new ShareCodeError(
      "unsupported_version",
      `Unsupported share code version ${version}`
    );
  }

  const flags = reader.u8();
  const currentRound = reader.varint();
  const createdAtSec = reader.varint();
  const updatedAtSec = reader.varint();

  const playerCount = reader.varint();
  if (playerCount === 0 || playerCount > MAX_PLAYERS_PER_GAME) {
    throw new ShareCodeError("invalid_code", "Invalid player count");
  }
  const players = Array.from({ length: playerCount }, (_, seatIndex) => ({
    id: sharedPlayerId(seatIndex),
    // Byte cap: names are limited to 100 chars, 4 UTF-8 bytes max each.
    name: reader.text(400),
  }));

  const roundCount = reader.varint();
  if (roundCount === 0 || roundCount > MAX_ROUNDS_PER_GAME) {
    throw new ShareCodeError("invalid_code", "Invalid round count");
  }
  const cardsDealt = Array.from({ length: roundCount }, () => reader.varint());
  const discardedTricks = Array.from({ length: roundCount }, () =>
    reader.varint()
  );
  const rounds = Array.from({ length: roundCount }, () => {
    const round: Record<string, RoundEntry> = {};
    for (const player of players) round[player.id] = readEntry(reader);
    return round;
  });

  const lootUses: LootUse[][] = Array.from(
    { length: roundCount },
    (_, roundIndex) => {
      const count = reader.varint();
      if (count > 2) {
        throw new ShareCodeError("invalid_code", "Invalid Loot count");
      }
      return Array.from({ length: count }, (_ignored, useIndex) => {
        const readReference = (): string | null => {
          const reference = reader.varint();
          if (reference === 0) return null;
          if (reference > playerCount) {
            throw new ShareCodeError(
              "invalid_code",
              "Invalid Loot player reference"
            );
          }
          return sharedPlayerId(reference - 1);
        };
        return {
          id: `loot_${roundIndex + 1}_${useIndex + 1}`,
          playedById: readReference(),
          boundToId: readReference(),
        };
      });
    }
  );

  if (!reader.atEnd()) {
    throw new ShareCodeError("invalid_code", "Trailing data in share code");
  }

  const raw = {
    id: `shared_${createdAtSec}`,
    players,
    totalRounds: roundCount,
    currentRound,
    rounds,
    lootUses,
    discardedTricks,
    cardsDealt,
    scoringMode:
      (flags & GAME_FLAG_RASCAL_SCORING) !== 0 ? "rascal" : "classic",
    rascalBets: (flags & GAME_FLAG_RASCAL_BETS) !== 0,
    advancedCards: (flags & GAME_FLAG_ADVANCED_CARDS) !== 0,
    newExpansion: (flags & GAME_FLAG_NEW_EXPANSION) !== 0,
    twoPlayerGhost: (flags & GAME_FLAG_TWO_PLAYER_GHOST) !== 0,
    status: (flags & GAME_FLAG_FINISHED) !== 0 ? "finished" : "in_progress",
    createdAt: createdAtSec * 1000,
    updatedAt: updatedAtSec * 1000,
  };

  try {
    return normalizeUntrustedGame(raw, "shared");
  } catch (cause) {
    throw new ShareCodeError(
      "invalid_code",
      "Share code failed validation",
      { cause }
    );
  }
}

// --- URLs and the spectator session ----------------------------------------

/** Full URL to encode in the QR code: `<base>#skl=<code>`. */
export function buildShareUrl(game: Game, baseUrl: string): string {
  return `${baseUrl}#${SHARE_HASH_PARAM}=${encodeShareCode(game)}`;
}

/**
 * The address players should land on: this page, without query or hash. On
 * the deployed PWA that is the GitHub Pages sub-path; in dev, localhost.
 */
export function webShareBaseUrl(): string | null {
  if (typeof window === "undefined" || !window.location) return null;
  return `${window.location.origin}${window.location.pathname}`;
}

/** Extract the share code from a location hash, or null if it has none. */
export function extractShareCode(hash: string | null | undefined): string | null {
  if (!hash) return null;
  const prefix = `${SHARE_HASH_PARAM}=`;
  const trimmed = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!trimmed.startsWith(prefix)) return null;
  const code = trimmed.slice(prefix.length);
  return code.length > 0 ? code : null;
}

/**
 * Remove the share payload from the address bar so it never reaches
 * analytics, bookmarks, or the user's history — the code lives in
 * sessionStorage from here on.
 */
export function stripShareHashFromLocation(): void {
  if (typeof window === "undefined" || !window.history?.replaceState) return;
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${window.location.search}`
  );
}

export function saveSpectatorSessionCode(code: string): void {
  try {
    window.sessionStorage.setItem(SPECTATOR_SESSION_KEY, code);
  } catch {
    // Reloads simply leave spectator mode when sessionStorage is unavailable.
  }
}

export function loadSpectatorSessionCode(): string | null {
  try {
    return window.sessionStorage.getItem(SPECTATOR_SESSION_KEY);
  } catch {
    return null;
  }
}

export function clearSpectatorSessionCode(): void {
  try {
    window.sessionStorage.removeItem(SPECTATOR_SESSION_KEY);
  } catch {
    // Nothing to clear.
  }
}

export interface SpectatorBoot {
  game: Game | null;
  /** True when a share code was present but could not be decoded. */
  invalid: boolean;
}

/**
 * If the current URL hash carries a share code (the page was just opened from
 * a scanned QR code), consume it: strip it from the address bar, remember it
 * for reloads, and decode it. Returns null when the hash has no share code.
 */
export function consumeScannedShareCode(): SpectatorBoot | null {
  if (typeof window === "undefined" || !window.location) return null;
  const scanned = extractShareCode(window.location.hash);
  if (!scanned) return null;
  stripShareHashFromLocation();
  try {
    const game = decodeShareCode(scanned);
    saveSpectatorSessionCode(scanned);
    return { game, invalid: false };
  } catch {
    clearSpectatorSessionCode();
    return { game: null, invalid: true };
  }
}

/**
 * Resolve the spectator state for this page load: a fresh scan in the URL
 * hash wins, then a snapshot kept in sessionStorage (page reload). Called
 * synchronously before first paint so the hash can be stripped before any
 * analytics script observes the URL.
 */
export function readSpectatorBoot(): SpectatorBoot {
  const scanned = consumeScannedShareCode();
  if (scanned) return scanned;
  const stored = loadSpectatorSessionCode();
  if (stored) {
    try {
      return { game: decodeShareCode(stored), invalid: false };
    } catch {
      clearSpectatorSessionCode();
    }
  }
  return { game: null, invalid: false };
}
