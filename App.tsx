import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Game } from "./src/types";
import type { CloudOwner } from "./src/storage";
import {
  AppSettings,
  TableMembership,
  clearGame,
  clearLiveSessionFor,
  loadGame,
  loadGameHistory,
  loadLang,
  loadSettings,
  loadSupportPrompt,
  loadTableMemberships,
  loadTableName,
  saveGame,
  saveGameHistory,
  saveSettings,
  saveSupportPrompt,
  saveTableMemberships,
  saveTableName,
} from "./src/storage";
import {
  PROMPT_DELAY_MS,
  SUPPORT_URL,
  SupportPromptState,
  markSupportPromptAnswered,
  markSupportPromptShown,
  registerFinishedGame,
  shouldShowSupportPrompt,
} from "./src/support";
import {
  findMembership,
  membershipOwner,
  nextActiveAfterRemoval,
  removeMembership,
  renameMembership,
  upsertMembership,
} from "./src/tables";
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
  clearSpectatorLiveId,
  consumeScannedLiveId,
  liveSessionManager,
  loadSpectatorLiveId,
  resolveSpectatorLiveId,
} from "./src/liveSession";
import { liveConfigured } from "./src/liveConfig";
import { registerServiceWorker } from "./src/registerServiceWorker";
import { createGame } from "./src/scoring";
import { initializePwaInstallPrompt } from "./src/pwaInstall";
import { requestPersistentStorage } from "./src/storagePersistence";
import {
  cloudBackupManager,
  cloudConfigured,
  consumeScannedJoinCode,
} from "./src/cloudSync";
import {
  BackupData,
  deduplicateGames,
  downloadBackupJson,
  mergeBackupData,
  parseBackup,
  pickBackupJsonFile,
  serializeBackup,
} from "./src/backup";
import CookieConsentBanner from "./src/components/CookieConsentBanner";
import JoinTableModal from "./src/components/JoinTableModal";
import SupportModal from "./src/components/SupportModal";
import {
  consumePendingAppIntentDestination,
  subscribeToAppIntentDestinations,
} from "./src/appIntents";
import type { AppIntentDestination } from "./src/appIntents";
import { illustrations } from "./src/assets/illustrations";

type Screen = "home" | "setup" | "game" | "results" | "settings" | "stats";
type PendingCurrentGame = Game | null | undefined;

/**
 * Spectator mode, opened by scanning a live-session QR code. `none` is the
 * normal app.
 */
type SpectatorMode =
  | { kind: "live"; sessionId: string }
  | { kind: "none" };

const NO_SPECTATOR: SpectatorMode = { kind: "none" };

/**
 * Resolve spectator mode for this page load. A fresh live scan wins over a
 * session restored from an earlier scan in this tab. A different capability
 * hash opens the normal app instead of reviving an old live session.
 */
