import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Game } from "./src/types";
import {
  AppSettings,
  clearGame,
  loadGame,
  loadGameHistory,
  loadLang,
  loadSettings,
  saveGame,
  saveGameHistory,
  saveSettings,
} from "./src/storage";
import { colors } from "./src/theme";
import { I18nProvider, detectLang, useI18n } from "./src/i18n/context";
import { Lang } from "./src/i18n/types";
import HomeScreen from "./src/screens/HomeScreen";
import SetupScreen from "./src/screens/SetupScreen";
import GameScreen from "./src/screens/GameScreen";
import ResultsScreen from "./src/screens/ResultsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import StatsScreen from "./src/screens/StatsScreen";
import SpectatorScreen from "./src/screens/SpectatorScreen";
import {
  clearSpectatorSessionCode,
  consumeScannedShareCode,
  decodeShareCode,
  loadSpectatorSessionCode,
} from "./src/shareLink";
import {
  clearSpectatorLiveId,
  consumeScannedLiveId,
  liveSessionManager,
  loadSpectatorLiveId,
} from "./src/liveSession";
import { liveConfigured } from "./src/liveConfig";
import { registerServiceWorker } from "./src/registerServiceWorker";
import { createGame } from "./src/scoring";
import { initializePwaInstallPrompt } from "./src/pwaInstall";
import { requestPersistentStorage } from "./src/storagePersistence";
import {
  deduplicateGames,
  downloadBackupJson,
  mergeBackupData,
  parseBackup,
  pickBackupJsonFile,
  serializeBackup,
} from "./src/backup";
import CookieConsentBanner from "./src/components/CookieConsentBanner";

type Screen = "home" | "setup" | "game" | "results" | "settings" | "stats";
type PendingCurrentGame = Game | null | undefined;

/**
 * Spectator mode, opened by scanning a share QR code: either a live session
 * followed in real time, or a static QR-encoded snapshot. `none` is the normal
 * app.
 */
type SpectatorMode =
  | { kind: "live"; sessionId: string }
  | { kind: "snapshot"; game: Game | null; invalid: boolean }
  | { kind: "none" };

const NO_SPECTATOR: SpectatorMode = { kind: "none" };

/**
 * Resolve spectator mode for this page load. A fresh scan in the URL hash
 * (either kind) wins over a session restored from an earlier scan in this tab,
 * and live takes precedence over a snapshot. Called before first paint so the
 * hash is stripped before analytics can observe it.
 */
function readSpectatorMode(): SpectatorMode {
  const scannedLive = consumeScannedLiveId();
  if (scannedLive) return { kind: "live", sessionId: scannedLive };
  const scannedSnapshot = consumeScannedShareCode();
  if (scannedSnapshot) {
    return {
      kind: "snapshot",
      game: scannedSnapshot.game,
      invalid: scannedSnapshot.invalid,
    };
  }
  const storedLive = loadSpectatorLiveId();
  if (storedLive) return { kind: "live", sessionId: storedLive };
  const storedCode = loadSpectatorSessionCode();
  if (storedCode) {
    try {
      return { kind: "snapshot", game: decodeShareCode(storedCode), invalid: false };
    } catch {
      clearSpectatorSessionCode();
    }
  }
  return NO_SPECTATOR;
}

