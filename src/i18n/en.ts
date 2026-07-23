import { Strings } from "./types";

export const en: Strings = {
  langLabel: "EN",

  common: {
    home: "Home",
    back: "Back",
    newGame: "New game",
    storageError:
      "Local saving failed. Export your games before closing the app.",
    dismiss: "Dismiss",
  },

  cookies: {
    accessibilityLabel: "Analytics cookie choices",
    message:
      "We use Google Analytics cookies to understand visits and improve the score keeper.",
    decline: "Decline",
    accept: "Accept",
  },

  home: {
    title: "Score keeper",
    subtitle: "for Skull King",
    unofficial: "Unofficial fan-made app",
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
    support: "Support the developer ☕",
    supportHint: "Optional contribution · the app remains completely free.",
    disclaimer:
      "Made by a player with no affiliation, endorsement, or sponsorship from Grandpa Beck’s Games, its publishers, or distributors. “Skull King” and the official game elements belong to their respective rights holders.",
    offline: "Works offline · install from your browser",
  },

  whatsNew: {
    open: "What's new",
    badge: "New",
    title: "What's new",
    version: (version, date) => `Version ${version} · ${date}`,
    automaticUpdatesTitle: "Always up to date",
    automaticUpdatesBody:
      "Installed apps now download each new release automatically and switch to it as soon as the device is online.",
    items: [
      "Your games now back up to the cloud automatically and privately — your scoreboard, leaderboard and stats come back even after this device's data is cleared.",
      "Playing on another phone? Copy your sync code from Settings and paste it there to load all your games.",
      "Clearer install help, including a note for Xiaomi/MIUI phones where the new icon can hide in the app drawer.",
    ],
    close: "Got it",
  },

  settings: {
    open: "Settings",
    title: "Settings",
    languageTitle: "Language",
    gameTitle: "During a game",
    keepAwakeTitle: "Keep the screen awake",
    keepAwakeHint:
      "Stops the device from going to sleep while a game screen is open.",
    dataTitle: "Your data",
    dataHint: "Export a copy of your games or restore it on this device.",
    exportBackup: "Export",
    importBackup: "Import",
    importSuccess: (count) =>
      `${count} ${count === 1 ? "game imported" : "games imported"}.`,
    backupError: "This backup could not be read.",
    deleteAll: "Delete all games",
    deleteAllTitle: "Delete all games?",
    deleteAllMessage:
      "Every game — including one in progress — will be permanently deleted. Consider exporting a backup first.",
    deleteAllCancel: "Cancel",
    deleteAllConfirm: "Delete all",
    deleteAllSuccess: "All games have been deleted.",
    feedbackTitle: "Feedback",
    feedbackHint: "Found a bug or have an idea? I'd love to hear from you.",
    feedbackButton: "Send feedback",
    install: {
      title: "Install the app",
      installedTitle: "App installed 🎉",
      installedBody:
        "The score keeper is on your device — it opens like any app and works fully offline.",
      promptHint:
        "Add the score keeper to your home screen for one-tap access and offline play.",
      manualHint:
        "Add the score keeper to your home screen for one-tap access and offline play. Follow the steps for your phone below.",
      button: "Install now",
      error: "Installation could not start. Try the manual steps below.",
      guideTitle: "How to install it by hand",
      iosTitle: "iPhone & iPad (Safari)",
      iosSteps: [
        "Open this page in Safari.",
        "Tap the Share button (a square with an upward arrow) at the bottom of the screen.",
        "Scroll down and tap “Add to Home Screen”.",
        "Tap “Add” at the top right — the app icon appears on your home screen.",
      ],
      androidTitle: "Android (Chrome)",
      androidSteps: [
        "Open this page in Chrome.",
        "Tap the ⋮ menu at the top right.",
        "Tap “Install app” (or “Add to Home screen”).",
        "Confirm with “Install” — the app icon appears on your home screen.",
      ],
      androidNote:
        "On Xiaomi/Redmi (MIUI) and some other phones the icon can land in the app drawer instead of the home screen, or you may first need to allow Chrome to create home-screen shortcuts in the system settings.",
    },
    cloud: {
      title: "Cloud backup",
      statusIdle: "Cloud backup is on.",
      statusSynced:
        "Backed up — your games save to the cloud automatically and come back if this device's data is cleared.",
      statusSyncing: "Saving to the cloud…",
      statusOffline: "Offline — changes will sync once you're back online.",
      statusUnavailable: "Cloud backup isn't set up for this app.",
      linkTitle: "Use your games on another phone",
      linkHint:
        "Copy this device's code, then paste it on the other phone to load the same games there. Keep it private — anyone with it can see your games.",
      codeLabel: "This device's code",
      copy: "Copy",
      copied: "Copied",
      pasteLabel: "Paste a code from another device",
      linkButton: "Load those games here",
      linking: "Loading…",
      linkError: "That code could not be read.",
      linkSuccess: "Done — games merged onto this device.",
    },
  },

  setup: {
    title: "New Game",
    crew: "Gather your crew",
    players: "Players",
    seatingHint:
      "Enter players in clockwise seating order — player 1 deals the first round. Use the arrows to rearrange the table.",
    playerPlaceholder: (n) => `Player ${n}`,
    addPlayer: "+ Add player",
    quickTitle: "Quick game",
    quickHint:
      "Recommended settings are ready. Enter the players and start, or customize the game.",
    customize: "Customize game",
    hideCustomization: "Hide options",
    movePlayerUp: (name) => `Move ${name} up`,
    movePlayerDown: (name) => `Move ${name} down`,
    removePlayer: (name) => `Remove ${name}`,
    twoPlayers: "Two players",
    ghostTitle: "Greybeard ghost 👻",
    ghostHint:
      "The two-player variant described in the rulebook: deal a third hand for the Greybeard ghost. He plays but never bids or scores, so he steals some tricks — your two trick counts can total less than the cards dealt.",
    rounds: "Rounds",
    roundsHint: "Standard Skull King is 10 rounds.",
    structureHint:
      "The rulebook suggests several ways to deal the cards. Pick the round structure for this game.",
    structureNames: {
      classic: "Classic",
      evenKeeled: "Even Keeled",
      brawl: "Skip to the Brawl",
      skirmish: "Swift-n-Salty Skirmish",
      barrage: "Broadside Barrage",
      whirlpool: "Whirlpool",
      bedtime: "Past Your Bedtime",
    },
    structureRounds: (n) => `${n} ${n === 1 ? "round" : "rounds"}`,
    showOtherStructures: "Show other round types",
    hideOtherStructures: "Hide other round types",
    scoring: "Scoring",
    scoringHint:
      "The rulebook offers two official ways to count points. Pick this game's system.",
    scoringNames: {
      classic: "Skull King scoring",
      rascal: "Rascal's scoring",
    },
    scoringHints: {
      classic:
        "The classic risk-and-reward system: exact bids pay 20 per trick, misses cost points.",
      rascal:
        "Each round puts 10 points per card dealt at stake. Exact bid: all of it. Off by one: half. Off by two or more: nothing — never negative.",
    },
    rascalBetsTitle: "Rascal's optional rules ✊",
    rascalBetsHint:
      "After bidding, everyone declares Buckshot (open hand: the standard tiers) or Cannonball (closed fist: 15 points per card dealt on an exact bid, nothing otherwise — bonuses included).",
    expansion: "Expansion cards",
    advancedTitle: "Loot & Rascal wager",
    advancedHint:
      "Adds round-level Loot/Butin tracking and the Rascal pirate side-bet. Kraken, White Whale & the 14/capture bonuses are always available.",
    newExpansionTitle: "New expansion",
    newExpansionHint:
      "Adds scoring for the special 7s and 8s, Davy Jones' Locker, and the Second. The other expansion effects are covered in the in-game rules.",
    knownPlayers: "Known players",
    useKnownPlayer: (name) => `Use ${name}`,
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
    untouchedTitle: "Score this round?",
    untouchedMessage:
      "No bids or tricks were entered. Confirm that both players bid zero and Greybeard won every trick.",
    untouchedCancel: "Check entries",
    untouchedConfirm: "Yes, score it",
    rascalStake: (points) => `Rascal's scoring · ${points} points at stake`,
    rascalBetNames: {
      buckshot: "Buckshot",
      cannonball: "Cannonball",
    },
    rascalBetFor: (name) => `${name}'s declaration`,
    yohohoHint: "Tap to sound the battle cry",
    yohohoA11y: "Play the Yohoho pirate cry",
  },

  liveShare: {
    open: "Share score tracking (QR code)",
    title: "Follow the scores",
    subtitle: "Every player can track the scores on their own phone.",
    liveHint:
      "Start a live session: players who scan the code follow the scores in real time — every bid, trick and bonus appears on their phone as you record it, no refresh needed.",
    start: "Start live follow",
    starting: "Starting…",
    stop: "Stop live follow",
    liveOnTitle: "Live follow is on",
    liveScanHint:
      "Players scan this QR code to follow the scores live on their own phone.",
    statusLive: "Live · auto-updating",
    statusSyncing: "Saving…",
    statusOffline: "Reconnecting…",
    liveError:
      "Live sync hit a problem — it keeps retrying. Check your connection, or stop and start again.",
    snapshotTitle: "No connection at the table?",
    snapshotToggleShow: "Show offline snapshot",
    snapshotToggleHide: "Hide offline snapshot",
    scanHint:
      "This QR code carries a read-only snapshot of the game — every bid, trick and bonus recorded so far.",
    updateHint:
      "It works with no server, but does not update on its own: players re-scan to get the latest scores.",
    networkHint:
      "A player's phone needs a connection the first time it opens the app; after that the snapshot works fully offline.",
    copyLink: "Copy link",
    copied: "Link copied!",
    copyError: "Could not copy the link.",
    qrError: "This game could not be turned into a QR code.",
    qrLabel: "QR code opening the score tracking of this game",
    close: "Close",
  },

  spectator: {
    eyebrow: "Read-only tracking",
    liveEyebrow: "Live tracking",
    liveBadge: "Live",
    title: "Game tracking",
    roundProgress: (scored, total) =>
      `Scores after round ${scored} of ${total}`,
    noRounds: "No round has been scored yet.",
    finished: "Final scores — the game is over.",
    snapshotAt: (time) => `Game master's scores · read at ${time}`,
    liveUpdatedAt: (time) => `Updated live · ${time}`,
    refreshHint:
      "This is a snapshot. To refresh it, scan the game master's QR code again.",
    connecting: "Connecting to the live game…",
    reconnecting: "Connection lost — reconnecting…",
    endedTitle: "Live session ended",
    endedBody:
      "The game master stopped sharing. The last scores you received are shown below.",
    standingsTitle: "Standings",
    tapHint:
      "Tap any player for their full round-by-round details — bids, tricks and every bonus.",
    identityTitle: "Which player are you?",
    identityHint:
      "Pick your name once to follow your own scores. It stays fixed for this game.",
    turnTitle: "Turn order",
    sortLabel: "Order",
    sortName: "A → Z",
    sortGameOrder: "Seating",
    sortRank: "Rank",
    you: "You",
    openApp: "Open the app for my own games",
    invalidTitle: "This code could not be read",
    invalidBody:
      "The scanned link does not contain a readable game. Ask the game master to show the QR code again, then rescan it.",
  },

  results: {
    gameOver: "Game Over",
    winner: (name, total) => `${name} wins with ${total}!`,
    podiumTitle: "Podium",
    podiumPlace: (rank, name, total) =>
      `Rank ${rank}, ${name}, ${total} points`,
    review: "Review round-by-round",
    rematch: "Rematch with the same crew",
    installTitle: "Keep the score keeper aboard",
    installHint: "Install the app for quick access and fully offline play.",
    installIosHint:
      "Open this page in Safari if needed, then tap Share and “Add to Home Screen”.",
    installError: "Installation could not start. You can try again later.",
    install: "Install app",
    installDismiss: "Later",
    backHome: "Back to home",
  },

  stats: {
    open: "Player statistics",
    title: "Statistics",
    groupTitle: "Crew records",
    playerTitle: (name) => `${name}'s statistics`,
    emptyTitle: "No tales to tell yet",
    emptyBody: "Finish a game to start building your crew's history.",
    leaderboard: "Leaderboard",
    records: "Records",
    scoreEvolution: "Score evolution",
    gamesPlayed: "Games played",
    wins: "Wins",
    winRate: "Win rate",
    exactBidRate: "Exact-bid rate",
    zeroBidRate: "Zero-bid success",
    averagePoints: "Average points",
    bestScore: "Best score",
    winStreak: "Current win streak",
    recentGames: "Recent games",
    bestFinalScore: "Best final score",
    worstRound: "Worst round",
    bestExactBid: "Best exact-bid rate",
    totalGames: "Games logged",
    totalRounds: "Rounds played",
    totalPlunder: "Points plundered",
    biggestRound: "Biggest single round",
    longestStreak: "Hottest streak",
    mostReckless: "Most reckless",
    krakenBait: "Kraken bait",
    zeroBidMaster: "Master of nothing",
    longestWinStreak: "Longest win streak",
    podiumRate: "Podium rate",
    averageRank: "Average rank",
    bestRoundScore: "Best round",
    unavailable: "Not available",
    chartLabel: (leader, rounds) =>
      `Score evolution after ${rounds} ${rounds === 1 ? "round" : "rounds"}; ${leader} leads.`,
    playerSummary: (games, wins) =>
      `${games} ${games === 1 ? "game" : "games"} · ${wins} ${
        wins === 1 ? "win" : "wins"
      }`,
    bidSummary: (successes, attempts) => `${successes} of ${attempts}`,
    scoreRecordHolder: (name, score, date) =>
      `${name} · ${score} points · ${date}`,
    roundRecordHolder: (name, score, round, date) =>
      `${name} · ${score} points in round ${round} · ${date}`,
    rateRecordHolder: (name, rate, successes, attempts) =>
      `${name} · ${rate} (${successes}/${attempts})`,
    streakRecordHolder: (name, streak) =>
      `${name} · ${streak} ${streak === 1 ? "win" : "wins"} in a row`,
    recklessRecordHolder: (name, averageBid) => `${name} · ${averageBid} avg bid`,
    countRecordHolder: (name, count) =>
      `${name} · ${count} ${count === 1 ? "time" : "times"}`,
    recentGame: (date, rank, score) =>
      `${date} · rank ${rank} · ${score} points`,
  },

  share: {
    button: "Share recap",
    preparing: "Preparing recap…",
    busy: "Sharing…",
    fileShared: "Recap shared.",
    textShared: "Summary shared.",
    copiedDownloaded: "Copied and downloaded.",
    copied: "Copied.",
    downloaded: "Downloaded.",
    error: "Could not share the recap.",
    summaryTitle: "Skull King game recap",
    awardsHeading: "Crew awards",
    gameDate: (date) => `Played ${date}`,
    rankingLine: (medal, name, score) =>
      `${medal} ${name} — ${score} points`,
    awardLine: (award, name) => `${award}: ${name}`,
    cancelled: "Sharing cancelled.",
  },

  awards: {
    title: "Crew awards",
    names: {
      lookout: "The Lookout",
      zeroBidRoyalty: "Zero-bid Royalty",
      comeback: "The Comeback",
      reckless: "The Reckless",
      castaway: "The Castaway",
    },
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
    outcomes: {
      directHit: "Direct hit",
      glancingBlow: "Glancing blow",
      whiff: "Total whiff",
    },
    rascalBidDirect: (bid) => `Direct hit · bid ${bid} exact · full points`,
    rascalBidGlancing: "Glancing blow · off by one · half the points",
    rascalBidWhiff: (diff) => `Total whiff · off by ${diff}`,
    rascalCannonballWon: "Cannonball · exact bid · 15 per card",
    rascalCannonballLost: (diff) => `Cannonball lost · off by ${diff}`,
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
    unofficialNotice:
      "Unofficial practical summary written to make scoring easier. When in doubt, the rulebook for your edition takes precedence.",
    officialRules: "View the official rules",
    headings: {
      scoring: "Scoring",
      rascal: "Rascal's scoring",
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
    rascal: [
      {
        title: "An official alternate scoring",
        body: "Chosen when creating the game. Every player has the same potential each round — 10 points per card dealt, whatever the bid — and accuracy decides how much of it you take. Scores never go negative.",
      },
      {
        title: "Direct hit · glancing blow · total whiff",
        body: "Exact bid: all the points at stake. Off by one: half of them. Off by two or more: nothing.",
      },
      {
        title: "Bonus points follow the same tiers",
        body: "Capture bonuses count in full on a direct hit, half on a glancing blow, and not at all on a whiff. Loot, the special 7s/8s and the Rascal pirate wager keep their own exact-bid rules.",
      },
      {
        title: "Optional: Buckshot or Cannonball",
        body: "If enabled at setup, everyone declares after bidding, then reveals simultaneously. Open hand (Buckshot) keeps the standard tiers; closed fist (Cannonball) pays 15 points per card dealt on an exact bid and nothing otherwise — bonuses included.",
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
        body: "The rulebook's two-player variant deals a third hand for the Greybeard ghost. On each trick he plays second, ignoring the led suit, and his Tigress always counts as an escape. Loot cards are not used.",
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
