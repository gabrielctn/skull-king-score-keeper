/**
 * Typed string dictionary shared by every locale. Both `en` and `fr` are
 * annotated `: Strings`, so a missing or renamed key is a compile error — that
 * is the translation-completeness check. Parameterized strings are functions.
 */

import { RoundStructureId } from "../roundStructures";
import type { AwardKind } from "../stats";
import type { RascalBet, ScoringMode } from "../types";
import type { RascalOutcome } from "../scoring";

/**
 * Every supported language, in the order the settings list shows them.
 *
 * This is the single source of truth: `Lang`, the runtime guard below, the
 * `dictionaries` map and the settings list all derive from it, so adding a
 * locale is one edit here plus the dictionary it now fails to compile without.
 */
export const LANGS = ["fr", "en", "es", "de", "ar", "zh"] as const;

export type Lang = (typeof LANGS)[number];

/** Narrow an untrusted value (stored preference, browser locale) to a Lang. */
export function isLang(value: unknown): value is Lang {
  return (LANGS as readonly unknown[]).includes(value);
}

/** A rules-modal entry: a bold title and a paragraph body. */
export interface Entry {
  title: string;
  body: string;
}

export interface Strings {
  /** Short label shown in the language switcher (e.g. "FR"). */
  langLabel: string;

  common: {
    home: string;
    back: string;
    newGame: string;
    storageError: string;
    dismiss: string;
  };

  cookies: {
    accessibilityLabel: string;
    message: string;
    decline: string;
    accept: string;
  };

  home: {
    title: string;
    subtitle: string;
    unofficial: string;
    resume: string;
    activeTitle: string;
    playing: string;
    lastPlayed: (date: string) => string;
    abandon: string;
    abandonTitle: string;
    abandonMessage: string;
    abandonConfirm: string;
    history: string;
    historyHint: string;
    /** Reveals the games hidden below the three most recent ones. */
    historyShowAll: (count: number) => string;
    historyShowLess: string;
    inProgress: string;
    finished: string;
    openGame: (date: string) => string;
    deleteGame: (date: string) => string;
    deleteTitle: string;
    deleteMessage: string;
    deleteCancel: string;
    deleteConfirm: string;
    /** "{players} players · round {round} of {total}" */
    playersRound: (players: number, round: number, total: number) => string;
    /** "Leading: {name} ({total})" */
    leading: (name: string, total: number) => string;
    support: string;
    supportHint: string;
    /**
     * What the App Store listing costs the developer every year, so the ask
     * above reads as covering a bill rather than as a profit.
     */
    supportCost: (amountEur: number) => string;
    disclaimer: string;
    offline: string;
  };

  /** End-of-game invitation to fund the App Store listing. */
  supportPrompt: {
    title: string;
    /** Why the ask exists: the app is free and ad-free, publishing it is not. */
    body: string;
    /** "Publishing it on the App Store costs €{amount} a year." */
    cost: (amountEur: number) => string;
    /** Opens the donation page; the prompt never comes back afterwards. */
    donate: string;
    /** Closes the prompt; it may return after the quiet period. */
    later: string;
    /** Declines for good — the home screen keeps the support button. */
    never: string;
  };

  whatsNew: {
    open: string;
    badge: string;
    title: string;
    version: (version: string, date: string) => string;
    automaticUpdatesTitle: string;
    automaticUpdatesBody: string;
    items: string[];
    close: string;
  };