function readSpectatorMode(): SpectatorMode {
  const hash =
    typeof window === "undefined" || !window.location
      ? ""
      : window.location.hash;
  const scannedLive = consumeScannedLiveId();
  if (scannedLive) return { kind: "live", sessionId: scannedLive };
  const storedLive = resolveSpectatorLiveId(hash, loadSpectatorLiveId());
  if (storedLive) return { kind: "live", sessionId: storedLive };
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
  // A scanned table invite (`#join=`) waits in this state for explicit
  // confirmation; joining swaps the cloud identity so it is never automatic.
  const [pendingJoinCode, setPendingJoinCode] = useState<string | null>(
    consumeScannedJoinCode
  );
  const [game, setGame] = useState<Game | null>(null);
  const [gameHistory, setGameHistory] = useState<Game[]>([]);
  const [tableName, setTableName] = useState<string | null>(null);
  const [tables, setTables] = useState<TableMembership[]>([]);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState(false);
  const [pendingAppIntentDestination, setPendingAppIntentDestination] =
    useState<AppIntentDestination | null>(null);
  const [supportPromptPending, setSupportPromptPending] = useState(false);
  const [supportPromptVisible, setSupportPromptVisible] = useState(false);
  const supportPromptRef = useRef<SupportPromptState | null>(null);
  const historyRef = useRef<Game[]>([]);
  const gameRef = useRef<Game | null>(null);
  const tableNameRef = useRef<string | null>(null);
  const tablesRef = useRef<TableMembership[]>([]);
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

  // Mirror every game change to this shared table's cloud backup.
  const pushCloud = (currentGame: Game | null, history: Game[]) => {
    if (cloudConfigured()) {
      cloudBackupManager().push({
        currentGame,
        history,
        tableName: tableNameRef.current,
      });
    }
  };

  // Persist the membership list (state, ref, storage) in one place.
  const applyTables = (next: TableMembership[]) => {
    tablesRef.current = next;
    setTables(next);
    void saveTableMemberships(next);
  };

  /**
   * Update the active table's name everywhere it lives: the live state, the
   * single-table storage key (what the payload carries) and the matching
   * membership row, so the table list shows the same label.
   */
  const applyTableName = (name: string | null) => {
    const activeId = cloudConfigured()
      ? cloudBackupManager().getOwner()?.ownerId ?? null
      : null;
    if (activeId) {
      applyTables(renameMembership(tablesRef.current, activeId, name));
    }
    if (name === tableNameRef.current) return;
    tableNameRef.current = name;
    setTableName(name);
    void saveTableName(name);
  };

  /** Record the active table (and remember its credentials for switching). */
  const markActiveTable = (owner: CloudOwner | null, name: string | null) => {
    setActiveTableId(owner?.ownerId ?? null);
    if (!owner) return;
    applyTables(
      upsertMembership(tablesRef.current, {
        ownerId: owner.ownerId,
        writerKey: owner.writerKey,
        name,
      })
    );
  };

  // Apply a reconciled backup (from the cloud on launch, or a joined table)
  // to both the live UI state and the local store.
  const applyBackupData = (data: BackupData) => {
    historyRef.current = data.history;
    setGameHistory(data.history);
    queueHistorySave(data.history, true);
    gameRef.current = data.currentGame;
    setGame(data.currentGame);
    queueCurrentSave(data.currentGame);
    applyTableName(data.tableName ?? null);
  };

  // Keep a synchronous mirror of the current game so cloud reconciles that run
  // after an await merge against the latest local state.
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  // Subscribe before consuming the launch value so an intent delivered while
  // the bridge is starting cannot fall into the gap between those two steps.
  // The web implementation is deliberately inert.
  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeToAppIntentDestinations((destination) => {
      if (active) setPendingAppIntentDestination(destination);
    });
    void consumePendingAppIntentDestination().then((destination) => {
      if (active && destination) {
        setPendingAppIntentDestination(destination);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // A QR code scanned while the app is already open navigates to the same page
  // with a new capability in the hash; pick it up without a reload.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const handleHashChange = () => {
      const scannedJoin = consumeScannedJoinCode();
      if (scannedJoin) {
        setPendingJoinCode(scannedJoin);
        return;
      }
      const scannedLive = consumeScannedLiveId();
      if (scannedLive) {
        setSpectator({ kind: "live", sessionId: scannedLive });
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleExitSpectator = () => {
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
      const [
        saved,
        history,
        savedLang,
        savedSettings,
        savedTableName,
        savedTables,
      ] = await Promise.all([
        loadGame(),
        loadGameHistory(),
        loadLang(),
        loadSettings(),
        loadTableName(),
        loadTableMemberships(),
      ]);
      tableNameRef.current = savedTableName;
      setTableName(savedTableName);
      tablesRef.current = savedTables;
      setTables(savedTables);
      if (saved) setGame(saved);
      // Populate the ref synchronously (the [game] effect runs later, after the
      // background cloud reconcile below may have already read it).
      gameRef.current = saved;
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
      // Once there are games worth keeping, quietly ask the browser to make the
      // local data durable too (belt and braces alongside the cloud backup).
      if (saved || migratedHistory.length > 0) void requestPersistentStorage();
      setLang(savedLang ?? detectLang());
      setSettings(savedSettings);
      setLoading(false);

      // Reconcile with the active table's cloud row in the background: pull its
      // snapshot, merge it with what's local (newest wins per game, because
      // both sides are the same table seen from different phones), apply the
      // result, and push it back. Falls back to local-only on any failure, so
      // nothing blocks or breaks offline.
      if (cloudConfigured()) {
        void (async () => {
          const cloud = cloudBackupManager();
          const remote = await cloud.pull();
          // Registers the active table in the membership list, which also
          // migrates devices that had a cloud identity before tables existed.
          markActiveTable(cloud.getOwner(), tableNameRef.current);
          const localData: BackupData = {
            currentGame: gameRef.current,
            history: historyRef.current,
            tableName: tableNameRef.current,
          };
          if (!remote) {
            cloud.push(localData);
            return;
          }
          let merged = localData;
          try {
            merged = mergeBackupData(localData, remote);
          } catch {
            merged = localData;
          }
          applyBackupData(merged);
          cloud.push(merged);
        })();
      }
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
    gameRef.current = g;
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
    pushCloud(g, next);
  };

  const handleNewGame = () => setScreen("setup");

  const handleStart = (g: Game) => {
    persist(g, true);
    setScreen("game");
  };

  const handleOpenHistory = (selectedGame: Game) => {
    setGame(selectedGame);
    queueCurrentSave(selectedGame);
    pushCloud(selectedGame, historyRef.current);
    setScreen(selectedGame.status === "finished" ? "results" : "game");
  };

  const handleDeleteGame = (gameId: string) => {
    const next = historyRef.current.filter((item) => item.id !== gameId);
    historyRef.current = next;
    setGameHistory(next);
    queueHistorySave(next, true);
    const current = gameRef.current;
    const nextCurrent = current?.id === gameId ? null : current;
    if (current?.id === gameId) {
      gameRef.current = null;
      setGame(null);
      queueCurrentSave(null);
    }
    const liveManager = liveConfigured() ? liveSessionManager() : null;
    if (liveManager?.getState().gameId === gameId) {
      void liveManager.stop();
    } else {
      void clearLiveSessionFor(gameId);
    }
    pushCloud(nextCurrent, next);
  };

  /**
   * Load another table's snapshot as the local state. Each table keeps its own
   * history, so this replaces rather than merges: the games of the table we
   * are leaving stay in its own cloud row (flushed by the callers before the
   * identity changes) and come back when it is opened again.
   */
  const adoptTableData = (data: BackupData | null, owner: CloudOwner) => {
    const next: BackupData = data ?? {
      currentGame: null,
      history: [],
      tableName: null,
    };
    applyBackupData(next);
    markActiveTable(owner, next.tableName ?? null);
  };

  /**
   * Make sure everything typed on the table we are leaving has reached its own
   * cloud row before the identity changes. Switching with an unsent change
   * would drop it, since the local store is about to be replaced.
   */
  const flushBeforeTableChange = async () => {
    if (!(await cloudBackupManager().flushPending())) {
      throw new Error("cloud unreachable");
    }
  };

  /** Join the table carried by an invite code, keeping the existing ones. */
  const handleJoinTable = async (code: string): Promise<number | null> => {
    const cloud = cloudBackupManager();
    await flushBeforeTableChange();
    const data = await cloud.adopt(code);
    const owner = cloud.getOwner();
    if (!owner) throw new Error("cloud unreachable");
    adoptTableData(data, owner);
    return data?.history.length ?? 0;
  };

  /** Open one of the tables this device already belongs to. */
  const handleSwitchTable = async (ownerId: string): Promise<void> => {
    const cloud = cloudBackupManager();
    if (cloud.getOwner()?.ownerId === ownerId) return;
    const membership = findMembership(tablesRef.current, ownerId);
    if (!membership) throw new Error("unknown table");
    await flushBeforeTableChange();
    const owner = membershipOwner(membership);
    adoptTableData(await cloud.switchTo(owner), owner);
  };

  /** Start a separate table (another group of friends) and open it. */
  const handleCreateTable = async (): Promise<void> => {
    const cloud = cloudBackupManager();
    await flushBeforeTableChange();
    const owner = await cloud.createTable();
    adoptTableData(null, owner);
    pushCloud(null, []);
  };

  /**
   * Forget a table on this device. The table itself keeps existing for the
   * rest of the crew, so an invite can bring it back later.
   */
  const handleRemoveTable = async (ownerId: string): Promise<void> => {
    if (tablesRef.current.length <= 1) return;
    const cloud = cloudBackupManager();
    const fallback = nextActiveAfterRemoval(
      tablesRef.current,
      ownerId,
      cloud.getOwner()?.ownerId ?? null
    );
    if (fallback) {
      await flushBeforeTableChange();
      const owner = membershipOwner(fallback);
      adoptTableData(await cloud.switchTo(owner), owner);
    }
    applyTables(removeMembership(tablesRef.current, ownerId));
  };

  const handleRenameTable = (name: string | null) => {
    applyTableName(name);
    pushCloud(gameRef.current, historyRef.current);
  };

  const handleExportBackup = () => {
    downloadBackupJson(
      serializeBackup({
        currentGame: game,
        history: gameHistory,
        tableName: tableNameRef.current,
      })
    );
  };

  const handleImportBackup = async (): Promise<number | null> => {
    const json = await pickBackupJsonFile();
    if (json === null) return null;

    const imported = parseBackup(json);
    const merged = mergeBackupData(
      { currentGame: game, history: gameHistory, tableName: tableNameRef.current },
      imported
    );
    applyTableName(merged.tableName ?? null);
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
    pushCloud(merged.currentGame, merged.history);

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
    pushCloud(null, []);
  };

  /**
   * Count the game that just ended and, when it has earned the ask, invite the
   * crew to fund the App Store listing. Reviewing an old game from history
   * never triggers this — only a game finishing does.
   */
  const considerSupportPrompt = async () => {
    const counted = registerFinishedGame(await loadSupportPrompt());
    if (!shouldShowSupportPrompt(counted, Date.now())) {
      supportPromptRef.current = counted;
      await saveSupportPrompt(counted);
      return;
    }
    const shown = markSupportPromptShown(counted, Date.now());
    supportPromptRef.current = shown;
    await saveSupportPrompt(shown);
    setSupportPromptPending(true);
  };

  /**
   * The ask waits for the podium celebration and only ever lands on the
   * results screen: leaving it before the delay elapses drops the prompt.
   */
  useEffect(() => {
    if (!supportPromptPending) return;
    if (screen !== "results") {
      setSupportPromptPending(false);
      return;
    }
    const timer = setTimeout(() => {
      setSupportPromptPending(false);
      setSupportPromptVisible(true);
    }, PROMPT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [screen, supportPromptPending]);

  /**
   * Both answers close the ask for good: someone who opened the donation page
   * has done their part, and someone who declined has said so. The support
   * button on the home screen stays available either way.
   */
  const answerSupportPrompt = (donate: boolean) => {
    setSupportPromptVisible(false);
    if (donate) void Linking.openURL(SUPPORT_URL).catch(() => undefined);
    const current = supportPromptRef.current;
    if (current === null) return;
    const answered = markSupportPromptAnswered(current);
    supportPromptRef.current = answered;
    void saveSupportPrompt(answered);
  };

  const handleFinish = (g: Game) => {
    // A finished game must reach history before the user can immediately
    // clear the current slot or launch a rematch from the results screen.
    persist(g, true);
    setScreen("results");
    void considerSupportPrompt();
  };

  const handleHome = () => setScreen("home");

  const handleNewFromResults = () => {
    queueCurrentSave(null);
    setGame(null);
    pushCloud(null, historyRef.current);
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
      game.rascalBets,
      game.bonusesRequireBid
    );
    persist(rematch, true);
    setScreen("game");
  };

  // Storage restoration must finish before resolving "continue game"; otherwise
  // a launch intent could briefly see an empty store and route to setup.
  useEffect(() => {
    if (loading || pendingAppIntentDestination === null) return;

    const destination = pendingAppIntentDestination;
    setPendingAppIntentDestination(null);

    if (destination === "newGame") {
      setScreen("setup");
      return;
    }
    if (destination === "statistics") {
      setScreen("stats");
      return;
    }

    const activeGame =
      game?.status === "in_progress"
        ? game
        : gameHistory.find((item) => item.status === "in_progress") ?? null;
    if (activeGame) {
      setGame(activeGame);
      gameRef.current = activeGame;
      queueCurrentSave(activeGame);
      pushCloud(activeGame, historyRef.current);
      setScreen("game");
      return;
    }

    // With no games at all, setup is the useful recovery path. If only finished
    // history exists, Home lets the user review it or deliberately start anew.
    setScreen(game === null && gameHistory.length === 0 ? "setup" : "home");
  }, [game, gameHistory, loading, pendingAppIntentDestination]);

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
  const spectatorActive = spectator.kind === "live";

  return (
    <I18nProvider initialLang={lang}>
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <Image
          source={illustrations.brandTexture}
          style={styles.backgroundTexture}
          resizeMode="cover"
        />
        {spectator.kind === "live" && (
          <SpectatorScreen
            liveSessionId={spectator.sessionId}
            onExit={handleExitSpectator}
          />
        )}
        {!spectatorActive && screen === "home" && (
          <HomeScreen
            gameHistory={gameHistory}
            currentGameId={game?.id ?? null}
            onNewGame={handleNewGame}
            onOpenGame={handleOpenHistory}
            onDeleteGame={handleDeleteGame}
            onOpenStats={() => setScreen("stats")}
            onOpenSettings={() => setScreen("settings")}
          />
        )}
        {!spectatorActive && screen === "stats" && (
          <StatsScreen
            gameHistory={gameHistory}
            tableName={tableName}
            onBack={handleHome}
          />
        )}
        {!spectatorActive && screen === "settings" && (
          <SettingsScreen
            settings={settings}
            hasGames={gameHistory.length > 0 || game !== null}
            tableName={tableName}
            tables={tables}
            activeTableId={activeTableId}
            onUpdateSettings={handleUpdateSettings}
            onBack={handleHome}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onDeleteAllGames={handleDeleteAllGames}
            onLinkDevice={handleJoinTable}
            onRenameTable={handleRenameTable}
            onSwitchTable={handleSwitchTable}
            onCreateTable={handleCreateTable}
            onRemoveTable={handleRemoveTable}
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
        <SupportModal
          visible={supportPromptVisible}
          onDonate={() => answerSupportPrompt(true)}
          onLater={() => setSupportPromptVisible(false)}
          onNever={() => answerSupportPrompt(false)}
        />
        <JoinTableModal
          code={pendingJoinCode}
          onClose={() => setPendingJoinCode(null)}
          onJoin={handleJoinTable}
        />
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
  backgroundTexture: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    opacity: 0.075,
    pointerEvents: "none",
  },
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
