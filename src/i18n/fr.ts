import { Strings } from "./types";

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

  home: {
    title: "Compteur de scores",
    subtitle: "pour Skull King",
    unofficial: "Application non officielle",
    resume: "Reprendre la partie",
    history: "Parties récentes",
    historyHint: "Touchez une partie pour la reprendre ou consulter son classement.",
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
    support: "Soutenir le développeur ☕",
    supportHint:
      "Contribution facultative · l’application reste entièrement gratuite.",
    disclaimer:
      "Application créée par un joueur, sans affiliation, approbation ni sponsoring de Grandpa Beck’s Games, de ses éditeurs ou distributeurs. « Skull King » et les éléments officiels du jeu appartiennent à leurs ayants droit respectifs.",
    offline: "Fonctionne hors ligne · installable depuis le navigateur",
  },

  whatsNew: {
    open: "Nouveautés",
    badge: "Nouveau",
    title: "Nouveautés",
    version: (version, date) => `Version ${version} · ${date}`,
    automaticUpdatesTitle: "Toujours à jour",
    automaticUpdatesBody:
      "Les applications installées téléchargent désormais chaque nouvelle version automatiquement et l'activent dès que l'appareil est en ligne.",
    items: [
      "Un nouveau menu Paramètres (bouton ⚙ de l'accueil) regroupe désormais la langue, vos données et les nouveautés.",
      "L'écran reste allumé pendant la partie pour garder les scores visibles entre les manches. Désactivable dans les paramètres.",
      "Vos données permettent maintenant de supprimer toutes les parties enregistrées en une fois.",
    ],
    close: "Compris",
  },

  settings: {
    open: "Paramètres",
    title: "Paramètres",
    languageTitle: "Langue",
    gameTitle: "Pendant la partie",
    keepAwakeTitle: "Garder l'écran allumé",
    keepAwakeHint:
      "Empêche l'appareil de se mettre en veille tant qu'un écran de partie est ouvert.",
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
      "Toutes les parties — y compris une éventuelle partie en cours — seront définitivement supprimées. Pensez à exporter une sauvegarde avant.",
    deleteAllCancel: "Annuler",
    deleteAllConfirm: "Tout supprimer",
    deleteAllSuccess: "Toutes les parties ont été supprimées.",
  },

  setup: {
    title: "Nouvelle partie",
    crew: "Rassemblez votre équipage",
    players: "Joueurs",
    seatingHint:
      "Saisissez les joueurs dans l'ordre des places, sens horaire — le joueur 1 distribue la 1re manche. Utilisez les flèches pour réorganiser la table.",
    playerPlaceholder: (n) => `Joueur ${n}`,
    addPlayer: "+ Ajouter un joueur",
    quickTitle: "Partie rapide",
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
      "La variante à 2 joueurs décrite dans le livret : distribuez une troisième main pour le fantôme Barbe Grise. Il joue mais ne mise jamais et ne marque pas, il vous vole donc des plis — vos deux totaux de plis peuvent être inférieurs au nombre de cartes distribuées.",
    rounds: "Manches",
    roundsHint: "Une partie standard de Skull King compte 10 manches.",
    structureHint:
      "Le livret propose plusieurs façons de distribuer les cartes. Choisissez la structure des manches de cette partie.",
    structureNames: {
      classic: "Classique",
      evenKeeled: "Pas d'impair",
      brawl: "Prêt au combat",
      skirmish: "Attaque éclair",
      barrage: "Tir de barrage",
      whirlpool: "Tourbillon",
      bedtime: "L'heure du dodo",
    },
    structureRounds: (n) => `${n} ${n === 1 ? "manche" : "manches"}`,
    showOtherStructures: "Afficher les autres types de manches",
    hideOtherStructures: "Masquer les autres types de manches",
    expansion: "Cartes d'extension",
    advancedTitle: "Butin & pari Rascal",
    advancedHint:
      "Ajoute le suivi des alliances Butin par manche et le pari du pirate Rascal. Le Kraken, la Baleine blanche et les bonus de 14/capture sont toujours disponibles.",
    newExpansionTitle: "Extension",
    newExpansionHint:
      "Ajoute au décompte les 7 et 8 spéciaux, le Casier de Davy Jones et le Second. Les autres effets de l'extension sont détaillés dans l'aide en jeu.",
    start: "Commencer ☠️",
    needPlayers: "Ajoutez au moins 2 joueurs",
  },

  game: {
    round: (n) => `Manche ${n}`,
    cardsDealt: "cartes distribuées",
    dealsVerb: "distribue",
    playOrderHint: "ordre de jeu · le meneur est à gauche",
    ghostName: "Barbe Grise",
    bid: "Mise",
    won: "Plis",
    bonus: "Bonus",
    roundPoints: "Points de la manche",
    total: (n) => `${n} au total`,
    tricksRecorded: (x, y) => `Plis enregistrés : ${x} / ${y}`,
    tricksOk: "  ✓",
    tricksWarnNormal: "  (doit égaler les cartes distribuées)",
    ghostTook: (n) => `  ·  Barbe Grise 👻 en a pris ${n}`,
    tricksWarnOver: "  (plus que les cartes distribuées — vérifiez vos comptes)",
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
  },

  results: {
    gameOver: "Partie terminée",
    winner: (name, total) => `${name} gagne avec ${total} !`,
    review: "Revoir manche par manche",
    rematch: "Revanche avec le même équipage",
    installTitle: "Gardez le compteur à bord",
    installHint: "Installez l’app pour la retrouver rapidement et jouer hors ligne.",
    installIosHint:
      "Ouvrez cette page dans Safari si nécessaire, puis touchez Partager et « Sur l’écran d’accueil ».",
    installError: "L’installation n’a pas pu démarrer. Vous pourrez réessayer plus tard.",
    install: "Installer l’app",
    installDismiss: "Plus tard",
    backHome: "Retour à l'accueil",
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
    ignored: "Non compté",
    items: {
      colored14: (count) =>
        `${count} ${count === 1 ? "14 de couleur capturé" : "14 de couleur capturés"}`,
      black14: "14 noir capturé",
      mermaidByPirate: (count) =>
        `${count} ${count === 1 ? "sirène prise" : "sirènes prises"} par un pirate`,
      pirateBySkullKing: (count) =>
        `${count} ${count === 1 ? "pirate pris" : "pirates pris"} par le Skull King`,
      mermaidCapturesSkullKing: "Sirène capture le Skull King",
      rascalWon: "Pari Rascal réussi",
      rascalLost: "Pari Rascal perdu",
      expansion7: (count) =>
        `${count} ${count === 1 ? "7 spécial capturé" : "7 spéciaux capturés"}`,
      expansion8: (count) =>
        `${count} ${count === 1 ? "8 spécial capturé" : "8 spéciaux capturés"}`,
      davyJonesLeviathans: (count) =>
        `${count} ${count === 1 ? "léviathan détruit" : "léviathans détruits"} par Davy Jones`,
      secondCaptured: "Second capturé",
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
    mermaidByPirate: "Sirène prise par un pirate",
    pirateBySkullKing: "Pirate pris par le Skull King",
    mermaidCapturesSkullKing: "Sirène capture le Skull King",
    rascal: "Pari Rascal",
    newExpansion: "Extension",
    expansion7: "Nouveau 7 remporté",
    expansion8: "Nouveau 8 remporté",
    expansionColorHint:
      "Les nouveaux 7 et 8 ne comptent que si la mise est réussie exactement.",
    davyJonesLeviathans: "Léviathan détruit par Davy Jones",
    secondCaptured: "Second pris par Skull King / Sirène",
    each: "ch.",
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
    title: "Score & Cartes",
    done: "Terminé",
    unofficialNotice:
      "Résumé pratique non officiel, rédigé pour faciliter le décompte. En cas de doute, le livret de votre édition fait foi.",
    officialRules: "Consulter les règles officielles",
    headings: {
      scoring: "Décompte",
      bonus: "Points bonus",
      expansion: "Extension",
      special: "Cartes spéciales",
      twoPlayer: "Variante à 2 joueurs",
    },
    scoring: [
      {
        title: "Mise de 1 ou plus",
        body: "Réussie exactement : +20 par pli remporté. Ratée (au-dessus ou en dessous) : -10 par pli d'écart, et aucun point pour les plis faits.",
      },
      {
        title: "Mise à zéro",
        body: "0 pli remporté : +10 × cartes distribuées cette manche. Au moins 1 pli : -10 × cartes distribuées cette manche.",
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
        title: "Sirène prise par un pirate  (+20 chacune)",
        body: "Votre pirate remporte un pli contenant une sirène.",
      },
      {
        title: "Pirate pris par le Skull King  (+30 chacun)",
        body: "Votre Skull King remporte un pli contenant un ou des pirates.",
      },
      {
        title: "Sirène capture le Skull King  (+40)",
        body: "Votre sirène remporte un pli contenant le Skull King. (Sirène bat Skull King, qui bat les pirates, qui battent la sirène.)",
      },
      {
        title: "Les bonus comptent quelle que soit votre mise",
        body: "Vous gardez les bonus de capture même si vous ratez votre mise. Ils vont à celui qui capture la carte, peu importe qui l'a jouée.",
      },
    ],
    expansion: [
      {
        title: "Nouveaux 7 et 8  (-5 / +5 chacun)",
        body: "Ils se jouent comme des cartes de couleur normales. Le joueur qui remporte un nouveau 7 perd 5 points et celui qui remporte un nouveau 8 gagne 5 points, seulement si sa mise est exacte. En cas d'égalité sur la valeur gagnante, la première carte jouée l'emporte.",
      },
      {
        title: "Cartes 0/14",
        body: "En jouant la carte, annoncez immédiatement si elle vaut 0 ou 14. Elle ne rapporte aucun bonus.",
      },
      {
        title: "15 joker",
        body: "Il vaut 15 jaune, violet ou vert. Si aucune couleur n'est définie, choisissez-la. Si une couleur non noire est déjà définie, il doit la suivre. Face au noir, aucune couleur ne doit être annoncée.",
      },
      {
        title: "Mary Throne (Pirate)",
        body: "Elle se joue comme un Pirate classique. Avec les pouvoirs avancés, choisissez au hasard et sans la regarder une carte de la main d'un adversaire : il devra la jouer au prochain pli, quelles que soient les cartes déjà jouées.",
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
        body: "La carte la plus basse remporte le pli ; en cas d'égalité, la première jouée gagne. Si plusieurs léviathans sont présents (Kraken, Baleine blanche, Raie), le dernier joué détermine l'effet du pli.",
      },
      {
        title: "Casier de Davy Jones  (+20 par léviathan)",
        body: "À utiliser avec les léviathans. Il ne gagne pas le pli et détruit tous les léviathans présents ; la carte la plus forte gagne alors normalement. Le joueur du Casier marque 20 points par léviathan détruit, quel que soit l'ordre des cartes.",
      },
      {
        title: "Second  (+30 s'il est capturé)",
        body: "Il bat tout sauf le Skull King et les Sirènes. Il peut utiliser les pouvoirs des Pirates qu'il capture, mais ne gagne aucun bonus pour eux. Si le Skull King ou une Sirène le capture, leur joueur gagne 30 points.",
      },
    ],
    special: [
      {
        title: "Fuite / Tigresse en fuite",
        body: "Perd toujours le pli. Sert à se défausser sans risque d'un pli dont vous ne voulez pas.",
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
        body: "Bat toutes les numérotées et bat le Skull King (+40), mais perd contre les pirates. Si un pirate, le Skull King et une sirène sont dans le même pli, la sirène l'emporte toujours.",
      },
      {
        title: "Kraken",
        body: "Le pli est détruit : PERSONNE ne le remporte, les cartes sont mises de côté. Aucun pli ne compte et aucune capture n'a lieu. Le pli suivant est lancé par celui qui aurait dû gagner.",
      },
      {
        title: "Baleine blanche",
        body: "Toutes les cartes spéciales sont annulées et perdent ; le NUMÉRO le plus élevé remporte le pli (atout compris). Si seules des spéciales ont été jouées, le pli est défaussé. Aucun bonus de capture dans un pli de baleine.",
      },
      {
        title: "Kraken vs Baleine blanche",
        body: "Si les deux sont dans le même pli, la deuxième jouée s'applique ; utilisez la règle de cette carte.",
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
        body: "Barbe Grise ne mise pas et ne gagne aucun point. Il ne fait que voler des plis (et les cartes bonus qu'ils contiennent sont simplement perdues). Quand il remporte un pli, il lance le suivant ; sinon il est toujours deuxième.",
      },
      {
        title: "Vos totaux de plis peuvent être inférieurs",
        body: "Comme Barbe Grise remporte des plis, vos deux totaux de plis peuvent être INFÉRIEURS aux cartes distribuées. L'app indique combien de plis le fantôme a pris au lieu de vous avertir.",
      },
    ],
  },

  stepper: {
    decrease: (label) => `Diminuer ${label}`,
    increase: (label) => `Augmenter ${label}`,
  },
};