  settings: {
    /** Accessibility label of the gear button on the home screen. */
    open: string;
    title: string;
    languageTitle: string;
    /** Section for options that apply while a game screen is open. */
    gameTitle: string;
    keepAwakeTitle: string;
    keepAwakeHint: string;
    dataTitle: string;
    dataHint: string;
    exportBackup: string;
    importBackup: string;
    importSuccess: (count: number) => string;
    backupError: string;
    deleteAll: string;
    deleteAllTitle: string;
    deleteAllMessage: string;
    deleteAllCancel: string;
    deleteAllConfirm: string;
    deleteAllSuccess: string;
    /** Section inviting players to send feedback to the developer. */
    feedbackTitle: string;
    feedbackHint: string;
    feedbackButton: string;
    /** "Install the app" section: one-tap button plus manual per-OS guides. */
    install: {
      title: string;
      /** Shown once the app is installed / added to the home screen. */
      installedTitle: string;
      installedBody: string;
      /** Hint above the one-tap install button (Android/Chromium). */
      promptHint: string;
      /** Hint shown when only the manual guide is available (e.g. iOS). */
      manualHint: string;
      button: string;
      error: string;
      /** Toggle that reveals the step-by-step manual guide. */
      guideTitle: string;
      iosSafariTitle: string;
      iosSafariSteps: string[];
      /** Chrome on iOS hides "Add to Home Screen" behind its own share sheet. */
      iosChromeTitle: string;
      iosChromeSteps: string[];
      androidTitle: string;
      androidSteps: string[];
    };
    /**
     * Shared game table: the cloud-backed history one group of friends
     * shares, plus the link/QR/code flows to bring other devices onto it.
     */
    cloud: {
      title: string;
      /** Configured but no sync has happened yet this session. */
      statusIdle: string;
      statusSynced: string;
      statusSyncing: string;
      statusOffline: string;
      statusUnavailable: string;
      /** Header of the membership list (one entry per crew). */
      tablesTitle: string;
      /** Row label for a table that has no name yet. */
      tableUnnamed: string;
      /** Badge on the currently loaded table. */
      tableActive: string;
      /** Accessibility label of an inactive row: "Switch to {name}". */
      tableSwitch: (name: string) => string;
      /** Shown while another table's history is being loaded. */
      tableSwitching: string;
      tableSwitchError: string;
      /** Button starting a fresh, empty table for another group. */
      newTable: string;
      newTableHint: string;
      /** Accessibility label of a row's remove button. */
      removeTable: (name: string) => string;
      removeTableTitle: string;
      removeTableMessage: string;
      removeTableCancel: string;
      removeTableConfirm: string;
      /** Label of the editable table-name field. */
      tableNameLabel: string;
      tableNamePlaceholder: string;
      /** Explains the name is shared with everyone on the table. */
      tableNameHint: string;
      /** Header of the invite block (QR + link). */
      shareTitle: string;
      /** Warns that anyone with the link can read and write the table. */
      shareHint: string;
      copyLink: string;
      copying: string;
      linkCopied: string;
      copyFailed: string;
      /** Accessibility description of the join QR code image. */
      qrLabel: string;
      linkTitle: string;
      linkHint: string;
      codeLabel: string;
      copy: string;
      copied: string;
      /** Header of the separate flow for joining another table. */
      joinTitle: string;
      pasteLabel: string;
      linkButton: string;
      linking: string;
      linkError: string;
      linkSuccess: string;
    };
  };

  /** Confirmation sheet shown after opening a table join link or QR code. */
  joinTable: {
    title: string;
    /** "Join the table «{name}»?" */
    named: (name: string) => string;
    /** Fallback when the table has no name yet. */
    unnamed: string;
    /** Explains the merge: "{count} games … merged into one shared history". */
    message: (count: number) => string;
    confirm: string;
    cancel: string;
    busy: string;
    success: string;
    error: string;
  };

  setup: {
    title: string;
    crew: string;
    players: string;
    seatingHint: string;
    /** Placeholder for an empty player row, e.g. "Player 3". */
    playerPlaceholder: (n: number) => string;
    addPlayer: string;
    quickTitle: string;
    quickHint: string;
    customize: string;
    hideCustomization: string;
    movePlayerUp: (name: string) => string;
    movePlayerDown: (name: string) => string;
    removePlayer: (name: string) => string;
    twoPlayers: string;
    ghostTitle: string;
    ghostHint: string;
    rounds: string;
    roundsHint: string;
    /** Explains that the rulebook offers alternate round/card structures. */
    structureHint: string;
    /** Rulebook name of each round structure. */
    structureNames: Record<RoundStructureId, string>;
    /** "{n} rounds" summary shown next to a structure's card sequence. */
    structureRounds: (n: number) => string;
    showOtherStructures: string;
    hideOtherStructures: string;
    /** Section header for choosing the official scoring system. */
    scoring: string;
    scoringHint: string;
    /** Rulebook name of each scoring system. */
    scoringNames: Record<ScoringMode, string>;
    /** One-line description of each scoring system. */
    scoringHints: Record<ScoringMode, string>;
    /** Toggle for the Rascal optional rules (Grapeshot / Cannonball). */
    rascalBetsTitle: string;
    rascalBetsHint: string;
    /** Optional rule that awards capture bonuses even after a missed bid. */
    bonusesOnMissTitle: string;
    bonusesOnMissHint: string;
    expansion: string;
    advancedTitle: string;
    advancedHint: string;
    newExpansionTitle: string;
    newExpansionHint: string;
    knownPlayers: string;
    useKnownPlayer: (name: string) => string;
    start: string;
    needPlayers: string;
  };

