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
    on: string;
    off: string;
    yes: string;
    no: string;
    home: string;
    back: string;
    newGame: string;
  };

  home: {
    subtitle: string;
    resume: string;
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

  bonus: {
    colored14: string;
    black14: string;
    mermaidByPirate: string;
    pirateBySkullKing: string;
    mermaidCapturesSkullKing: string;
    loot: string;
    rascal: string;
    /** Suffix meaning "each", appended after "+{points}". */
    each: string;
    /** "Capture bonus: +{n}" */
    captureBonus: (n: number) => string;
  };

  rules: {
    title: string;
    done: string;
    headings: {
      scoring: string;
      bonus: string;
      special: string;
      twoPlayer: string;
    };
    scoring: Entry[];
    bonusEntries: Entry[];
    special: Entry[];
    twoPlayer: Entry[];
  };

  stepper: {
    /** Accessibility label, e.g. "Decrease Bid". */
    decrease: (label: string) => string;
    increase: (label: string) => string;
  };
}
