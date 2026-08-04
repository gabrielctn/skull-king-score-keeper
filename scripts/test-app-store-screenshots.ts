/**
 * Contract tests for deterministic App Store screenshot fixtures and assets.
 * Run with: npm run test:app-store-screenshots
 */
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
    JSON.stringify(english) === JSON.stringify(englishAgain),
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

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
