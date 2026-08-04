/**
 * Contract tests for deterministic App Store screenshot fixtures and assets.
 * Run with: npm run test:app-store-screenshots
 */
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseBackup, serializeBackup } from "../src/backup";
import { ghostTricks, isRoundComplete, standings } from "../src/scoring";
import {
  aggregateStats,
  gameAwards,
  MIN_RATED_ROUNDS,
  MIN_ZERO_BIDS,
} from "../src/stats";
import { playOrder } from "../src/turnOrder";
import {
  APP_STORE_FIXTURE_EPOCH,
  createAppStoreScreenshotFixture,
  createAppStoreScreenshotSeed,
} from "../src/appStoreScreenshotFixture";
import {
  APP_STORE_SCREENSHOT_DEVICES,
  APP_STORE_SCREENSHOT_LOCALES,
  APP_STORE_SCREENSHOT_SHOTS,
  finalScreenshotPath,
} from "./app-store-screenshots/contracts";
import {
  asyncStorageFileName,
  buildAsyncStorageLayout,
  writeAsyncStorageLayout,
} from "./app-store-screenshots/asyncStorageIos";
import {
  assertCaptureSimulatorName,
  buildSeedEntries,
} from "./app-store-screenshots/seedSimulator";

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

function eq<T>(label: string, actual: T, expected: T) {
  if (Object.is(actual, expected)) {
    passed++;
    console.log(`  ✓ ${label} = ${String(actual)}`);
  } else {
    failed++;
    console.error(
      `  ✗ ${label}: expected ${String(expected)}, got ${String(actual)}`
    );
  }
}