function StorageWarning({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  const { t } = useI18n();
  if (!visible) return null;
  return (
    <View style={styles.storageWarning} accessibilityRole="alert">
      <Text style={styles.storageWarningText}>{t.common.storageError}</Text>
      <TouchableOpacity
        style={styles.storageWarningDismiss}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel={t.common.dismiss}
      >
        <Text style={styles.storageWarningDismissText}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  // Spectator mode (opened from a scanned share QR code) is resolved in the
  // lazy initializer, before first paint and before analytics can load, so
  // the share payload is stripped from the URL as early as possible.
  const [spectator, setSpectator] = useState<SpectatorMode>(readSpectatorMode);
  const [game, setGame] = useState<Game | null>(null);
  const [gameHistory, setGameHistory] = useState<Game[]>([]);
  const [lang, setLang] = useState<Lang | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState(false);
  const historyRef = useRef<Game[]>([]);
  const pendingCurrentSave = useRef<PendingCurrentGame>(undefined);
  const currentSaveWorker = useRef<Promise<void> | null>(null);
  const pendingHistorySave = useRef<Game[] | null>(null);
  const historySaveWorker = useRef<Promise<void> | null>(null);
  const historySaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistenceFailures = useRef(0);

  const markStorageFailure = () => {
    persistenceFailures.current += 1;
    setStorageError(true);
  };

  const startCurrentSave = (): Promise<void> => {
    if (currentSaveWorker.current) return currentSaveWorker.current;
    const worker = (async () => {
      while (pendingCurrentSave.current !== undefined) {
        const pending = pendingCurrentSave.current;
        pendingCurrentSave.current = undefined;
        const saved = pending ? await saveGame(pending) : await clearGame();
        if (!saved) markStorageFailure();
      }
    })();
    currentSaveWorker.current = worker;
    void worker.finally(() => {
      currentSaveWorker.current = null;
      if (pendingCurrentSave.current !== undefined) void startCurrentSave();
    });
    return worker;
  };

  const queueCurrentSave = (nextGame: Game | null) => {
    pendingCurrentSave.current = nextGame;
    void startCurrentSave();
  };

  const flushCurrentSave = async () => {
    if (pendingCurrentSave.current !== undefined) void startCurrentSave();
    while (currentSaveWorker.current) await currentSaveWorker.current;
  };

  const startHistorySave = (): Promise<void> => {
    if (historySaveWorker.current) return historySaveWorker.current;
    const worker = (async () => {
      while (pendingHistorySave.current) {
        const pending = pendingHistorySave.current;
        pendingHistorySave.current = null;
        if (!(await saveGameHistory(pending))) markStorageFailure();
      }
    })();
    historySaveWorker.current = worker;
    void worker.finally(() => {
      historySaveWorker.current = null;
      if (pendingHistorySave.current && historySaveTimer.current === null) {
        void startHistorySave();
      }
    });
    return worker;
  };

  const queueHistorySave = (history: Game[], immediate = false) => {
    pendingHistorySave.current = history;
    if (historySaveTimer.current) clearTimeout(historySaveTimer.current);
    historySaveTimer.current = null;
    if (immediate) {
      void startHistorySave();
      return;
    }
    historySaveTimer.current = setTimeout(() => {
      historySaveTimer.current = null;
      void startHistorySave();
    }, 300);
  };

  const flushHistorySave = async () => {
    if (historySaveTimer.current) clearTimeout(historySaveTimer.current);
    historySaveTimer.current = null;
    if (pendingHistorySave.current) void startHistorySave();
    while (historySaveWorker.current) await historySaveWorker.current;
  };

  // A QR code scanned while the app is already open navigates to the same
  // page with a new share payload in the hash; pick it up without a reload.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const handleHashChange = () => {
      const scannedLive = consumeScannedLiveId();
      if (scannedLive) {
        setSpectator({ kind: "live", sessionId: scannedLive });
        return;
      }
      const scanned = consumeScannedShareCode();
      if (scanned) {
        setSpectator({
          kind: "snapshot",
          game: scanned.game,
          invalid: scanned.invalid,
        });
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleExitSpectator = () => {
    clearSpectatorSessionCode();
    clearSpectatorLiveId();
    setSpectator(NO_SPECTATOR);
  };

  // Restore the saved game and language on launch, and register the PWA
  // service worker (web only). Loading the language here (before first paint)
  // avoids a flash of the wrong language.
  useEffect(() => {
    initializePwaInstallPrompt();
    registerServiceWorker();
    (async () => {
      const [saved, history, savedLang, savedSettings] = await Promise.all([
        loadGame(),
        loadGameHistory(),
        loadLang(),
        loadSettings(),
      ]);
      if (saved) setGame(saved);
      const migratedHistory = saved
        ? [saved, ...history.filter((item) => item.id !== saved.id)].sort(
            (a, b) => b.updatedAt - a.updatedAt
          )
        : history;
      historyRef.current = migratedHistory;
      setGameHistory(migratedHistory);
      if (saved && history.every((item) => item.id !== saved.id)) {
        queueHistorySave(migratedHistory, true);
      }
      // Once there are games worth keeping, ask the browser to make the local
      // data durable so it survives cache eviction. Gated on having data so a
      // brand-new visitor is never prompted (some browsers show a permission
      // dialog); Settings also exposes an explicit button.
      if (saved || migratedHistory.length > 0) void requestPersistentStorage();
      setLang(savedLang ?? detectLang());
      setSettings(savedSettings);
      setLoading(false);
    })();
  }, []);

  // Resume a previously started live session for the loaded game (after an app
  // restart) so the QR stays valid and saved changes keep syncing.
  useEffect(() => {
    if (!liveConfigured() || spectator.kind !== "none" || !game) return;
    void liveSessionManager().restoreFor(game);
  }, [game?.id, spectator.kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateSettings = (next: AppSettings) => {
    setSettings(next);
    void saveSettings(next);
  };

  const persist = (g: Game, historyImmediate = false) => {
    setGame(g);
    queueCurrentSave(g);
    const next = [
      g,
      ...historyRef.current.filter((item) => item.id !== g.id),
    ].sort((a, b) => b.updatedAt - a.updatedAt);
    historyRef.current = next;
    setGameHistory(next);
    queueHistorySave(next, historyImmediate);
    // Mirror the change to any live session sharing this game.
    if (liveConfigured()) liveSessionManager().notifyGameChanged(g);
  };

  const handleNewGame = () => setScreen("setup");

  const handleStart = (g: Game) => {
    persist(g, true);
    setScreen("game");
  };

  const handleOpenHistory = (selectedGame: Game) => {
    setGame(selectedGame);
    queueCurrentSave(selectedGame);
    setScreen(selectedGame.status === "finished" ? "results" : "game");
  };

  const handleDeleteHistory = (gameId: string) => {
    const next = historyRef.current.filter((item) => item.id !== gameId);
    historyRef.current = next;
    setGameHistory(next);
    queueHistorySave(next, true);
    if (game?.id === gameId) {
      setGame(null);
      queueCurrentSave(null);
    }
  };

  const handleExportBackup = async () => {
    const json = serializeBackup({ currentGame: game, history: gameHistory });
    downloadBackupJson(json);
  };

  const handleImportBackup = async (): Promise<number | null> => {
    const json = await pickBackupJsonFile();
    if (json === null) return null;

    const imported = parseBackup(json);
    const merged = mergeBackupData(
      { currentGame: game, history: gameHistory },
      imported
    );
    const failureCount = persistenceFailures.current;
    queueCurrentSave(merged.currentGame);
    queueHistorySave(merged.history, true);
    await Promise.all([flushCurrentSave(), flushHistorySave()]);
    if (persistenceFailures.current !== failureCount) {
      throw new Error("Imported backup could not be persisted");
    }
    historyRef.current = merged.history;
    setGame(merged.currentGame);
    setGameHistory(merged.history);

    return deduplicateGames([
      ...imported.history,
      ...(imported.currentGame ? [imported.currentGame] : []),
    ]).length;
  };

  const handleDeleteAllGames = async () => {
    const failureCount = persistenceFailures.current;
    queueCurrentSave(null);
    queueHistorySave([], true);
    await Promise.all([flushCurrentSave(), flushHistorySave()]);
    if (persistenceFailures.current !== failureCount) {
      throw new Error("Stored games could not be cleared");
    }
    historyRef.current = [];
    setGame(null);
    setGameHistory([]);
  };

  const handleFinish = (g: Game) => {
    // A finished game must reach history before the user can immediately
    // clear the current slot or launch a rematch from the results screen.
    persist(g, true);
    setScreen("results");
  };

  const handleHome = () => setScreen("home");

  const handleNewFromResults = () => {
    queueCurrentSave(null);
    setGame(null);
    setScreen("setup");
  };

  const handleRematch = () => {
    if (!game) return;
    const rematch = createGame(
      game.players.map((player) => ({ ...player })),
      game.cardsDealt.length,
      game.advancedCards,
      game.twoPlayerGhost,
      game.newExpansion,
      game.cardsDealt,
      game.scoringMode,
      game.rascalBets
    );
    persist(rematch, true);
    setScreen("game");
  };

  if (loading || lang === null || settings === null) {
    return (
      <View style={styles.loader}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  // A scanned session takes over the whole UI. The user's own games stay
  // untouched underneath and come back through the spectator exit button.
  const spectatorActive = spectator.kind !== "none";

  return (
    <I18nProvider initialLang={lang}>
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        {spectatorActive && (
          <SpectatorScreen
            game={spectator.kind === "snapshot" ? spectator.game : null}
            liveSessionId={
              spectator.kind === "live" ? spectator.sessionId : null
            }
            onExit={handleExitSpectator}
          />
        )}
        {!spectatorActive && screen === "home" && (
          <HomeScreen
            gameHistory={gameHistory}
            currentGameId={game?.id ?? null}
            onNewGame={handleNewGame}
            onOpenGame={handleOpenHistory}
            onDeleteGame={handleDeleteHistory}
            onOpenStats={() => setScreen("stats")}
            onOpenSettings={() => setScreen("settings")}
          />
        )}
        {!spectatorActive && screen === "stats" && (
          <StatsScreen gameHistory={gameHistory} onBack={handleHome} />
        )}
        {!spectatorActive && screen === "settings" && (
          <SettingsScreen
            settings={settings}
            hasGames={gameHistory.length > 0 || game !== null}
            onUpdateSettings={handleUpdateSettings}
            onBack={handleHome}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onDeleteAllGames={handleDeleteAllGames}
          />
        )}
        {!spectatorActive && screen === "setup" && (
          <SetupScreen
            gameHistory={gameHistory}
            onStart={handleStart}
            onBack={handleHome}
          />
        )}
        {!spectatorActive && screen === "game" && game && (
          <GameScreen
            game={game}
            keepAwake={settings.keepAwake}
            onUpdateGame={persist}
            onFinish={handleFinish}
            onExit={handleHome}
          />
        )}
        {!spectatorActive && screen === "results" && game && (
          <ResultsScreen
            game={game}
            onRematch={handleRematch}
            onNewGame={handleNewFromResults}
            onHome={handleHome}
            onReview={() => setScreen("game")}
          />
        )}
        <CookieConsentBanner />
        <StorageWarning
          visible={storageError}
          onDismiss={() => setStorageError(false)}
        />
      </View>
    </I18nProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loader: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  storageWarning: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.danger,
    borderRadius: 10,
    paddingStart: 14,
    minHeight: 52,
  },
  storageWarningText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    paddingVertical: 10,
  },
  storageWarningDismiss: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  storageWarningDismissText: { color: colors.text, fontSize: 24 },
});
