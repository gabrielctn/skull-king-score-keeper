import { Strings } from "./types";

export const en: Strings = {
  langLabel: "EN",

  common: {
    on: "On",
    off: "Off",
    yes: "Yes",
    no: "No",
    home: "Home",
    back: "Back",
    newGame: "New game",
  },

  home: {
    subtitle: "Scorekeeper",
    resume: "Resume game",
    playersRound: (players, round, total) =>
      `${players} players · round ${round} of ${total}`,
    leading: (name, total) => `Leading: ${name} (${total})`,
    offline: "Works offline · install from your browser",
  },

  setup: {
    title: "New Game",
    crew: "Gather your crew",
    players: "Players",
    seatingHint:
      "Enter players in clockwise seating order — player 1 deals the first round. Use the arrows to rearrange the table.",
    playerPlaceholder: (n) => `Player ${n}`,
    addPlayer: "+ Add player",
    twoPlayers: "Two players",
    ghostTitle: "Greybeard ghost 👻",
    ghostHint:
      "The official 2-player variant: deal a third hand for the Greybeard ghost. He plays but never bids or scores, so he steals some tricks — your two trick counts can total less than the cards dealt.",
    rounds: "Rounds",
    roundsHint: "Standard Skull King is 10 rounds.",
    expansion: "Expansion cards",
    advancedTitle: "Loot & Rascal wager",
    advancedHint:
      "Adds Loot/Butin alliances and the Rascal pirate side-bet to the bonus editor. Kraken, White Whale & the 14/capture bonuses are always available.",
    start: "Start game ☠️",
    needPlayers: "Add at least 2 players",
  },

  game: {
    round: (n) => `Round ${n}`,
    cardsDealt: "cards dealt",
    dealsVerb: "deals",
    playOrderHint: "play order · first to lead is left",
    ghostName: "Greybeard",
    bid: "Bid",
    won: "Won",
    bonus: "Bonus",
    total: (n) => `${n} total`,
    tricksRecorded: (x, y) => `Tricks recorded: ${x} / ${y}`,
    tricksOk: "  ✓",
    tricksWarnNormal:
      "  (should equal cards dealt, unless a Kraken voided a trick)",
    ghostTook: (n) => `  ·  Greybeard 👻 took ${n}`,
    tricksWarnOver: "  (more than the cards dealt — check your counts)",
    finish: "Finish game 🏁",
    updateRound: "Update round",
    scoreRound: "Score round →",
  },

  results: {
    gameOver: "Game Over",
    winner: (name, total) => `${name} wins with ${total}!`,
    review: "Review round-by-round",
    backHome: "Back to home",
  },

  bonus: {
    colored14: "Colored 14s",
    black14: "Black 14 (Jolly Roger)",
    mermaidByPirate: "Mermaid taken by a pirate",
    pirateBySkullKing: "Pirate taken by Skull King",
    mermaidCapturesSkullKing: "Mermaid captures Skull King",
    loot: "Loot alliance (both hit bid)",
    rascal: "Rascal wager",
    each: "ea.",
    captureBonus: (n) => `Capture bonus: +${n}`,
  },

  rules: {
    title: "Scoring & Cards",
    done: "Done",
    headings: {
      scoring: "Scoring",
      bonus: "Bonus points",
      special: "Special cards",
      twoPlayer: "Two-player variant",
    },
    scoring: [
      {
        title: "Bid 1 or more",
        body: "Hit it exactly: +20 per trick won. Miss (over or under): -10 per trick of difference, and no points for tricks made.",
      },
      {
        title: "Bid zero",
        body: "Win 0 tricks: +10 x cards dealt this round. Win any trick: -10 x cards dealt this round.",
      },
    ],
    bonusEntries: [
      {
        title: "Colored 14  (+10 each)",
        body: "Each yellow / purple / green 14 you capture (win the trick it's in) at round end.",
      },
      {
        title: "Black 14  (+20)",
        body: "Capturing the black (Jolly Roger / trump) 14.",
      },
      {
        title: "Mermaid taken by a pirate  (+20 each)",
        body: "Your pirate wins a trick containing a mermaid.",
      },
      {
        title: "Pirate taken by Skull King  (+30 each)",
        body: "Your Skull King wins a trick containing pirate(s).",
      },
      {
        title: "Mermaid captures Skull King  (+40)",
        body: "Your mermaid wins a trick containing the Skull King. (Mermaid beats Skull King beats Pirates beats Mermaid.)",
      },
      {
        title: "Bonuses count regardless of your bid",
        body: "You keep capture bonuses even if you missed your bid. They go to whoever captures the card, no matter who played it.",
      },
    ],
    special: [
      {
        title: "Escape / Tigress-as-escape",
        body: "Always loses the trick. Used to safely dump a trick you don't want.",
      },
      {
        title: "Pirate (x5) & Tigress",
        body: "Beat all numbered cards. Tigress can be played as a pirate or an escape.",
      },
      {
        title: "Skull King",
        body: "Beats all numbers and all pirates (+30 each captured). Only a mermaid can beat it.",
      },
      {
        title: "Mermaid (x2)",
        body: "Beats all numbers and beats the Skull King (+40), but loses to pirates. If a pirate, Skull King and a mermaid are all in one trick, the mermaid always wins.",
      },
      {
        title: "Kraken",
        body: "The trick is destroyed: NOBODY wins it, the cards are set aside. No trick counts and no captures happen for it. The next trick is led by whoever would have won.",
      },
      {
        title: "White Whale",
        body: "All special cards are nullified and lose; the highest NUMBER wins the trick (trump included). If only specials were played, the trick is discarded. No special-card capture bonuses occur in a whale trick.",
      },
      {
        title: "Kraken vs White Whale",
        body: "If both hit the same trick, the second one played takes effect; apply that card's rule.",
      },
      {
        title: "Loot / Butin  (+20 each ally)",
        body: "Forms an alliance with whoever wins that trick. If BOTH allies hit their exact bid, each gets +20. Enter it only when the alliance succeeded.",
      },
      {
        title: "Rascal pirate wager (0/10/20)",
        body: "A side bet: gain the wager if you hit your bid, lose it if you miss.",
      },
    ],
    twoPlayer: [
      {
        title: "Greybeard the ghost 👻",
        body: "The official 2-player variant deals a third hand for the Greybeard ghost. On each trick he plays second, ignoring the led suit, and his Tigress always counts as an escape.",
      },
      {
        title: "He plays but never scores",
        body: "Greybeard does not bid and earns no points. He only steals tricks (and any bonus cards in them are simply lost). When he wins a trick he leads the next one; otherwise he is always second.",
      },
      {
        title: "Your trick totals can be short",
        body: "Because Greybeard wins some tricks, your two trick counts can add up to LESS than the cards dealt. The app shows how many tricks the ghost took instead of warning you.",
      },
    ],
  },

  stepper: {
    decrease: (label) => `Decrease ${label}`,
    increase: (label) => `Increase ${label}`,
  },
};