  game: {
    /** "Round {n}" */
    round: (n: number) => string;
    cardsDealt: string;
    /** Verb after the bold dealer name: "deals" / "distribue". */
    dealsVerb: string;
    /** "Play order · {name} leads the first trick" under the ordered chips. */
    playOrderLead: (name: string) => string;
    /** Display name of the ghost in the play-order chip. */
    ghostName: string;
    bid: string;
    won: string;
    bonus: string;
    roundPoints: string;
    roundPointsPreview: string;
    /** "{n} total" */
    total: (n: number) => string;
    /** "Tricks recorded: {x} / {y}" */
    tricksRecorded: (x: number, y: number) => string;
    tricksOk: string;
    tricksWarnNormal: string;
    /** "Greybeard 👻 took {n}" */
    ghostTook: (n: number) => string;
    tricksWarnOver: string;
    krakenRecord: string;
    krakenRecorded: string;
    krakenUndo: string;
    totalScoreTitle: string;
    totalIncludesRound: string;
    totalExcludesRound: string;
    finish: string;
    updateRound: string;
    scoreRound: string;
    untouchedTitle: string;
    untouchedMessage: string;
    untouchedCancel: string;
    untouchedConfirm: string;
    /** Banner line in Rascal games: "… · {points} points at stake". */
    rascalStake: (points: number) => string;
    /** Official names of the two Rascal optional-rules declarations. */
    rascalBetNames: Record<RascalBet, string>;
    /** Accessibility label of a player's declaration selector. */
    rascalBetFor: (name: string) => string;
  };

  /** In-game rules editor: change the game's options while it is running. */
  gameSettings: {
    /** Accessibility label of the ⚙ button in the game header. */
    open: string;
    title: string;
    /** Warns that recorded rounds are recalculated with the new rules. */
    recomputeHint: string;
    close: string;
  };

  /** Game master's sheet sharing the current game with the other players. */
  liveShare: {
    /** Accessibility label of the Live button in the game header. */
    open: string;
    /** Short label inside the header pill button ("Live"). */
    badge: string;
    title: string;
    subtitle: string;
    // Live (real-time, server-backed) section.
    /** Explanation shown before a live session is started. */
    liveHint: string;
    start: string;
    starting: string;
    stop: string;
    liveOnTitle: string;
    liveScanHint: string;
    /** Status pill while the session is connected and idle. */
    statusLive: string;
    /** Status pill while a change is being pushed. */
    statusSyncing: string;
    /** Status pill while sync is failing and retrying. */
    statusOffline: string;
    liveError: string;
    copyLink: string;
    copied: string;
    copyError: string;
    /** Accessibility description of the QR code image. */
    qrLabel: string;
    close: string;
  };

  /** Read-only score-tracking view opened by scanning a share QR code. */
  spectator: {
    /** Small tag above the title while following a live session. */
    liveEyebrow: string;
    /** Pill shown next to the title while connected to a live session. */
    liveBadge: string;
    title: string;
    /** Progress line: "Scores after round {scored} of {total}". */
    roundProgress: (scored: number, total: number) => string;
    noRounds: string;
    finished: string;
    /** "Updated live · {time}". */
    liveUpdatedAt: (time: string) => string;
    /** Banner while first connecting to a live session. */
    connecting: string;
    /** Banner while a live session is reconnecting. */
    reconnecting: string;
    /** Banner when the scorekeeper ends the live session. */
    endedTitle: string;
    endedBody: string;
    standingsTitle: string;
    tapHint: string;
    /** Heading for the one-time "which player are you?" picker. */
    identityTitle: string;
    /** Sub-line explaining the identity pick stays fixed for the game. */
    identityHint: string;
    /** Section title above the dealer / play-order banner. */
    turnTitle: string;
    /** Label before the standings-order control. */
    sortLabel: string;
    /** Order options: alphabetical, seating/game order, and rank. */
    sortName: string;
    sortGameOrder: string;
    sortRank: string;
    /** Chip marking the remembered "this is me" row in the standings. */
    you: string;
    openApp: string;
    invalidTitle: string;
    invalidBody: string;
  };

