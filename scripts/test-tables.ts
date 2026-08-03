/**
 * Membership bookkeeping for the shared game tables a device belongs to:
 * adding, renaming, removing, and choosing the fallback after a removal.
 * Run with: npm run test:tables
 */
import {
  findMembership,
  membershipOwner,
  nextActiveAfterRemoval,
  removeMembership,
  renameMembership,
  upsertMembership,
} from "../src/tables";
import { normalizeTableMemberships, TableMembership } from "../src/storage";

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}`);
  }
}

function section(title: string) {
  console.log(`\n${title}`);
}

const uuid = (n: number) =>
  `0000000${n}-0000-4000-8000-00000000000${n}`.slice(0, 36);
const key = (c: string) => c.repeat(48);

const family: TableMembership = {
  ownerId: uuid(1),
  writerKey: key("a"),
  name: "Family",
};
const friends: TableMembership = {
  ownerId: uuid(2),
  writerKey: key("b"),
  name: "Friday crew",
};

section("Adding and finding tables");
const two = upsertMembership(upsertMembership([], family), friends);
check("both crews are kept", two.length === 2);
check("order is insertion order", two[0].name === "Family");
check("lookup finds a table", findMembership(two, friends.ownerId)?.name === "Friday crew");
check(
  "lookup is case-insensitive on the id",
  findMembership(two, friends.ownerId.toUpperCase())?.name === "Friday crew"
);
check("lookup of an unknown id is null", findMembership(two, uuid(9)) === null);
check("lookup of null is null", findMembership(two, null) === null);
check(
  "owner extraction keeps the credentials only",
  JSON.stringify(membershipOwner(family)) ===
    JSON.stringify({ ownerId: family.ownerId, writerKey: family.writerKey })
);

section("Re-joining a table already known");
const rejoined = upsertMembership(two, {
  ownerId: family.ownerId.toUpperCase(),
  writerKey: key("c"),
  name: "Family renamed",
});
check("no duplicate row is created", rejoined.length === 2);
check("the row keeps its position", rejoined[0].ownerId === family.ownerId);
check("fresh credentials win", rejoined[0].writerKey === key("c"));
check("a non-empty name updates the label", rejoined[0].name === "Family renamed");
check(
  "an empty name never wipes the known label",
  upsertMembership(two, { ...family, name: "   " })[0].name === "Family"
);
check(
  "a name is trimmed and bounded on the way in",
  upsertMembership([], { ...family, name: `  ${"x".repeat(80)}  ` })[0].name ===
    "x".repeat(60)
);

section("Renaming and removing");
check(
  "rename targets one table",
  renameMembership(two, friends.ownerId, "Poker night")[1].name === "Poker night"
);
check(
  "rename leaves the others alone",
  renameMembership(two, friends.ownerId, "Poker night")[0].name === "Family"
);
check(
  "rename to null clears the label",
  renameMembership(two, family.ownerId, null)[0].name === null
);
check(
  "removal drops exactly one table",
  removeMembership(two, family.ownerId).length === 1 &&
    removeMembership(two, family.ownerId)[0].ownerId === friends.ownerId
);
check(
  "removing an unknown table changes nothing",
  removeMembership(two, uuid(9)).length === 2
);

section("Fallback table after a removal");
check(
  "removing the active table falls back to another one",
  nextActiveAfterRemoval(two, family.ownerId, family.ownerId)?.ownerId ===
    friends.ownerId
);
check(
  "removing an inactive table keeps the active one",
  nextActiveAfterRemoval(two, friends.ownerId, family.ownerId) === null
);
check(
  "removing the only table has no fallback",
  nextActiveAfterRemoval([family], family.ownerId, family.ownerId) === null
);
check(
  "case differences still match the active table",
  nextActiveAfterRemoval(two, family.ownerId.toUpperCase(), family.ownerId)
    ?.ownerId === friends.ownerId
);

section("Hardening a stored membership list");
check("a non-array becomes empty", normalizeTableMemberships("nope").length === 0);
check(
  "valid rows survive a round-trip",
  normalizeTableMemberships(JSON.parse(JSON.stringify(two))).length === 2
);
check(
  "rows with a bad owner id are dropped",
  normalizeTableMemberships([{ ownerId: "not-a-uuid", writerKey: key("a") }])
    .length === 0
);
check(
  "rows with a too-short writer key are dropped",
  normalizeTableMemberships([{ ownerId: uuid(1), writerKey: "abc" }]).length === 0
);
check(
  "duplicate ids collapse to the first row",
  normalizeTableMemberships([family, { ...family, name: "Copy" }]).length === 1
);
check(
  "a non-string name becomes null",
  normalizeTableMemberships([{ ...family, name: 42 }])[0].name === null
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