function deepEq(label: string, actual: unknown, expected: unknown) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson === expectedJson) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}: expected ${expectedJson}, got ${actualJson}`);
  }
}

function throws(label: string, action: () => void, message: RegExp) {
  try {
    action();
    failed++;
    console.error(`  ✗ ${label}: expected an error`);
  } catch (error) {
    const actual = error instanceof Error ? error.message : String(error);
    check(label, message.test(actual));
  }
}

function section(title: string) {
  console.log(`\n${title}`);
}

section("Screenshot contract");
eq("English and French only", APP_STORE_SCREENSHOT_LOCALES.join(","), "en,fr");
deepEq("phone dimensions", APP_STORE_SCREENSHOT_DEVICES["iphone-6.9"], {
  width: 1320,
  height: 2868,
});
deepEq("tablet dimensions", APP_STORE_SCREENSHOT_DEVICES["ipad-13"], {
  width: 2064,
  height: 2752,
});
eq("eight unique shot stems", new Set(APP_STORE_SCREENSHOT_SHOTS.map((shot) => shot.stem)).size, 8);
deepEq(
  "English headlines",
  APP_STORE_SCREENSHOT_SHOTS.map((shot) => shot.headline.en),
  [
    "Score every round. We do the math.",
    "Everyone follows the scores live.",
    "Crown the winner.",
    "Build your crew’s hall of fame.",
    "One crew. One shared ledger.",
    "Classic, Rascal and expansion cards.",
    "Two players? Summon Greybeard’s Ghost.",
    "Every round saved. Offline. Ad-free.",
  ]
);
deepEq(
  "French headlines",
  APP_STORE_SCREENSHOT_SHOTS.map((shot) => shot.headline.fr),
  [
    "Notez chaque manche. On fait les calculs.",
    "Tout l’équipage suit les scores en direct.",
    "Couronnez le vainqueur.",
    "Créez le palmarès de votre équipage.",
    "Un équipage. Un carnet partagé.",
    "Classique, Rascal et cartes d’extension.",
    "À deux ? Invoquez le fantôme Barbe Grise.",
    "Chaque manche sauvegardée. Hors ligne. Sans pub.",
  ]
);

const finalPaths = APP_STORE_SCREENSHOT_LOCALES.flatMap((locale) =>
  Object.keys(APP_STORE_SCREENSHOT_DEVICES).flatMap((device) =>
    APP_STORE_SCREENSHOT_SHOTS.map((shot) =>
      finalScreenshotPath(
        "marketing/app-store/screenshots",
        locale,
        device as keyof typeof APP_STORE_SCREENSHOT_DEVICES,
        shot.stem
      )
    )
  )
);
eq("thirty-two unique final paths", new Set(finalPaths).size, 32);
check(
  "French iPad Greybeard path",
  finalPaths.includes(
    "marketing/app-store/screenshots/fr-FR/ipad-13/07-greybeards-ghost.png"
  )
);

section("Deterministic fixture");
const english = createAppStoreScreenshotFixture("en");
const french = createAppStoreScreenshotFixture("fr");
const englishAgain = createAppStoreScreenshotFixture("en");
eq("fixture epoch is fixed", APP_STORE_FIXTURE_EPOCH, 1785866400000);
eq("English table name", english.tableName, "Friday Night Crew");
eq("French table name", french.tableName, "L’équipage du vendredi");
check(
  "two English builds serialize identically",
  JSON.stringify(english) === JSON.stringify(englishAgain)
);

const withoutLocaleCopy = (fixture: typeof english) => ({
  history: fixture.history,
  activeGame: fixture.activeGame,
  greybeardGame: fixture.greybeardGame,
  featuredFinishedGameId: fixture.featuredFinishedGameId,
});
deepEq("game data is locale-independent", withoutLocaleCopy(english), withoutLocaleCopy(french));
eq("twelve finished games", english.history.length, 12);
eq("twelve unique history ids", new Set(english.history.map((game) => game.id)).size, 12);
eq("featured result is newest fixture game", english.featuredFinishedGameId, "app-store-finished-12");

check(
  "all history games are finished four-player ten-round games",
  english.history.every(
    (game) =>
      game.status === "finished" &&
      game.players.length === 4 &&
      game.totalRounds === 10 &&
      game.rounds.length === 10
  )
);
check(
  "every finished entry is recorded",
  english.history.every((game) =>
    game.rounds.every((round) =>
      game.players.every((player) => round[player.id]?.recorded === true)
    )
  )
);
check(
  "every finished round accounts for all dealt tricks",
  english.history.every((game) =>
    game.rounds.every((round, index) => {
      const tricks = game.players.reduce(
        (total, player) => total + round[player.id].tricks,
        0
      );
      return tricks + game.discardedTricks[index] === game.cardsDealt[index];
    })
  )
);
check(
  "every finished game has one winner",
  english.history.every(
    (game) => standings(game).filter((row) => row.rank === 1).length === 1
  )
);

section("Statistics and featured result");
const snapshot = aggregateStats(english.history);
deepEq("crew summary", snapshot.summary, {
  totalGames: 12,
  totalRounds: 120,
  totalPlunder: 17760,
  totalPlayers: 4,
});
const winsByName = new Map(
  snapshot.players.map((player) => [player.name, player.wins])
);
eq("Camille wins", winsByName.get("Camille"), 5);
eq("Alex wins", winsByName.get("Alex"), 3);
eq("Morgan wins", winsByName.get("Morgan"), 2);
eq("Sam wins", winsByName.get("Sam"), 2);
check(
  "every player clears both record gates",
  snapshot.players.every(
    (player) =>
      player.roundsPlayed >= MIN_RATED_ROUNDS &&
      player.zeroBids.attempts >= MIN_ZERO_BIDS
  )
);
check("exact-bid record is populated", snapshot.records.bestExactBidRate !== null);
check("zero-bid record is populated", snapshot.records.zeroBidMaster !== null);

const featured = english.history.find(
  (game) => game.id === english.featuredFinishedGameId
);
check("featured result exists", featured !== undefined);
if (featured) {
  eq("featured winner is Camille", standings(featured)[0]?.player.name, "Camille");
  check("featured result has several awards", gameAwards(featured).length >= 3);
}

section("Active game");
eq("active game id", english.activeGame.id, "app-store-active");
eq("active game is round five", english.activeGame.currentRound, 5);
check(
  "active rounds one through four are complete",
  [1, 2, 3, 4].every((round) => isRoundComplete(english.activeGame, round))
);
check("active round five is provisional", !isRoundComplete(english.activeGame, 5));
eq("active round has one Loot alliance", english.activeGame.lootUses[4].length, 1);
deepEq("active round five tricks", english.activeGame.players.map((player) => english.activeGame.rounds[4][player.id].tricks), [1, 2, 0, 2]);

section("Greybeard game");
const greybeard = english.greybeardGame;
eq("Greybeard game id", greybeard.id, "app-store-greybeard");
eq("only two real players", greybeard.players.length, 2);
check("two-player variant is enabled", greybeard.twoPlayerGhost);
const greybeardRound = greybeard.rounds[4];
const realTricks = greybeard.players.reduce(
  (total, player) => total + greybeardRound[player.id].tricks,
  0
);
eq("Greybeard takes two round-five tricks", ghostTricks(greybeard, realTricks, 5), 2);
deepEq(
  "round-five play order puts Greybeard second",
  playOrder(greybeard, 5).map((slot) =>
    slot.kind === "ghost" ? "Greybeard" : slot.player.name
  ),
  ["Camille", "Greybeard", "Alex"]
);
check("Greybeard is never a scoring player", greybeard.players.every((player) => player.name !== "Greybeard"));

section("Scenario seeds and backup round trip");
const activeSeed = createAppStoreScreenshotSeed("en", "active");
const ghostSeed = createAppStoreScreenshotSeed("fr", "greybeard");
const resultsSeed = createAppStoreScreenshotSeed("en", "featured-results");
eq("active scenario points at active game", activeSeed.currentGame.id, "app-store-active");
eq("Greybeard scenario points at ghost game", ghostSeed.currentGame.id, "app-store-greybeard");
eq("results scenario points at featured game", resultsSeed.currentGame.id, "app-store-finished-12");
eq("seed history stays finished-only", activeSeed.history.length, 12);
check("support prompt is suppressed", activeSeed.supportPrompt.optedOut);
eq("seed release is current", activeSeed.seenRelease, "1.11.1");

const parsed = parseBackup(serializeBackup(activeSeed, APP_STORE_FIXTURE_EPOCH));
eq("backup current game survives", parsed.currentGame?.id, "app-store-active");
eq("backup history survives", parsed.history.length, 12);
eq("backup table name survives", parsed.tableName, "Friday Night Crew");

section("iOS AsyncStorage layout");
const inlineValue = "x".repeat(1024);
const externalValue = "y".repeat(1025);
const storageLayout = buildAsyncStorageLayout({
  "fixture:inline": inlineValue,
  "fixture:external": externalValue,
});
check(
  "a 1024-character value stays inline",
  storageLayout.manifest["fixture:inline"] === inlineValue
);
eq(
  "a 1025-character value moves outside the manifest",
  storageLayout.manifest["fixture:external"],
  null
);
check(
  "external content is preserved",
  storageLayout.files.get(asyncStorageFileName("fixture:external")) ===
    externalValue
);
eq(
  "current-game filename is lowercase MD5",
  asyncStorageFileName("skullking:currentGame"),
  "23de68dede465d087edb3ffd085091cd"
);
check(
  "every generated filename is lowercase hexadecimal",
  [...storageLayout.files.keys()].every((name) => /^[0-9a-f]{32}$/.test(name))
);

const temporaryContainer = mkdtempSync(
  join(tmpdir(), "skull-king-async-storage-")
);
try {
  writeAsyncStorageLayout(
    temporaryContainer,
    "com.gabrielcretin.skullking",
    {
      "fixture:inline": inlineValue,
      "fixture:external": externalValue,
    }
  );
  const storageDirectory = join(
    temporaryContainer,
    "Library",
    "Application Support",
    "com.gabrielcretin.skullking",
    "RCTAsyncLocalStorage_V1"
  );
  const writtenManifest = JSON.parse(
    readFileSync(join(storageDirectory, "manifest.json"), "utf8")
  );
  deepEq("manifest is written at the exact native path", writtenManifest, {
    "fixture:inline": inlineValue,
    "fixture:external": null,
  });
  check(
    "external value is written at the exact native path",
    readFileSync(
      join(storageDirectory, asyncStorageFileName("fixture:external")),
      "utf8"
    ) === externalValue
  );
  check(
    "no legacy AsyncStorage directory is created",
    !existsSync(join(temporaryContainer, "RCTAsyncLocalStorage_V1"))
  );
} finally {
  rmSync(temporaryContainer, { recursive: true, force: true });
}

section("Guarded Simulator seed");
throws(
  "ordinary simulators are refused",
  () => assertCaptureSimulatorName("iPhone 17 Pro Max"),
  /Skull King Capture /
);
assertCaptureSimulatorName("Skull King Capture iPhone 17 Pro Max");
check("dedicated capture simulator is accepted", true);

const seedEntries = buildSeedEntries({ locale: "fr", scenario: "greybeard" });
const expectedSeedKeys = [
  "skullking:cloudOwner",
  "skullking:currentGame",
  "skullking:gameDeletions",
  "skullking:gameHistory",
  "skullking:lang",
  "skullking:seenRelease",
  "skullking:settings",
  "skullking:supportPrompt",
  "skullking:tableName",
  "skullking:tables",
];
deepEq("seed writes the exact ten-key set", Object.keys(seedEntries).sort(), expectedSeedKeys);
eq("seed language", seedEntries["skullking:lang"], "fr");
eq(
  "seed current game",
  JSON.parse(seedEntries["skullking:currentGame"]).id,
  "app-store-greybeard"
);
const fakeOwner = JSON.parse(seedEntries["skullking:cloudOwner"]);
deepEq("seed uses the non-production table owner", fakeOwner, {
  ownerId: "00000000-0000-4000-8000-000000000111",
  writerKey: "7".repeat(64),
});
deepEq("table membership matches the fake owner", JSON.parse(seedEntries["skullking:tables"]), [
  {
    ...fakeOwner,
    name: "L’équipage du vendredi",
  },
]);

const seedFileNames: Record<string, string> = {
  "skullking:currentGame": "23de68dede465d087edb3ffd085091cd",
  "skullking:gameHistory": "ae61df700b16e324c47167cd29307fe1",
  "skullking:gameDeletions": "770a39b70d6dede264461c66545b38d0",
  "skullking:lang": "879adda3a78cbfeab7420ff9d1d33418",
  "skullking:seenRelease": "aad16e0dfe5f2bd16bff3658acb22478",
  "skullking:settings": "c36c0fd69bb47d212326ec95a7f4fa48",
  "skullking:supportPrompt": "c8a89cb6b811af97bdcdec6d3426f526",
  "skullking:tableName": "43ad2a37e67ffcce639fa596c8ccb677",
  "skullking:tables": "7e3594786f3d82501220bb90e209e3b5",
  "skullking:cloudOwner": "be51e2486c1d835a13887a01164428e1",
};
for (const [key, expectedFileName] of Object.entries(seedFileNames)) {
  eq(`${key} filename`, asyncStorageFileName(key), expectedFileName);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
