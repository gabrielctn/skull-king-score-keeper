import { Strings } from "./types";

export const en: Strings = {
  langLabel: "EN",

  common: {
    home: "Home",
    back: "Back",
    newGame: "New game",
  },

  home: {
    subtitle: "Scorekeeper",
    resume: "Resume game",
    history: "Recent games",
    historyHint: "Tap a game to resume it or view its standings.",
    inProgress: "In progress",
    finished: "Finished",
    openGame: (date) => `Open game from ${date}`,
    deleteGame: (date) => `Delete game from ${date}`,
    deleteTitle: "Delete this game?",
    deleteMessage: "Its score and round details will be permanently deleted.",
    deleteCancel: "Cancel",
    deleteConfirm: "Delete",
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
      "Adds round-level Loot/Butin tracking and the Rascal pirate side-bet. Kraken, White Whale & the 14/capture bonuses are always available.",
    newExpansionTitle: "New expansion",
    newExpansionHint:
      "Adds scoring for the special 7s and 8s, Davy Jones' Locker, and the Second. The other expansion effects are covered in the in-game rules.",
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
    roundPoints: "Round points",
    total: (n) => `${n} total`,
    tricksRecorded: (x, y) => `Tricks recorded: ${x} / ${y}`,
    tricksOk: "  ✓",
    tricksWarnNormal: "  (must equal cards dealt)",
    ghostTook: (n) => `  ·  Greybeard 👻 took ${n}`,
    tricksWarnOver: "  (more than the cards dealt — check your counts)",
    krakenRecord: "+ Trick discarded by Kraken",
    krakenRecorded: "Kraken trick counted",
    krakenUndo: "Undo",
    totalScoreTitle: "Total score",
    totalIncludesRound: "The displayed round is included in these totals.",
    totalExcludesRound:
      "The displayed round is not included in these totals yet.",
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

  scoreBreakdown: {
    title: "Score details",
    close: "Close",
    openFor: (name, total) => `Show ${name}'s score details: ${total}`,
    openRankedFor: (rank, name, total) =>
      `Rank ${rank}, ${name}, ${total} points. Show score details`,
    currentScore: "Current score",
    earned: "Earned",
    lost: "Lost",
    recordedHint: "Only scored rounds are included.",
    noRounds: "No rounds have been scored yet.",
    historyTitle: "Scored rounds",
    round: (n) => `Round ${n}`,
    roundSummary: (bid, tricks) => `Bid ${bid} · won ${tricks}`,
    exact: "Bid hit",
    missed: "Bid missed",
    runningTotal: "Total after round",
    expandRound: (n) => `Show round ${n} details`,
    collapseRound: (n) => `Hide round ${n} details`,
    bidSuccess: (bid) => `Bid ${bid} hit exactly`,
    bidMissed: (bid, difference) =>
      `Bid ${bid} missed · ${difference} ${
        difference === 1 ? "trick" : "tricks"
      } off`,
    zeroBidSuccess: (cards) =>
      `Zero bid hit · ${cards} ${cards === 1 ? "card" : "cards"}`,
    zeroBidMissed: (cards) =>
      `Zero bid missed · ${cards} ${cards === 1 ? "card" : "cards"}`,
    ignored: "Not counted",
    items: {
      colored14: (count) =>
        `${count} colored ${count === 1 ? "14" : "14s"} captured`,
      black14: "Black 14 captured",
      mermaidByPirate: (count) =>
        `${count} ${count === 1 ? "mermaid" : "mermaids"} taken by a pirate`,
      pirateBySkullKing: (count) =>
        `${count} ${count === 1 ? "pirate" : "pirates"} taken by Skull King`,
      mermaidCapturesSkullKing: "Mermaid captures Skull King",
      rascalWon: "Rascal wager won",
      rascalLost: "Rascal wager lost",
      expansion7: (count) =>
        `${count} special ${count === 1 ? "7" : "7s"} captured`,
      expansion8: (count) =>
        `${count} special ${count === 1 ? "8" : "8s"} captured`,
      davyJonesLeviathans: (count) =>
        `${count} ${count === 1 ? "leviathan" : "leviathans"} destroyed by Davy Jones`,
      secondCaptured: "The Second captured",
      legacyLoot: (count) =>
        `${count} legacy Loot ${count === 1 ? "bonus" : "bonuses"}`,
      loot: (count) =>
        `${count} Loot ${count === 1 ? "alliance" : "alliances"} succeeded`,
      lootMissed: (count) =>
        `${count} Loot ${count === 1 ? "alliance" : "alliances"} · at least one bid missed`,
      lootSelfWin: (count) =>
        `${count} Loot ${count === 1 ? "card" : "cards"} won back by ${
          count === 1 ? "its" : "their"
        } player · no alliance`,
    },
  },

  bonus: {
    colored14: "Colored 14s",
    black14: "Black 14 (Jolly Roger)",
    mermaidByPirate: "Mermaid taken by a pirate",
    pirateBySkullKing: "Pirate taken by Skull King",
    mermaidCapturesSkullKing: "Mermaid captures Skull King",
    rascal: "Rascal wager",
    newExpansion: "New expansion",
    expansion7: "New 7 captured",
    expansion8: "New 8 captured",
    expansionColorHint:
      "The new 7s and 8s only score when the bid is hit exactly.",
    davyJonesLeviathans: "Leviathan destroyed by Davy Jones",
    secondCaptured: "Second taken by Skull King / Mermaid",
    each: "ea.",
    cardBonus: (n) => `Card bonus: ${n >= 0 ? "+" : ""}${n}`,
  },

  loot: {
    title: "Loot alliances",
    hint:
      "Record each Loot card as soon as it is played. Every involved bid must be confirmed at round end.",
    record: "+ Record Loot",
    useNumber: (n) => `Loot ${n}`,
    playedByPrompt: "Who played the Loot card?",
    winnerPrompt: "Who won the trick?",
    playedByRole: "played Loot",
    winnerRole: "won the trick",
    pendingPair: (playedBy, boundTo) =>
      `${playedBy} and ${boundTo} must both hit their bids.`,
    success: "Both hit their bids · +20 each",
    failed: (names) => `No Loot bonus · missed bid: ${names}`,
    selfWin: (name) => `${name} won their own Loot · no alliance formed`,
    change: "Change",
    remove: "Remove",
    removeLabel: (n) => `Remove Loot ${n}`,
    maxRecorded: "Both Loot cards are recorded.",
    incomplete: "Choose the players for every Loot before scoring the round.",
    legacyNotice:
      "Older Loot points are preserved, but their original player links were not saved.",
  },

  lootConfirmation: {
    eyebrow: "Required check",
    title: "Confirm Loot alliances",
    intro: (players) =>
      `${players} ${players === 1 ? "player is" : "players are"} involved in a Loot alliance. Review every bid before continuing.`,
    madeBid: "Bid hit",
    missedBid: "Bid missed",
    allianceBonus: "Alliance succeeded · +20 points each",
    noAllianceBonus: "Alliance failed · no Loot bonus",
    confirm: "Confirm bids",
  },

  rules: {
    title: "Scoring & Cards",
    done: "Done",
    headings: {
      scoring: "Scoring",
      bonus: "Bonus points",
      expansion: "New expansion",
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
    expansion: [
      {
        title: "New 7s and 8s  (-5 / +5 each)",
        body: "They play like normal suited cards. The player who captures a new 7 loses 5 points and the player who captures a new 8 gains 5 points, only when their bid is exact. If the winning value is tied, the first card played wins.",
      },
      {
        title: "0/14 cards",
        body: "When you play the card, immediately declare whether it is worth 0 or 14. It awards no bonus.",
      },
      {
        title: "Wild 15",
        body: "It counts as a yellow, purple, or green 15. Choose its suit if none has been set. If a non-black suit is already set, it must follow that suit. When black is led, no suit needs to be declared.",
      },
      {
        title: "Mary Throne (Pirate)",
        body: "She plays as a normal Pirate. With advanced pirate powers, randomly choose a card from an opponent's hand without seeing it; they must play it on the next trick regardless of the cards already played.",
      },
      {
        title: "Final Salvo",
        body: "It cannot win a trick and is not an Escape. After everyone has played, immediately play another card. You then have one fewer card and sit out the round's final trick.",
      },
      {
        title: "Walk the Plank",
        body: "This card cannot win the trick. At the end of the trick, remove one Pirate in it; that Pirate can no longer win the trick or award points.",
      },
      {
        title: "Spotted Ray",
        body: "The lowest card wins; ties go to the first card played. If several leviathans appear (Kraken, White Whale, Spotted Ray), the last one played determines the trick's effect.",
      },
      {
        title: "Davy Jones' Locker  (+20 per leviathan)",
        body: "Use it with leviathans. It cannot win the trick and destroys every leviathan in it; the strongest remaining card then wins normally. The Locker's player scores 20 points per destroyed leviathan, regardless of card order.",
      },
      {
        title: "The Second  (+30 when captured)",
        body: "It beats every card except Skull King and Mermaids. It may use the powers of Pirates it captures but earns no capture bonus for them. If Skull King or a Mermaid captures it, their player scores 30 points.",
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
        body: "Forms an alliance between the player who played it and whoever wins that trick. Record both players when it happens; if BOTH hit their exact bid, the app awards each +20.",
      },
      {
        title: "Rascal pirate wager (0/10/20)",
        body: "A side bet: gain the wager if you hit your bid, lose it if you miss.",
      },
    ],
    twoPlayer: [
      {
        title: "Greybeard the ghost 👻",
        body: "The official 2-player variant deals a third hand for the Greybeard ghost. On each trick he plays second, ignoring the led suit, and his Tigress always counts as an escape. Loot cards are not used.",
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
