import { Strings } from "./types";

/** Ordinaux français : 1er, puis 2e, 3e, 4e… */
const ordinal = (value: number) => (value === 1 ? "1er" : `${value}e`);

export const fr: Strings = {
  langLabel: "FR",

  common: {
    home: "Accueil",
    back: "Retour",
    newGame: "Nouvelle partie",
    storageError:
      "La sauvegarde locale a échoué. Exportez vos parties avant de fermer l’app.",
    dismiss: "Fermer",
  },

  cookies: {
    accessibilityLabel: "Choix des cookies statistiques",
    message:
      "Nous utilisons des cookies Google Analytics pour mesurer les visites et améliorer Skull King Crew Ledger.",
    decline: "Refuser",
    accept: "Accepter",
  },

  home: {
    title: "Skull King",
    subtitle: "Crew Ledger",
    unofficial: "Application non officielle",
    resume: "Reprendre la partie",
    activeTitle: "Partie en cours",
    playing: "Participants",
    lastPlayed: (date) => `Dernière activité : ${date}`,
    abandon: "Abandonner la partie",
    abandonTitle: "Abandonner cette partie ?",
    abandonMessage:
      "Tous les scores et détails des manches de cette partie en cours seront définitivement supprimés. Les parties terminées ne seront pas affectées.",
    abandonConfirm: "Abandonner",
    history: "Parties récentes",
    historyHint: "Touchez une partie pour la reprendre ou consulter son classement.",
    historyShowAll: (count) => `Afficher les ${count} parties`,
    historyShowLess: "Afficher moins",
    inProgress: "En cours",
    finished: "Terminée",
    openGame: (date) => `Ouvrir la partie du ${date}`,
    deleteGame: (date) => `Supprimer la partie du ${date}`,
    deleteTitle: "Supprimer cette partie ?",
    deleteMessage: "Son score et le détail de ses manches seront définitivement supprimés.",
    deleteCancel: "Annuler",
    deleteConfirm: "Supprimer",
    playersRound: (players, round, total) =>
      `${players} joueurs · manche ${round} sur ${total}`,
    leading: (name, total) => `En tête : ${name} (${total})`,
    tableTitle: "Votre table",
    tableHint: (name) =>
      name
        ? `Vos parties rejoignent la table « ${name} ».`
        : "Vos parties rejoignent votre table partagée.",
    tableInvite: "Inviter",
    tableJoin: "Rejoindre",
    support: "Soutenir le développeur ☕",
    supportHint:
      "Contribution facultative · l’application reste entièrement gratuite.",
    supportCost: (amountEur) =>
      `Publier l’application sur l’App Store coûte ${amountEur} €/an au développeur. Vos dons servent d’abord à payer cette facture.`,
    disclaimer:
      "Application créée par un joueur, sans affiliation, approbation ni parrainage de Grandpa Beck’s Games, de ses éditeurs ou distributeurs. « Skull King » et les éléments officiels du jeu appartiennent à leurs ayants droit respectifs.",
    offline: "Fonctionne hors ligne · installable depuis le navigateur",
  },

  supportPrompt: {
    title: "Vous aimez cette appli ?",
    body:
      "Elle est gratuite, sans publicité et sans compte, et elle le restera. Il n’y a personne derrière, à part un joueur qui la développe sur son temps libre.",
    cost: (amountEur) =>
      `La garder disponible sur l’App Store coûte ${amountEur} €/an à son développeur. Un petit coup de pouce suffit à couvrir cette facture.`,
    donate: "Soutenir le développeur ☕",
    later: "Plus tard",
    never: "Ne plus me le proposer",
  },

  whatsNew: {
    open: "Nouveautés",
    badge: "Nouveau",
    title: "Nouveautés",
    version: (version, date) => `Version ${version} · ${date}`,
    automaticUpdatesTitle: "Toujours à jour",
    automaticUpdatesBody:
      "Les applications installées téléchargent désormais chaque nouvelle version automatiquement et l’activent dès que l’appareil est en ligne.",
    items: [
      "Rejoindre une table se fait désormais avec un code à six caractères : l’hôte l’affiche, les autres le saisissent dans leur propre appli. Sans appareil photo ni détour par le navigateur, et à l’identique sur l’appli installée et sur le web.",
      "Supprimer une partie la supprime désormais pour tout l’équipage : une partie retirée de l’historique ne réapparaît plus à la synchronisation suivante et quitte définitivement les statistiques.",
      "L’application reste gratuite et sans publicité : l’accueil indique désormais ce que coûte sa présence sur l’App Store (100 €/an), et une partie terminée propose parfois de contribuer à cette facture.",
      "Le partage des scores utilise désormais uniquement des sessions QR en direct, afin que chaque joueur voie les mises à jour en temps réel.",
      "Inviter votre équipage et rejoindre une autre table sont désormais deux actions distinctes, directement visibles dans les paramètres.",
      "Tables de jeu partagées : donnez un nom à la table de votre équipage et invitez vos amis par lien ou QR code. Chaque membre peut tenir les scores, toutes les parties rejoignent l’historique et le classement partagés, et un même téléphone peut garder plusieurs tables, une par groupe d’amis.",
      "Les règles peuvent désormais être modifiées en cours de partie via le nouveau bouton ⚙ : activer l’extension, changer de décompte, etc. Les manches déjà comptées sont recalculées automatiquement.",
      "L’extension est maintenant activée par défaut pour les nouvelles parties.",
      "Le bouton de suivi en direct devient une pastille « Live » explicite, et l’ordre de jeu affiche des places numérotées avec la personne qui entame.",
      "Les intitulés de bonus suivent tous la même forme : qui prend quoi.",
    ],
    close: "Compris",
  },

  settings: {
    open: "Paramètres",
    title: "Paramètres",
    languageTitle: "Langue",
    gameTitle: "Pendant la partie",
    keepAwakeTitle: "Garder l’écran allumé",
    keepAwakeHint:
      "Empêche l’appareil de se mettre en veille tant qu’un écran de partie est ouvert.",
    dataTitle: "Vos données",
    dataHint: "Exportez une copie de vos parties ou restaurez-la sur cet appareil.",
    exportBackup: "Exporter",
    importBackup: "Importer",
    importSuccess: (count) =>
      `${count} ${count === 1 ? "partie importée" : "parties importées"}.`,
    backupError: "Impossible de lire cette sauvegarde.",
    deleteAll: "Supprimer toutes les parties",
    deleteAllTitle: "Supprimer toutes les parties ?",
    deleteAllMessage:
      "Toutes les parties, y compris une éventuelle partie en cours, seront définitivement supprimées. Pensez à exporter une sauvegarde avant.",
    deleteAllCancel: "Annuler",
    deleteAllConfirm: "Tout supprimer",
    deleteAllSuccess: "Toutes les parties ont été supprimées.",
    feedbackTitle: "Votre avis",
    feedbackHint: "Un bug ou une idée ? N’hésitez pas à m’écrire.",
    feedbackButton: "Envoyer un retour",
    install: {
      title: "Installer l’application",
      installedTitle: "Application installée",
      installedBody:
        "Skull King Crew Ledger est installée sur votre appareil. Elle s’ouvre comme une appli et fonctionne entièrement hors ligne.",
      promptHint:
        "Ajoutez Skull King Crew Ledger à votre écran d’accueil pour y accéder rapidement et jouer hors ligne.",
      manualHint:
        "Ajoutez Skull King Crew Ledger à votre écran d’accueil pour y accéder rapidement et jouer hors ligne. Suivez les étapes correspondant à votre téléphone ci-dessous.",
      button: "Installer maintenant",
      error:
        "L’installation n’a pas pu démarrer. Suivez les étapes manuelles ci-dessous.",
      guideTitle: "Comment l’installer manuellement",
      iosSafariTitle: "iPhone et iPad (Safari)",
      iosSafariSteps: [
        "Ouvrez cette page dans Safari.",
        "Touchez le bouton Partager (un carré surmonté d’une flèche) en bas de l’écran.",
        "Faites défiler et touchez « Sur l’écran d’accueil ».",
        "Touchez « Ajouter » en haut à droite. L’icône apparaît sur votre écran d’accueil.",
      ],
      iosChromeTitle: "iPhone et iPad (Chrome)",
      iosChromeSteps: [
        "Ouvrez cette page dans Chrome.",
        "Touchez le petit bouton Partager (un carré surmonté d’une flèche) dans la barre d’adresse.",
        "Touchez le chevron « ⌄ » (« En voir plus ») pour afficher toutes les options.",
        "Touchez le bouton « + » nommé « Sur l’écran d’accueil ». L’icône apparaît sur votre écran d’accueil.",
      ],
      androidTitle: "Android (Chrome)",
      androidSteps: [
        "Ouvrez cette page dans Chrome.",
        "Touchez le menu ⋮ en haut à droite.",
        "Touchez « Installer l’application » (ou « Ajouter à l’écran d’accueil »).",
        "Confirmez avec « Installer ». L’icône apparaît sur votre écran d’accueil.",
      ],
    },
    cloud: {
      title: "Table de jeu partagée",
      statusIdle: "La sauvegarde cloud est activée.",
      statusSynced:
        "Sauvegarde terminée. Vos parties sont enregistrées automatiquement dans le cloud et restaurées si les données de cet appareil sont effacées.",
      statusSyncing: "Enregistrement dans le cloud…",
      statusOffline: "Hors ligne. Les changements se synchroniseront une fois de retour en ligne.",
      statusUnavailable: "La sauvegarde cloud n’est pas configurée pour cette appli.",
      tablesTitle: "Vos tables",
      tableUnnamed: "Table sans nom",
      tableActive: "Active",
      tableSwitch: (name) => `Passer à la table ${name}`,
      tableSwitching: "Ouverture de la table…",
      tableSwitchError:
        "Cette table n’a pas pu être ouverte. Vérifiez votre connexion et réessayez.",
      newTable: "Créer une nouvelle table",
      newTableHint:
        "Une table vierge avec son propre historique et son propre classement, pour un autre groupe d’amis. Vos tables actuelles restent sur ce téléphone.",
      removeTable: (name) => `Retirer ${name} de ce téléphone`,
      removeTableTitle: "Retirer cette table de ce téléphone ?",
      removeTableMessage:
        "Elle disparaît uniquement de ce téléphone. La table et ses parties continuent d’exister pour ses membres, et vous pourrez la rejoindre plus tard avec une invitation.",
      removeTableCancel: "Annuler",
      removeTableConfirm: "Retirer",
      tableNameLabel: "Nom de la table",
      tableNamePlaceholder: "ex. La tablée du vendredi",
      tableNameHint:
        "Donnez un nom à la table de votre équipage. Tous ceux qui la rejoignent voient le même nom, le même historique et le même classement.",
      shareTitle: "Inviter votre équipage",
      shareHint:
        "Montrez un code à six caractères à vos amis : ils le saisissent dans leur propre appli et rejoignent la table. Chaque membre peut tenir les scores ; toutes les parties rejoignent le même historique partagé. N’invitez que votre équipage : une invitation donne accès à toutes vos parties.",
      joinTitle: "Rejoindre une autre table",
    },
  },

  tableInvite: {
    title: "Inviter à votre table",
    subtitle: "Un code à dicter, rien à scanner",
    subtitleNamed: (name) => `Rejoindre « ${name} »`,
    steps:
      "Votre ami ouvre son appli, touche « Rejoindre » et tape ce code.",
    minting: "Création du code…",
    codeLabel: (spelled) => `Code d’invitation : ${spelled}`,
    expiresIn: (countdown) => `Valable encore ${countdown}`,
    expired: "Code expiré",
    newCode: "Nouveau code",
    retry: "Réessayer",
    warning:
      "Toute personne qui saisit ce code voit et modifie les parties de la table. Ne le donnez qu’à votre équipage.",
    offline:
      "Le code n’a pas pu être créé. Vérifiez votre connexion et réessayez.",
    unsupported:
      "Les codes d’invitation ne sont pas encore disponibles sur ce serveur.",
    throttled: "Trop de tentatives sur le serveur. Réessayez dans une minute.",
    copyCode: "Copier le code",
    codeCopied: "Code copié !",
  },

  joinByCode: {
    title: "Rejoindre une table",
    subtitle: "Tapez le code affiché sur l’autre téléphone",
    placeholder: "K7M-4QP",
    inputLabel: (length) => `Code d’invitation à ${length} caractères`,
    submit: "Rejoindre la table",
    hint: "Un code reste valable 15 minutes. Si le vôtre a expiré, demandez-en un nouveau à la personne qui tient la table.",
    malformed:
      "Ce n’est pas un code d’invitation. Saisissez les six caractères affichés sur l’autre téléphone.",
    unknown:
      "Ce code n’est plus valable. Les codes durent 15 minutes : demandez-en un nouveau à votre ami.",
    throttled: "Trop de tentatives. Réessayez dans une minute.",
    unsupported:
      "Les codes d’invitation ne sont pas encore disponibles sur ce serveur.",
    offline: "Serveur injoignable. Vérifiez votre connexion et réessayez.",
  },

  joinTable: {
    title: "Rejoindre une table de jeu",
    named: (name) => `Rejoindre la table « ${name} » ?`,
    unnamed: "Rejoindre cette table de jeu ?",
    message: (count) =>
      count === 1
        ? "Cette table et sa partie seront ajoutées sur ce téléphone. Les parties déjà présentes restent dans leur propre table ; vous pouvez changer de table à tout moment."
        : `Cette table et ses ${count} parties seront ajoutées sur ce téléphone. Les parties déjà présentes restent dans leur propre table ; vous pouvez changer de table à tout moment.`,
    confirm: "Rejoindre la table",
    cancel: "Pas maintenant",
    busy: "Connexion…",
    success: "Bienvenue à bord ! Ce téléphone suit désormais cette table.",
    error:
      "Cette invitation n’a pas pu être ouverte. Vérifiez votre connexion, ou demandez à votre équipage de renvoyer le lien.",
  },

  setup: {
    title: "Nouvelle partie",
    crew: "Rassemblez votre équipage",
    players: "Joueurs",
    seatingHint:
      "Saisissez les joueurs dans l’ordre des places, sens horaire. Le joueur 1 distribue la 1re manche. Utilisez les flèches pour réorganiser la table.",
    playerPlaceholder: (n) => `Joueur ${n}`,
    addPlayer: "+ Ajouter un joueur",
    quickTitle: "Configuration rapide (classique)",
    quickHint:
      "Les réglages recommandés sont prêts. Saisissez les joueurs et commencez, ou personnalisez la partie.",
    customize: "Personnaliser la partie",
    hideCustomization: "Masquer les options",
    movePlayerUp: (name) => `Déplacer ${name} vers le haut`,
    movePlayerDown: (name) => `Déplacer ${name} vers le bas`,
    removePlayer: (name) => `Retirer ${name}`,
    twoPlayers: "Deux joueurs",
    ghostTitle: "Fantôme Barbe Grise 👻",
    ghostHint:
      "La variante à 2 joueurs décrite dans le livret : distribuez une troisième main pour le fantôme Barbe Grise. Il joue mais ne mise jamais et ne marque pas. Comme il vous vole certains plis, vos deux totaux peuvent être inférieurs au nombre de cartes distribuées.",
    rounds: "Manches",
    roundsHint: "Une partie standard de Skull King compte 10 manches.",
    structureHint:
      "Le livret propose plusieurs façons de distribuer les cartes. Choisissez la structure des manches de cette partie.",
    structureNames: {
      classic: "Classique",
      evenKeeled: "Pas d’impair",
      brawl: "Prêt au combat",
      skirmish: "Attaque éclair",
      barrage: "Tir de barrage",
      whirlpool: "Tourbillon",
      bedtime: "L’heure du dodo",
    },
    structureRounds: (n) => `${n} ${n === 1 ? "manche" : "manches"}`,
    showOtherStructures: "Afficher les autres types de manches",
    hideOtherStructures: "Masquer les autres types de manches",
    scoring: "Décompte des points",
    scoringHint:
      "Le livret propose deux façons officielles de compter les points. Choisissez celle de cette partie.",
    scoringNames: {
      classic: "Les scores selon Skull King",
      rascal: "Les scores selon Rascal",
    },
    scoringHints: {
      classic:
        "Le décompte classique : une mise exacte rapporte 20 par pli, une erreur coûte des points.",
      rascal:
        "Chaque manche met en jeu 10 points par carte distribuée. Mise exacte : la totalité. Écart de 1 : la moitié. Écart de 2 ou plus : rien. Les scores ne sont jamais négatifs.",
    },
    rascalBetsTitle: "Règles optionnelles de Rascal ✊",
    rascalBetsHint:
      "Après la mise, chacun déclare Chevrotine (main ouverte : barème habituel) ou Boulet de canon (poing fermé : 15 points par carte distribuée si la mise est exacte, sinon rien, bonus compris).",
    bonusesOnMissTitle: "Compter les bonus malgré une mise ratée",
    bonusesOnMissHint:
      "Variante optionnelle : les bonus de capture (14, sirènes, pirates, Skull King...) restent acquis après une mise ratée. Laissez cette option désactivée pour suivre la règle officielle.",
    expansion: "Cartes d’extension",
    advancedTitle: "Butin et pari Rascal",
    advancedHint:
      "Ajoute le suivi des alliances Butin par manche et le pari du pirate Rascal. Le Kraken, la Baleine blanche et les bonus de 14/capture sont toujours disponibles.",
    newExpansionTitle: "Extension",
    newExpansionHint:
      "Ajoute au décompte les 7 et 8 spéciaux, le Casier de Davy Jones et le Second. Les autres effets de l’extension sont détaillés dans l’aide en jeu.",
    knownPlayers: "Joueurs connus",
    useKnownPlayer: (name) => `Utiliser ${name}`,
    start: "Commencer ☠️",
    needPlayers: "Ajoutez au moins 2 joueurs",
  },

  game: {
    round: (n) => `Manche ${n}`,
    cardsDealt: "cartes distribuées",
    dealsVerb: "distribue",
    playOrderLead: (name) => `Ordre de jeu · ${name} entame la manche`,
    ghostName: "Barbe Grise",
    bid: "Mise",
    won: "Plis",
    bonus: "Bonus",
    roundPoints: "Points de la manche",
    roundPointsPreview: "Score provisoire",
    total: (n) => `${n} au total`,
    tricksRecorded: (x, y) => `Plis enregistrés : ${x} / ${y}`,
    tricksOk: "  ✓",
    tricksWarnNormal: "  (doit égaler les cartes distribuées)",
    ghostTook: (n) =>
      `  ·  Barbe Grise 👻 a remporté ${n} ${n === 1 ? "pli" : "plis"}`,
    tricksWarnOver: "  (plus que les cartes distribuées ; vérifiez vos comptes)",
    krakenRecord: "+ Pli défaussé par le Kraken",
    krakenRecorded: "Pli du Kraken comptabilisé",
    krakenUndo: "Annuler",
    totalScoreTitle: "Score total",
    totalIncludesRound: "La manche affichée est incluse dans ces totaux.",
    totalExcludesRound:
      "La manche affichée n’est pas encore incluse dans ces totaux.",
    finish: "Terminer la partie 🏁",
    updateRound: "Modifier la manche",
    scoreRound: "Valider la manche →",
    untouchedTitle: "Valider cette manche ?",
    untouchedMessage:
      "Aucune mise ni aucun pli n’a été saisi. Confirmez que les deux joueurs ont misé zéro et que Barbe Grise a remporté tous les plis.",
    untouchedCancel: "Vérifier",
    untouchedConfirm: "Oui, valider",
    rascalStake: (points) =>
      `Scores selon Rascal · ${points} points en jeu`,
    rascalBetNames: {
      buckshot: "Chevrotine",
      cannonball: "Boulet de canon",
    },
    rascalBetFor: (name) => `Déclaration de ${name}`,
  },

  gameSettings: {
    open: "Règles de la partie",
    title: "Règles de la partie",
    recomputeHint:
      "Les changements s’appliquent à toute la partie : les manches déjà comptées sont recalculées avec les nouvelles règles.",
    close: "Terminé",
  },

  liveShare: {
    open: "Partage des scores en direct",
    badge: "Live",
    title: "Suivre les scores",
    subtitle: "Chaque joueur peut suivre les scores sur son propre téléphone.",
    liveHint:
      "Démarrez une session en direct. Les joueurs qui scannent le code suivent les scores en temps réel ; chaque mise, pli et bonus apparaît sur leur téléphone au moment où vous l’enregistrez, sans rien actualiser.",
    start: "Démarrer le suivi en direct",
    starting: "Démarrage…",
    stop: "Arrêter le suivi en direct",
    liveOnTitle: "Suivi en direct activé",
    liveScanHint:
      "Les joueurs scannent ce QR code pour suivre les scores en direct sur leur propre téléphone.",
    statusLive: "En direct · mise à jour auto",
    statusSyncing: "Enregistrement…",
    statusOffline: "Reconnexion…",
    liveError:
      "La synchronisation en direct a rencontré un problème et réessaie automatiquement. Vérifiez votre connexion, ou arrêtez puis relancez le suivi.",
    copyLink: "Copier le lien",
    copied: "Lien copié !",
    copyError: "Impossible de copier le lien.",
    qrLabel: "QR code ouvrant le suivi des scores de cette partie",
    close: "Fermer",
  },

  spectator: {
    liveEyebrow: "Suivi en direct",
    liveBadge: "En direct",
    title: "Suivi de partie",
    roundProgress: (scored, total) =>
      `Scores après la manche ${scored} sur ${total}`,
    noRounds: "Aucune manche n’a encore été validée.",
    finished: "Scores finaux. La partie est terminée.",
    liveUpdatedAt: (time) => `Mis à jour en direct · ${time}`,
    connecting: "Connexion à la partie en direct…",
    reconnecting: "Connexion perdue, reconnexion…",
    endedTitle: "Session en direct terminée",
    endedBody:
      "Le maître du jeu a arrêté le partage. Les derniers scores reçus sont affichés ci-dessous.",
    standingsTitle: "Classement",
    tapHint:
      "Touchez un joueur pour consulter son détail complet, manche par manche : mises, plis et bonus.",
    identityTitle: "Quel joueur êtes-vous ?",
    identityHint:
      "Choisissez votre nom une fois pour suivre vos propres scores. Ce choix reste fixe pour cette partie.",
    turnTitle: "Ordre du tour",
    sortLabel: "Ordre",
    sortName: "A → Z",
    sortGameOrder: "Places",
    sortRank: "Rang",
    you: "Vous",
    openApp: "Ouvrir l’appli pour mes propres parties",
    invalidTitle: "Code illisible",
    invalidBody:
      "Le lien scanné ne contient pas de partie lisible. Demandez au maître du jeu de réafficher le QR code, puis scannez-le à nouveau.",
  },

  results: {
    gameOver: "Partie terminée",
    winner: (name, total) => `${name} gagne avec ${total} points !`,
    duration: (hours, minutes) =>
      hours > 0 && minutes > 0
        ? `Partie jouée en ${hours} h ${String(minutes).padStart(2, "0")}`
        : hours > 0
          ? `Partie jouée en ${hours} h`
          : minutes > 0
            ? `Partie jouée en ${minutes} min`
            : "Partie jouée en moins d’une minute",
    podiumTitle: "Podium",
    podiumPlace: (rank, name, total) =>
      `${rank === 1 ? "1re" : `${rank}e`} place, ${name}, ${total} points`,
    review: "Revoir manche par manche",
    rematch: "Revanche avec le même équipage",
    installTitle: "Gardez Skull King Crew Ledger à bord",
    installHint: "Installez l’app pour la retrouver rapidement et jouer hors ligne.",
    installIosHint:
      "Touchez Partager puis « Sur l’écran d’accueil ». Dans Chrome, ouvrez d’abord « En voir plus ».",
    installError: "L’installation n’a pas pu démarrer. Vous pourrez réessayer plus tard.",
    install: "Installer l’app",
    installDismiss: "Plus tard",
    backHome: "Retour à l’accueil",
  },

  stats: {
    open: "Statistiques des joueurs",
    title: "Statistiques",
    groupTitle: "Palmarès de l’équipage",
    playerTitle: (name) => `Statistiques de ${name}`,
    emptyTitle: "Aucune légende à raconter",
    emptyBody:
      "Terminez une partie pour commencer l’histoire de votre équipage.",
    leaderboard: "Classement",
    scoreEvolution: "Évolution des scores",
    hallOfFame: "Panthéon",
    hallOfShame: "Fond de cale",

    totalGames: "Parties jouées",
    totalRounds: "Manches jouées",
    totalPlunder: "Points amassés",
    totalPlayers: "Membres d’équipage",

    bestFinalScore: "Meilleur score final",
    bestFinalScoreHint:
      "Le plus haut total jamais atteint en fin de partie.",
    biggestRound: "Plus grosse manche",
    biggestRoundHint: "Le plus gros butin ramassé en une seule manche.",
    bestExactBid: "Mise la plus juste",
    bestExactBidHint: (rounds) =>
      `Le meilleur taux de mises exactes, sur au moins ${rounds} manches jouées.`,
    zeroBidMaster: "Maître du zéro",
    zeroBidMasterHint: (zeroBids) =>
      `Le meilleur bilan des mises à zéro tenues, sur au moins ${zeroBids} mises à zéro.`,
    longestStreak: "Plus longue série",
    longestStreakHint: "La plus longue suite de parties gagnées d’affilée.",
    biggestComeback: "Plus belle remontée",
    biggestComebackHint:
      "Le plus grand nombre de places gagnées entre la mi-partie et le classement final.",
    biggestBonusHaul: "Plus riche butin",
    biggestBonusHaulHint:
      "Le plus de points bonus tirés des cartes spéciales en une seule partie.",
    worstFinalScore: "Pire score final",
    worstFinalScoreHint: "Le plus bas total jamais atteint en fin de partie.",
    worstRound: "Pire manche",
    worstRoundHint: "Le plus gros trou creusé en une seule manche.",
    mostLastPlaces: "Plus de dernières places",
    mostLastPlacesHint:
      "A terminé derrière tout le monde plus souvent que quiconque.",
    boldestBidder: "Mise la plus audacieuse",
    boldestBidderHint:
      "Réclame la plus grosse part de chaque main distribuée : courage ou folie.",

    recordUnclaimed: "Pas encore attribué",
    unitPoints: "pts",
    unitWins: (count) => (count === 1 ? "victoire" : "victoires"),
    unitPlaces: (count) => (count === 1 ? "place" : "places"),
    unitGames: (count) => (count === 1 ? "partie" : "parties"),
    roundMeta: (round, date) => `Manche ${round} · ${date}`,
    sampleMeta: (successes, attempts) =>
      `${successes} sur ${attempts} ${attempts === 1 ? "manche" : "manches"}`,
    comebackMeta: (fromRank, toRank, date) =>
      `${ordinal(fromRank)} → ${ordinal(toRank)} · ${date}`,
    lastPlaceMeta: (rate, games) =>
      `${rate} de ${games} ${games === 1 ? "partie" : "parties"}`,
    appetiteMeta: (averageBid, rounds) =>
      `${averageBid} pli par manche · ${rounds} ${
        rounds === 1 ? "manche" : "manches"
      }`,

    metricsResults: "Résultats",
    metricsBidding: "Mises",
    metricsScoring: "Points",

    gamesPlayed: "Parties jouées",
    roundsPlayed: "Manches jouées",
    wins: "Victoires",
    winRate: "Taux de victoire",
    rivalsBeaten: "Adversaires devancés",
    averageRank: "Rang moyen",
    lastPlaces: "Dernières places",
    winStreak: "Victoires d’affilée",
    longestWinStreak: "Plus longue série de victoires",
    exactBidRate: "Taux de mises réussies",
    zeroBidRate: "Mises à zéro réussies",
    bidAppetite: "Appétit de mise",
    averagePoints: "Points par partie",
    pointsPerRound: "Points par manche",
    bestScore: "Meilleur score",
    worstScore: "Pire score",
    bestRoundScore: "Meilleure manche",
    worstRoundScore: "Pire manche",
    bonusPoints: "Points bonus",

    outOfGames: (count, games) =>
      `${count} sur ${games} ${games === 1 ? "partie" : "parties"}`,
    seatsCaption: (seats) => `sur ${seats} joueurs`,
    perGame: "Moyenne sur toutes les parties",
    rivalsBeatenCaption: "Part des adversaires terminés devant",
    perRound: "Moyenne sur toutes les manches",
    fromSpecialCards: "Gagnés avec les cartes spéciales",
    bidCaption: (averageBid) => `${averageBid} pli par manche`,

    recentGames: "Parties récentes",
    unavailable: "Indisponible",
    chartLabel: (leader, rounds) =>
      `Évolution des scores après ${rounds} ${
        rounds === 1 ? "manche" : "manches"
      } ; ${leader} est en tête.`,
    playerSummary: (games, wins) =>
      `${games} ${games === 1 ? "partie" : "parties"} · ${wins} ${
        wins === 1 ? "victoire" : "victoires"
      }`,
    bidSummary: (successes, attempts) => `${successes} sur ${attempts}`,
    recentGame: (date, rank, score) =>
      `${date} · ${ordinal(rank)} · ${score} points`,
  },

  share: {
    button: "Partager le récapitulatif",
    preparing: "Préparation…",
    busy: "Partage…",
    fileShared: "Récapitulatif partagé.",
    textShared: "Résumé partagé.",
    copiedDownloaded: "Copié et téléchargé.",
    copied: "Copié.",
    downloaded: "Téléchargé.",
    error: "Impossible de partager le récapitulatif.",
    summaryTitle: "Récapitulatif de la partie Skull King",
    awardsHeading: "Distinctions de l’équipage",
    gameDate: (date) => `Partie du ${date}`,
    rankingLine: (medal, name, score) =>
      `${medal} ${name}, ${score} points`,
    awardLine: (award, name) => `${award} : ${name}`,
    cancelled: "Partage annulé.",
  },

  awards: {
    title: "Distinctions de l’équipage",
    names: {
      lookout: "Œil de la vigie",
      zeroBidRoyalty: "Couronne du zéro",
      comeback: "Retour de marée",
      reckless: "Pari casse-cou",
      castaway: "Naufragé magnifique",
    },
  },

  scoreBreakdown: {
    title: "Détail du score",
    close: "Fermer",
    openFor: (name, total) => `Afficher le détail du score de ${name} : ${total}`,
    openRankedFor: (rank, name, total) =>
      `Rang ${rank}, ${name}, ${total} points. Afficher le détail du score`,
    currentScore: "Score actuel",
    earned: "Gagnés",
    lost: "Perdus",
    recordedHint: "Seules les manches validées sont comptabilisées.",
    noRounds: "Aucune manche validée pour le moment.",
    historyTitle: "Manches comptabilisées",
    round: (n) => `Manche ${n}`,
    roundSummary: (bid, tricks) =>
      `${bid} ${bid === 1 ? "pli misé" : "plis misés"} · ${tricks} ${
        tricks === 1 ? "pli remporté" : "plis remportés"
      }`,
    exact: "Mise réussie",
    missed: "Mise ratée",
    runningTotal: "Cumul après la manche",
    expandRound: (n) => `Afficher le détail de la manche ${n}`,
    collapseRound: (n) => `Masquer le détail de la manche ${n}`,
    bidSuccess: (bid) => `Mise de ${bid} réussie exactement`,
    bidMissed: (bid, difference) =>
      `Mise de ${bid} ratée · ${difference} ${
        difference > 1 ? "plis d’écart" : "pli d’écart"
      }`,
    zeroBidSuccess: (cards) =>
      `Mise à zéro réussie · ${cards} ${cards === 1 ? "carte" : "cartes"}`,
    zeroBidMissed: (cards) =>
      `Mise à zéro ratée · ${cards} ${cards === 1 ? "carte" : "cartes"}`,
    outcomes: {
      directHit: "Coup direct",
      glancingBlow: "Frappe à revers",
      whiff: "Échec cuisant",
    },
    rascalBidDirect: (bid) =>
      `Coup direct · mise ${bid} exacte · tous les points`,
    rascalBidGlancing: "Frappe à revers · écart de 1 · moitié des points",
    rascalBidWhiff: (diff) => `Échec cuisant · écart de ${diff}`,
    rascalCannonballWon: "Boulet de canon · mise exacte · 15 par carte",
    rascalCannonballLost: (diff) =>
      `Boulet de canon perdu · écart de ${diff}`,
    ignored: "Non compté",
    items: {
      colored14: (count) =>
        `${count} ${count === 1 ? "14 de couleur capturé" : "14 de couleur capturés"}`,
      black14: "14 noir capturé",
      mermaidByPirate: (count) =>
        `Un pirate a pris ${count} ${count === 1 ? "sirène" : "sirènes"}`,
      pirateBySkullKing: (count) =>
        `Le Skull King a pris ${count} ${count === 1 ? "pirate" : "pirates"}`,
      mermaidCapturesSkullKing: "Une sirène a pris le Skull King",
      rascalWon: "Pari Rascal réussi",
      rascalLost: "Pari Rascal perdu",
      expansion7: (count) =>
        `${count} ${count === 1 ? "7 spécial capturé" : "7 spéciaux capturés"}`,
      expansion8: (count) =>
        `${count} ${count === 1 ? "8 spécial capturé" : "8 spéciaux capturés"}`,
      davyJonesLeviathans: (count) =>
        `Davy Jones a détruit ${count} ${count === 1 ? "léviathan" : "léviathans"}`,
      secondCaptured: "Skull King ou une sirène a pris le Second",
      legacyLoot: (count) =>
        `${count} ${count === 1 ? "ancien bonus Butin" : "anciens bonus Butin"}`,
      loot: (count) =>
        `${count} ${count === 1 ? "alliance Butin réussie" : "alliances Butin réussies"}`,
      lootMissed: (count) =>
        `${count} ${count === 1 ? "alliance Butin" : "alliances Butin"} · au moins une mise ratée`,
      lootSelfWin: (count) =>
        `${count} ${count === 1 ? "Butin repris par son joueur" : "Butins repris par leur joueur"} · aucune alliance`,
    },
  },

  bonus: {
    colored14: "14 de couleur",
    black14: "14 noir (Drapeau pirate)",
    mermaidByPirate: "Un pirate prend une sirène",
    pirateBySkullKing: "Le Skull King prend un pirate",
    mermaidCapturesSkullKing: "Une sirène prend le Skull King",
    rascal: "Pari Rascal",
    newExpansion: "Extension",
    expansion7: "Nouveau 7 remporté",
    expansion8: "Nouveau 8 remporté",
    expansionColorHint:
      "Les nouveaux 7 et 8 ne comptent que si la mise est réussie exactement.",
    davyJonesLeviathans: "Davy Jones détruit un léviathan",
    secondCaptured: "Skull King / sirène prend le Second",
    each: "ch.",
    requiresBidHint:
      "Cette partie n’accorde les bonus de capture que si la mise est réussie.",
    requiresBidMissed:
      "Mise ratée : les bonus de capture ne comptent pas dans cette partie.",
    cardBonus: (n) => `Bonus de cartes : ${n >= 0 ? "+" : ""}${n}`,
  },

  loot: {
    title: "Alliances Butin",
    hint:
      "Enregistrez chaque carte Butin dès qu’elle est jouée. Les mises seront obligatoirement confirmées en fin de manche.",
    record: "+ Enregistrer un Butin",
    useNumber: (n) => `Butin ${n}`,
    playedByPrompt: "Qui a joué la carte Butin ?",
    winnerPrompt: "Qui a remporté le pli ?",
    playedByRole: "a joué Butin",
    winnerRole: "a remporté le pli",
    pendingPair: (playedBy, boundTo) =>
      `${playedBy} et ${boundTo} doivent tous les deux réussir leur mise.`,
    success: "Les deux mises sont réussies · +20 chacun",
    failed: (names) => `Pas de bonus Butin · mise ratée : ${names}`,
    selfWin: (name) =>
      `${name} a remporté son propre Butin · aucune alliance formée`,
    change: "Modifier",
    remove: "Retirer",
    removeLabel: (n) => `Retirer le Butin ${n}`,
    maxRecorded: "Les deux cartes Butin sont enregistrées.",
    incomplete:
      "Indiquez les joueurs de chaque Butin avant de valider la manche.",
    legacyNotice:
      "Les anciens points Butin sont conservés, mais les joueurs liés n’avaient pas été enregistrés.",
  },

  lootConfirmation: {
    eyebrow: "Validation obligatoire",
    title: "Confirmer les Butins",
    intro: (players) =>
      `${players} ${players === 1 ? "joueur est impliqué" : "joueurs sont impliqués"} dans une alliance Butin. Vérifiez chaque mise avant de continuer.`,
    madeBid: "Mise réussie",
    missedBid: "Mise ratée",
    allianceBonus: "Alliance réussie · +20 points chacun",
    noAllianceBonus: "Alliance ratée · aucun bonus Butin",
    confirm: "Confirmer les mises",
  },

  rules: {
    title: "Décompte et cartes",
    done: "Terminé",
    unofficialNotice:
      "Résumé pratique non officiel, rédigé pour faciliter le décompte. En cas de doute, le livret de votre édition fait foi.",
    officialRules: "Consulter les règles officielles",
    headings: {
      scoring: "Décompte",
      rascal: "Les scores selon Rascal",
      bonus: "Points bonus",
      expansion: "Extension",
      special: "Cartes spéciales",
      twoPlayer: "Variante à 2 joueurs",
    },
    scoring: [
      {
        title: "Mise de 1 ou plus",
        body: "Réussie exactement : +20 par pli remporté. Ratée (au-dessus ou en dessous) : -10 par pli d’écart, et aucun point pour les plis faits.",
      },
      {
        title: "Mise à zéro",
        body: "0 pli remporté : +10 × cartes distribuées cette manche. Au moins 1 pli : -10 × cartes distribuées cette manche.",
      },
    ],
    rascal: [
      {
        title: "Un décompte officiel alternatif",
        body: "Choisi à la création de la partie. Tous les joueurs ont le même potentiel à chaque manche : 10 points par carte distribuée, quelle que soit la mise. C’est la précision qui décide de ce que vous en gagnez. Les scores ne deviennent jamais négatifs.",
      },
      {
        title: "Coup direct · frappe à revers · échec cuisant",
        body: "Mise exacte : tous les points mis en jeu. Écart de 1 : la moitié. Écart de 2 ou plus : aucun point.",
      },
      {
        title: "Les bonus suivent le même barème",
        body: "Les bonus de capture comptent en entier sur un coup direct, à moitié sur une frappe à revers, et pas du tout sur un échec cuisant. Le Butin, les 7/8 spéciaux et le pari du pirate Rascal gardent leur propre condition de mise exacte.",
      },
      {
        title: "Option : Chevrotine ou Boulet de canon",
        body: "Si l’option est activée, chacun choisit après avoir misé, puis tout le monde révèle en même temps. Main ouverte (Chevrotine) : barème habituel ; poing fermé (Boulet de canon) : 15 points par carte distribuée si la mise est exacte, sinon rien, bonus compris.",
      },
    ],
    bonusEntries: [
      {
        title: "14 de couleur  (+10 chacun)",
        body: "Chaque 14 jaune / violet / vert que vous capturez (remportez le pli qui le contient) à la fin de la manche.",
      },
      {
        title: "14 noir  (+20)",
        body: "Capturer le 14 noir (Drapeau pirate / atout).",
      },
      {
        title: "Un pirate prend une sirène  (+20 chacune)",
        body: "Votre pirate remporte un pli contenant une sirène.",
      },
      {
        title: "Le Skull King prend un pirate  (+30 chacun)",
        body: "Votre Skull King remporte un pli contenant un ou des pirates.",
      },
      {
        title: "Une sirène prend le Skull King  (+40)",
        body: "Votre sirène remporte un pli contenant le Skull King. (Sirène bat Skull King, qui bat les pirates, qui battent la sirène.)",
      },
      {
        title: "Les bonus exigent une mise réussie",
        body: "Selon le livret officiel, les bonus de capture ne sont accordés que si vous réussissez exactement votre mise. Ils vont à celui qui capture la carte, peu importe qui l’a jouée. Une option à la création de la partie permet la variante inverse : les bonus comptent même après une mise ratée.",
      },
    ],
    expansion: [
      {
        title: "Nouveaux 7 et 8  (-5 / +5 chacun)",
        body: "Ils se jouent comme des cartes de couleur normales. Le joueur qui remporte un nouveau 7 perd 5 points et celui qui remporte un nouveau 8 gagne 5 points, seulement si sa mise est exacte. En cas d’égalité sur la valeur gagnante, la première carte jouée l’emporte.",
      },
      {
        title: "Cartes 0/14",
        body: "En jouant la carte, annoncez immédiatement si elle vaut 0 ou 14. Elle ne rapporte aucun bonus.",
      },
      {
        title: "15 joker",
        body: "Il vaut 15 jaune, violet ou vert. Si aucune couleur n’est définie, choisissez-la. Si une couleur non noire est déjà définie, il doit la suivre. Face au noir, aucune couleur ne doit être annoncée.",
      },
      {
        title: "Mary Throne (Pirate)",
        body: "Elle se joue comme un Pirate classique. Avec les pouvoirs avancés, choisissez au hasard et sans la regarder une carte de la main d’un adversaire : il devra la jouer au prochain pli, quelles que soient les cartes déjà jouées.",
      },
      {
        title: "Dernière salve",
        body: "Elle ne gagne jamais le pli et ne compte pas comme une Fuite. Après que tous ont joué, posez immédiatement une autre carte. Vous aurez ensuite une carte de moins et ne participerez pas au dernier pli de la manche.",
      },
      {
        title: "Supplice de la planche",
        body: "Cette carte ne gagne pas le pli. À la fin du pli, retirez un Pirate présent : il ne peut plus gagner le pli ni rapporter de points.",
      },
      {
        title: "Raie tachetée",
        body: "La carte la plus basse remporte le pli ; en cas d’égalité, la première jouée gagne. Si plusieurs léviathans sont présents (Kraken, Baleine blanche, Raie), le dernier joué détermine l’effet du pli.",
      },
      {
        title: "Casier de Davy Jones  (+20 par léviathan)",
        body: "À utiliser avec les léviathans. Il ne gagne pas le pli et détruit tous les léviathans présents ; la carte la plus forte gagne alors normalement. Le joueur du Casier marque 20 points par léviathan détruit, quel que soit l’ordre des cartes.",
      },
      {
        title: "Second  (+30 s’il est capturé)",
        body: "Il bat tout sauf le Skull King et les Sirènes. Il peut utiliser les pouvoirs des Pirates qu’il capture, mais ne gagne aucun bonus pour eux. Si le Skull King ou une Sirène le capture, leur joueur gagne 30 points.",
      },
    ],
    special: [
      {
        title: "Fuite / Tigresse en fuite",
        body: "Perd toujours le pli. Sert à se défausser sans risque d’un pli dont vous ne voulez pas.",
      },
      {
        title: "Pirate (x5) & Tigresse",
        body: "Battent toutes les cartes numérotées. La Tigresse se joue comme pirate ou comme fuite.",
      },
      {
        title: "Skull King",
        body: "Bat toutes les numérotées et tous les pirates (+30 par pirate capturé). Seule une sirène peut le vaincre.",
      },
      {
        title: "Sirène (x2)",
        body: "Bat toutes les numérotées et bat le Skull King (+40), mais perd contre les pirates. Si un pirate, le Skull King et une sirène sont dans le même pli, la sirène l’emporte toujours.",
      },
      {
        title: "Kraken",
        body: "Le pli est détruit : PERSONNE ne le remporte, les cartes sont mises de côté. Aucun pli ne compte et aucune capture n’a lieu. Le pli suivant est lancé par celui qui aurait dû gagner.",
      },
      {
        title: "Baleine blanche",
        body: "Toutes les cartes spéciales sont annulées et perdent ; le NUMÉRO le plus élevé remporte le pli (atout compris). Si seules des spéciales ont été jouées, le pli est défaussé. Aucun bonus de capture dans un pli de baleine.",
      },
      {
        title: "Kraken vs Baleine blanche",
        body: "Si les deux sont dans le même pli, la deuxième jouée s’applique ; utilisez la règle de cette carte.",
      },
      {
        title: "Butin  (+20 par allié)",
        body: "Forme une alliance entre celui qui joue la carte et celui qui remporte le pli. Enregistrez les deux joueurs ; si TOUS DEUX réussissent leur mise exacte, l’app ajoute +20 à chacun.",
      },
      {
        title: "Pari du pirate Rascal (0/10/20)",
        body: "Un pari annexe : gagnez la mise si vous réussissez votre mise, perdez-la sinon.",
      },
    ],
    twoPlayer: [
      {
        title: "Barbe Grise, le fantôme 👻",
        body: "La variante à 2 joueurs du livret distribue une troisième main pour le fantôme Barbe Grise. À chaque pli il joue en deuxième, sans suivre la couleur demandée, et sa Tigresse compte toujours comme une fuite. Les cartes Butin ne sont pas utilisées.",
      },
      {
        title: "Il joue mais ne marque jamais",
        body: "Barbe Grise ne mise pas et ne gagne aucun point. Il ne fait que voler des plis (et les cartes bonus qu’ils contiennent sont simplement perdues). Quand il remporte un pli, il lance le suivant ; sinon il est toujours deuxième.",
      },
      {
        title: "Vos totaux de plis peuvent être inférieurs",
        body: "Comme Barbe Grise remporte des plis, vos deux totaux de plis peuvent être INFÉRIEURS aux cartes distribuées. L’app indique combien de plis le fantôme a pris au lieu de vous avertir.",
      },
    ],
  },

  stepper: {
    decrease: (label) => `Diminuer ${label}`,
    increase: (label) => `Augmenter ${label}`,
  },
};
