import { CloudOwner, TableMembership } from "./storage";
import { normalizeTableName } from "./backup";

/**
 * Membership bookkeeping for the shared game tables a device belongs to.
 *
 * A player often has several crews (family, friday-night friends, …). Each
 * crew is one cloud row with its own history and leaderboard, and this device
 * keeps a list of the ones it can open, exactly one of which is active. These
 * helpers are pure so the switching rules can be tested without a backend.
 */

/** The credentials half of a membership, for the cloud manager. */
export function membershipOwner(membership: TableMembership): CloudOwner {
  return { ownerId: membership.ownerId, writerKey: membership.writerKey };
}

export function findMembership(
  memberships: readonly TableMembership[],
  ownerId: string | null | undefined
): TableMembership | null {
  if (!ownerId) return null;
  const wanted = ownerId.toLowerCase();
  return (
    memberships.find((entry) => entry.ownerId.toLowerCase() === wanted) ?? null
  );
}

/**
 * Add a table, or refresh the credentials/name of one already known. Existing
 * entries keep their position so the list does not reshuffle under the user;
 * a name is only overwritten by a non-empty one, so joining a table that has
 * not been named yet never wipes a local label.
 */
export function upsertMembership(
  memberships: readonly TableMembership[],
  membership: TableMembership
): TableMembership[] {
  const ownerId = membership.ownerId.toLowerCase();
  const name = normalizeTableName(membership.name);
  const existing = findMembership(memberships, ownerId);
  if (!existing) {
    return [...memberships, { ...membership, ownerId, name }];
  }
  return memberships.map((entry) =>
    entry.ownerId.toLowerCase() === ownerId
      ? {
          ownerId,
          writerKey: membership.writerKey,
          name: name ?? entry.name,
        }
      : entry
  );
}

/** Set (or clear, with null) the name of one table. */
export function renameMembership(
  memberships: readonly TableMembership[],
  ownerId: string,
  name: string | null
): TableMembership[] {
  const wanted = ownerId.toLowerCase();
  return memberships.map((entry) =>
    entry.ownerId.toLowerCase() === wanted
      ? { ...entry, name: normalizeTableName(name) }
      : entry
  );
}

/**
 * Forget a table on this device. The table itself is untouched server-side,
 * so the crew keeps playing and an invite can bring it back later.
 */
export function removeMembership(
  memberships: readonly TableMembership[],
  ownerId: string
): TableMembership[] {
  const wanted = ownerId.toLowerCase();
  return memberships.filter((entry) => entry.ownerId.toLowerCase() !== wanted);
}

/**
 * Which table to fall back to after removing `ownerId`, or null when the
 * removed one was not active (the active table simply stays) or nothing is
 * left. Never returns the table being removed.
 */
export function nextActiveAfterRemoval(
  memberships: readonly TableMembership[],
  ownerId: string,
  activeOwnerId: string | null
): TableMembership | null {
  const wanted = ownerId.toLowerCase();
  if (!activeOwnerId || activeOwnerId.toLowerCase() !== wanted) return null;
  return removeMembership(memberships, ownerId)[0] ?? null;
}
