import { Strings } from "./types";

export const es: Strings = {
  langLabel: "ES",

  common: {
    home: "Inicio",
    back: "Atrás",
    newGame: "Nueva partida",
    storageError:
      "No se ha podido guardar localmente. Exporta tus partidas antes de cerrar la aplicación.",
    dismiss: "Cerrar",
  },

  cookies: {
    accessibilityLabel: "Opciones de cookies analíticas",
    message:
      "Usamos cookies de Google Analytics para conocer las visitas y mejorar el anotador de puntos.",
    decline: "Rechazar",
    accept: "Aceptar",
  },

  home: {
    title: "Anotador de puntos",
    subtitle: "para Skull King",
    unofficial: "Aplicación no oficial creada por fans",
    resume: "Continuar partida",
    history: "Partidas recientes",
    historyHint: "Toca una partida para continuarla o ver su clasificación.",
    inProgress: "En curso",
    finished: "Terminada",
    openGame: (date) => `Abrir la partida del ${date}`,
    deleteGame: (date) => `Eliminar la partida del ${date}`,
    deleteTitle: "¿Eliminar esta partida?",
    deleteMessage:
      "Su puntuación y los detalles de las rondas se eliminarán permanentemente.",
    deleteCancel: "Cancelar",
    deleteConfirm: "Eliminar",
    playersRound: (players, round, total) =>
      `${players} jugadores · ronda ${round} de ${total}`,
    leading: (name, total) => `En cabeza: ${name} (${total})`,
    support: "Apoya al desarrollador ☕",
    supportHint:
      "Contribución opcional · la aplicación seguirá siendo totalmente gratuita.",
    disclaimer:
      "Creada por un jugador sin afiliación, aprobación ni patrocinio de Grandpa Beck’s Games, sus editores o distribuidores. «Skull King» y los elementos oficiales del juego pertenecen a sus respectivos titulares de derechos.",
    offline: "Funciona sin conexión · instálala desde tu navegador",
  },

  whatsNew: {
    open: "Novedades",
    badge: "Nuevo",
    title: "Novedades",
    version: (version, date) => `Versión ${version} · ${date}`,
    automaticUpdatesTitle: "Siempre al día",
    automaticUpdatesBody:
      "Las aplicaciones instaladas ahora descargan automáticamente cada nueva versión y la activan en cuanto el dispositivo se conecta a internet.",
    items: [
      "Tus partidas ahora se respaldan en la nube automáticamente y en privado: tu marcador, clasificación y estadísticas vuelven incluso tras borrar los datos de este dispositivo.",
      "¿Juegas en otro teléfono? Copia tu código de sincronización desde Ajustes y pégalo allí para cargar todas tus partidas.",
      "Ayuda de instalación más clara, con una nota para los teléfonos Xiaomi/MIUI donde el icono nuevo puede esconderse en el cajón de aplicaciones.",
    ],
    close: "Entendido",
  },

  settings: {
    open: "Ajustes",
    title: "Ajustes",
    languageTitle: "Idioma",
    gameTitle: "Durante una partida",
    keepAwakeTitle: "Mantener la pantalla encendida",
    keepAwakeHint:
      "Evita que el dispositivo entre en reposo mientras haya una pantalla de partida abierta.",
    dataTitle: "Tus datos",
    dataHint:
      "Exporta una copia de tus partidas o restáurala en este dispositivo.",
    exportBackup: "Exportar",
    importBackup: "Importar",
    importSuccess: (count) =>
      `${count} ${count === 1 ? "partida importada" : "partidas importadas"}.`,
    backupError: "No se ha podido leer esta copia de seguridad.",
    deleteAll: "Eliminar todas las partidas",
    deleteAllTitle: "¿Eliminar todas las partidas?",
    deleteAllMessage:
      "Todas las partidas —incluida cualquier partida en curso— se eliminarán permanentemente. Te recomendamos exportar antes una copia de seguridad.",
    deleteAllCancel: "Cancelar",
    deleteAllConfirm: "Eliminar todo",
    deleteAllSuccess: "Se han eliminado todas las partidas.",
    feedbackTitle: "Comentarios",
    feedbackHint:
      "¿Has encontrado un error o tienes una idea? Me encantará saber de ti.",
    feedbackButton: "Enviar comentarios",
    install: {
      title: "Instalar la aplicación",
      installedTitle: "Aplicación instalada 🎉",
      installedBody:
        "El marcador está en tu dispositivo — se abre como cualquier app y funciona totalmente sin conexión.",
      promptHint:
        "Añade el marcador a tu pantalla de inicio para acceder con un toque y jugar sin conexión.",
      manualHint:
        "Añade el marcador a tu pantalla de inicio para acceder con un toque y jugar sin conexión. Sigue los pasos de tu teléfono más abajo.",
      button: "Instalar ahora",
      error:
        "No se pudo iniciar la instalación. Sigue los pasos manuales de abajo.",
      guideTitle: "Cómo instalarla a mano",
      iosTitle: "iPhone y iPad (Safari)",
      iosSteps: [
        "Abre esta página en Safari.",
        "Toca el botón Compartir (un cuadrado con una flecha hacia arriba) en la parte inferior de la pantalla.",
        "Desplázate y toca «Añadir a pantalla de inicio».",
        "Toca «Añadir» arriba a la derecha — el icono aparece en tu pantalla de inicio.",
      ],
      androidTitle: "Android (Chrome)",
      androidSteps: [
        "Abre esta página en Chrome.",
        "Toca el menú ⋮ arriba a la derecha.",
        "Toca «Instalar aplicación» (o «Añadir a la pantalla de inicio»).",
        "Confirma con «Instalar» — el icono aparece en tu pantalla de inicio.",
      ],
      androidNote:
        "En Xiaomi/Redmi (MIUI) y algunos otros teléfonos, el icono puede acabar en el cajón de aplicaciones en lugar de la pantalla de inicio, o quizá debas permitir primero que Chrome cree accesos directos en los ajustes del sistema.",
    },
    cloud: {
      title: "Copia en la nube",
      statusSynced:
        "Guardado — tus partidas se guardan en la nube automáticamente y vuelven si se borran los datos de este dispositivo.",
      statusSyncing: "Guardando en la nube…",
      statusOffline: "Sin conexión — los cambios se sincronizarán al volver a estar en línea.",
      statusUnavailable: "La copia en la nube no está configurada en esta app.",
      linkTitle: "Usar tus partidas en otro teléfono",
      linkHint:
        "Copia el código de este dispositivo y pégalo en el otro teléfono para cargar allí las mismas partidas. Mantenlo privado: cualquiera que lo tenga puede ver tus partidas.",
      codeLabel: "Código de este dispositivo",
      copy: "Copiar",
      copied: "Copiado",
      pasteLabel: "Pega un código de otro dispositivo",
      linkButton: "Cargar esas partidas aquí",
      linking: "Cargando…",
      linkError: "No se pudo leer ese código.",
      linkSuccess: "Listo — partidas combinadas en este dispositivo.",
    },
  },

  setup: {
    title: "Nueva partida",
    crew: "Reúne a tu tripulación",
    players: "Jugadores",
    seatingHint:
      "Introduce a los jugadores según su orden en el sentido de las agujas del reloj: el jugador 1 reparte la primera ronda. Usa las flechas para cambiar el orden de la mesa.",
    playerPlaceholder: (n) => `Jugador ${n}`,
    addPlayer: "+ Añadir jugador",
    quickTitle: "Partida rápida",
    quickHint:
      "Los ajustes recomendados están listos. Añade a los jugadores y empieza, o personaliza la partida.",
    customize: "Personalizar partida",
    hideCustomization: "Ocultar opciones",
    movePlayerUp: (name) => `Subir a ${name}`,
    movePlayerDown: (name) => `Bajar a ${name}`,
    removePlayer: (name) => `Eliminar a ${name}`,
    twoPlayers: "Dos jugadores",
    ghostTitle: "Fantasma Barbagris 👻",
    ghostHint:
      "La variante para dos jugadores descrita en el reglamento: reparte una tercera mano para el fantasma Barbagris. Juega, pero nunca apuesta ni puntúa, así que roba algunas bazas; la suma de las bazas de los dos jugadores puede ser inferior al número de cartas repartidas.",
    rounds: "Rondas",
    roundsHint: "Una partida estándar de Skull King tiene 10 rondas.",
    structureHint:
      "El reglamento propone varias formas de repartir las cartas. Elige la estructura de rondas de esta partida.",
    structureNames: {
      classic: "Clásica",
      evenKeeled: "Equilibrada",
      brawl: "Directos a la refriega",
      skirmish: "Escaramuza rápida y salada",
      barrage: "Andanada",
      whirlpool: "Remolino",
      bedtime: "Más allá de la hora de dormir",
    },
    structureRounds: (n) => `${n} ${n === 1 ? "ronda" : "rondas"}`,
    showOtherStructures: "Mostrar otros tipos de ronda",
    hideOtherStructures: "Ocultar otros tipos de ronda",
    scoring: "Puntuación",
    scoringHint:
      "El reglamento ofrece dos formas oficiales de contar los puntos. Elige el sistema de esta partida.",
    scoringNames: {
      classic: "Puntuación de Skull King",
      rascal: "Puntuación de Rascal",
    },
    scoringHints: {
      classic:
        "El sistema clásico de riesgo y recompensa: las apuestas exactas dan 20 puntos por baza y los fallos restan puntos.",
      rascal:
        "En cada ronda hay en juego 10 puntos por carta repartida. Apuesta exacta: todos. Fallo por una: la mitad. Fallo por dos o más: nada; nunca se resta.",
    },
    rascalBetsTitle: "Reglas opcionales de Rascal ✊",
    rascalBetsHint:
      "Tras apostar, todos declaran Perdigón (mano abierta: niveles normales) o Bala de cañón (puño cerrado: 15 puntos por carta repartida con una apuesta exacta y nada en caso contrario, bonus incluidos).",
    expansion: "Cartas de expansión",
    advancedTitle: "Botín y apuesta Rascal",
    advancedHint:
      "Añade el seguimiento por ronda de Botín y de la apuesta del pirata Rascal. El Kraken, la Ballena Blanca y los bonus de 14/capturas siempre están disponibles.",
    newExpansionTitle: "Nueva expansión",
    newExpansionHint:
      "Añade la puntuación de los 7 y 8 especiales, el Cofre de Davy Jones y El Segundo. Los demás efectos de la expansión se explican en las reglas de la aplicación.",
    knownPlayers: "Jugadores conocidos",
    useKnownPlayer: (name) => `Usar a ${name}`,
    start: "Empezar partida ☠️",
    needPlayers: "Añade al menos 2 jugadores",
  },

  game: {
    round: (n) => `Ronda ${n}`,
    cardsDealt: "cartas repartidas",
    dealsVerb: "reparte",
    playOrderHint: "orden de juego · empieza quien está a la izquierda",
    ghostName: "Barbagris",
    bid: "Apuesta",
    won: "Ganadas",
    bonus: "Bonus",
    roundPoints: "Puntos de la ronda",
    total: (n) => `${n} en total`,
    tricksRecorded: (x, y) => `Bazas registradas: ${x} / ${y}`,
    tricksOk: "  ✓",
    tricksWarnNormal: "  (deben coincidir con las cartas repartidas)",
    ghostTook: (n) => `  ·  Barbagris 👻 ganó ${n}`,
    tricksWarnOver:
      "  (más que las cartas repartidas; comprueba los valores)",
    krakenRecord: "+ Baza descartada por el Kraken",
    krakenRecorded: "Baza del Kraken registrada",
    krakenUndo: "Deshacer",
    totalScoreTitle: "Puntuación total",
    totalIncludesRound: "La ronda mostrada está incluida en estos totales.",
    totalExcludesRound:
      "La ronda mostrada aún no está incluida en estos totales.",
    finish: "Terminar partida 🏁",
    updateRound: "Actualizar ronda",
    scoreRound: "Puntuar ronda →",
    untouchedTitle: "¿Puntuar esta ronda?",
    untouchedMessage:
      "No se han introducido apuestas ni bazas. Confirma que ambos jugadores apostaron cero y que Barbagris ganó todas las bazas.",
    untouchedCancel: "Revisar valores",
    untouchedConfirm: "Sí, puntuarla",
    rascalStake: (points) =>
      `Puntuación de Rascal · ${points} puntos en juego`,
    rascalBetNames: {
      buckshot: "Perdigón",
      cannonball: "Bala de cañón",
    },
    rascalBetFor: (name) => `Declaración de ${name}`,
    yohohoHint: "Toca para lanzar el grito de guerra",
    yohohoA11y: "Reproducir el grito pirata Yohoho",
  },

  liveShare: {
    open: "Compartir el seguimiento de puntos (código QR)",
    title: "Seguir los puntos",
    subtitle: "Cada jugador puede seguir los puntos en su propio teléfono.",
    liveHint:
      "Inicia una sesión en directo: los jugadores que escaneen el código siguen los puntos en tiempo real — cada apuesta, baza y bonus aparece en su teléfono en cuanto lo registras, sin actualizar nada.",
    start: "Iniciar seguimiento en directo",
    starting: "Iniciando…",
    stop: "Detener seguimiento en directo",
    liveOnTitle: "Seguimiento en directo activado",
    liveScanHint:
      "Los jugadores escanean este código QR para seguir los puntos en directo en su propio teléfono.",
    statusLive: "En directo · actualización automática",
    statusSyncing: "Guardando…",
    statusOffline: "Reconectando…",
    liveError:
      "La sincronización en directo tuvo un problema — sigue reintentando. Comprueba tu conexión, o detén e inicia de nuevo.",
    snapshotTitle: "¿Sin conexión en la mesa?",
    snapshotToggleShow: "Mostrar instantánea sin conexión",
    snapshotToggleHide: "Ocultar instantánea sin conexión",
    scanHint:
      "Este código QR contiene una instantánea de solo lectura de la partida — cada apuesta, baza y bonus registrados hasta ahora.",
    updateHint:
      "Funciona sin servidor, pero no se actualiza solo: los jugadores lo vuelven a escanear para obtener los últimos puntos.",
    networkHint:
      "El teléfono del jugador necesita conexión la primera vez que abre la app; después la instantánea funciona totalmente sin conexión.",
    copyLink: "Copiar enlace",
    copied: "¡Enlace copiado!",
    copyError: "No se pudo copiar el enlace.",
    qrError: "No se pudo convertir esta partida en un código QR.",
    qrLabel:
      "Código QR que abre el seguimiento de puntos de esta partida",
    close: "Cerrar",
  },

  spectator: {
    eyebrow: "Seguimiento de solo lectura",
    liveEyebrow: "Seguimiento en directo",
    liveBadge: "En directo",
    title: "Seguimiento de partida",
    roundProgress: (scored, total) =>
      `Puntos tras la ronda ${scored} de ${total}`,
    noRounds: "Todavía no se ha puntuado ninguna ronda.",
    finished: "Puntuación final — la partida ha terminado.",
    snapshotAt: (time) => `Puntos del anotador · leídos a las ${time}`,
    liveUpdatedAt: (time) => `Actualizado en directo · ${time}`,
    refreshHint:
      "Esto es una instantánea. Para actualizarla, vuelve a escanear el código QR del anotador.",
    connecting: "Conectando con la partida en directo…",
    reconnecting: "Conexión perdida — reconectando…",
    endedTitle: "Sesión en directo finalizada",
    endedBody:
      "El anotador dejó de compartir. Debajo se muestran los últimos puntos recibidos.",
    standingsTitle: "Clasificación",
    tapHint:
      "Toca cualquier jugador para ver su detalle completo ronda a ronda — apuestas, bazas y cada bonus.",
    identityTitle: "¿Qué jugador eres?",
    identityHint:
      "Elige tu nombre una vez para seguir tus propias puntuaciones. Queda fijo para esta partida.",
    turnTitle: "Orden de juego",
    sortLabel: "Orden",
    sortName: "A → Z",
    sortGameOrder: "Asientos",
    sortRank: "Puesto",
    you: "Tú",
    openApp: "Abrir la app para mis propias partidas",
    invalidTitle: "No se pudo leer este código",
    invalidBody:
      "El enlace escaneado no contiene una partida legible. Pide al anotador que vuelva a mostrar el código QR y escanéalo de nuevo.",
  },

  results: {
    gameOver: "Fin de la partida",
    winner: (name, total) => `¡${name} gana con ${total} puntos!`,
    podiumTitle: "Podio",
    podiumPlace: (rank, name, total) =>
      `Puesto ${rank}, ${name}, ${total} puntos`,
    review: "Revisar ronda por ronda",
    rematch: "Revancha con la misma tripulación",
    installTitle: "Lleva el anotador a bordo",
    installHint:
      "Instala la aplicación para acceder rápidamente y jugar sin conexión.",
    installIosHint:
      "Abre esta página en Safari si es necesario, toca Compartir y después «Añadir a pantalla de inicio».",
    installError:
      "No se ha podido iniciar la instalación. Puedes volver a intentarlo más tarde.",
    install: "Instalar aplicación",
    installDismiss: "Más tarde",
    backHome: "Volver al inicio",
  },

  stats: {
    open: "Estadísticas de jugadores",
    title: "Estadísticas",
    groupTitle: "Récords de la tripulación",
    playerTitle: (name) => `Estadísticas de ${name}`,
    emptyTitle: "Todavía no hay historias que contar",
    emptyBody:
      "Termina una partida para empezar a crear el historial de tu tripulación.",
    leaderboard: "Clasificación",
    records: "Récords",
    scoreEvolution: "Evolución de la puntuación",
    gamesPlayed: "Partidas jugadas",
    wins: "Victorias",
    winRate: "Porcentaje de victorias",
    exactBidRate: "Apuestas exactas",
    zeroBidRate: "Éxito con apuesta cero",
    averagePoints: "Media de puntos",
    bestScore: "Mejor puntuación",
    winStreak: "Racha de victorias actual",
    recentGames: "Partidas recientes",
    bestFinalScore: "Mejor puntuación final",
    worstRound: "Peor ronda",
    bestExactBid: "Mejor porcentaje de apuestas exactas",
    totalGames: "Partidas",
    totalRounds: "Rondas",
    totalPlunder: "Botín",
    biggestRound: "Mayor ronda",
    longestStreak: "Mejor racha",
    mostReckless: "El más temerario",
    krakenBait: "Cebo del kraken",
    zeroBidMaster: "Maestro del cero",
    longestWinStreak: "Mayor racha de victorias",
    podiumRate: "Tasa de podio",
    averageRank: "Puesto medio",
    bestRoundScore: "Mejor ronda",
    unavailable: "No disponible",
    chartLabel: (leader, rounds) =>
      `Evolución de la puntuación tras ${rounds} ${rounds === 1 ? "ronda" : "rondas"}; ${leader} va en cabeza.`,
    playerSummary: (games, wins) =>
      `${games} ${games === 1 ? "partida" : "partidas"} · ${wins} ${
        wins === 1 ? "victoria" : "victorias"
      }`,
    bidSummary: (successes, attempts) => `${successes} de ${attempts}`,
    scoreRecordHolder: (name, score, date) =>
      `${name} · ${score} puntos · ${date}`,
    roundRecordHolder: (name, score, round, date) =>
      `${name} · ${score} puntos en la ronda ${round} · ${date}`,
    rateRecordHolder: (name, rate, successes, attempts) =>
      `${name} · ${rate} (${successes}/${attempts})`,
    streakRecordHolder: (name, streak) =>
      `${name} · ${streak} ${streak === 1 ? "victoria" : "victorias"} seguidas`,
    recklessRecordHolder: (name, averageBid) =>
      `${name} · ${averageBid} de apuesta media`,
    countRecordHolder: (name, count) =>
      `${name} · ${count} ${count === 1 ? "vez" : "veces"}`,
    recentGame: (date, rank, score) =>
      `${date} · puesto ${rank} · ${score} puntos`,
  },

  share: {
    button: "Compartir resumen",
    preparing: "Preparando resumen…",
    busy: "Compartiendo…",
    fileShared: "Resumen compartido.",
    textShared: "Resumen compartido.",
    copiedDownloaded: "Copiado y descargado.",
    copied: "Copiado.",
    downloaded: "Descargado.",
    error: "No se ha podido compartir el resumen.",
    summaryTitle: "Resumen de la partida de Skull King",
    awardsHeading: "Premios de la tripulación",
    gameDate: (date) => `Jugado el ${date}`,
    rankingLine: (medal, name, score) =>
      `${medal} ${name} — ${score} puntos`,
    awardLine: (award, name) => `${award}: ${name}`,
    cancelled: "Se ha cancelado el uso compartido.",
  },

  awards: {
    title: "Premios de la tripulación",
    names: {
      lookout: "El Vigía",
      zeroBidRoyalty: "Realeza de la apuesta cero",
      comeback: "La Remontada",
      reckless: "El Temerario",
      castaway: "El Náufrago",
    },
  },

  scoreBreakdown: {
    title: "Detalles de puntuación",
    close: "Cerrar",
    openFor: (name, total) =>
      `Mostrar los detalles de puntuación de ${name}: ${total}`,
    openRankedFor: (rank, name, total) =>
      `Puesto ${rank}, ${name}, ${total} puntos. Mostrar detalles de puntuación`,
    currentScore: "Puntuación actual",
    earned: "Ganados",
    lost: "Perdidos",
    recordedHint: "Solo se incluyen las rondas puntuadas.",
    noRounds: "Todavía no se ha puntuado ninguna ronda.",
    historyTitle: "Rondas puntuadas",
    round: (n) => `Ronda ${n}`,
    roundSummary: (bid, tricks) => `Apuesta ${bid} · ganó ${tricks}`,
    exact: "Apuesta acertada",
    missed: "Apuesta fallada",
    runningTotal: "Total tras la ronda",
    expandRound: (n) => `Mostrar detalles de la ronda ${n}`,
    collapseRound: (n) => `Ocultar detalles de la ronda ${n}`,
    bidSuccess: (bid) => `Apuesta ${bid} acertada exactamente`,
    bidMissed: (bid, difference) =>
      `Apuesta ${bid} fallada · diferencia de ${difference} ${
        difference === 1 ? "baza" : "bazas"
      }`,
    zeroBidSuccess: (cards) =>
      `Apuesta cero acertada · ${cards} ${cards === 1 ? "carta" : "cartas"}`,
    zeroBidMissed: (cards) =>
      `Apuesta cero fallada · ${cards} ${cards === 1 ? "carta" : "cartas"}`,
    outcomes: {
      directHit: "Impacto directo",
      glancingBlow: "Impacto parcial",
      whiff: "Fallo total",
    },
    rascalBidDirect: (bid) =>
      `Impacto directo · apuesta ${bid} exacta · todos los puntos`,
    rascalBidGlancing:
      "Impacto parcial · diferencia de una · la mitad de los puntos",
    rascalBidWhiff: (diff) => `Fallo total · diferencia de ${diff}`,
    rascalCannonballWon:
      "Bala de cañón · apuesta exacta · 15 por carta",
    rascalCannonballLost: (diff) =>
      `Bala de cañón perdida · diferencia de ${diff}`,
    ignored: "No contabilizado",
    items: {
      colored14: (count) =>
        `${count} ${count === 1 ? "14 de color capturado" : "14 de color capturados"}`,
      black14: "14 negro capturado",
      mermaidByPirate: (count) =>
        `${count} ${count === 1 ? "sirena capturada" : "sirenas capturadas"} por un pirata`,
      pirateBySkullKing: (count) =>
        `${count} ${count === 1 ? "pirata capturado" : "piratas capturados"} por Skull King`,
      mermaidCapturesSkullKing: "Una sirena captura a Skull King",
      rascalWon: "Apuesta Rascal ganada",
      rascalLost: "Apuesta Rascal perdida",
      expansion7: (count) =>
        `${count} ${count === 1 ? "7 especial capturado" : "7 especiales capturados"}`,
      expansion8: (count) =>
        `${count} ${count === 1 ? "8 especial capturado" : "8 especiales capturados"}`,
      davyJonesLeviathans: (count) =>
        `${count} ${count === 1 ? "leviatán destruido" : "leviatanes destruidos"} por Davy Jones`,
      secondCaptured: "El Segundo capturado",
      legacyLoot: (count) =>
        `${count} ${count === 1 ? "bonus de Botín antiguo" : "bonus de Botín antiguos"}`,
      loot: (count) =>
        `${count} ${count === 1 ? "alianza de Botín conseguida" : "alianzas de Botín conseguidas"}`,
      lootMissed: (count) =>
        `${count} ${count === 1 ? "alianza de Botín" : "alianzas de Botín"} · al menos una apuesta fallada`,
      lootSelfWin: (count) =>
        `${count} ${count === 1 ? "carta de Botín recuperada" : "cartas de Botín recuperadas"} por quien la jugó · sin alianza`,
    },
  },

  bonus: {
    colored14: "14 de colores",
    black14: "14 negro (Jolly Roger)",
    mermaidByPirate: "Sirena capturada por un pirata",
    pirateBySkullKing: "Pirata capturado por Skull King",
    mermaidCapturesSkullKing: "Sirena que captura a Skull King",
    rascal: "Apuesta Rascal",
    newExpansion: "Nueva expansión",
    expansion7: "Nuevo 7 capturado",
    expansion8: "Nuevo 8 capturado",
    expansionColorHint:
      "Los nuevos 7 y 8 solo puntúan cuando la apuesta es exacta.",
    davyJonesLeviathans: "Leviatán destruido por Davy Jones",
    secondCaptured: "El Segundo capturado por Skull King / Sirena",
    each: "c/u",
    cardBonus: (n) => `Bonus de cartas: ${n >= 0 ? "+" : ""}${n}`,
  },

  loot: {
    title: "Alianzas de Botín",
    hint:
      "Registra cada carta de Botín en cuanto se juegue. Todas las apuestas implicadas deben confirmarse al final de la ronda.",
    record: "+ Registrar Botín",
    useNumber: (n) => `Botín ${n}`,
    playedByPrompt: "¿Quién jugó la carta de Botín?",
    winnerPrompt: "¿Quién ganó la baza?",
    playedByRole: "jugó Botín",
    winnerRole: "ganó la baza",
    pendingPair: (playedBy, boundTo) =>
      `${playedBy} y ${boundTo} deben acertar sus apuestas.`,
    success: "Ambos acertaron sus apuestas · +20 cada uno",
    failed: (names) => `Sin bonus de Botín · apuesta fallada: ${names}`,
    selfWin: (name) =>
      `${name} ganó su propio Botín · no se formó ninguna alianza`,
    change: "Cambiar",
    remove: "Eliminar",
    removeLabel: (n) => `Eliminar Botín ${n}`,
    maxRecorded: "Las dos cartas de Botín están registradas.",
    incomplete:
      "Elige a los jugadores de cada Botín antes de puntuar la ronda.",
    legacyNotice:
      "Se conservan los puntos de Botín anteriores, pero no se guardaron sus vínculos originales entre jugadores.",
  },

  lootConfirmation: {
    eyebrow: "Comprobación obligatoria",
    title: "Confirmar alianzas de Botín",
    intro: (players) =>
      `${players} ${players === 1 ? "jugador participa" : "jugadores participan"} en una alianza de Botín. Revisa todas las apuestas antes de continuar.`,
    madeBid: "Apuesta acertada",
    missedBid: "Apuesta fallada",
    allianceBonus: "Alianza conseguida · +20 puntos cada uno",
    noAllianceBonus: "Alianza fallida · sin bonus de Botín",
    confirm: "Confirmar apuestas",
  },

  rules: {
    title: "Puntuación y cartas",
    done: "Listo",
    unofficialNotice:
      "Resumen práctico no oficial redactado para facilitar el recuento de puntos. En caso de duda, prevalece el reglamento de tu edición.",
    officialRules: "Ver las reglas oficiales",
    headings: {
      scoring: "Puntuación",
      rascal: "Puntuación de Rascal",
      bonus: "Puntos de bonus",
      expansion: "Nueva expansión",
      special: "Cartas especiales",
      twoPlayer: "Variante para dos jugadores",
    },
    scoring: [
      {
        title: "Apuesta de 1 o más",
        body: "Apuesta exacta: +20 por baza ganada. Fallo (por exceso o por defecto): -10 por cada baza de diferencia y ningún punto por las bazas ganadas.",
      },
      {
        title: "Apuesta cero",
        body: "Ganar 0 bazas: +10 × cartas repartidas en esta ronda. Ganar cualquier baza: -10 × cartas repartidas en esta ronda.",
      },
    ],
    rascal: [
      {
        title: "Un sistema de puntuación alternativo oficial",
        body: "Se elige al crear la partida. Todos los jugadores tienen el mismo potencial en cada ronda —10 puntos por carta repartida, independientemente de la apuesta— y la precisión decide qué parte obtienen. La puntuación nunca es negativa.",
      },
      {
        title: "Impacto directo · impacto parcial · fallo total",
        body: "Apuesta exacta: todos los puntos en juego. Fallo por una: la mitad. Fallo por dos o más: nada.",
      },
      {
        title: "Los puntos de bonus siguen los mismos niveles",
        body: "Los bonus por captura cuentan completos con un impacto directo, a la mitad con un impacto parcial y no cuentan con un fallo total. Botín, los 7/8 especiales y la apuesta del pirata Rascal mantienen sus propias reglas de apuesta exacta.",
      },
      {
        title: "Opcional: Perdigón o Bala de cañón",
        body: "Si se activa en la configuración, todos declaran después de apostar y revelan a la vez. La mano abierta (Perdigón) mantiene los niveles normales; el puño cerrado (Bala de cañón) da 15 puntos por carta repartida con una apuesta exacta y nada en caso contrario, bonus incluidos.",
      },
    ],
    bonusEntries: [
      {
        title: "14 de color  (+10 cada uno)",
        body: "Cada 14 amarillo, morado o verde que captures (ganando la baza en la que está) al final de la ronda.",
      },
      {
        title: "14 negro  (+20)",
        body: "Capturar el 14 negro (Jolly Roger / triunfo).",
      },
      {
        title: "Sirena capturada por un pirata  (+20 cada una)",
        body: "Tu pirata gana una baza que contiene una sirena.",
      },
      {
        title: "Pirata capturado por Skull King  (+30 cada uno)",
        body: "Tu Skull King gana una baza que contiene uno o más piratas.",
      },
      {
        title: "Una sirena captura a Skull King  (+40)",
        body: "Tu sirena gana una baza que contiene a Skull King. (La sirena gana a Skull King, Skull King gana a los piratas y los piratas ganan a la sirena).",
      },
      {
        title: "Los bonus cuentan sin importar tu apuesta",
        body: "Conservas los bonus por captura aunque falles tu apuesta. Se los lleva quien captura la carta, sin importar quién la haya jugado.",
      },
    ],
    expansion: [
      {
        title: "Nuevos 7 y 8  (-5 / +5 cada uno)",
        body: "Se juegan como cartas normales de su palo. Quien captura un nuevo 7 pierde 5 puntos y quien captura un nuevo 8 gana 5, pero solo si su apuesta es exacta. Si hay empate en el valor ganador, vence la primera carta jugada.",
      },
      {
        title: "Cartas 0/14",
        body: "Al jugar la carta, declara inmediatamente si vale 0 o 14. No concede ningún bonus.",
      },
      {
        title: "15 comodín",
        body: "Cuenta como un 15 amarillo, morado o verde. Elige su palo si todavía no se ha establecido ninguno. Si ya se ha establecido un palo que no sea negro, debe seguirlo. Cuando se sale con negro, no hace falta declarar un palo.",
      },
      {
        title: "Mary Throne (Pirata)",
        body: "Se juega como una pirata normal. Con los poderes avanzados de pirata, elige al azar y sin verla una carta de la mano de un rival; deberá jugarla en la siguiente baza sin importar las cartas ya jugadas.",
      },
      {
        title: "Salva final",
        body: "No puede ganar una baza y no es una Huida. Cuando todos hayan jugado, juega inmediatamente otra carta. Después tendrás una carta menos y no participarás en la última baza de la ronda.",
      },
      {
        title: "Caminar por la tabla",
        body: "Esta carta no puede ganar la baza. Al terminar la baza, retira uno de los piratas que haya en ella; ese pirata ya no puede ganar la baza ni conceder puntos.",
      },
      {
        title: "Raya moteada",
        body: "Gana la carta más baja; en caso de empate, gana la primera que se jugó. Si aparecen varios leviatanes (Kraken, Ballena Blanca, Raya moteada), el último jugado determina el efecto de la baza.",
      },
      {
        title: "Cofre de Davy Jones  (+20 por leviatán)",
        body: "Úsalo con leviatanes. No puede ganar la baza y destruye todos los leviatanes que haya en ella; después, la carta restante más fuerte gana normalmente. Quien jugó el Cofre obtiene 20 puntos por cada leviatán destruido, independientemente del orden de las cartas.",
      },
      {
        title: "El Segundo  (+30 al capturarlo)",
        body: "Gana a todas las cartas excepto a Skull King y las sirenas. Puede usar los poderes de los piratas que capture, pero no obtiene bonus de captura por ellos. Si Skull King o una sirena lo captura, su jugador obtiene 30 puntos.",
      },
    ],
    special: [
      {
        title: "Huida / Tigresa como Huida",
        body: "Siempre pierde la baza. Sirve para deshacerte sin riesgo de una baza que no quieres.",
      },
      {
        title: "Pirata (×5) y Tigresa",
        body: "Ganan a todas las cartas numeradas. La Tigresa puede jugarse como pirata o como Huida.",
      },
      {
        title: "Skull King",
        body: "Gana a todos los números y a todos los piratas (+30 por cada uno capturado). Solo una sirena puede vencerlo.",
      },
      {
        title: "Sirena (×2)",
        body: "Gana a todos los números y a Skull King (+40), pero pierde contra los piratas. Si en una baza hay un pirata, Skull King y una sirena, la sirena siempre gana.",
      },
      {
        title: "Kraken",
        body: "La baza se destruye: NADIE la gana y las cartas se apartan. No se cuenta la baza ni se produce ninguna captura. Sale en la siguiente baza quien la habría ganado.",
      },
      {
        title: "Ballena Blanca",
        body: "Todas las cartas especiales quedan anuladas y pierden; la carta NUMERADA más alta gana la baza (incluido el triunfo). Si solo se jugaron cartas especiales, la baza se descarta. En una baza con la Ballena no se conceden bonus por capturar cartas especiales.",
      },
      {
        title: "Kraken contra Ballena Blanca",
        body: "Si ambos caen en la misma baza, se aplica el efecto del segundo que se haya jugado.",
      },
      {
        title: "Botín  (+20 por aliado)",
        body: "Forma una alianza entre quien lo juega y quien gana esa baza. Registra a ambos jugadores cuando ocurra; si LOS DOS aciertan exactamente su apuesta, la aplicación concede +20 a cada uno.",
      },
      {
        title: "Apuesta del pirata Rascal (0/10/20)",
        body: "Una apuesta paralela: ganas su valor si aciertas tu apuesta y lo pierdes si fallas.",
      },
    ],
    twoPlayer: [
      {
        title: "Barbagris, el fantasma 👻",
        body: "En la variante para dos jugadores del reglamento se reparte una tercera mano para el fantasma Barbagris. En cada baza juega segundo, sin respetar el palo de salida, y su Tigresa siempre cuenta como Huida. No se usan cartas de Botín.",
      },
      {
        title: "Juega, pero nunca puntúa",
        body: "Barbagris no apuesta ni obtiene puntos. Solo roba bazas (y las cartas de bonus que contengan simplemente se pierden). Cuando gana una baza, sale en la siguiente; en caso contrario, siempre juega segundo.",
      },
      {
        title: "El total de bazas puede ser inferior",
        body: "Como Barbagris gana algunas bazas, la suma de las bazas de los dos jugadores puede ser MENOR que el número de cartas repartidas. La aplicación muestra cuántas bazas ganó el fantasma en lugar de advertirte.",
      },
    ],
  },

  stepper: {
    decrease: (label) => `Reducir ${label}`,
    increase: (label) => `Aumentar ${label}`,
  },
};
