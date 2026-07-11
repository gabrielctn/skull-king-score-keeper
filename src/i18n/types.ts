/**
 * Typed string dictionary shared by every locale. Both `en` and `fr` are
 * annotated `: Strings`, so a missing or renamed key is a compile error — that
 * is the translation-completeness check. Parameterized strings are functions.
 */

export type Lang = "en" | "fr";

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
  };

  home: {
    subtitle: string;
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
    offline: string;
  };

  setup: {
    title: string;
    crew: string;
    players: string;
    seatingHint: string;
    /** Placeholder for an empty player row, e.g. "Player 3". */
    playerPlaceholder: (n: number) => string;
    addPlayer: string;
    twoPlayers: string;
    ghostTitle: string;
    ghostHint: string;
    rounds: string;
    roundsHint: string;
    expansion: string;
    advancedTitle: string;
    advancedHint: string;
    newExpansionTitle: string;
    newExpansionHint: string;
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
    /** "{n} total" */
    total: (n: number) => string;
    /** "Tricks recorded: {x} / {y}" */
    tricksRecorded: (x: number, y: number) => string;
    tricksOk: string;
    tricksWarnNormal: string;
    /** "Greybeard 👻 took {n}" */
    ghostTook: (n: number) => string;
    tricksWarnOver: string;
    finish: string;
    updateRound: string;
    scoreRound: string;
  };

  results: {
    gameOver: string;
    /** "{name} wins with {total}!" */
    winner: (name: string, total: number) => string;
    review: string;
    backHome: string;
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

  rules: {
    title: string;
    done: string;
    headings: {
      scoring: string;
      bonus: string;
      expansion: string;
      special: string;
      twoPlayer: string;
    };
    scoring: Entry[];
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
