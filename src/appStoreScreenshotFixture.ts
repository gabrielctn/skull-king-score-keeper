import type { BackupData } from "./backup";
import { normalizeUntrustedGame } from "./backup";
import type { Lang } from "./i18n/types";
import { CURRENT_RELEASE } from "./releases";
import { createGame, emptyBonus } from "./scoring";
import type { AppSettings } from "./storage";
import type { SupportPromptState } from "./support";
import type { BonusInput, Game, Player, RoundEntry } from "./types";

export const APP_STORE_FIXTURE_EPOCH = Date.parse(
  "2026-08-04T18:00:00.000Z"
);

export const APP_STORE_FIXTURE_SCENARIOS = [
  "active",
  "greybeard",
  "featured-results",
] as const;

export type AppStoreFixtureLocale = Extract<Lang, "en" | "fr">;
export type AppStoreFixtureScenario =
  (typeof APP_STORE_FIXTURE_SCENARIOS)[number];

export interface AppStoreScreenshotFixture {
  locale: AppStoreFixtureLocale;
  tableName: string;
  history: Game[];
  activeGame: Game;
  greybeardGame: Game;
  featuredFinishedGameId: string;
}

export interface AppStoreScreenshotSeed extends BackupData {
  scenario: AppStoreFixtureScenario;
  locale: AppStoreFixtureLocale;
  currentGame: Game;
  history: Game[];
  tableName: string;
  settings: AppSettings;
  seenRelease: string;
  supportPrompt: SupportPromptState;
}

const TABLE_NAMES: Readonly<Record<AppStoreFixtureLocale, string>> = {
  en: "Friday Night Crew",
  fr: "L’équipage du vendredi",
};

const PLAYERS: readonly Player[] = [
  { id: "alex", name: "Alex" },
  { id: "camille", name: "Camille" },
  { id: "morgan", name: "Morgan" },
  { id: "sam", name: "Sam" },
];

const WINNERS = [
  "camille",
  "alex",
  "camille",
  "morgan",
  "sam",
  "camille",
  "alex",
  "morgan",
  "sam",
  "camille",
  "alex",
  "camille",
] as const;

const FINISHED_GAME_BONUSES: readonly Partial<BonusInput>[] = [
  { colored14: 1 },
  { black14: true },
  { mermaidByPirate: 1 },
  { pirateBySkullKing: 1 },
  { mermaidCapturesSkullKing: true },
  { davyJonesLeviathans: 1 },
  { secondCaptured: true },
  { expansion8: 2 },
  { colored14: 2 },
  { black14: true, mermaidByPirate: 1 },
  { pirateBySkullKing: 2 },
  { mermaidCapturesSkullKing: true, black14: true },
];

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

function players(): Player[] {
  return PLAYERS.map((player) => ({ ...player }));
}

function entry(
  bid: number,
  tricks: number,
  bonus: Partial<BonusInput> = {},
  recorded = true
): RoundEntry {
  return {
    bid,
    tricks,
    bonus: { ...emptyBonus(), ...bonus },
    legacyLoot: 0,
    recorded,
    rascalBet: "buckshot",
  };
}

function finishedGame(index: number): Game {
  const game = createGame(players(), 10, true, false, true);
  const winnerId = WINNERS[index];
  const nonWinners = game.players.filter((player) => player.id !== winnerId);
  const playedAt = APP_STORE_FIXTURE_EPOCH - (11 - index) * WEEK_MS;

  game.id = `app-store-finished-${String(index + 1).padStart(2, "0")}`;
  game.status = "finished";
  game.currentRound = 10;
  game.createdAt = playedAt - 2 * HOUR_MS;
  game.finishedAt = playedAt;
  game.updatedAt = playedAt;

  for (let roundNumber = 1; roundNumber <= game.totalRounds; roundNumber++) {
    const zeroBidder = nonWinners[roundNumber % nonWinners.length];
    const round = game.rounds[roundNumber - 1];
    for (const player of game.players) {
      if (player.id === winnerId) {
        round[player.id] = entry(
          roundNumber,
          roundNumber,
          roundNumber === 8 ? FINISHED_GAME_BONUSES[index] : {}
        );
      } else if (player.id === zeroBidder.id) {
        round[player.id] = entry(0, 0);
      } else {
        round[player.id] = entry(1, 0);
      }
    }
  }

  return normalizeUntrustedGame(game, game.id);
}

