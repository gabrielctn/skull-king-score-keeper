import { Strings } from "./types";

export const fr: Strings = {
  langLabel: "FR",

  common: {
    home: "Accueil",
    back: "Retour",
    newGame: "Nouvelle partie",
  },

  home: {
    subtitle: "Compteur de points",
    resume: "Reprendre la partie",
    playersRound: (players, round, total) =>
      `${players} joueurs · manche ${round} sur ${total}`,
    leading: (name, total) => `En tête : ${name} (${total})`,
    offline: "Fonctionne hors ligne · installable depuis le navigateur",
  },

  setup: {
    title: "Nouvelle partie",
    crew: "Rassemblez votre équipage",
    players: "Joueurs",
    seatingHint:
      "Saisissez les joueurs dans l'ordre des places, sens horaire — le joueur 1 distribue la 1re manche. Utilisez les flèches pour réorganiser la table.",
    playerPlaceholder: (n) => `Joueur ${n}`,
    addPlayer: "+ Ajouter un joueur",
    twoPlayers: "Deux joueurs",
    ghostTitle: "Fantôme Barbe Grise 👻",
    ghostHint:
      "La variante officielle à 2 joueurs : distribuez une troisième main pour le fantôme Barbe Grise. Il joue mais ne mise jamais et ne marque pas, il vous vole donc des plis — vos deux totaux de plis peuvent être inférieurs au nombre de cartes distribuées.",
    rounds: "Manches",
    roundsHint: "Une partie standard de Skull King compte 10 manches.",
    expansion: "Cartes d'extension",
    advancedTitle: "Butin & pari Rascal",
    advancedHint:
      "Ajoute le suivi des alliances Butin par manche et le pari du pirate Rascal. Le Kraken, la Baleine blanche et les bonus de 14/capture sont toujours disponibles.",
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
    total: (n) => `${n} au total`,
    tricksRecorded: (x, y) => `Plis enregistrés : ${x} / ${y}`,
    tricksOk: "  ✓",
    tricksWarnNormal:
      "  (devrait égaler les cartes distribuées, sauf si un Kraken a annulé un pli)",
    ghostTook: (n) => `  ·  Barbe Grise 👻 en a pris ${n}`,
    tricksWarnOver: "  (plus que les cartes distribuées — vérifiez vos comptes)",
    finish: "Terminer la partie 🏁",
    updateRound: "Modifier la manche",
    scoreRound: "Valider la manche →",
  },

  results: {
    gameOver: "Partie terminée",
    winner: (name, total) => `${name} gagne avec ${total} !`,
    review: "Revoir manche par manche",
    backHome: "Retour à l'accueil",
  },

  bonus: {
    colored14: "14 de couleur",
    black14: "14 noir (Drapeau pirate)",
    mermaidByPirate: "Sirène prise par un pirate",
    pirateBySkullKing: "Pirate pris par le Skull King",
    mermaidCapturesSkullKing: "Sirène capture le Skull King",
    rascal: "Pari Rascal",
    each: "ch.",
    captureBonus: (n) => `Bonus de capture : +${n}`,
  },

  loot: {
    title: "Alliances Butin",
    hint:
      "Enregistrez chaque carte Butin dès qu’elle est jouée. L’app vérifie automatiquement les deux mises.",
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

  rules: {
    title: "Score & Cartes",
    done: "Terminé",
    headings: {
      scoring: "Décompte",
      bonus: "Points bonus",
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
        body: "La variante officielle à 2 joueurs distribue une troisième main pour le fantôme Barbe Grise. À chaque pli il joue en deuxième, sans suivre la couleur demandée, et sa Tigresse compte toujours comme une fuite. Les cartes Butin ne sont pas utilisées.",
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