  results: {
    gameOver: string;
    /** "{name} wins with {total}!" */
    winner: (name: string, total: number) => string;
    /**
     * How long the game lasted, already split into whole hours and the
     * remaining minutes. Both are 0 for a game shorter than a minute.
     */
    duration: (hours: number, minutes: number) => string;
    podiumTitle: string;
    podiumPlace: (rank: number, name: string, total: number) => string;
    review: string;
    rematch: string;
    installTitle: string;
    installHint: string;
    installIosHint: string;
    installError: string;
    install: string;
    installDismiss: string;
    backHome: string;
  };

  stats: {
    open: string;
    title: string;
    groupTitle: string;
    playerTitle: (name: string) => string;
    emptyTitle: string;
    emptyBody: string;
    leaderboard: string;
    scoreEvolution: string;
    /** The two record walls: bragging rights and the ones nobody wants. */
    hallOfFame: string;
    hallOfShame: string;

    /** Crew-total tiles at the top of the group stats. */
    totalGames: string;
    totalRounds: string;
    totalPlunder: string;
    totalPlayers: string;

    /**
     * Record labels, each paired with a hint spelling out exactly what the
     * app measured — every record has to be readable without guessing.
     */
    bestFinalScore: string;
    bestFinalScoreHint: string;
    biggestRound: string;
    biggestRoundHint: string;
    bestExactBid: string;
    bestExactBidHint: (rounds: number) => string;
    zeroBidMaster: string;
    zeroBidMasterHint: (zeroBids: number) => string;
    longestStreak: string;
    longestStreakHint: string;
    biggestComeback: string;
    biggestComebackHint: string;
    biggestBonusHaul: string;
    biggestBonusHaulHint: string;
    worstFinalScore: string;
    worstFinalScoreHint: string;
    worstRound: string;
    worstRoundHint: string;
    mostLastPlaces: string;
    mostLastPlacesHint: string;
    boldestBidder: string;
    boldestBidderHint: string;

    /** Record-card values, units and context lines. */
    recordUnclaimed: string;
    unitPoints: string;
    unitWins: (count: number) => string;
    unitPlaces: (count: number) => string;
    unitGames: (count: number) => string;
    /** "Round 7 · 4 Aug 2026" */
    roundMeta: (round: number, date: string) => string;
    /** "18 of 24 rounds" */
    sampleMeta: (successes: number, attempts: number) => string;
    /** "4th → 1st · 4 Aug 2026" */
    comebackMeta: (fromRank: number, toRank: number, date: string) => string;
    /** "25% of 12 games" (rate is already formatted) */
    lastPlaceMeta: (rate: string, games: number) => string;
    /** "1.8 tricks a round · 30 rounds" (averageBid is already formatted) */
    appetiteMeta: (averageBid: string, rounds: number) => string;

    /** Per-player metric groups. */
    metricsResults: string;
    metricsBidding: string;
    metricsScoring: string;

    /** Per-player metric labels. */
    gamesPlayed: string;
    roundsPlayed: string;
    wins: string;
    winRate: string;
    rivalsBeaten: string;
    averageRank: string;
    lastPlaces: string;
    winStreak: string;
    longestWinStreak: string;
    exactBidRate: string;
    zeroBidRate: string;
    bidAppetite: string;
    averagePoints: string;
    pointsPerRound: string;
    bestScore: string;
    worstScore: string;
    bestRoundScore: string;
    worstRoundScore: string;
    bonusPoints: string;

    /** Metric captions that give a bare number its context. */
    outOfGames: (count: number, games: number) => string;
    /** "out of 4 players" (seats is already formatted) */
    seatsCaption: (seats: string) => string;
    perGame: string;
    rivalsBeatenCaption: string;
    perRound: string;
    fromSpecialCards: string;
    /** "1.8 tricks a round" (averageBid is already formatted) */
    bidCaption: (averageBid: string) => string;

    recentGames: string;
    unavailable: string;
    chartLabel: (leader: string, rounds: number) => string;
    playerSummary: (games: number, wins: number) => string;
    bidSummary: (successes: number, attempts: number) => string;
    recentGame: (date: string, rank: number, score: number) => string;
  };