function activeGame(): Game {
  const game = createGame(players(), 10, true, false, true);
  const trickVectors = [
    [1, 0, 0, 0],
    [0, 1, 1, 0],
    [1, 0, 0, 2],
    [1, 1, 2, 0],
  ];

  game.id = "app-store-active";
  game.currentRound = 5;
  game.createdAt = APP_STORE_FIXTURE_EPOCH + HOUR_MS;
  game.updatedAt = APP_STORE_FIXTURE_EPOCH + 2 * HOUR_MS;

  for (let roundIndex = 0; roundIndex < trickVectors.length; roundIndex++) {
    for (let playerIndex = 0; playerIndex < game.players.length; playerIndex++) {
      const player = game.players[playerIndex];
      const tricks = trickVectors[roundIndex][playerIndex];
      game.rounds[roundIndex][player.id] = entry(tricks, tricks);
    }
  }

  game.rounds[4] = {
    alex: entry(2, 1, {}, false),
    camille: entry(2, 2, { colored14: 1, black14: true }, false),
    morgan: entry(0, 0, {}, false),
    sam: entry(1, 2, {}, false),
  };
  game.lootUses[4] = [
    {
      id: "app-store-active-loot-r5",
      playedById: "camille",
      boundToId: "morgan",
    },
  ];

  return normalizeUntrustedGame(game, game.id);
}

function greybeardGame(): Game {
  const game = createGame(players().slice(0, 2), 10, false, true, true);
  const trickVectors = [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ];

  game.id = "app-store-greybeard";
  game.currentRound = 5;
  game.createdAt = APP_STORE_FIXTURE_EPOCH + 3 * HOUR_MS;
  game.updatedAt = APP_STORE_FIXTURE_EPOCH + 4 * HOUR_MS;

  for (let roundIndex = 0; roundIndex < trickVectors.length; roundIndex++) {
    for (let playerIndex = 0; playerIndex < game.players.length; playerIndex++) {
      const player = game.players[playerIndex];
      const tricks = trickVectors[roundIndex][playerIndex];
      game.rounds[roundIndex][player.id] = entry(tricks, tricks);
    }
  }

  game.rounds[4] = {
    alex: entry(2, 2, { colored14: 1 }, false),
    camille: entry(1, 1, {}, false),
  };

  return normalizeUntrustedGame(game, game.id);
}

export function createAppStoreScreenshotFixture(
  locale: AppStoreFixtureLocale
): AppStoreScreenshotFixture {
  return {
    locale,
    tableName: TABLE_NAMES[locale],
    history: WINNERS.map((_, index) => finishedGame(index)),
    activeGame: activeGame(),
    greybeardGame: greybeardGame(),
    featuredFinishedGameId: "app-store-finished-12",
  };
}

export function createAppStoreScreenshotSeed(
  locale: AppStoreFixtureLocale,
  scenario: AppStoreFixtureScenario = "active"
): AppStoreScreenshotSeed {
  const fixture = createAppStoreScreenshotFixture(locale);
  const featured = fixture.history.find(
    (game) => game.id === fixture.featuredFinishedGameId
  );
  if (!featured) throw new Error("Featured App Store fixture game is missing");

  const currentGame =
    scenario === "greybeard"
      ? fixture.greybeardGame
      : scenario === "featured-results"
        ? featured
        : fixture.activeGame;

  return {
    scenario,
    locale,
    currentGame,
    history: fixture.history,
    tableName: fixture.tableName,
    settings: { keepAwake: true },
    seenRelease: CURRENT_RELEASE,
    supportPrompt: {
      finishedSincePrompt: 0,
      lastPromptAt: APP_STORE_FIXTURE_EPOCH,
      optedOut: true,
    },
    deletions: {},
  };
}
