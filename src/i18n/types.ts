/**
 * Typed string dictionary shared by every locale. Both `en` and `fr` are
 * annotated `: Strings`, so a missing or renamed key is a compile error — that
 * is the translation-completeness check. Parameterized strings are functions.
 */

import { RoundStructureId } from "../roundStructures";
import type { AwardKind } from "../stats";
import type { RascalBet, ScoringMode } from "../types";
import type { RascalOutcome } from "../scoring";

export type Lang = "en" | "fr" | "es" | "de" | "ar" | "zh";

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
    history: string;
    historyHint: string;
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
    disclaimer: string;
    offline: string;
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
      iosTitle: string;
      iosSteps: string[];
      androidTitle: string;
      androidSteps: string[];
      /** Note for phones (e.g. Xiaomi/MIUI) that hide the new icon. */
      androidNote: string;
    };
    /** Automatic cloud backup that keeps each scorekeeper's games private. */
    cloud: {
      title: string;
      /** Configured but no sync has happened yet this session. */
      statusIdle: string;
      statusSynced: string;
      statusSyncing: string;
      statusOffline: string;
      statusUnavailable: string;
      linkTitle: string;
      linkHint: string;
      codeLabel: string;
      copy: string;
      copied: string;
      pasteLabel: string;
      linkButton: string;
      linking: string;
      linkError: string;
      linkSuccess: string;
    };
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
    /** Toggle for the Rascal optional rules (Chevrotine / Boulet de canon). */
    rascalBetsTitle: string;
    rascalBetsHint: string;
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
    playOrderHint: string;
    /** Display name of the ghost in the play-order chip. */
    ghostName: string;
    bid: string;
    won: string;
    bonus: string;
    roundPoints: string;
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
    /** Playful caption under the just-for-fun Yohoho sound button. */
    yohohoHint: string;
    /** Accessibility label for the Yohoho sound button. */
    yohohoA11y: string;
  };

  /** Game master's sheet sharing the current game with the other players. */
  liveShare: {
    /** Accessibility label of the QR button in the game header. */
    open: string;
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
    // Offline snapshot (QR-encoded game) fallback section.
    snapshotTitle: string;
    snapshotToggleShow: string;
    snapshotToggleHide: string;
    scanHint: string;
    updateHint: string;
    networkHint: string;
    copyLink: string;
    copied: string;
    copyError: string;
    qrError: string;
    /** Accessibility description of the QR code image. */
    qrLabel: string;
    close: string;
  };

  /** Read-only score-tracking view opened by scanning a share QR code. */
  spectator: {
    /** Small "read-only" tag above the title (snapshot mode). */
    eyebrow: string;
    /** Small tag above the title while following a live session. */
    liveEyebrow: string;
    /** Pill shown next to the title while connected to a live session. */
    liveBadge: string;
    title: string;
    /** Progress line: "Scores after round {scored} of {total}". */
    roundProgress: (scored: number, total: number) => string;
    noRounds: string;
    finished: string;
    /** "Game master's scores · read at {time}". */
    snapshotAt: (time: string) => string;
    /** "Updated live · {time}". */
    liveUpdatedAt: (time: string) => string;
    refreshHint: string;
    /** Banner while first connecting to a live session. */
    connecting: string;
    /** Banner while a live session is reconnecting. */
    reconnecting: string;
    /** Banner when the game master ends the live session. */
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
    records: string;
    scoreEvolution: string;
    gamesPlayed: string;
    wins: string;
    winRate: string;
    exactBidRate: string;
    zeroBidRate: string;
    averagePoints: string;
    bestScore: string;
    winStreak: string;
    recentGames: string;
    bestFinalScore: string;
    worstRound: string;
    bestExactBid: string;
    /** Crew-total tiles at the top of the group stats. */
    totalGames: string;
    totalRounds: string;
    totalPlunder: string;
    /** Extra group-record labels. */
    biggestRound: string;
    longestStreak: string;
    mostReckless: string;
    krakenBait: string;
    zeroBidMaster: string;
    /** Extra per-player metric labels. */
    longestWinStreak: string;
    podiumRate: string;
    averageRank: string;
    bestRoundScore: string;
    unavailable: string;
    chartLabel: (leader: string, rounds: number) => string;
    playerSummary: (games: number, wins: number) => string;
    bidSummary: (successes: number, attempts: number) => string;
    scoreRecordHolder: (name: string, score: number, date: string) => string;
    roundRecordHolder: (
      name: string,
      score: number,
      round: number,
      date: string
    ) => string;
    rateRecordHolder: (
      name: string,
      rate: string,
      successes: number,
      attempts: number
    ) => string;
    /** "{name} · {streak} wins in a row" */
    streakRecordHolder: (name: string, streak: number) => string;
    /** "{name} · {averageBid} avg bid" (averageBid is already formatted) */
    recklessRecordHolder: (name: string, averageBid: string) => string;
    /** "{name} · {count}×" */
    countRecordHolder: (name: string, count: number) => string;
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
