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
      "Wir verwenden Google-Analytics-Cookies, um Besuche zu verstehen und den Punktezähler zu verbessern.",
    decline: "Ablehnen",
    accept: "Akzeptieren",
  },

  home: {
    title: "Punktezähler",
    subtitle: "für Skull King",
    unofficial: "Inoffizielle Fan-App",
    resume: "Spiel fortsetzen",
    history: "Letzte Spiele",
    historyHint: "Tippe auf ein Spiel, um es fortzusetzen oder den Stand anzusehen.",
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
      "Neuer ▦-Knopf im Spielbildschirm: Zeige einen QR-Code und jeder Spieler öffnet auf dem eigenen Handy eine Lese-Ansicht der Punkte.",
      "Alle prüfen ihre Ansagen, Stiche und jeden Bonus, ohne den Spielleiter zu fragen — erneutes Scannen aktualisiert die Ansicht.",
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
      "Alle Spiele — auch ein laufendes — werden dauerhaft gelöscht. Exportiere vorher am besten eine Sicherung.",
    deleteAllCancel: "Abbrechen",
    deleteAllConfirm: "Alle löschen",
    deleteAllSuccess: "Alle Spiele wurden gelöscht.",
    feedbackTitle: "Feedback",
    feedbackHint: "Fehler gefunden oder eine Idee? Ich freue mich über Nachricht.",
    feedbackButton: "Feedback senden",
  },

  setup: {
    title: "Neues Spiel",
    crew: "Stelle deine Mannschaft zusammen",
    players: "Spieler",
    seatingHint:
      "Gib die Spieler im Uhrzeigersinn ein — Spieler 1 gibt in der ersten Runde. Mit den Pfeilen kannst du die Sitzordnung ändern.",
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
      "Die Zwei-Spieler-Variante aus der Anleitung: Teile eine dritte Hand für den Graubart-Geist aus. Er spielt, bietet und punktet aber nie. So stiehlt er Stiche — die Summe eurer Stiche kann kleiner als die Zahl der ausgeteilten Karten sein.",
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
      rascal: "Rascal-Wertung",
    },
    scoringHints: {
      classic:
        "Die klassische Wertung: Eine exakte Ansage bringt 20 pro Stich, Fehler kosten Punkte.",
      rascal:
        "Jede Runde stehen 10 Punkte pro ausgeteilter Karte auf dem Spiel. Exakte Ansage: alles. 1 daneben: die Hälfte. 2 oder mehr daneben: nichts — nie Minuspunkte.",
    },
    rascalBetsTitle: "Optionale Rascal-Regeln ✊",
    rascalBetsHint:
      "Nach der Ansage erklärt jede Person Schrotladung (offene Hand: übliche Stufen) oder Kanonenkugel (geschlossene Faust: 15 Punkte pro Karte bei exakter Ansage, sonst nichts — Boni eingeschlossen).",
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
    dealsVerb: "gibt",
    playOrderHint: "Spielreihenfolge · links beginnt",
    ghostName: "Graubart",
    bid: "Ansage",
    won: "Stiche",
    bonus: "Bonus",
    roundPoints: "Rundenpunkte",
    total: (n) => `${n} gesamt`,
    tricksRecorded: (x, y) => `Erfasste Stiche: ${x} / ${y}`,
    tricksOk: "  ✓",
    tricksWarnNormal: "  (muss den ausgeteilten Karten entsprechen)",
    ghostTook: (n) => `  ·  Graubart 👻 nahm ${n}`,
    tricksWarnOver: "  (mehr als ausgeteilte Karten — Eingaben prüfen)",
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
      `Rascal-Wertung · ${points} Punkte im Spiel`,
    rascalBetNames: {
      buckshot: "Schrotladung",
      cannonball: "Kanonenkugel",
    },
    rascalBetFor: (name) => `Erklärung von ${name}`,
  },

  liveShare: {
    open: "Live-Punkteverfolgung teilen (QR-Code)",
    title: "Live mitverfolgen",
    subtitle: "Alle Spieler können die Punkte auf dem eigenen Handy verfolgen.",
    scanHint:
      "Lass die Spieler diesen QR-Code scannen: Er öffnet eine reine Lese-Ansicht dieser Partie — jede Ansage, jeder Stich und jeder Bonus, den du einträgst.",
    updateHint:
      "Der QR-Code enthält immer den zuletzt gespeicherten Stand. Zum Aktualisieren scannt ein Spieler ihn einfach erneut.",
    networkHint:
      "Das Handy des Spielers braucht beim ersten Öffnen der App eine Verbindung; danach funktioniert die Ansicht auch offline.",
    copyLink: "Link kopieren",
    copied: "Link kopiert!",
    copyError: "Der Link konnte nicht kopiert werden.",
    qrError: "Diese Partie konnte nicht in einen QR-Code umgewandelt werden.",
    qrLabel:
      "QR-Code, der die Live-Punkteverfolgung dieser Partie öffnet",
    close: "Schließen",
  },

  spectator: {
    eyebrow: "Nur-Lese-Ansicht",
    title: "Partie verfolgen",
    roundProgress: (scored, total) =>
      `Punktestand nach Runde ${scored} von ${total}`,
    noRounds: "Es wurde noch keine Runde gewertet.",
    finished: "Endstand — die Partie ist beendet.",
    snapshotAt: (time) => `Punkte des Spielleiters · abgelesen um ${time}`,
    refreshHint:
      "Dies ist eine Momentaufnahme. Zum Aktualisieren scanne den QR-Code des Spielleiters erneut.",
    standingsTitle: "Rangliste",
    tapHint:
      "Tippe auf deinen Namen für deine vollständigen Details Runde für Runde — Ansagen, Stiche und jeder Bonus.",
    you: "Du",
    openApp: "App für meine eigenen Partien öffnen",
    invalidTitle: "Code nicht lesbar",
    invalidBody:
      "Der gescannte Link enthält keine lesbare Partie. Bitte den Spielleiter, den QR-Code erneut zu zeigen, und scanne ihn noch einmal.",
  },

  results: {
    gameOver: "Spiel beendet",
    winner: (name, total) => `${name} gewinnt mit ${total}!`,
    podiumTitle: "Siegertreppchen",
    podiumPlace: (rank, name, total) =>
      `Platz ${rank}, ${name}, ${total} Punkte`,
    review: "Runden einzeln ansehen",
    rematch: "Revanche mit derselben Crew",
    installTitle: "Punktezähler an Bord behalten",
    installHint: "Installiere die App für schnellen Zugriff und vollständig offline spielbare Partien.",
    installIosHint:
      "Öffne diese Seite bei Bedarf in Safari und tippe dann auf Teilen und „Zum Home-Bildschirm“.",
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
    winStreak: "Aktuelle Siegesserie",
    recentGames: "Letzte Partien",
    bestFinalScore: "Bestes Endergebnis",
    worstRound: "Schlechteste Runde",
    bestExactBid: "Beste Ansagequote",
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
      `${medal} ${name} — ${score} Punkte`,
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
      whiff: "Fehlschlag",
    },
    rascalBidDirect: (bid) =>
      `Volltreffer · Ansage ${bid} exakt · alle Punkte`,
    rascalBidGlancing: "Streifschuss · 1 daneben · halbe Punkte",
    rascalBidWhiff: (diff) => `Fehlschlag · ${diff} daneben`,
    rascalCannonballWon: "Kanonenkugel · exakte Ansage · 15 pro Karte",
    rascalCannonballLost: (diff) =>
      `Kanonenkugel verloren · ${diff} daneben`,
    ignored: "Nicht gewertet",
    items: {
      colored14: (count) => `${count} farbige ${count === 1 ? "14" : "14er"} gefangen`,
      black14: "Schwarze 14 gefangen",
      mermaidByPirate: (count) => `${count} ${count === 1 ? "Meerjungfrau" : "Meerjungfrauen"} von einem Piraten gefangen`,
      pirateBySkullKing: (count) => `${count} ${count === 1 ? "Pirat" : "Piraten"} vom Skull King gefangen`,
      mermaidCapturesSkullKing: "Meerjungfrau fängt den Skull King",
      rascalWon: "Rascal-Wette gewonnen",
      rascalLost: "Rascal-Wette verloren",
      expansion7: (count) => `${count} besondere ${count === 1 ? "7" : "7er"} gefangen`,
      expansion8: (count) => `${count} besondere ${count === 1 ? "8" : "8er"} gefangen`,
      davyJonesLeviathans: (count) => `${count} ${count === 1 ? "Leviathan" : "Leviathane"} von Davy Jones zerstört`,
      secondCaptured: "Den Zweiten gefangen",
      legacyLoot: (count) => `${count} alte Beute-${count === 1 ? "Bonus" : "Boni"}`,
      loot: (count) => `${count} Beute-${count === 1 ? "Allianz" : "Allianzen"} erfolgreich`,
      lootMissed: (count) => `${count} Beute-${count === 1 ? "Allianz" : "Allianzen"} · mindestens eine Ansage verfehlt`,
      lootSelfWin: (count) => `${count} Beute-${count === 1 ? "Karte" : "Karten"} vom eigenen Spieler zurückgewonnen · keine Allianz`,
    },
  },

  bonus: {
    colored14: "Farbige 14er",
    black14: "Schwarze 14 (Jolly Roger)",
    mermaidByPirate: "Meerjungfrau von einem Piraten gefangen",
    pirateBySkullKing: "Pirat vom Skull King gefangen",
    mermaidCapturesSkullKing: "Meerjungfrau fängt den Skull King",
    rascal: "Rascal-Wette",
    newExpansion: "Neue Erweiterung",
    expansion7: "Neue 7 gefangen",
    expansion8: "Neue 8 gefangen",
    expansionColorHint: "Die neuen 7er und 8er zählen nur bei exakt getroffener Ansage.",
    davyJonesLeviathans: "Leviathan von Davy Jones zerstört",
    secondCaptured: "Zweiter von Skull King / Meerjungfrau gefangen",
    each: "je",
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
      rascal: "Rascal-Wertung",
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
      { title: "Eine offizielle Alternativwertung", body: "Wird beim Erstellen der Partie gewählt. Alle haben in jeder Runde dasselbe Potenzial — 10 Punkte pro ausgeteilter Karte, egal wie hoch die Ansage — und die Genauigkeit entscheidet, wie viel davon du bekommst. Die Punktzahl wird nie negativ." },
      { title: "Volltreffer · Streifschuss · Fehlschlag", body: "Exakte Ansage: alle Punkte im Spiel. 1 daneben: die Hälfte. 2 oder mehr daneben: nichts." },
      { title: "Boni folgen denselben Stufen", body: "Fangboni zählen bei einem Volltreffer voll, bei einem Streifschuss zur Hälfte und bei einem Fehlschlag gar nicht. Beute, die besonderen 7er/8er und die Rascal-Piratenwette behalten ihre eigene Bedingung der exakten Ansage." },
      { title: "Optional: Schrotladung oder Kanonenkugel", body: "Falls aktiviert, wählt jede Person nach der Ansage und alle zeigen gleichzeitig. Offene Hand (Schrotladung): übliche Stufen; geschlossene Faust (Kanonenkugel): 15 Punkte pro Karte bei exakter Ansage, sonst nichts — Boni eingeschlossen." },
    ],
    bonusEntries: [
      { title: "Farbige 14  (+10 je)", body: "Jede gelbe / violette / grüne 14, die du am Rundenende fängst (den Stich mit ihr gewinnst)." },
      { title: "Schwarze 14  (+20)", body: "Fange die schwarze 14 (Jolly Roger / Trumpf)." },
      { title: "Meerjungfrau durch Pirat  (+20 je)", body: "Dein Pirat gewinnt einen Stich mit einer Meerjungfrau." },
      { title: "Pirat durch Skull King  (+30 je)", body: "Dein Skull King gewinnt einen Stich mit einem oder mehreren Piraten." },
      { title: "Meerjungfrau fängt Skull King  (+40)", body: "Deine Meerjungfrau gewinnt einen Stich mit dem Skull King. (Meerjungfrau schlägt Skull King, Skull King schlägt Piraten, Piraten schlagen Meerjungfrau.)" },
      { title: "Boni zählen unabhängig von der Ansage", body: "Fangboni bleiben auch bei verfehlter Ansage erhalten. Sie gehen an die Person, die die Karte fängt, unabhängig davon, wer sie gespielt hat." },
    ],
    expansion: [
      { title: "Neue 7er und 8er  (-5 / +5 je)", body: "Sie werden wie normale Farbkarten gespielt. Wer eine neue 7 fängt, verliert 5 Punkte; wer eine neue 8 fängt, erhält 5 Punkte — nur bei exakt getroffener Ansage. Bei Gleichstand gewinnt die zuerst gespielte Karte." },
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
