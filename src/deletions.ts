/**
 * Deletion tombstones for a shared game table.
 *
 * Every member's device keeps its own copy of the table's history and merges it
 * with the cloud row on launch. That merge is a union — it has to be, so two
 * phones scoring at the same table never erase each other's games — which means
 * removing a game locally is not enough: the next device to sync still holds
 * its copy, pushes it straight back, and the game reappears for the whole crew.
 *
 * A tombstone records "this game id was deleted at this moment" and travels
 * inside the same payload as the games, so a deletion converges instead of
 * being undone. A game revision newer than the tombstone still wins: if
 * somebody kept scoring that game after the deletion, those rounds are real
 * data and must not disappear under a stale delete.
 */

/** Deleted game IDs mapped to when they were deleted (epoch ms). */
export type GameDeletions = Record<string, number>;

/**
 * Tombstones are tiny, but the payload has a hard size budget and they would
 * otherwise grow forever. The most recent ones are kept: the older a deletion
 * is, the more likely every device has long since applied it.
 */
export const MAX_DELETIONS = 500;

/** Same identifier cap as the backup format applies to game IDs. */
const MAX_DELETION_ID_LENGTH = 200;

function isTimestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Tombstone maps have no prototype: game IDs come from other devices, and on a
 * plain object an id of "__proto__" would go to the inherited setter instead of
 * becoming an entry — losing the tombstone, and letting that game come back.
 * JSON serialization is unchanged.
 */
function emptyDeletions(): GameDeletions {
  return Object.create(null) as GameDeletions;
}

/**
 * Validate an untrusted tombstone map (cloud row, backup file, local store).
 * Unusable entries are dropped rather than rejected: a tombstone is metadata
 * about games, and a malformed one must never cost the user their games.
 */
export function normalizeDeletions(raw: unknown): GameDeletions {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return emptyDeletions();
  }
  const entries: [string, number][] = [];
  // Own enumerable keys only, so a "__proto__" entry is data, not a prototype.
  for (const [id, deletedAt] of Object.entries(raw)) {
    if (id.length === 0 || id.length > MAX_DELETION_ID_LENGTH) continue;
    if (!isTimestamp(deletedAt)) continue;
    entries.push([id, deletedAt]);
  }
  if (entries.length > MAX_DELETIONS) {
    entries.sort((a, b) =>
      a[1] === b[1] ? compareText(a[0], b[0]) : b[1] - a[1]
    );
    entries.length = MAX_DELETIONS;
  }
  // Key order is stable regardless of how the entries arrived, so the same set
  // of tombstones always serializes to the same JSON.
  entries.sort((a, b) => compareText(a[0], b[0]));
  return Object.assign(emptyDeletions(), Object.fromEntries(entries));
}

/** Lookup table for the merge, safe against ids like "constructor". */
export function deletionTimes(
  deletions: GameDeletions | null | undefined
): Map<string, number> {
  return new Map(deletions ? Object.entries(deletions) : []);
}

/**
 * Whether a game outlives the tombstones: either none covers it, or it carries
 * a revision written after the deletion (somebody kept playing it).
 */
export function survivesDeletion(
  game: { id: string; updatedAt: number },
  times: Map<string, number>
): boolean {
  const deletedAt = times.get(game.id);
  return deletedAt === undefined || game.updatedAt > deletedAt;
}

/**
 * Union of two tombstone sets. The later deletion wins for a given game: it is
 * the most recent intent, and it also covers the revisions the earlier one
 * could not.
 */
export function mergeDeletions(
  a: GameDeletions | null | undefined,
  b: GameDeletions | null | undefined
): GameDeletions {
  const merged = Object.assign(emptyDeletions(), normalizeDeletions(a));
  for (const [id, deletedAt] of Object.entries(normalizeDeletions(b))) {
    const existing = merged[id];
    if (existing === undefined || deletedAt > existing) merged[id] = deletedAt;
  }
  return normalizeDeletions(merged);
}

/**
 * Drop the tombstones covering these game IDs. Restoring a backup file is a
 * deliberate "bring these games back" action, so it has to outrank an earlier
 * deletion — unlike a background cloud merge, which must respect it.
 */
export function forgetDeletions(
  existing: GameDeletions | null | undefined,
  gameIds: readonly string[]
): GameDeletions {
  const kept = normalizeDeletions(existing);
  for (const id of gameIds) delete kept[id];
  return kept;
}

/** Add tombstones for the games just deleted on this device. */
export function recordDeletions(
  existing: GameDeletions | null | undefined,
  gameIds: readonly string[],
  deletedAt: number
): GameDeletions {
  const added = emptyDeletions();
  for (const id of gameIds) added[id] = deletedAt;
  return mergeDeletions(existing, added);
}
