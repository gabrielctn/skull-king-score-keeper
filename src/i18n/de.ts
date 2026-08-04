import { Strings } from "./types";

export const de: Strings = {
  langLabel: "DE",

  common: {
    home: "Startseite",
    back: "Zurück",
    newGame: "Neues Spiel",
    storageError:
      "Die lokale Speicherung ist fehlgeschlagen. Exportiere deine Spiele, bevor du die App schließt.",
    dismiss: "Schließen",
  },

  cookies: {
    accessibilityLabel: "Auswahl für Analyse-Cookies",
    message:
      "Wir verwenden Google-Analytics-Cookies, um Besuche zu verstehen und Skull King Crew Ledger zu verbessern.",
    decline: "Ablehnen",
    accept: "Akzeptieren",
  },

  home: {
    title: "Skull King",
    subtitle: "Crew Ledger",
    unofficial: "Inoffizielle Fan-App",
    resume: "Spiel fortsetzen",
    activeTitle: "Laufendes Spiel",
    playing: "Mitspieler",
    lastPlayed: (date) => `Zuletzt gespielt: ${date}`,
    abandon: "Spiel aufgeben",
    abandonTitle: "Dieses Spiel aufgeben?",
    abandonMessage:
      "Alle Punkte und Rundendetails dieses laufenden Spiels werden dauerhaft gelöscht. Beendete Spiele bleiben erhalten.",
    abandonConfirm: "Aufgeben",
    history: "Letzte Spiele",
    historyHint: "Tippe auf ein Spiel, um es fortzusetzen oder den Stand anzusehen.",
    historyShowAll: (count) => `Alle ${count} Spiele anzeigen`,
    historyShowLess: "Weniger anzeigen",
    inProgress: "Läuft",
    finished: "Beendet",
    openGame: (date) => `Spiel vom ${date} öffnen`,
    deleteGame: (date) => `Spiel vom ${date} löschen`,
    deleteTitle: "Dieses Spiel löschen?",
    deleteMessage: "Punktestand und Rundendetails werden dauerhaft gelöscht.",
    deleteCancel: "Abbrechen",
    deleteConfirm: "Löschen",
    playersRound: (players, round, total) =>
      `${players} Spieler · Runde ${round} von ${total}`,
    leading: (name, total) => `In Führung: ${name} (${total})`,
    support: "Entwickler unterstützen ☕",
    supportHint: "Freiwilliger Beitrag · die App bleibt vollständig kostenlos.",
    disclaimer:
      "Von einem Spieler erstellt, ohne Verbindung zu, Unterstützung oder Sponsoring durch Grandpa Beck’s Games, dessen Verlage oder Händler. „Skull King“ und die offiziellen Spielelemente gehören den jeweiligen Rechteinhabern.",
    offline: "Funktioniert offline · über den Browser installieren",
  },

  whatsNew: {
    open: "Neuigkeiten",
    badge: "Neu",
    title: "Neuigkeiten",
    version: (version, date) => `Version ${version} · ${date}`,
    automaticUpdatesTitle: "Immer aktuell",
    automaticUpdatesBody:
      "Installierte Apps laden jede neue Version automatisch und wechseln zu ihr, sobald das Gerät online ist.",
    items: [
      "Die eigene Crew einzuladen und einem anderen Tisch beizutreten sind jetzt getrennte Aktionen, die in den Einstellungen direkt sichtbar sind.",
      "Gemeinsame Spieltische: Gib dem Tisch deiner Crew einen Namen und lade Freunde per Link oder QR-Code ein. Wer beitritt, kann die Punkte führen, jedes Spiel landet in der gemeinsamen Historie und Rangliste, und ein Handy kann mehrere Tische halten, einen pro Freundesgruppe.",
      "Die Regeln lassen sich jetzt während des Spiels über den neuen ⚙-Button ändern: Erweiterung aktivieren, Wertung wechseln und mehr. Bereits gewertete Runden werden automatisch neu berechnet.",
      "Die neue Erweiterung ist bei neuen Spielen jetzt standardmäßig aktiviert.",
      "Der Live-Button ist jetzt eine klare „Live“-Schaltfläche, und die Spielreihenfolge zeigt nummerierte Plätze mit dem Spieler, der den Stich eröffnet.",
      "Alle Bonus-Bezeichnungen folgen jetzt derselben Form: Wer fängt wen.",
    ],
    close: "Verstanden",
  },

  settings: {
    open: "Einstellungen",
    title: "Einstellungen",
    languageTitle: "Sprache",
    gameTitle: "Während der Partie",
    keepAwakeTitle: "Bildschirm eingeschaltet lassen",
    keepAwakeHint:
      "Verhindert, dass das Gerät in den Ruhezustand wechselt, solange ein Spielbildschirm geöffnet ist.",
    dataTitle: "Deine Daten",
    dataHint: "Exportiere eine Kopie deiner Spiele oder stelle sie auf diesem Gerät wieder her.",
    exportBackup: "Exportieren",
    importBackup: "Importieren",
    importSuccess: (count) =>
      `${count} ${count === 1 ? "Spiel importiert" : "Spiele importiert"}.`,
    backupError: "Diese Sicherung konnte nicht gelesen werden.",
    deleteAll: "Alle Spiele löschen",
    deleteAllTitle: "Alle Spiele löschen?",
    deleteAllMessage:
      "Alle Spiele, auch ein laufendes, werden dauerhaft gelöscht. Exportiere vorher am besten eine Sicherung.",
    deleteAllCancel: "Abbrechen",
    deleteAllConfirm: "Alle löschen",
    deleteAllSuccess: "Alle Spiele wurden gelöscht.",
    feedbackTitle: "Feedback",
    feedbackHint: "Fehler gefunden oder eine Idee? Ich freue mich über eine Nachricht.",
    feedbackButton: "Feedback senden",
    install: {
      title: "App installieren",
      installedTitle: "App installiert",
      installedBody:
        "Skull King Crew Ledger ist auf deinem Gerät installiert. Die App öffnet sich wie jede andere und funktioniert komplett offline.",
      promptHint:
        "Füge Skull King Crew Ledger zum Startbildschirm hinzu, um die App mit einem Tipp zu öffnen und offline zu spielen.",
      manualHint:
        "Füge Skull King Crew Ledger zum Startbildschirm hinzu, um die App mit einem Tipp zu öffnen und offline zu spielen. Folge unten den Schritten für dein Telefon.",
      button: "Jetzt installieren",
      error:
        "Die Installation konnte nicht starten. Nutze die manuellen Schritte unten.",
      guideTitle: "So installierst du sie manuell",
      iosSafariTitle: "iPhone & iPad (Safari)",
      iosSafariSteps: [
        "Öffne diese Seite in Safari.",
        "Tippe unten auf die Teilen-Schaltfläche (ein Quadrat mit Pfeil nach oben).",
        "Scrolle nach unten und tippe auf „Zum Home-Bildschirm“.",
        "Tippe oben rechts auf „Hinzufügen“. Das App-Symbol erscheint auf dem Startbildschirm.",
      ],
      iosChromeTitle: "iPhone & iPad (Chrome)",
      iosChromeSteps: [
        "Öffne diese Seite in Chrome.",
        "Tippe in der Adressleiste auf die kleine Teilen-Schaltfläche (ein Quadrat mit Pfeil nach oben).",
        "Tippe auf den Pfeil „⌄“ („Mehr anzeigen“), um alle Optionen zu sehen.",
        "Tippe auf die Schaltfläche „+“ mit dem Namen „Zum Home-Bildschirm“. Das App-Symbol erscheint auf dem Startbildschirm.",
      ],
      androidTitle: "Android (Chrome)",
      androidSteps: [
        "Öffne diese Seite in Chrome.",
        "Tippe oben rechts auf das Menü ⋮.",
        "Tippe auf „App installieren“ (oder „Zum Startbildschirm hinzufügen“).",
        "Bestätige mit „Installieren“. Das App-Symbol erscheint auf dem Startbildschirm.",
      ],
    },
    cloud: {
      title: "Cloud-Sicherung",
      statusIdle: "Cloud-Sicherung ist aktiv.",
      statusSynced:
        "Sicherung abgeschlossen. Deine Spiele werden automatisch in der Cloud gespeichert und wiederhergestellt, falls die Daten dieses Geräts gelöscht werden.",
      statusSyncing: "Wird in der Cloud gespeichert…",
      statusOffline: "Offline. Änderungen werden synchronisiert, sobald du wieder online bist.",
      statusUnavailable: "Cloud-Sicherung ist für diese App nicht eingerichtet.",
      tablesTitle: "Deine Tische",
      tableUnnamed: "Unbenannter Tisch",
      tableActive: "Aktiv",
      tableSwitch: (name) => `Zum Tisch ${name} wechseln`,
      tableSwitching: "Tisch wird geöffnet…",
      tableSwitchError:
        "Dieser Tisch konnte nicht geöffnet werden. Prüfe deine Verbindung und versuche es erneut.",
      newTable: "Neuen Tisch anlegen",
      newTableHint:
        "Ein leerer Tisch mit eigener Historie und Rangliste, für eine andere Freundesgruppe. Deine bisherigen Tische bleiben auf diesem Handy.",
      removeTable: (name) => `${name} von diesem Handy entfernen`,
      removeTableTitle: "Diesen Tisch von diesem Handy entfernen?",
      removeTableMessage:
        "Er verschwindet nur von diesem Handy. Der Tisch und seine Spiele bleiben für seine Mitglieder bestehen, und du kannst später mit einer Einladung wieder beitreten.",
      removeTableCancel: "Abbrechen",
      removeTableConfirm: "Entfernen",
      tableNameLabel: "Name des Tisches",
      tableNamePlaceholder: "z. B. Freitagsrunde",
      tableNameHint:
        "Gib dem Tisch deiner Crew einen Namen. Alle, die beitreten, sehen denselben Namen, dieselbe Historie und dieselbe Rangliste.",
      shareTitle: "Lade deine Crew ein",
      shareHint:
        "Freunde scannen diesen QR-Code (oder öffnen den Link), um deinem Tisch beizutreten. Jedes Mitglied kann die Punkte führen; alle Spiele landen in derselben gemeinsamen Historie. Teile ihn nur mit deiner Crew.",
      copyLink: "Einladungslink kopieren",
      copying: "Wird kopiert…",
      linkCopied: "Link kopiert!",
      copyFailed: "Kopieren fehlgeschlagen",
      qrLabel: "QR-Code zum Beitreten dieses Spieltisches",
      linkTitle: "Keine Kamera zur Hand? Nutze einen Code",
      linkHint:
        "Kopiere den Code dieses Tisches und füge ihn auf dem anderen Handy ein, um dort demselben Tisch beizutreten. Halte ihn geheim, denn wer ihn hat, kann deine Spiele sehen und ändern.",
      codeLabel: "Code dieses Tisches",
      copy: "Kopieren",
      copied: "Kopiert",
      joinTitle: "Einem anderen Tisch beitreten",
      pasteLabel: "Code eines anderen Tisches einfügen",
      linkButton: "Diesem Tisch beitreten",
      linking: "Wird beigetreten…",
      linkError: "Dieser Code konnte nicht gelesen werden.",
      linkSuccess: "Fertig. Dieses Handy gehört jetzt zum gemeinsamen Tisch.",
    },
  },

  joinTable: {
    title: "Einem Spieltisch beitreten",
    named: (name) => `Dem Tisch „${name}“ beitreten?`,
    unnamed: "Diesem Spieltisch beitreten?",
    message: (count) =>
      count === 1
        ? "Dieser Tisch und sein Spiel werden auf diesem Handy hinzugefügt. Vorhandene Spiele bleiben in ihrem eigenen Tisch; du kannst jederzeit zwischen Tischen wechseln."
        : `Dieser Tisch und seine ${count} Spiele werden auf diesem Handy hinzugefügt. Vorhandene Spiele bleiben in ihrem eigenen Tisch; du kannst jederzeit zwischen Tischen wechseln.`,
    confirm: "Tisch beitreten",
    cancel: "Jetzt nicht",
    busy: "Wird beigetreten…",
    success: "Willkommen an Bord! Dieses Handy folgt jetzt diesem Tisch.",
    error:
      "Diese Einladung konnte nicht geöffnet werden. Prüfe deine Verbindung oder bitte deine Crew, den Link erneut zu senden.",
  },

  setup: {
    title: "Neues Spiel",
    crew: "Stelle deine Mannschaft zusammen",
    players: "Spieler",
    seatingHint:
      "Gib die Spieler im Uhrzeigersinn ein. Spieler 1 gibt in der ersten Runde. Mit den Pfeilen kannst du die Sitzordnung ändern.",
    playerPlaceholder: (n) => `Spieler ${n}`,
    addPlayer: "+ Spieler hinzufügen",
    quickTitle: "Schnelles Spiel",
    quickHint:
      "Die empfohlenen Einstellungen sind bereit. Spieler eingeben und starten oder das Spiel anpassen.",
    customize: "Spiel anpassen",
    hideCustomization: "Optionen ausblenden",
    movePlayerUp: (name) => `${name} nach oben verschieben`,
    movePlayerDown: (name) => `${name} nach unten verschieben`,
    removePlayer: (name) => `${name} entfernen`,
    twoPlayers: "Zwei Spieler",
    ghostTitle: "Graubart-Geist 👻",
    ghostHint:
      "Die Zwei-Spieler-Variante aus der Anleitung: Teile eine dritte Hand für den Graubart-Geist aus. Er spielt, bietet und punktet aber nie. So stiehlt er Stiche. Die Summe eurer Stiche kann kleiner als die Zahl der ausgeteilten Karten sein.",
    rounds: "Runden",
    roundsHint: "Eine Standardpartie Skull King hat 10 Runden.",
    structureHint:
      "Die Anleitung schlägt mehrere Kartenverteilungen vor. Wähle die Rundenstruktur für diese Partie.",
    structureNames: {
      classic: "Klassisch",
      evenKeeled: "Nur gerade Zahlen",
      brawl: "Direkt ins Gefecht",
      skirmish: "Blitzangriff",
      barrage: "Breitseiten-Beschuss",
      whirlpool: "Strudel",
      bedtime: "Schlafenszeit",
    },
    structureRounds: (n) => `${n} ${n === 1 ? "Runde" : "Runden"}`,
    showOtherStructures: "Andere Rundentypen anzeigen",
    hideOtherStructures: "Andere Rundentypen ausblenden",
    scoring: "Wertung",
    scoringHint:
      "Die Anleitung bietet zwei offizielle Wertungssysteme. Wähle das System für diese Partie.",
    scoringNames: {
      classic: "Skull-King-Wertung",
      rascal: "Rascals Wertung",
    },
    scoringHints: {
      classic:
        "Die klassische Wertung: Eine exakte Ansage bringt 20 pro Stich, Fehler kosten Punkte.",
      rascal:
        "Jede Runde stehen 10 Punkte pro ausgeteilter Karte auf dem Spiel. Exakte Ansage: alles. 1 daneben: die Hälfte. 2 oder mehr daneben: nichts. Es gibt nie Minuspunkte.",
    },
    rascalBetsTitle: "Optionale Rascal-Regeln ✊",
    rascalBetsHint:
      "Nach der Ansage wählt jede Person Grapeshot (offene Hand: übliche Stufen) oder Cannonball (geschlossene Faust: 15 Punkte pro Karte bei exakter Ansage, sonst nichts, Boni eingeschlossen).",
    bonusesOnMissTitle: "Boni trotz verfehlter Ansage zählen",
    bonusesOnMissHint:
      "Optionale Variante: Fangboni (14er, Meerjungfrauen, Piraten, Skull King ...) zählen auch nach einer verfehlten Ansage. Ausgeschaltet gilt die offizielle Regel.",
    expansion: "Erweiterungskarten",
    advancedTitle: "Beute & Rascal-Wette",
    advancedHint:
      "Erfasst Beute-Allianzen pro Runde und die Nebenwette des Rascal-Piraten. Kraken, Weißer Wal sowie 14er- und Fangboni sind immer verfügbar.",
    newExpansionTitle: "Neue Erweiterung",
    newExpansionHint:
      "Wertet die besonderen 7er und 8er, Davy Jones’ Truhe und den Zweiten. Die übrigen Erweiterungseffekte stehen in den Spielregeln der App.",
    knownPlayers: "Bekannte Spieler",
    useKnownPlayer: (name) => `${name} übernehmen`,
    start: "Spiel starten ☠️",
    needPlayers: "Mindestens 2 Spieler hinzufügen",
  },

  game: {
    round: (n) => `Runde ${n}`,
    cardsDealt: "Karten ausgeteilt",
    dealsVerb: "teilt aus",
    playOrderLead: (name) => `Spielreihenfolge · ${name} eröffnet den ersten Stich`,
    ghostName: "Graubart",
    bid: "Ansage",
    won: "Stiche",
    bonus: "Bonus",
    roundPoints: "Rundenpunkte",
    roundPointsPreview: "Vorläufige Punkte",
    total: (n) => `${n} gesamt`,
    tricksRecorded: (x, y) => `Erfasste Stiche: ${x} / ${y}`,
    tricksOk: "  ✓",
    tricksWarnNormal: "  (muss den ausgeteilten Karten entsprechen)",
    ghostTook: (n) =>
      `  ·  Graubart 👻 holte ${n} ${n === 1 ? "Stich" : "Stiche"}`,
    tricksWarnOver: "  (mehr als ausgeteilte Karten; Eingaben prüfen)",
    krakenRecord: "+ Vom Kraken verworfener Stich",
    krakenRecorded: "Kraken-Stich erfasst",
    krakenUndo: "Rückgängig",
    totalScoreTitle: "Gesamtpunktzahl",
    totalIncludesRound: "Die angezeigte Runde ist in diesen Summen enthalten.",
    totalExcludesRound: "Die angezeigte Runde ist noch nicht enthalten.",
    finish: "Spiel beenden 🏁",
    updateRound: "Runde aktualisieren",
    scoreRound: "Runde werten →",
    untouchedTitle: "Diese Runde werten?",
    untouchedMessage:
      "Es wurden keine Gebote oder Stiche eingegeben. Bestätige, dass beide Spieler null geboten haben und Graubart alle Stiche gewonnen hat.",
    untouchedCancel: "Eingaben prüfen",
    untouchedConfirm: "Ja, werten",
    rascalStake: (points) =>
      `Rascals Wertung · ${points} Punkte im Spiel`,
    rascalBetNames: {
      buckshot: "Grapeshot",
      cannonball: "Cannonball",
    },
    rascalBetFor: (name) => `Erklärung von ${name}`,
  },

  gameSettings: {
    open: "Spielregeln",
    title: "Spielregeln",
    recomputeHint:
      "Änderungen gelten für das ganze Spiel: Bereits gewertete Runden werden mit den neuen Regeln neu berechnet.",
    close: "Fertig",
  },

  liveShare: {
    open: "Live-Punkteteilung",
    badge: "Live",
    title: "Punkte mitverfolgen",
    subtitle: "Alle Spieler können die Punkte auf dem eigenen Handy verfolgen.",
    liveHint:
      "Starte eine Live-Sitzung. Wer den Code scannt, verfolgt die Punkte in Echtzeit; jede Ansage, jeder Stich und jeder Bonus erscheint auf dem Handy, sobald du ihn einträgst, ganz ohne Aktualisieren.",
    start: "Live-Verfolgung starten",
    starting: "Wird gestartet…",
    stop: "Live-Verfolgung beenden",
    liveOnTitle: "Live-Verfolgung ist an",
    liveScanHint:
      "Spieler scannen diesen QR-Code, um die Punkte live auf dem eigenen Handy zu verfolgen.",
    statusLive: "Live · aktualisiert automatisch",
    statusSyncing: "Wird gespeichert…",
    statusOffline: "Verbindung wird wiederhergestellt…",
    liveError:
      "Bei der Live-Synchronisierung gab es ein Problem. Sie versucht es weiter. Prüfe deine Verbindung, oder beende und starte neu.",
    copyLink: "Link kopieren",
    copied: "Link kopiert!",
    copyError: "Der Link konnte nicht kopiert werden.",
    qrLabel:
      "QR-Code, der die Punkteverfolgung dieser Partie öffnet",
    close: "Schließen",
  },

  spectator: {
    liveEyebrow: "Live-Verfolgung",
    liveBadge: "Live",
    title: "Partie verfolgen",
    roundProgress: (scored, total) =>
      `Punktestand nach Runde ${scored} von ${total}`,
    noRounds: "Es wurde noch keine Runde gewertet.",
    finished: "Endstand. Die Partie ist beendet.",
    liveUpdatedAt: (time) => `Live aktualisiert · ${time}`,
    connecting: "Verbindung zur Live-Partie…",
    reconnecting: "Verbindung verloren. Verbindung wird wiederhergestellt…",
    endedTitle: "Live-Sitzung beendet",
    endedBody:
      "Der Spielleiter hat das Teilen beendet. Unten stehen die zuletzt empfangenen Punkte.",
    standingsTitle: "Rangliste",
    tapHint:
      "Tippe auf einen Spieler, um alle Details Runde für Runde zu sehen: Ansagen, Stiche und sämtliche Boni.",
    identityTitle: "Welcher Spieler bist du?",
    identityHint:
      "Wähle einmal deinen Namen, um deine eigenen Punkte zu verfolgen. Das bleibt für dieses Spiel fest.",
    turnTitle: "Zugreihenfolge",
    sortLabel: "Reihenfolge",
    sortName: "A → Z",
    sortGameOrder: "Sitzplatz",
    sortRank: "Rang",
    you: "Du",
    openApp: "App für meine eigenen Partien öffnen",
    invalidTitle: "Code nicht lesbar",
    invalidBody:
      "Der gescannte Link enthält keine lesbare Partie. Bitte den Spielleiter, den QR-Code erneut zu zeigen, und scanne ihn noch einmal.",
  },

  results: {
    gameOver: "Spiel beendet",
    winner: (name, total) => `${name} gewinnt mit ${total} Punkten!`,
    duration: (hours, minutes) =>
      hours > 0 && minutes > 0
        ? `Gespielt in ${hours} Std. ${minutes} Min.`
        : hours > 0
          ? `Gespielt in ${hours} Std.`
          : minutes > 0
            ? `Gespielt in ${minutes} Min.`
            : "In weniger als einer Minute gespielt",
    podiumTitle: "Siegertreppchen",
    podiumPlace: (rank, name, total) =>
      `Platz ${rank}, ${name}, ${total} Punkte`,
    review: "Runden einzeln ansehen",
    rematch: "Revanche mit derselben Crew",
    installTitle: "Skull King Crew Ledger an Bord behalten",
    installHint: "Installiere die App für schnellen Zugriff und vollständig offline spielbare Partien.",
    installIosHint:
      "Tippe auf Teilen und „Zum Home-Bildschirm“. In Chrome zuerst „Mehr anzeigen“ öffnen.",
    installError: "Die Installation konnte nicht gestartet werden. Versuche es später erneut.",
    install: "App installieren",
    installDismiss: "Später",
    backHome: "Zur Startseite",
  },

  stats: {
    open: "Spielerstatistik",
    title: "Statistik",
    groupTitle: "Bilanz der Crew",
    playerTitle: (name) => `Statistik für ${name}`,
    emptyTitle: "Noch kein Seemannsgarn",
    emptyBody:
      "Beendet ein Spiel, um die Geschichte eurer Crew zu schreiben.",
    leaderboard: "Rangliste",
    records: "Rekorde",
    scoreEvolution: "Punkteverlauf",
    gamesPlayed: "Gespielte Partien",
    wins: "Siege",
    winRate: "Siegquote",
    exactBidRate: "Trefferquote der Ansagen",
    zeroBidRate: "Erfolgreiche Nullansagen",
    averagePoints: "Punktedurchschnitt",
    bestScore: "Bestes Ergebnis",
    worstScore: "Schlechtestes Ergebnis",
    winStreak: "Aktuelle Siegesserie",
    recentGames: "Letzte Partien",
    bestFinalScore: "Bestes Endergebnis",
    worstFinalScore: "Schlechtestes Endergebnis",
    worstRound: "Schlechteste Runde",
    bestExactBid: "Beste Ansagequote",
    totalGames: "Partien",
    totalRounds: "Runden",
    totalPlunder: "Erbeutete Punkte",
    biggestRound: "Beste Einzelrunde",
    longestStreak: "Beste Serie",
    mostReckless: "Am tollkühnsten",
    krakenBait: "Kraken-Köder",
    zeroBidMaster: "Meister der Null",
    longestWinStreak: "Längste Siegesserie",
    podiumRate: "Podestquote",
    averageRank: "Durchschnittsplatz",
    bestRoundScore: "Beste Runde",
    worstRoundScore: "Schlechteste Runde",
    unavailable: "Nicht verfügbar",
    chartLabel: (leader, rounds) =>
      `Punkteverlauf nach ${rounds} ${
        rounds === 1 ? "Runde" : "Runden"
      }; ${leader} führt.`,
    playerSummary: (games, wins) =>
      `${games} ${games === 1 ? "Partie" : "Partien"} · ${wins} ${
        wins === 1 ? "Sieg" : "Siege"
      }`,
    bidSummary: (successes, attempts) => `${successes} von ${attempts}`,
    scoreRecordHolder: (name, score, date) =>
      `${name} · ${score} Punkte · ${date}`,
    roundRecordHolder: (name, score, round, date) =>
      `${name} · ${score} Punkte in Runde ${round} · ${date}`,
    rateRecordHolder: (name, rate, successes, attempts) =>
      `${name} · ${rate} (${successes}/${attempts})`,
    streakRecordHolder: (name, streak) =>
      `${name} · ${streak} ${streak === 1 ? "Sieg" : "Siege"} in Folge`,
    recklessRecordHolder: (name, averageBid) =>
      `${name} · ${averageBid} Ansage im Schnitt`,
    countRecordHolder: (name, count) => `${name} · ${count}-mal`,
    recentGame: (date, rank, score) =>
      `${date} · Platz ${rank} · ${score} Punkte`,
  },

  share: {
    button: "Spielrückblick teilen",
    preparing: "Rückblick wird erstellt…",
    busy: "Wird geteilt…",
    fileShared: "Rückblick geteilt.",
    textShared: "Zusammenfassung geteilt.",
    copiedDownloaded: "Kopiert und heruntergeladen.",
    copied: "Kopiert.",
    downloaded: "Heruntergeladen.",
    error: "Der Rückblick konnte nicht geteilt werden.",
    summaryTitle: "Skull-King-Spielrückblick",
    awardsHeading: "Auszeichnungen der Crew",
    gameDate: (date) => `Gespielt am ${date}`,
    rankingLine: (medal, name, score) =>
      `${medal} ${name}: ${score} Punkte`,
    awardLine: (award, name) => `${award}: ${name}`,
    cancelled: "Teilen abgebrochen.",
  },

  awards: {
    title: "Auszeichnungen der Crew",
    names: {
      lookout: "Adlerauge im Ausguck",
      zeroBidRoyalty: "Krone der Null",
      comeback: "Gezeitenwender",
      reckless: "Waghals des Meeres",
      castaway: "Gestrandeter Glückspilz",
    },
  },

  scoreBreakdown: {
    title: "Punktedetails",
    close: "Schließen",
    openFor: (name, total) => `Punktedetails für ${name} anzeigen: ${total}`,
    openRankedFor: (rank, name, total) =>
      `Rang ${rank}, ${name}, ${total} Punkte. Punktedetails anzeigen`,
    currentScore: "Aktueller Stand",
    earned: "Gewonnen",
    lost: "Verloren",
    recordedHint: "Nur gewertete Runden sind enthalten.",
    noRounds: "Noch keine Runde wurde gewertet.",
    historyTitle: "Gewertete Runden",
    round: (n) => `Runde ${n}`,
    roundSummary: (bid, tricks) => `Ansage ${bid} · ${tricks} gewonnen`,
    exact: "Ansage getroffen",
    missed: "Ansage verfehlt",
    runningTotal: "Summe nach der Runde",
    expandRound: (n) => `Details zu Runde ${n} anzeigen`,
    collapseRound: (n) => `Details zu Runde ${n} ausblenden`,
    bidSuccess: (bid) => `Ansage ${bid} genau getroffen`,
    bidMissed: (bid, difference) =>
      `Ansage ${bid} verfehlt · ${difference} ${difference === 1 ? "Stich" : "Stiche"} daneben`,
    zeroBidSuccess: (cards) =>
      `Nullansage getroffen · ${cards} ${cards === 1 ? "Karte" : "Karten"}`,
    zeroBidMissed: (cards) =>
      `Nullansage verfehlt · ${cards} ${cards === 1 ? "Karte" : "Karten"}`,
    outcomes: {
      directHit: "Volltreffer",
      glancingBlow: "Streifschuss",
      whiff: "Daneben",
    },
    rascalBidDirect: (bid) =>
      `Volltreffer · Ansage ${bid} exakt · alle Punkte`,
    rascalBidGlancing: "Streifschuss · 1 daneben · halbe Punkte",
    rascalBidWhiff: (diff) => `Daneben · ${diff} Stiche Abweichung`,
    rascalCannonballWon: "Cannonball · exakte Ansage · 15 pro Karte",
    rascalCannonballLost: (diff) =>
      `Cannonball verfehlt · ${diff} Stiche Abweichung`,
    ignored: "Nicht gewertet",
    items: {
      colored14: (count) => `${count} farbige ${count === 1 ? "14" : "14er"} gefangen`,
      black14: "Schwarze 14 gefangen",
      mermaidByPirate: (count) => `Ein Pirat fing ${count} ${count === 1 ? "Meerjungfrau" : "Meerjungfrauen"}`,
      pirateBySkullKing: (count) => `Der Skull King fing ${count} Piraten`,
      mermaidCapturesSkullKing: "Eine Meerjungfrau fing den Skull King",
      rascalWon: "Rascal-Wette gewonnen",
      rascalLost: "Rascal-Wette verloren",
      expansion7: (count) => `${count} besondere ${count === 1 ? "7" : "7er"} gefangen`,
      expansion8: (count) => `${count} besondere ${count === 1 ? "8" : "8er"} gefangen`,
      davyJonesLeviathans: (count) => `Davy Jones zerstörte ${count} ${count === 1 ? "Leviathan" : "Leviathane"}`,
      secondCaptured: "Skull King oder Meerjungfrau fing den Zweiten",
      legacyLoot: (count) => `${count} alte Beute-${count === 1 ? "Bonus" : "Boni"}`,
      loot: (count) => `${count} Beute-${count === 1 ? "Allianz" : "Allianzen"} erfolgreich`,
      lootMissed: (count) => `${count} Beute-${count === 1 ? "Allianz" : "Allianzen"} · mindestens eine Ansage verfehlt`,
      lootSelfWin: (count) => `${count} Beute-${count === 1 ? "Karte" : "Karten"} vom eigenen Spieler zurückgewonnen · keine Allianz`,
    },
  },

  bonus: {
    colored14: "Farbige 14er",
    black14: "Schwarze 14 (Jolly Roger)",
    mermaidByPirate: "Pirat fängt eine Meerjungfrau",
    pirateBySkullKing: "Skull King fängt einen Piraten",
    mermaidCapturesSkullKing: "Meerjungfrau fängt den Skull King",
    rascal: "Rascal-Wette",
    newExpansion: "Neue Erweiterung",
    expansion7: "Neue 7 gefangen",
    expansion8: "Neue 8 gefangen",
    expansionColorHint: "Die neuen 7er und 8er zählen nur bei exakt getroffener Ansage.",
    davyJonesLeviathans: "Davy Jones zerstört einen Leviathan",
    secondCaptured: "Skull King / Meerjungfrau fängt den Zweiten",
    each: "je",
    requiresBidHint:
      "In dieser Partie gibt es Fangboni nur bei exakt getroffener Ansage.",
    requiresBidMissed:
      "Ansage verfehlt: Fangboni zählen in dieser Partie nicht.",
    cardBonus: (n) => `Kartenbonus: ${n >= 0 ? "+" : ""}${n}`,
  },

  loot: {
    title: "Beute-Allianzen",
    hint: "Erfasse jede Beute-Karte, sobald sie gespielt wird. Am Rundenende müssen alle beteiligten Ansagen bestätigt werden.",
    record: "+ Beute erfassen",
    useNumber: (n) => `Beute ${n}`,
    playedByPrompt: "Wer hat die Beute-Karte gespielt?",
    winnerPrompt: "Wer hat den Stich gewonnen?",
    playedByRole: "spielte Beute",
    winnerRole: "gewann den Stich",
    pendingPair: (playedBy, boundTo) => `${playedBy} und ${boundTo} müssen beide ihre Ansage treffen.`,
    success: "Beide Ansagen getroffen · je +20",
    failed: (names) => `Kein Beute-Bonus · Ansage verfehlt: ${names}`,
    selfWin: (name) => `${name} gewann die eigene Beute · keine Allianz gebildet`,
    change: "Ändern",
    remove: "Entfernen",
    removeLabel: (n) => `Beute ${n} entfernen`,
    maxRecorded: "Beide Beute-Karten sind erfasst.",
    incomplete: "Wähle vor der Rundenwertung die Spieler für jede Beute.",
    legacyNotice: "Ältere Beute-Punkte bleiben erhalten, aber die ursprünglichen Spielerverknüpfungen wurden nicht gespeichert.",
  },

  lootConfirmation: {
    eyebrow: "Prüfung erforderlich",
    title: "Beute-Allianzen bestätigen",
    intro: (players) => `${players} ${players === 1 ? "Spieler ist" : "Spieler sind"} an einer Beute-Allianz beteiligt. Prüfe vor dem Fortfahren jede Ansage.`,
    madeBid: "Ansage getroffen",
    missedBid: "Ansage verfehlt",
    allianceBonus: "Allianz erfolgreich · je +20 Punkte",
    noAllianceBonus: "Allianz gescheitert · kein Beute-Bonus",
    confirm: "Ansagen bestätigen",
  },

  rules: {
    title: "Wertung & Karten",
    done: "Fertig",
    unofficialNotice: "Inoffizielle praktische Zusammenfassung zur leichteren Wertung. Im Zweifel gilt die Anleitung deiner Ausgabe.",
    officialRules: "Offizielle Regeln ansehen",
    headings: {
      scoring: "Wertung",
      rascal: "Rascals Wertung",
      bonus: "Bonuspunkte",
      expansion: "Neue Erweiterung",
      special: "Sonderkarten",
      twoPlayer: "Zwei-Spieler-Variante",
    },
    scoring: [
      { title: "Ansage 1 oder mehr", body: "Exakt getroffen: +20 pro gewonnenem Stich. Verfehlt (zu hoch oder zu niedrig): -10 pro Stich Abweichung und keine Punkte für gewonnene Stiche." },
      { title: "Nullansage", body: "0 Stiche: +10 × ausgeteilte Karten dieser Runde. Mindestens 1 Stich: -10 × ausgeteilte Karten dieser Runde." },
    ],
    rascal: [
      { title: "Eine offizielle Alternativwertung", body: "Wird beim Erstellen der Partie gewählt. Alle haben in jeder Runde dasselbe Potenzial: 10 Punkte pro ausgeteilter Karte, egal wie hoch die Ansage. Die Genauigkeit entscheidet, wie viel davon du bekommst. Die Punktzahl wird nie negativ." },
      { title: "Volltreffer · Streifschuss · daneben", body: "Exakte Ansage: alle Punkte im Spiel. 1 daneben: die Hälfte. 2 oder mehr daneben: nichts." },
      { title: "Boni folgen denselben Stufen", body: "Fangboni zählen bei einem Volltreffer voll, bei einem Streifschuss zur Hälfte und bei einer Abweichung von 2 oder mehr gar nicht. Beute, die besonderen 7er/8er und die Rascal-Piratenwette behalten ihre eigene Bedingung der exakten Ansage." },
      { title: "Optional: Grapeshot oder Cannonball", body: "Falls aktiviert, wählt jede Person nach der Ansage und alle zeigen gleichzeitig. Offene Hand (Grapeshot): übliche Stufen; geschlossene Faust (Cannonball): 15 Punkte pro Karte bei exakter Ansage, sonst nichts, Boni eingeschlossen." },
    ],
    bonusEntries: [
      { title: "Farbige 14  (+10 je)", body: "Jede gelbe / violette / grüne 14, die du am Rundenende fängst (den Stich mit ihr gewinnst)." },
      { title: "Schwarze 14  (+20)", body: "Fange die schwarze 14 (Jolly Roger / Trumpf)." },
      { title: "Pirat fängt Meerjungfrau  (+20 je)", body: "Dein Pirat gewinnt einen Stich mit einer Meerjungfrau." },
      { title: "Skull King fängt Pirat  (+30 je)", body: "Dein Skull King gewinnt einen Stich mit einem oder mehreren Piraten." },
      { title: "Meerjungfrau fängt Skull King  (+40)", body: "Deine Meerjungfrau gewinnt einen Stich mit dem Skull King. (Meerjungfrau schlägt Skull King, Skull King schlägt Piraten, Piraten schlagen Meerjungfrau.)" },
      { title: "Boni erfordern eine exakte Ansage", body: "Nach den offiziellen Regeln werden Fangboni nur bei exakt getroffener Ansage vergeben. Sie gehen an die Person, die die Karte fängt, unabhängig davon, wer sie gespielt hat. Eine Option beim Erstellen des Spiels aktiviert die umgekehrte Variante: Fangboni zählen auch nach einer verfehlten Ansage." },
    ],
    expansion: [
      { title: "Neue 7er und 8er  (-5 / +5 je)", body: "Sie werden wie normale Farbkarten gespielt. Wer eine neue 7 fängt, verliert 5 Punkte; wer eine neue 8 fängt, erhält 5 Punkte, allerdings nur bei exakt getroffener Ansage. Bei Gleichstand gewinnt die zuerst gespielte Karte." },
      { title: "0/14-Karten", body: "Sage beim Ausspielen sofort an, ob die Karte als 0 oder 14 zählt. Sie gibt keinen Bonus." },
      { title: "Wilde 15", body: "Sie zählt als gelbe, violette oder grüne 15. Wähle ihre Farbe, wenn noch keine festgelegt ist. Ist bereits eine nicht-schwarze Farbe vorgegeben, muss sie dieser folgen. Bei Schwarz muss keine Farbe angesagt werden." },
      { title: "Mary Throne (Pirat)", body: "Sie wird wie ein normaler Pirat gespielt. Mit erweiterten Piratenkräften ziehst du ungesehen zufällig eine Karte aus der Hand eines Gegners; diese muss im nächsten Stich unabhängig von den bereits gespielten Karten gespielt werden." },
      { title: "Letzte Salve", body: "Sie kann keinen Stich gewinnen und ist keine Flucht. Nachdem alle gespielt haben, spielst du sofort eine weitere Karte. Danach hast du eine Karte weniger und setzt beim letzten Stich der Runde aus." },
      { title: "Über die Planke", body: "Diese Karte kann den Stich nicht gewinnen. Entferne am Ende des Stichs einen darin liegenden Piraten; er kann den Stich nicht mehr gewinnen oder Punkte geben." },
      { title: "Gefleckter Rochen", body: "Die niedrigste Karte gewinnt; bei Gleichstand die zuerst gespielte. Sind mehrere Leviathane im Stich (Kraken, Weißer Wal, Gefleckter Rochen), bestimmt der zuletzt gespielte dessen Effekt." },
      { title: "Davy Jones’ Truhe  (+20 pro Leviathan)", body: "Mit Leviathanen verwenden. Sie kann den Stich nicht gewinnen und zerstört alle Leviathane darin; die stärkste übrige Karte gewinnt normal. Der Spieler der Truhe erhält 20 Punkte pro zerstörtem Leviathan, unabhängig von der Kartenreihenfolge." },
      { title: "Der Zweite  (+30 beim Fang)", body: "Er schlägt jede Karte außer Skull King und Meerjungfrauen. Er darf die Kräfte gefangener Piraten nutzen, erhält dafür aber keinen Fangbonus. Wird er vom Skull King oder einer Meerjungfrau gefangen, gibt es 30 Punkte." },
    ],
    special: [
      { title: "Flucht / Tigerin als Flucht", body: "Verliert den Stich immer. Damit kannst du gefahrlos einen unerwünschten Stich abwerfen." },
      { title: "Pirat (x5) & Tigerin", body: "Schlagen alle Zahlenkarten. Die Tigerin kann als Pirat oder Flucht gespielt werden." },
      { title: "Skull King", body: "Schlägt alle Zahlen und Piraten (+30 pro gefangenem Piraten). Nur eine Meerjungfrau kann ihn schlagen." },
      { title: "Meerjungfrau (x2)", body: "Schlägt alle Zahlen und den Skull King (+40), verliert aber gegen Piraten. Sind Pirat, Skull King und Meerjungfrau in einem Stich, gewinnt immer die Meerjungfrau." },
      { title: "Kraken", body: "Der Stich wird zerstört: NIEMAND gewinnt ihn, die Karten kommen beiseite. Er zählt nicht und es gibt keine Fänge. Den nächsten Stich beginnt, wer gewonnen hätte." },
      { title: "Weißer Wal", body: "Alle Sonderkarten werden neutralisiert und verlieren; die höchste ZAHL gewinnt (einschließlich Trumpf). Wurden nur Sonderkarten gespielt, wird der Stich abgeworfen. In einem Wal-Stich gibt es keine Sonderkarten-Fangboni." },
      { title: "Kraken gegen Weißen Wal", body: "Sind beide im selben Stich, gilt die zuletzt gespielte Karte; wende deren Regel an." },
      { title: "Beute  (+20 pro Verbündetem)", body: "Bildet eine Allianz zwischen der Person, die sie spielt, und dem Gewinner des Stichs. Erfasse beide; treffen BEIDE ihre Ansage exakt, vergibt die App je +20." },
      { title: "Rascal-Piratenwette (0/10/20)", body: "Eine Nebenwette: Bei getroffener Ansage gewinnst du den Einsatz, andernfalls verlierst du ihn." },
    ],
    twoPlayer: [
      { title: "Graubart, der Geist 👻", body: "In der Zwei-Spieler-Variante der Anleitung erhält der Graubart-Geist eine dritte Hand. Er spielt in jedem Stich als Zweiter, muss die angespielte Farbe nicht bedienen und seine Tigerin zählt immer als Flucht. Beute-Karten werden nicht verwendet." },
      { title: "Er spielt, punktet aber nie", body: "Graubart sagt nichts an und erhält keine Punkte. Er stiehlt nur Stiche (Bonuskarten darin gehen verloren). Gewinnt er einen Stich, spielt er den nächsten aus; sonst ist er immer Zweiter." },
      { title: "Eure Stichsumme kann kleiner sein", body: "Weil Graubart Stiche gewinnt, kann die Summe eurer Stiche KLEINER als die Zahl der ausgeteilten Karten sein. Die App zeigt stattdessen, wie viele Stiche der Geist nahm." },
    ],
  },

  stepper: {
    decrease: (label) => `${label} verringern`,
    increase: (label) => `${label} erhöhen`,
  },
};