  share: {
    button: string;
    preparing: string;
    busy: string;
    fileShared: string;
    textShared: string;
    copiedDownloaded: string;
    copied: string;
    downloaded: string;
    error: string;
    summaryTitle: string;
    awardsHeading: string;
    gameDate: (date: string) => string;
    rankingLine: (medal: string, name: string, score: number) => string;
    awardLine: (award: string, name: string) => string;
    cancelled: string;
  };

  awards: {
    title: string;
    names: Record<AwardKind, string>;
  };

  scoreBreakdown: {
    title: string;
    close: string;
    openFor: (name: string, total: number) => string;
    openRankedFor: (rank: number, name: string, total: number) => string;
    currentScore: string;
    earned: string;
    lost: string;
    recordedHint: string;
    noRounds: string;
    historyTitle: string;
    /** "Round {n}" */
    round: (n: number) => string;
    /** Compact bid/trick recap for a recorded round. */
    roundSummary: (bid: number, tricks: number) => string;
    exact: string;
    missed: string;
    runningTotal: string;
    expandRound: (n: number) => string;
    collapseRound: (n: number) => string;
    bidSuccess: (bid: number) => string;
    bidMissed: (bid: number, difference: number) => string;
    zeroBidSuccess: (cards: number) => string;
    zeroBidMissed: (cards: number) => string;
    /** Badge names of the Rascal accuracy tiers. */
    outcomes: Record<RascalOutcome, string>;
    /** Bid-line labels for Rascal-scored rounds. */
    rascalBidDirect: (bid: number) => string;
    rascalBidGlancing: string;
    rascalBidWhiff: (diff: number) => string;
    rascalCannonballWon: string;
    rascalCannonballLost: (diff: number) => string;
    ignored: string;
    items: {
      colored14: (count: number) => string;
      black14: string;
      mermaidByPirate: (count: number) => string;
      pirateBySkullKing: (count: number) => string;
      mermaidCapturesSkullKing: string;
      rascalWon: string;
      rascalLost: string;
      expansion7: (count: number) => string;
      expansion8: (count: number) => string;
      davyJonesLeviathans: (count: number) => string;
      secondCaptured: string;
      legacyLoot: (count: number) => string;
      loot: (count: number) => string;
      lootMissed: (count: number) => string;
      lootSelfWin: (count: number) => string;
    };
  };

  bonus: {
    colored14: string;
    black14: string;
    mermaidByPirate: string;
    pirateBySkullKing: string;
    mermaidCapturesSkullKing: string;
    rascal: string;
    newExpansion: string;
    expansion7: string;
    expansion8: string;
    expansionColorHint: string;
    davyJonesLeviathans: string;
    secondCaptured: string;
    /** Suffix meaning "each", appended after "+{points}". */
    each: string;
    /** Reminder shown when the game requires an exact bid for bonuses. */
    requiresBidHint: string;
    /** Same reminder once the entered bid is missed and bonuses are voided. */
    requiresBidMissed: string;
    /** "Card bonus: +{n}" */
    cardBonus: (n: number) => string;
  };

  loot: {
    title: string;
    hint: string;
    record: string;
    /** "Loot {n}" */
    useNumber: (n: number) => string;
    playedByPrompt: string;
    winnerPrompt: string;
    playedByRole: string;
    winnerRole: string;
    /** Reminder naming the two bound players. */
    pendingPair: (playedBy: string, boundTo: string) => string;
    success: string;
    /** Names of players who missed, already joined for display. */
    failed: (names: string) => string;
    /** Loot player also won the trick, so no alliance exists. */
    selfWin: (name: string) => string;
    change: string;
    remove: string;
    removeLabel: (n: number) => string;
    maxRecorded: string;
    incomplete: string;
    legacyNotice: string;
  };

  lootConfirmation: {
    eyebrow: string;
    title: string;
    intro: (players: number) => string;
    madeBid: string;
    missedBid: string;
    allianceBonus: string;
    noAllianceBonus: string;
    confirm: string;
  };

  rules: {
    title: string;
    done: string;
    unofficialNotice: string;
    officialRules: string;
    headings: {
      scoring: string;
      rascal: string;
      bonus: string;
      expansion: string;
      special: string;
      twoPlayer: string;
    };
    scoring: Entry[];
    rascal: Entry[];
    bonusEntries: Entry[];
    expansion: Entry[];
    special: Entry[];
    twoPlayer: Entry[];
  };

  stepper: {
    /** Accessibility label, e.g. "Decrease Bid". */
    decrease: (label: string) => string;
    increase: (label: string) => string;
  };
}
