import { Strings } from "./types";

/** English ordinals: 1st, 2nd, 3rd, 4th, with "th" for all the teens. */
function ordinal(value: number): string {
  const lastTwo = value % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${value}th`;
  const suffix = { 1: "st", 2: "nd", 3: "rd" }[value % 10] ?? "th";
  return `${value}${suffix}`;
}

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
      "We use Google Analytics cookies to understand visits and improve Skull King Crew Ledger.",
    decline: "Decline",
    accept: "Accept",
  },

  home: {
    title: "Skull King",
    subtitle: "Crew Ledger",
    unofficial: "Unofficial fan-made app",
    resume: "Resume game",
    activeTitle: "Game in progress",
    playing: "Playing",
    lastPlayed: (date) => `Last played ${date}`,
    abandon: "Abandon game",
    abandonTitle: "Abandon this game?",
    abandonMessage:
      "All scores and round details from this in-progress game will be permanently deleted. Finished games will not be affected.",
    abandonConfirm: "Abandon",
    history: "Recent games",
    historyHint: "Tap a game to resume it or view its standings.",
    historyShowAll: (count) => `Show all ${count} games`,
    historyShowLess: "Show fewer",
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
    supportCost: (amountEur) =>
      `Publishing the app on the App Store costs the developer €${amountEur} a year. Contributions go towards that bill first.`,
    disclaimer:
      "Made by a player with no affiliation, endorsement, or sponsorship from Grandpa Beck’s Games, its publishers, or distributors. “Skull King” and the official game elements belong to their respective rights holders.",
    offline: "Works offline · install from your browser",
  },

  supportPrompt: {
    title: "Enjoying the app?",
    body:
      "It is free, ad-free and account-free, and it will stay that way. There is no company behind it, just a player building it in their spare time.",
    cost: (amountEur) =>
      `Keeping it on the App Store costs the developer €${amountEur} a year. A small contribution is enough to cover that bill.`,
    donate: "Support the developer ☕",
    later: "Maybe later",
    never: "Don't ask again",
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
      "Score sharing now uses live QR sessions only, so every player sees updates in real time.",
      "Inviting your crew and joining another table are now separate actions, so each flow is immediately visible in Settings.",
      "Shared game tables: name your crew's table and invite friends with a link or QR code. Anyone who joins can keep score, every game lands in the shared history and leaderboard, and one phone can hold several tables, one per group of friends.",
      "Game rules can now be changed during a game from the new ⚙ button: enable the expansion mid-game, switch scoring, and more. Scored rounds recalculate automatically.",
      "The new expansion is now on by default for new games.",
      "The live-tracking button is now a clear “Live” pill, and the play order shows numbered seats with who leads the trick.",
      "Bonus labels now all read the same way: who takes what.",
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
      "Every game, including one in progress, will be permanently deleted. Consider exporting a backup first.",
    deleteAllCancel: "Cancel",
    deleteAllConfirm: "Delete all",
    deleteAllSuccess: "All games have been deleted.",
    feedbackTitle: "Feedback",
    feedbackHint: "Found a bug or have an idea? I'd love to hear from you.",
    feedbackButton: "Send feedback",
    install: {
      title: "Install the app",
      installedTitle: "App installed",
      installedBody:
        "Skull King Crew Ledger is installed on your device. It opens like any app and works fully offline.",
      promptHint:
        "Add Skull King Crew Ledger to your home screen for one-tap access and offline play.",
      manualHint:
        "Add Skull King Crew Ledger to your home screen for one-tap access and offline play. Follow the steps for your phone below.",
      button: "Install now",
      error: "Installation could not start. Try the manual steps below.",
      guideTitle: "How to install it by hand",
      iosSafariTitle: "iPhone & iPad (Safari)",
      iosSafariSteps: [
        "Open this page in Safari.",
        "Tap the Share button (a square with an upward arrow) at the bottom of the screen.",
        "Scroll down and tap “Add to Home Screen”.",
        "Tap “Add” at the top right. The app icon appears on your home screen.",
      ],
      iosChromeTitle: "iPhone & iPad (Chrome)",
      iosChromeSteps: [
        "Open this page in Chrome.",
        "Tap the small Share button (a square with an upward arrow) in the address bar.",
        "Tap the “⌄” chevron (“See more”) to show every option.",
        "Tap the “+” button named “Add to Home Screen”. The app icon appears on your home screen.",
      ],
      androidTitle: "Android (Chrome)",
      androidSteps: [
        "Open this page in Chrome.",
        "Tap the ⋮ menu at the top right.",
        "Tap “Install app” (or “Add to Home screen”).",
        "Confirm with “Install”. The app icon appears on your home screen.",
      ],
    },
    cloud: {
      title: "Shared game table",
      statusIdle: "Cloud backup is on.",
      statusSynced:
        "Backed up. Your games save to the cloud automatically and come back if this device's data is cleared.",
      statusSyncing: "Saving to the cloud…",
      statusOffline: "Offline. Changes will sync once you're back online.",
      statusUnavailable: "Cloud backup isn't set up for this app.",
      tablesTitle: "Your tables",
      tableUnnamed: "Unnamed table",
      tableActive: "Active",
      tableSwitch: (name) => `Switch to ${name}`,
      tableSwitching: "Opening that table…",
      tableSwitchError:
        "That table could not be opened. Check your connection and try again.",
      newTable: "Start a new table",
      newTableHint:
        "A fresh table with its own history and leaderboard, for another group of friends. Your current tables stay on this phone.",
      removeTable: (name) => `Remove ${name} from this phone`,
      removeTableTitle: "Remove this table from this phone?",
      removeTableMessage:
        "It only disappears from this phone. The table and its games keep existing for its members, and you can rejoin later with an invite.",
      removeTableCancel: "Cancel",
      removeTableConfirm: "Remove",
      tableNameLabel: "Table name",
      tableNamePlaceholder: "e.g. Friday night crew",
      tableNameHint:
        "Give your crew's table a name. Everyone who joins the table sees the same name, history and leaderboard.",
      shareTitle: "Invite your crew",
      shareHint:
        "Friends scan this QR code (or open the link) to join your table. Anyone on the table can keep score; every game joins the same shared history. Share it only with your crew.",
      copyLink: "Copy invite link",
      copying: "Copying…",
      linkCopied: "Link copied!",
      copyFailed: "Copy failed",
      qrLabel: "QR code to join this game table",
      linkTitle: "No camera at hand? Use a code",
      linkHint:
        "Copy this table's code, then paste it on the other phone to join the same table there. Keep it private; anyone with it can see and edit your games.",
      codeLabel: "This table's code",
      copy: "Copy",
      copied: "Copied",
      joinTitle: "Join another table",
      pasteLabel: "Paste a code from another table",
      linkButton: "Join that table",
      linking: "Joining…",
      linkError: "That code could not be read.",
      linkSuccess: "Done. This phone is now on the shared table.",
    },
  },

  joinTable: {
    title: "Join a game table",
    named: (name) => `Join the table “${name}”?`,
    unnamed: "Join this game table?",
    message: (count) =>
      count === 1
        ? "This table and its 1 game will be added on this phone. Games already on this phone stay in their own table; you can switch tables anytime."
        : `This table and its ${count} games will be added on this phone. Games already on this phone stay in their own table; you can switch tables anytime.`,
    confirm: "Join the table",
    cancel: "Not now",
    busy: "Joining…",
    success: "Welcome aboard! This phone now follows this table.",
    error:
      "This invite could not be opened. Check your connection, or ask your crew to send the link again.",
  },

  setup: {
    title: "New Game",
    crew: "Gather your crew",
    players: "Players",
    seatingHint:
      "Enter players in clockwise seating order. Player 1 deals the first round. Use the arrows to rearrange the table.",
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
      "The two-player variant described in the rulebook: deal a third hand for the Greybeard ghost. He plays but never bids or scores, so he steals some tricks. Your two trick counts can total less than the cards dealt.",
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
        "Each round puts 10 points per card dealt at stake. Exact bid: all of it. Off by one: half. Off by two or more: nothing. Scores are never negative.",
    },
    rascalBetsTitle: "Rascal's optional rules ✊",
    rascalBetsHint:
      "After bidding, everyone declares Grapeshot (open hand: the standard tiers) or Cannonball (closed fist: 15 points per card dealt on an exact bid, nothing otherwise, bonuses included).",
    bonusesOnMissTitle: "Count bonuses after a missed bid",
    bonusesOnMissHint:
      "Optional variant: capture bonuses (14s, Mermaids, Pirates, Skull King...) still count after a missed bid. Leave this off to follow the official exact-bid rule.",
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
    playOrderLead: (name) => `Play order · ${name} leads the first trick`,
    ghostName: "Greybeard",
    bid: "Bid",
    won: "Won",
    bonus: "Bonus",
    roundPoints: "Round points",
    roundPointsPreview: "Provisional score",
    total: (n) => `${n} total`,
    tricksRecorded: (x, y) => `Tricks recorded: ${x} / ${y}`,
    tricksOk: "  ✓",
    tricksWarnNormal: "  (must equal cards dealt)",
    ghostTook: (n) => `  ·  Greybeard 👻 took ${n}`,
    tricksWarnOver: "  (more than the cards dealt; check your counts)",
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
      buckshot: "Grapeshot",
      cannonball: "Cannonball",
    },
    rascalBetFor: (name) => `${name}'s declaration`,
  },

  gameSettings: {
    open: "Game rules",
    title: "Game rules",
    recomputeHint:
      "Changes apply to the whole game: rounds already scored are recalculated with the new rules.",
    close: "Done",
  },

  liveShare: {
    open: "Live score sharing",
    badge: "Live",
    title: "Follow the scores",
    subtitle: "Every player can track the scores on their own phone.",
    liveHint:
      "Start a live session. Players who scan the code follow the scores in real time; every bid, trick and bonus appears on their phone as you record it, no refresh needed.",
    start: "Start live tracking",
    starting: "Starting…",
    stop: "Stop live tracking",
    liveOnTitle: "Live tracking is on",
    liveScanHint:
      "Players scan this QR code to follow the scores live on their own phone.",
    statusLive: "Live · auto-updating",
    statusSyncing: "Saving…",
    statusOffline: "Reconnecting…",
    liveError:
      "Live sync hit a problem. It keeps retrying. Check your connection, or stop and start again.",
    copyLink: "Copy link",
    copied: "Link copied!",
    copyError: "Could not copy the link.",
    qrLabel: "QR code opening the score tracking of this game",
    close: "Close",
  },

  spectator: {
    liveEyebrow: "Live tracking",
    liveBadge: "Live",
    title: "Game tracking",
    roundProgress: (scored, total) =>
      `Scores after round ${scored} of ${total}`,
    noRounds: "No round has been scored yet.",
    finished: "Final scores. The game is over.",
    liveUpdatedAt: (time) => `Updated live · ${time}`,
    connecting: "Connecting to the live game…",
    reconnecting: "Connection lost. Reconnecting…",
    endedTitle: "Live session ended",
    endedBody:
      "The scorekeeper stopped sharing. The last scores you received are shown below.",
    standingsTitle: "Standings",
    tapHint:
      "Tap any player for their full round-by-round details: bids, tricks and every bonus.",
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
      "The scanned link does not contain a readable game. Ask the scorekeeper to show the QR code again, then rescan it.",
  },

  results: {
    gameOver: "Game Over",
    winner: (name, total) => `${name} wins with ${total} points!`,
    duration: (hours, minutes) =>
      hours > 0 && minutes > 0
        ? `Played in ${hours} hr ${minutes} min`
        : hours > 0
          ? `Played in ${hours} hr`
          : minutes > 0
            ? `Played in ${minutes} min`
            : "Played in under a minute",
    podiumTitle: "Podium",
    podiumPlace: (rank, name, total) =>
      `Rank ${rank}, ${name}, ${total} points`,
    review: "Review round-by-round",
    rematch: "Rematch with the same crew",
    installTitle: "Keep Skull King Crew Ledger aboard",
    installHint: "Install the app for quick access and fully offline play.",
    installIosHint:
      "Tap Share and “Add to Home Screen”. In Chrome, open “See more” first.",
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
    scoreEvolution: "Score evolution",
    hallOfFame: "Hall of fame",
    hallOfShame: "Hall of shame",

    totalGames: "Games logged",
    totalRounds: "Rounds played",
    totalPlunder: "Points plundered",
    totalPlayers: "Crew members",

    bestFinalScore: "Best final score",
    bestFinalScoreHint: "The highest total anyone has ever finished a game on.",
    biggestRound: "Biggest round",
    biggestRoundHint: "The most points banked in a single round.",
    bestExactBid: "Sharpest bidder",
    bestExactBidHint: (rounds) =>
      `The best exact-bid rate, over at least ${rounds} rounds played.`,
    zeroBidMaster: "Master of nothing",
    zeroBidMasterHint: (zeroBids) =>
      `The best record at bidding zero and taking nothing, over at least ${zeroBids} zero bids.`,
    longestStreak: "Hottest streak",
    longestStreakHint: "The longest run of games won back to back.",
    biggestComeback: "Biggest comeback",
    biggestComebackHint:
      "The most places climbed between the halfway standings and the final ones.",
    biggestBonusHaul: "Richest haul",
    biggestBonusHaulHint:
      "The most bonus points won from special cards in a single game.",
    worstFinalScore: "Worst final score",
    worstFinalScoreHint: "The lowest total anyone has ever finished a game on.",
    worstRound: "Worst round",
    worstRoundHint: "The deepest hole dug in a single round.",
    mostLastPlaces: "Most last places",
    mostLastPlacesHint:
      "Finished behind everyone else at the table more often than anyone.",
    boldestBidder: "Boldest bidder",
    boldestBidderHint:
      "Claims the biggest share of every hand dealt: brave, or reckless.",

    recordUnclaimed: "Not claimed yet",
    unitPoints: "pts",
    unitWins: (count) => (count === 1 ? "win" : "wins"),
    unitPlaces: (count) => (count === 1 ? "place" : "places"),
    unitGames: (count) => (count === 1 ? "game" : "games"),
    roundMeta: (round, date) => `Round ${round} · ${date}`,
    sampleMeta: (successes, attempts) =>
      `${successes} of ${attempts} ${attempts === 1 ? "round" : "rounds"}`,
    comebackMeta: (fromRank, toRank, date) =>
      `${ordinal(fromRank)} → ${ordinal(toRank)} · ${date}`,
    lastPlaceMeta: (rate, games) =>
      `${rate} of ${games} ${games === 1 ? "game" : "games"}`,
    appetiteMeta: (averageBid, rounds) =>
      `${averageBid} tricks a round · ${rounds} ${
        rounds === 1 ? "round" : "rounds"
      }`,

    metricsResults: "Results",
    metricsBidding: "Bidding",
    metricsScoring: "Scoring",

    gamesPlayed: "Games played",
    roundsPlayed: "Rounds played",
    wins: "Wins",
    winRate: "Win rate",
    rivalsBeaten: "Rivals beaten",
    averageRank: "Average rank",
    lastPlaces: "Last places",
    winStreak: "Current win streak",
    longestWinStreak: "Longest win streak",
    exactBidRate: "Exact-bid rate",
    zeroBidRate: "Zero-bid success",
    bidAppetite: "Bid appetite",
    averagePoints: "Points per game",
    pointsPerRound: "Points per round",
    bestScore: "Best score",
    worstScore: "Worst score",
    bestRoundScore: "Best round",
    worstRoundScore: "Worst round",
    bonusPoints: "Bonus points",

    outOfGames: (count, games) =>
      `${count} of ${games} ${games === 1 ? "game" : "games"}`,
    seatsCaption: (seats) => `out of ${seats} players`,
    perGame: "Average across every game",
    rivalsBeatenCaption: "Share of opponents finished ahead of",
    perRound: "Average across every round",
    fromSpecialCards: "Won from special cards",
    bidCaption: (averageBid) => `${averageBid} tricks a round`,

    recentGames: "Recent games",
    unavailable: "Not available",
    chartLabel: (leader, rounds) =>
      `Score evolution after ${rounds} ${rounds === 1 ? "round" : "rounds"}; ${leader} leads.`,
    playerSummary: (games, wins) =>
      `${games} ${games === 1 ? "game" : "games"} · ${wins} ${
        wins === 1 ? "win" : "wins"
      }`,
    bidSummary: (successes, attempts) => `${successes} of ${attempts}`,
    recentGame: (date, rank, score) =>
      `${date} · ${ordinal(rank)} · ${score} points`,
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
      `${medal} ${name}, ${score} points`,
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
    exact: "Exact bid",
    missed: "Missed bid",
    runningTotal: "Total after round",
    expandRound: (n) => `Show round ${n} details`,
    collapseRound: (n) => `Hide round ${n} details`,
    bidSuccess: (bid) => `Exact bid: ${bid}`,
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
      whiff: "Complete miss",
    },
    rascalBidDirect: (bid) => `Direct hit · bid ${bid} exact · full points`,
    rascalBidGlancing: "Glancing blow · off by one · half the points",
    rascalBidWhiff: (diff) => `Complete miss · off by ${diff}`,
    rascalCannonballWon: "Cannonball · exact bid · 15 per card",
    rascalCannonballLost: (diff) => `Cannonball missed · off by ${diff}`,
    ignored: "Not counted",
    items: {
      colored14: (count) =>
        `${count} colored ${count === 1 ? "14" : "14s"} captured`,
      black14: "Black 14 captured",
      mermaidByPirate: (count) =>
        `Pirate took ${count} ${count === 1 ? "mermaid" : "mermaids"}`,
      pirateBySkullKing: (count) =>
        `Skull King took ${count} ${count === 1 ? "pirate" : "pirates"}`,
      mermaidCapturesSkullKing: "Mermaid took the Skull King",
      rascalWon: "Rascal wager won",
      rascalLost: "Rascal wager lost",
      expansion7: (count) =>
        `${count} special ${count === 1 ? "7" : "7s"} captured`,
      expansion8: (count) =>
        `${count} special ${count === 1 ? "8" : "8s"} captured`,
      davyJonesLeviathans: (count) =>
        `Davy Jones destroyed ${count} ${count === 1 ? "leviathan" : "leviathans"}`,
      secondCaptured: "Skull King or a mermaid took the Second",
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
    mermaidByPirate: "Pirate takes a mermaid",
    pirateBySkullKing: "Skull King takes a pirate",
    mermaidCapturesSkullKing: "Mermaid takes the Skull King",
    rascal: "Rascal wager",
    newExpansion: "New expansion",
    expansion7: "New 7 captured",
    expansion8: "New 8 captured",
    expansionColorHint:
      "The new 7s and 8s only score when the bid is hit exactly.",
    davyJonesLeviathans: "Davy Jones destroys a leviathan",
    secondCaptured: "Skull King / mermaid takes the Second",
    each: "ea.",
    requiresBidHint:
      "This game only awards capture bonuses when the bid is made exactly.",
    requiresBidMissed:
      "Bid missed: capture bonuses do not count in this game.",
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
    title: "Scoring & cards",
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
        body: "Chosen when creating the game. Every player has the same potential each round: 10 points per card dealt, whatever the bid. Accuracy decides how much of it you take. Scores never go negative.",
      },
      {
        title: "Direct hit · glancing blow · complete miss",
        body: "Exact bid: all the points at stake. Off by one: half of them. Off by two or more: nothing.",
      },
      {
        title: "Bonus points follow the same tiers",
        body: "Capture bonuses count in full on a direct hit, half on a glancing blow, and not at all on a whiff. Loot, the special 7s/8s and the Rascal pirate wager keep their own exact-bid rules.",
      },
      {
        title: "Optional: Grapeshot or Cannonball",
        body: "If enabled at setup, everyone declares after bidding, then reveals simultaneously. Open hand (Grapeshot) keeps the standard tiers; closed fist (Cannonball) pays 15 points per card dealt on an exact bid and nothing otherwise, bonuses included.",
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
        title: "Pirate takes a mermaid  (+20 each)",
        body: "Your pirate wins a trick containing a mermaid.",
      },
      {
        title: "Skull King takes a pirate  (+30 each)",
        body: "Your Skull King wins a trick containing pirate(s).",
      },
      {
        title: "Mermaid takes the Skull King  (+40)",
        body: "Your mermaid wins a trick containing the Skull King. (Mermaid beats Skull King beats Pirates beats Mermaid.)",
      },
      {
        title: "Capture bonuses require an exact bid",
        body: "Official rules award capture bonuses only when you make your bid exactly. They go to whoever captures the card, no matter who played it. The setup option enables the opposite variant: capture bonuses still count after a missed bid.",
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
