import { Strings } from "./types";

/** Ordinales españoles abreviados: 1.º, 2.º, 3.º… */
const ordinal = (value: number) => `${value}.º`;

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
      "Usamos cookies de Google Analytics para conocer las visitas y mejorar Skull King Crew Ledger.",
    decline: "Rechazar",
    accept: "Aceptar",
  },

  home: {
    title: "Skull King",
    subtitle: "Crew Ledger",
    unofficial: "Aplicación no oficial creada por fans",
    resume: "Continuar partida",
    activeTitle: "Partida en curso",
    playing: "Jugadores",
    lastPlayed: (date) => `Última actividad: ${date}`,
    abandon: "Abandonar partida",
    abandonTitle: "¿Abandonar esta partida?",
    abandonMessage:
      "Todas las puntuaciones y detalles de las rondas de esta partida en curso se eliminarán permanentemente. Las partidas terminadas no se verán afectadas.",
    abandonConfirm: "Abandonar",
    history: "Partidas recientes",
    historyHint: "Toca una partida para continuarla o ver su clasificación.",
    historyShowAll: (count) => `Ver las ${count} partidas`,
    historyShowLess: "Ver menos",
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
    supportCost: (amountEur) =>
      `Publicar la aplicación en la App Store le cuesta ${amountEur} €/año al desarrollador. Las contribuciones se destinan primero a esa factura.`,
    disclaimer:
      "Creada por un jugador sin afiliación, aprobación ni patrocinio de Grandpa Beck’s Games, sus editores o distribuidores. «Skull King» y los elementos oficiales del juego pertenecen a sus respectivos titulares de derechos.",
    offline: "Funciona sin conexión · instálala desde tu navegador",
  },

  supportPrompt: {
    title: "¿Te gusta la aplicación?",
    body:
      "Es gratuita, sin anuncios y sin cuentas, y así seguirá. No hay ninguna empresa detrás: solo un jugador que la desarrolla en su tiempo libre.",
    cost: (amountEur) =>
      `Mantenerla en la App Store le cuesta ${amountEur} €/año al desarrollador. Una pequeña aportación basta para cubrir esa factura.`,
    donate: "Apoya al desarrollador ☕",
    later: "Quizá más tarde",
    never: "No volver a preguntar",
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
      "Ahora los puntos se comparten únicamente mediante sesiones QR en directo, para que todos los jugadores vean las actualizaciones en tiempo real.",
      "Invitar a tu tripulación y unirse a otra mesa son ahora acciones separadas y visibles directamente en los ajustes.",
      "Mesas de juego compartidas: ponle nombre a la mesa de tu tripulación e invita a tus amigos con un enlace o código QR. Cualquiera que se una puede anotar los puntos, todas las partidas van al historial y la clasificación compartidos, y un mismo teléfono puede tener varias mesas, una por grupo de amigos.",
      "Las reglas ahora pueden cambiarse durante la partida con el nuevo botón ⚙: activar la expansión, cambiar la puntuación y más. Las rondas ya anotadas se recalculan automáticamente.",
      "La nueva expansión viene activada por defecto en las partidas nuevas.",
      "El botón de seguimiento en directo ahora es una pastilla «Live» clara, y el orden de juego muestra asientos numerados con quién abre la baza.",
      "Las etiquetas de bonificación siguen ahora la misma forma: quién captura qué.",
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
      "Todas las partidas, incluida cualquier partida en curso, se eliminarán permanentemente. Te recomendamos exportar antes una copia de seguridad.",
    deleteAllCancel: "Cancelar",
    deleteAllConfirm: "Eliminar todo",
    deleteAllSuccess: "Se han eliminado todas las partidas.",
    feedbackTitle: "Comentarios",
    feedbackHint:
      "¿Has encontrado un error o tienes una idea? Me encantará saber de ti.",
    feedbackButton: "Enviar comentarios",
    install: {
      title: "Instalar la aplicación",
      installedTitle: "Aplicación instalada",
      installedBody:
        "Skull King Crew Ledger está en tu dispositivo. Se abre como cualquier app y funciona totalmente sin conexión.",
      promptHint:
        "Añade Skull King Crew Ledger a tu pantalla de inicio para acceder con un toque y jugar sin conexión.",
      manualHint:
        "Añade Skull King Crew Ledger a tu pantalla de inicio para acceder con un toque y jugar sin conexión. Sigue los pasos de tu teléfono más abajo.",
      button: "Instalar ahora",
      error:
        "No se pudo iniciar la instalación. Sigue los pasos manuales de abajo.",
      guideTitle: "Cómo instalarla a mano",
      iosSafariTitle: "iPhone y iPad (Safari)",
      iosSafariSteps: [
        "Abre esta página en Safari.",
        "Toca el botón Compartir (un cuadrado con una flecha hacia arriba) en la parte inferior de la pantalla.",
        "Desplázate y toca «Añadir a pantalla de inicio».",
        "Toca «Añadir» arriba a la derecha. El icono aparece en tu pantalla de inicio.",
      ],
      iosChromeTitle: "iPhone y iPad (Chrome)",
      iosChromeSteps: [
        "Abre esta página en Chrome.",
        "Toca el pequeño botón Compartir (un cuadrado con una flecha hacia arriba) en la barra de direcciones.",
        "Toca la flecha «⌄» («Ver más») para mostrar todas las opciones.",
        "Toca el botón «+» llamado «Añadir a pantalla de inicio». El icono aparece en tu pantalla de inicio.",
      ],
      androidTitle: "Android (Chrome)",
      androidSteps: [
        "Abre esta página en Chrome.",
        "Toca el menú ⋮ arriba a la derecha.",
        "Toca «Instalar aplicación» (o «Añadir a la pantalla de inicio»).",
        "Confirma con «Instalar». El icono aparece en tu pantalla de inicio.",
      ],
    },
    cloud: {
      title: "Mesa de juego compartida",
      statusIdle: "La copia en la nube está activada.",
      statusSynced:
        "Guardado. Tus partidas se guardan en la nube automáticamente y vuelven si se borran los datos de este dispositivo.",
      statusSyncing: "Guardando en la nube…",
      statusOffline: "Sin conexión. Los cambios se sincronizarán al volver a estar en línea.",
      statusUnavailable: "La copia en la nube no está configurada en esta app.",
      tablesTitle: "Tus mesas",
      tableUnnamed: "Mesa sin nombre",
      tableActive: "Activa",
      tableSwitch: (name) => `Cambiar a la mesa ${name}`,
      tableSwitching: "Abriendo esa mesa…",
      tableSwitchError:
        "No se pudo abrir esa mesa. Comprueba tu conexión e inténtalo de nuevo.",
      newTable: "Crear una mesa nueva",
      newTableHint:
        "Una mesa vacía con su propio historial y clasificación, para otro grupo de amigos. Tus mesas actuales permanecen en este teléfono.",
      removeTable: (name) => `Quitar ${name} de este teléfono`,
      removeTableTitle: "¿Quitar esta mesa de este teléfono?",
      removeTableMessage:
        "Solo desaparece de este teléfono. La mesa y sus partidas siguen existiendo para sus miembros, y podrás volver a unirte más tarde con una invitación.",
      removeTableCancel: "Cancelar",
      removeTableConfirm: "Quitar",
      tableNameLabel: "Nombre de la mesa",
      tableNamePlaceholder: "p. ej. La tripulación del viernes",
      tableNameHint:
        "Ponle nombre a la mesa de tu tripulación. Todos los que se unan verán el mismo nombre, historial y clasificación.",
      shareTitle: "Invita a tu tripulación",
      shareHint:
        "Tus amigos escanean este código QR (o abren el enlace) para unirse a tu mesa. Cualquier miembro puede anotar los puntos; todas las partidas van al mismo historial compartido. Compártelo solo con tu tripulación.",
      copyLink: "Copiar enlace de invitación",
      copying: "Copiando…",
      linkCopied: "¡Enlace copiado!",
      copyFailed: "No se pudo copiar",
      qrLabel: "Código QR para unirse a esta mesa de juego",
      linkTitle: "¿Sin cámara a mano? Usa un código",
      linkHint:
        "Copia el código de esta mesa y pégalo en el otro teléfono para unirte allí a la misma mesa. Mantenlo privado: cualquiera que lo tenga puede ver y editar tus partidas.",
      codeLabel: "Código de esta mesa",
      copy: "Copiar",
      copied: "Copiado",
      joinTitle: "Unirse a otra mesa",
      pasteLabel: "Pega el código de otra mesa",
      linkButton: "Unirse a esa mesa",
      linking: "Uniéndose…",
      linkError: "No se pudo leer ese código.",
      linkSuccess: "Listo. Este teléfono ya forma parte de la mesa compartida.",
    },
  },

  joinTable: {
    title: "Unirse a una mesa de juego",
    named: (name) => `¿Unirse a la mesa «${name}»?`,
    unnamed: "¿Unirse a esta mesa de juego?",
    message: (count) =>
      count === 1
        ? "Esta mesa y su partida se añadirán a este teléfono. Las partidas que ya tienes se quedan en su propia mesa; puedes cambiar de mesa cuando quieras."
        : `Esta mesa y sus ${count} partidas se añadirán a este teléfono. Las partidas que ya tienes se quedan en su propia mesa; puedes cambiar de mesa cuando quieras.`,
    confirm: "Unirse a la mesa",
    cancel: "Ahora no",
    busy: "Uniéndose…",
    success: "¡Bienvenido a bordo! Este teléfono ya sigue esta mesa.",
    error:
      "No se pudo abrir esta invitación. Comprueba tu conexión o pide a tu tripulación que reenvíe el enlace.",
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
      "La variante para dos jugadores descrita en el reglamento: reparte una tercera mano para el fantasma Barbagris. Juega, pero nunca hace envites ni puntúa, así que roba algunas bazas; la suma de las bazas de los dos jugadores puede ser inferior al número de cartas repartidas.",
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
      classic: "Recuento de Skull King",
      rascal: "Recuento del Bribón",
    },
    scoringHints: {
      classic:
        "El sistema clásico de riesgo y recompensa: los envites exactos dan 20 puntos por baza y los fallos restan puntos.",
      rascal:
        "En cada ronda hay en juego 10 puntos por carta repartida. Envite exacto: todos. Fallo por una: la mitad. Fallo por dos o más: nada; nunca se resta.",
    },
    rascalBetsTitle: "Reglas opcionales del Bribón ✊",
    rascalBetsHint:
      "Tras hacer el envite, todos declaran Metralla (mano abierta: niveles normales) o Bala de cañón (puño cerrado: 15 puntos por carta repartida con un envite exacto y nada en caso contrario, bonificaciones incluidas).",
    bonusesOnMissTitle: "Contar bonificaciones aunque falle el envite",
    bonusesOnMissHint:
      "Variante opcional: las bonificaciones por captura (14, sirenas, piratas, Skull King...) se conservan tras fallar el envite. Déjala desactivada para seguir la regla oficial.",
    expansion: "Cartas de expansión",
    advancedTitle: "Botín y apuesta del Bribón",
    advancedHint:
      "Añade el seguimiento por ronda de Botín y de la apuesta del pirata Bribón. El Kraken, la Ballena Blanca y las bonificaciones de 14 y capturas siempre están disponibles.",
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
    playOrderLead: (name) => `Orden de juego · ${name} abre la primera baza`,
    ghostName: "Barbagris",
    bid: "Envite",
    won: "Ganadas",
    bonus: "Bonus",
    roundPoints: "Puntos de la ronda",
    roundPointsPreview: "Puntuación provisional",
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
      "No se han introducido envites ni bazas. Confirma que ambos jugadores envidaron cero y que Barbagris ganó todas las bazas.",
    untouchedCancel: "Revisar valores",
    untouchedConfirm: "Sí, puntuarla",
    rascalStake: (points) =>
      `Recuento del Bribón · ${points} puntos en juego`,
    rascalBetNames: {
      buckshot: "Metralla",
      cannonball: "Bala de cañón",
    },
    rascalBetFor: (name) => `Declaración de ${name}`,
  },

  gameSettings: {
    open: "Reglas de la partida",
    title: "Reglas de la partida",
    recomputeHint:
      "Los cambios se aplican a toda la partida: las rondas ya anotadas se recalculan con las nuevas reglas.",
    close: "Listo",
  },

  liveShare: {
    open: "Puntos compartidos en directo",
    badge: "Live",
    title: "Seguir los puntos",
    subtitle: "Cada jugador puede seguir los puntos en su propio teléfono.",
    liveHint:
      "Inicia una sesión en directo. Los jugadores que escaneen el código siguen los puntos en tiempo real; cada envite, baza y bonificación aparece en su teléfono en cuanto lo registras, sin actualizar nada.",
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
      "La sincronización en directo tuvo un problema. Sigue reintentando. Comprueba tu conexión, o detén e inicia de nuevo.",
    copyLink: "Copiar enlace",
    copied: "¡Enlace copiado!",
    copyError: "No se pudo copiar el enlace.",
    qrLabel:
      "Código QR que abre el seguimiento de puntos de esta partida",
    close: "Cerrar",
  },

  spectator: {
    liveEyebrow: "Seguimiento en directo",
    liveBadge: "En directo",
    title: "Seguimiento de partida",
    roundProgress: (scored, total) =>
      `Puntos tras la ronda ${scored} de ${total}`,
    noRounds: "Todavía no se ha puntuado ninguna ronda.",
    finished: "Puntuación final. La partida ha terminado.",
    liveUpdatedAt: (time) => `Actualizado en directo · ${time}`,
    connecting: "Conectando con la partida en directo…",
    reconnecting: "Conexión perdida. Reconectando…",
    endedTitle: "Sesión en directo finalizada",
    endedBody:
      "El anotador dejó de compartir. Debajo se muestran los últimos puntos recibidos.",
    standingsTitle: "Clasificación",
    tapHint:
      "Toca cualquier jugador para ver su detalle completo ronda a ronda: envites, bazas y bonificaciones.",
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
    duration: (hours, minutes) =>
      hours > 0 && minutes > 0
        ? `Partida jugada en ${hours} h ${String(minutes).padStart(2, "0")}`
        : hours > 0
          ? `Partida jugada en ${hours} h`
          : minutes > 0
            ? `Partida jugada en ${minutes} min`
            : "Partida jugada en menos de un minuto",
    podiumTitle: "Podio",
    podiumPlace: (rank, name, total) =>
      `Puesto ${rank}, ${name}, ${total} puntos`,
    review: "Revisar ronda por ronda",
    rematch: "Revancha con la misma tripulación",
    installTitle: "Lleva Skull King Crew Ledger a bordo",
    installHint:
      "Instala la aplicación para acceder rápidamente y jugar sin conexión.",
    installIosHint:
      "Toca Compartir y después «Añadir a pantalla de inicio». En Chrome, abre antes «Ver más».",
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
    scoreEvolution: "Evolución de la puntuación",
    hallOfFame: "Salón de la fama",
    hallOfShame: "Sentina",

    totalGames: "Partidas",
    totalRounds: "Rondas",
    totalPlunder: "Botín",
    totalPlayers: "Tripulantes",

    bestFinalScore: "Mejor puntuación final",
    bestFinalScoreHint:
      "La puntuación más alta con la que alguien ha terminado una partida.",
    biggestRound: "Mayor ronda",
    biggestRoundHint: "El mayor botín conseguido en una sola ronda.",
    bestExactBid: "Envite más certero",
    bestExactBidHint: (rounds) =>
      `El mejor porcentaje de envites exactos, con al menos ${rounds} rondas jugadas.`,
    zeroBidMaster: "Maestro del cero",
    zeroBidMasterHint: (zeroBids) =>
      `El mejor historial envidando cero y sin ganar bazas, con al menos ${zeroBids} envites a cero.`,
    longestStreak: "Mejor racha",
    longestStreakHint: "La racha más larga de partidas ganadas seguidas.",
    biggestComeback: "Mayor remontada",
    biggestComebackHint:
      "Los puestos ganados entre la clasificación de mitad de partida y la final.",
    biggestBonusHaul: "Botín más rico",
    biggestBonusHaulHint:
      "Los puntos de bonificación de cartas especiales conseguidos en una partida.",
    worstFinalScore: "Peor puntuación final",
    worstFinalScoreHint:
      "La puntuación más baja con la que alguien ha terminado una partida.",
    worstRound: "Peor ronda",
    worstRoundHint: "El mayor agujero cavado en una sola ronda.",
    mostLastPlaces: "Más últimos puestos",
    mostLastPlacesHint:
      "Ha terminado por detrás de toda la mesa más veces que nadie.",
    boldestBidder: "Envite más audaz",
    boldestBidderHint:
      "Reclama la mayor parte de cada mano repartida: valentía o temeridad.",

    recordUnclaimed: "Aún sin dueño",
    unitPoints: "pts",
    unitWins: (count) => (count === 1 ? "victoria" : "victorias"),
    unitPlaces: (count) => (count === 1 ? "puesto" : "puestos"),
    unitGames: (count) => (count === 1 ? "partida" : "partidas"),
    roundMeta: (round, date) => `Ronda ${round} · ${date}`,
    sampleMeta: (successes, attempts) =>
      `${successes} de ${attempts} ${attempts === 1 ? "ronda" : "rondas"}`,
    comebackMeta: (fromRank, toRank, date) =>
      `${ordinal(fromRank)} → ${ordinal(toRank)} · ${date}`,
    lastPlaceMeta: (rate, games) =>
      `${rate} de ${games} ${games === 1 ? "partida" : "partidas"}`,
    appetiteMeta: (averageBid, rounds) =>
      `${averageBid} bazas por ronda · ${rounds} ${
        rounds === 1 ? "ronda" : "rondas"
      }`,

    metricsResults: "Resultados",
    metricsBidding: "Envites",
    metricsScoring: "Puntos",

    gamesPlayed: "Partidas jugadas",
    roundsPlayed: "Rondas jugadas",
    wins: "Victorias",
    winRate: "Porcentaje de victorias",
    rivalsBeaten: "Rivales superados",
    averageRank: "Puesto medio",
    lastPlaces: "Últimos puestos",
    winStreak: "Racha de victorias actual",
    longestWinStreak: "Mayor racha de victorias",
    exactBidRate: "Envites exactos",
    zeroBidRate: "Éxito con envite cero",
    bidAppetite: "Apetito de envite",
    averagePoints: "Puntos por partida",
    pointsPerRound: "Puntos por ronda",
    bestScore: "Mejor puntuación",
    worstScore: "Peor puntuación",
    bestRoundScore: "Mejor ronda",
    worstRoundScore: "Peor ronda",
    bonusPoints: "Puntos de bonificación",

    outOfGames: (count, games) =>
      `${count} de ${games} ${games === 1 ? "partida" : "partidas"}`,
    seatsCaption: (seats) => `de ${seats} jugadores`,
    perGame: "Media de todas las partidas",
    rivalsBeatenCaption: "Parte de los rivales que ha dejado atrás",
    perRound: "Media de todas las rondas",
    fromSpecialCards: "Ganados con cartas especiales",
    bidCaption: (averageBid) => `${averageBid} bazas por ronda`,

    recentGames: "Partidas recientes",
    unavailable: "No disponible",
    chartLabel: (leader, rounds) =>
      `Evolución de la puntuación tras ${rounds} ${rounds === 1 ? "ronda" : "rondas"}; ${leader} va en cabeza.`,
    playerSummary: (games, wins) =>
      `${games} ${games === 1 ? "partida" : "partidas"} · ${wins} ${
        wins === 1 ? "victoria" : "victorias"
      }`,
    bidSummary: (successes, attempts) => `${successes} de ${attempts}`,
    recentGame: (date, rank, score) =>
      `${date} · ${ordinal(rank)} · ${score} puntos`,
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
      `${medal} ${name}, ${score} puntos`,
    awardLine: (award, name) => `${award}: ${name}`,
    cancelled: "Se ha cancelado el uso compartido.",
  },

  awards: {
    title: "Premios de la tripulación",
    names: {
      lookout: "El Vigía",
      zeroBidRoyalty: "Realeza del envite cero",
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
    roundSummary: (bid, tricks) => `Envite ${bid} · ganó ${tricks}`,
    exact: "Envite acertado",
    missed: "Envite fallado",
    runningTotal: "Total tras la ronda",
    expandRound: (n) => `Mostrar detalles de la ronda ${n}`,
    collapseRound: (n) => `Ocultar detalles de la ronda ${n}`,
    bidSuccess: (bid) => `Envite ${bid} acertado exactamente`,
    bidMissed: (bid, difference) =>
      `Envite ${bid} fallado · diferencia de ${difference} ${
        difference === 1 ? "baza" : "bazas"
      }`,
    zeroBidSuccess: (cards) =>
      `Envite cero acertado · ${cards} ${cards === 1 ? "carta" : "cartas"}`,
    zeroBidMissed: (cards) =>
      `Envite cero fallado · ${cards} ${cards === 1 ? "carta" : "cartas"}`,
    outcomes: {
      directHit: "Impacto directo",
      glancingBlow: "Golpe de refilón",
      whiff: "Tiro errado",
    },
    rascalBidDirect: (bid) =>
      `Impacto directo · envite ${bid} exacto · todos los puntos`,
    rascalBidGlancing:
      "Golpe de refilón · diferencia de una · la mitad de los puntos",
    rascalBidWhiff: (diff) => `Tiro errado · diferencia de ${diff}`,
    rascalCannonballWon:
      "Bala de cañón · envite exacto · 15 por carta",
    rascalCannonballLost: (diff) =>
      `Bala de cañón perdida · diferencia de ${diff}`,
    ignored: "No contabilizado",
    items: {
      colored14: (count) =>
        `${count} ${count === 1 ? "14 de color capturado" : "14 de color capturados"}`,
      black14: "14 negro capturado",
      mermaidByPirate: (count) =>
        `Un pirata capturó ${count} ${count === 1 ? "sirena" : "sirenas"}`,
      pirateBySkullKing: (count) =>
        `Skull King capturó ${count} ${count === 1 ? "pirata" : "piratas"}`,
      mermaidCapturesSkullKing: "Una sirena capturó a Skull King",
      rascalWon: "Apuesta del Bribón ganada",
      rascalLost: "Apuesta del Bribón perdida",
      expansion7: (count) =>
        `${count} ${count === 1 ? "7 especial capturado" : "7 especiales capturados"}`,
      expansion8: (count) =>
        `${count} ${count === 1 ? "8 especial capturado" : "8 especiales capturados"}`,
      davyJonesLeviathans: (count) =>
        `Davy Jones destruyó ${count} ${count === 1 ? "leviatán" : "leviatanes"}`,
      secondCaptured: "Skull King o una sirena capturó al Segundo",
      legacyLoot: (count) =>
        `${count} ${count === 1 ? "bonificación de Botín antigua" : "bonificaciones de Botín antiguas"}`,
      loot: (count) =>
        `${count} ${count === 1 ? "alianza de Botín conseguida" : "alianzas de Botín conseguidas"}`,
      lootMissed: (count) =>
        `${count} ${count === 1 ? "alianza de Botín" : "alianzas de Botín"} · al menos un envite fallado`,
      lootSelfWin: (count) =>
        `${count} ${count === 1 ? "carta de Botín recuperada" : "cartas de Botín recuperadas"} por quien la jugó · sin alianza`,
    },
  },

  bonus: {
    colored14: "14 de colores",
    black14: "14 negro (Jolly Roger)",
    mermaidByPirate: "Un pirata captura una sirena",
    pirateBySkullKing: "Skull King captura un pirata",
    mermaidCapturesSkullKing: "Una sirena captura a Skull King",
    rascal: "Apuesta del Bribón",
    newExpansion: "Nueva expansión",
    expansion7: "Nuevo 7 capturado",
    expansion8: "Nuevo 8 capturado",
    expansionColorHint:
      "Los nuevos 7 y 8 solo puntúan cuando el envite es exacto.",
    davyJonesLeviathans: "Davy Jones destruye un leviatán",
    secondCaptured: "Skull King / sirena captura al Segundo",
    each: "c/u",
    requiresBidHint:
      "Esta partida solo concede las bonificaciones por captura si el envite es exacto.",
    requiresBidMissed:
      "Envite fallado: en esta partida las bonificaciones por captura no cuentan.",
    cardBonus: (n) => `Bonificación de cartas: ${n >= 0 ? "+" : ""}${n}`,
  },

  loot: {
    title: "Alianzas de Botín",
    hint:
      "Registra cada carta de Botín en cuanto se juegue. Todos los envites implicados deben confirmarse al final de la ronda.",
    record: "+ Registrar Botín",
    useNumber: (n) => `Botín ${n}`,
    playedByPrompt: "¿Quién jugó la carta de Botín?",
    winnerPrompt: "¿Quién ganó la baza?",
    playedByRole: "jugó Botín",
    winnerRole: "ganó la baza",
    pendingPair: (playedBy, boundTo) =>
      `${playedBy} y ${boundTo} deben acertar sus envites.`,
    success: "Ambos acertaron sus envites · +20 cada uno",
    failed: (names) => `Sin bonificación de Botín · envite fallado: ${names}`,
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
      `${players} ${players === 1 ? "jugador participa" : "jugadores participan"} en una alianza de Botín. Revisa todos los envites antes de continuar.`,
    madeBid: "Envite acertado",
    missedBid: "Envite fallado",
    allianceBonus: "Alianza conseguida · +20 puntos cada uno",
    noAllianceBonus: "Alianza fallida · sin bonificación de Botín",
    confirm: "Confirmar envites",
  },

  rules: {
    title: "Puntuación y cartas",
    done: "Listo",
    unofficialNotice:
      "Resumen práctico no oficial redactado para facilitar el recuento de puntos. En caso de duda, prevalece el reglamento de tu edición.",
    officialRules: "Ver las reglas oficiales",
    headings: {
      scoring: "Puntuación",
      rascal: "Recuento del Bribón",
      bonus: "Puntos de bonificación",
      expansion: "Nueva expansión",
      special: "Cartas especiales",
      twoPlayer: "Variante para dos jugadores",
    },
    scoring: [
      {
        title: "Envite de 1 o más",
        body: "Envite exacto: +20 por baza ganada. Fallo (por exceso o por defecto): -10 por cada baza de diferencia y ningún punto por las bazas ganadas.",
      },
      {
        title: "Envite cero",
        body: "Ganar 0 bazas: +10 × cartas repartidas en esta ronda. Ganar cualquier baza: -10 × cartas repartidas en esta ronda.",
      },
    ],
    rascal: [
      {
        title: "Un sistema de puntuación alternativo oficial",
        body: "Se elige al crear la partida. Todos los jugadores tienen el mismo potencial en cada ronda: 10 puntos por carta repartida, independientemente del envite. La precisión decide qué parte obtienen. La puntuación nunca es negativa.",
      },
      {
        title: "Impacto directo · golpe de refilón · tiro errado",
        body: "Envite exacto: todos los puntos en juego. Fallo por una: la mitad. Fallo por dos o más: nada.",
      },
      {
        title: "Las bonificaciones siguen los mismos niveles",
        body: "Las bonificaciones por captura cuentan completas con un impacto directo, a la mitad con un golpe de refilón y no cuentan con un tiro errado. Botín, los 7/8 especiales y la apuesta del pirata Bribón mantienen sus propias reglas de envite exacto.",
      },
      {
        title: "Opcional: Metralla o Bala de cañón",
        body: "Si se activa en la configuración, todos declaran después de envidar y revelan a la vez. La mano abierta (Metralla) mantiene los niveles normales; el puño cerrado (Bala de cañón) da 15 puntos por carta repartida con un envite exacto y nada en caso contrario, bonificaciones incluidas.",
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
        title: "Un pirata captura una sirena  (+20 cada una)",
        body: "Tu pirata gana una baza que contiene una sirena.",
      },
      {
        title: "Skull King captura un pirata  (+30 cada uno)",
        body: "Tu Skull King gana una baza que contiene uno o más piratas.",
      },
      {
        title: "Una sirena captura a Skull King  (+40)",
        body: "Tu sirena gana una baza que contiene a Skull King. (La sirena gana a Skull King, Skull King gana a los piratas y los piratas ganan a la sirena).",
      },
      {
        title: "Las bonificaciones exigen un envite exacto",
        body: "Según el reglamento oficial, las bonificaciones por captura solo se conceden si aciertas exactamente el envite. Las recibe quien captura la carta, sin importar quién la haya jugado. Una opción al crear la partida permite la variante contraria: las bonificaciones cuentan incluso tras fallar el envite.",
      },
    ],
    expansion: [
      {
        title: "Nuevos 7 y 8  (-5 / +5 cada uno)",
        body: "Se juegan como cartas normales de su palo. Quien captura un nuevo 7 pierde 5 puntos y quien captura un nuevo 8 gana 5, pero solo si su envite es exacto. Si hay empate en el valor ganador, vence la primera carta jugada.",
      },
      {
        title: "Cartas 0/14",
        body: "Al jugar la carta, declara inmediatamente si vale 0 o 14. No concede ninguna bonificación.",
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
        body: "Gana a todas las cartas excepto a Skull King y las sirenas. Puede usar los poderes de los piratas que capture, pero no obtiene bonificaciones de captura por ellos. Si Skull King o una sirena lo captura, su jugador obtiene 30 puntos.",
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
        body: "Todas las cartas especiales quedan anuladas y pierden; la carta NUMERADA más alta gana la baza (incluido el triunfo). Si solo se jugaron cartas especiales, la baza se descarta. En una baza con la Ballena no se conceden bonificaciones por capturar cartas especiales.",
      },
      {
        title: "Kraken contra Ballena Blanca",
        body: "Si ambos caen en la misma baza, se aplica el efecto del segundo que se haya jugado.",
      },
      {
        title: "Botín  (+20 por aliado)",
        body: "Forma una alianza entre quien lo juega y quien gana esa baza. Registra a ambos jugadores cuando ocurra; si LOS DOS aciertan exactamente su envite, la aplicación concede +20 a cada uno.",
      },
      {
        title: "Apuesta del pirata Bribón (0/10/20)",
        body: "Una apuesta paralela: ganas su valor si aciertas tu envite y lo pierdes si fallas.",
      },
    ],
    twoPlayer: [
      {
        title: "Barbagris, el fantasma 👻",
        body: "En la variante para dos jugadores del reglamento se reparte una tercera mano para el fantasma Barbagris. En cada baza juega segundo, sin respetar el palo de salida, y su Tigresa siempre cuenta como Huida. No se usan cartas de Botín.",
      },
      {
        title: "Juega, pero nunca puntúa",
        body: "Barbagris no hace envites ni obtiene puntos. Solo roba bazas (y las cartas de bonificación que contengan simplemente se pierden). Cuando gana una baza, sale en la siguiente; en caso contrario, siempre juega segundo.",
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
