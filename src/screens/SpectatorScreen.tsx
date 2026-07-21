import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Game } from "../types";
import { isRoundComplete, standings } from "../scoring";
import { dealerIndex, playOrder } from "../turnOrder";
import { browserLocale, useI18n } from "../i18n/context";
import { loadSpectatorIdentity, saveSpectatorIdentity } from "../storage";
import {
  SpectatorLiveStatus,
  watchLiveGame,
} from "../liveSession";
import ScoreBreakdownModal from "../components/ScoreBreakdownModal";
import ScoreChart from "../components/ScoreChart";
import { illustrations } from "../assets/illustrations";
import { colors, radius, spacing } from "../theme";
import { getResponsiveLayout } from "../responsive";

interface Props {
  /** Static snapshot (QR-encoded) to show. Ignored in live mode. */
  game: Game | null;
  /** When set, follow this live session in real time instead of a snapshot. */
  liveSessionId?: string | null;
  onExit: () => void;
}

function formatSnapshotTime(timestamp: number, locale: string): string | null {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return null;
  try {
    return new Date(timestamp).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

/**
 * Read-only view of the game master's scores, opened by scanning a share QR
 * code. In live mode it follows a Supabase session and updates in real time;
 * in snapshot mode it shows a single QR-encoded state. Either way nothing here
 * writes to the game — players just check their own bids, tricks and bonuses.
 */
export default function SpectatorScreen({ game, liveSessionId, onExit }: Props) {
  const { t, lang } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  const [scorePlayerId, setScorePlayerId] = useState<string | null>(null);
  const [rememberedId, setRememberedId] = useState<string | null>(null);
  // Whether storage has been checked for a saved "this is me" pick. Gates the
  // identity picker so it never flashes before a remembered pick can load.
  const [identityResolved, setIdentityResolved] = useState(false);

  const isLive = !!liveSessionId;
  const [liveGame, setLiveGame] = useState<Game | null>(null);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState<number>(0);
  const [liveStatus, setLiveStatus] = useState<SpectatorLiveStatus>(
    "connecting"
  );
  const watcherRef = useRef<{ refresh: () => void; stop: () => void } | null>(
    null
  );

  // Follow the live session: subscribe on mount, refresh when the tab regains
  // focus (realtime channels can miss events while backgrounded).
  useEffect(() => {
    if (!liveSessionId) return;
    setLiveGame(null);
    setLiveStatus("connecting");
    const watcher = watchLiveGame(liveSessionId, {
      onGame: (nextGame, updatedAt) => {
        setLiveGame(nextGame);
        setLiveUpdatedAt(updatedAt);
      },
      onStatus: setLiveStatus,
    });
    watcherRef.current = watcher;

    let detachVisibility: (() => void) | null = null;
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const onVisible = () => {
        if (document.visibilityState === "visible") watcher.refresh();
      };
      document.addEventListener("visibilitychange", onVisible);
      detachVisibility = () =>
        document.removeEventListener("visibilitychange", onVisible);
    }
    return () => {
      watcher.stop();
      watcherRef.current = null;
      if (detachVisibility) detachVisibility();
    };
  }, [liveSessionId]);

  const activeGame = isLive ? liveGame : game;

  const board = useMemo(
    () => (activeGame ? standings(activeGame) : []),
    [activeGame]
  );
  const scoredRounds = useMemo(() => {
    if (!activeGame) return 0;
    let count = 0;
    for (let round = 1; round <= activeGame.totalRounds; round++) {
      if (isRoundComplete(activeGame, round)) count++;
    }
    return count;
  }, [activeGame]);

  // Restore this device owner's "this is me" pick when the followed game
  // matches a saved identity. The pick is made once (via the identity picker
  // below) and is never reassigned by tapping other players, so re-scans and
  // reloads always keep the same "you".
  useEffect(() => {
    let cancelled = false;
    if (!activeGame) return;
    setIdentityResolved(false);
    setRememberedId(null);
    void loadSpectatorIdentity().then((identity) => {
      if (cancelled) return;
      if (identity && identity.gameId === activeGame.id) {
        const player = activeGame.players.find(
          (candidate) =>
            candidate.id === identity.playerId &&
            candidate.name === identity.playerName
        );
        if (player) setRememberedId(player.id);
      }
      setIdentityResolved(true);
    });
    return () => {
      cancelled = true;
    };
  }, [activeGame?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // A broken/expired link (nothing ever loaded) shows the friendly error view.
  const failedToLoad =
    (!isLive && !game) ||
    (isLive &&
      liveGame === null &&
      (liveStatus === "notFound" || liveStatus === "error"));

  if (failedToLoad) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.invalidWrap, { maxWidth: layout.formMaxWidth }]}>
          <Image
            source={illustrations.parrot}
            style={styles.invalidMascot}
            resizeMode="contain"
          />
          <Text style={styles.invalidTitle}>{t.spectator.invalidTitle}</Text>
          <Text style={styles.invalidBody}>{t.spectator.invalidBody}</Text>
          <TouchableOpacity
            style={styles.exitButton}
            onPress={onExit}
            accessibilityRole="button"
          >
            <Text style={styles.exitButtonText}>{t.spectator.openApp}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Live, still connecting, nothing received yet.
  if (isLive && !activeGame) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.invalidWrap, { maxWidth: layout.formMaxWidth }]}>
          <Image
            source={illustrations.compass}
            style={styles.invalidMascot}
            resizeMode="contain"
          />
          <Text style={styles.connectingText}>{t.spectator.connecting}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeGame) return null;

  const locale = browserLocale(lang);
  const snapshotTime = formatSnapshotTime(
    isLive ? liveUpdatedAt : activeGame.updatedAt,
    locale
  );
  // Tapping a standings row only opens that player's breakdown — it never
  // reassigns "you". The identity pick is deliberately kept separate.
  const openBreakdown = (playerId: string) => {
    setScorePlayerId(playerId);
  };

  // The one-time "which player are you?" choice. Once set it is only ever
  // restored from storage, never changed by row taps, so it stays put.
  const chooseIdentity = (playerId: string, playerName: string) => {
    setRememberedId(playerId);
    void saveSpectatorIdentity({
      gameId: activeGame.id,
      playerId,
      playerName,
    });
  };

  // Indicative dealer & first-trick order for the round in play, mirroring the
  // game master's screen so spectators can follow who deals and who leads.
  const currentRound = Math.min(
    Math.max(1, activeGame.currentRound),
    activeGame.totalRounds
  );
  const showTurnOrder =
    activeGame.status !== "finished" && activeGame.players.length > 0;
  const dealer = showTurnOrder
    ? activeGame.players[dealerIndex(activeGame, currentRound)]
    : null;
  const turnSlots = showTurnOrder ? playOrder(activeGame, currentRound) : [];

  const liveBanner =
    isLive && liveStatus === "ended" ? (
      <View style={[styles.statusBanner, styles.statusBannerEnded]}>
        <Text style={styles.statusBannerTitle}>{t.spectator.endedTitle}</Text>
        <Text style={styles.statusBannerBody}>{t.spectator.endedBody}</Text>
      </View>
    ) : isLive && liveStatus === "reconnecting" ? (
      <View style={[styles.statusBanner, styles.statusBannerReconnecting]}>
        <Text style={styles.statusBannerBody}>{t.spectator.reconnecting}</Text>
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            maxWidth: layout.contentMaxWidth,
            paddingHorizontal: layout.screenPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={illustrations.treasureChest}
            style={styles.mascot}
            resizeMode="contain"
          />
          <View style={styles.headerCopy}>
            <View style={styles.eyebrowRow}>
              <Text style={styles.eyebrow}>
                {isLive ? t.spectator.liveEyebrow : t.spectator.eyebrow}
              </Text>
              {isLive && liveStatus === "live" ? (
                <View style={styles.liveBadge}>
                  <View style={styles.liveBadgeDot} />
                  <Text style={styles.liveBadgeText}>
                    {t.spectator.liveBadge}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.title}>{t.spectator.title}</Text>
            <Text style={styles.progress}>
              {activeGame.status === "finished"
                ? t.spectator.finished
                : scoredRounds === 0
                  ? t.spectator.noRounds
                  : t.spectator.roundProgress(
                      scoredRounds,
                      activeGame.totalRounds
                    )}
            </Text>
          </View>
        </View>

        {liveBanner}

        {snapshotTime ? (
          <Text style={styles.snapshotLine}>
            {isLive
              ? t.spectator.liveUpdatedAt(snapshotTime)
              : t.spectator.snapshotAt(snapshotTime)}
          </Text>
        ) : null}

        {!isLive ? (
          <View style={styles.refreshBox}>
            <Text style={styles.refreshIcon}>🔄</Text>
            <Text style={styles.refreshText}>{t.spectator.refreshHint}</Text>
          </View>
        ) : null}

        {identityResolved && !rememberedId ? (
          <View style={styles.identityCard}>
            <Text style={styles.identityTitle}>
              {t.spectator.identityTitle}
            </Text>
            <Text style={styles.identityHint}>{t.spectator.identityHint}</Text>
            <View style={styles.identityChips}>
              {activeGame.players.map((player) => (
                <TouchableOpacity
                  key={player.id}
                  style={styles.identityChip}
                  activeOpacity={0.7}
                  onPress={() => chooseIdentity(player.id, player.name)}
                  accessibilityRole="button"
                  accessibilityLabel={player.name}
                >
                  <Text style={styles.identityChipText} numberOfLines={1}>
                    {player.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {dealer ? (
          <>
            <Text style={styles.sectionTitle}>{t.spectator.turnTitle}</Text>
            <View style={styles.turnCard}>
              <Text style={styles.turnRound}>{t.game.round(currentRound)}</Text>
              <Text style={styles.turnDealer}>
                🃏 <Text style={styles.turnDealerName}>{dealer.name}</Text>{" "}
                {t.game.dealsVerb}
              </Text>
              <View style={styles.turnOrderRow}>
                {turnSlots.map((slot, i) => {
                  const isMine =
                    slot.kind === "player" && slot.player.id === rememberedId;
                  return (
                    <React.Fragment key={i}>
                      {i > 0 ? <Text style={styles.turnArrow}>›</Text> : null}
                      <View
                        style={[
                          styles.turnChip,
                          slot.kind === "ghost" && styles.turnChipGhost,
                          i === 0 && styles.turnChipLead,
                          isMine && styles.turnChipMine,
                        ]}
                      >
                        <Text
                          style={[
                            styles.turnChipText,
                            i === 0 && styles.turnChipLeadText,
                          ]}
                          numberOfLines={1}
                        >
                          {slot.kind === "ghost"
                            ? `👻 ${t.game.ghostName}`
                            : slot.player.name}
                        </Text>
                      </View>
                    </React.Fragment>
                  );
                })}
              </View>
              <Text style={styles.turnHint}>{t.game.playOrderHint}</Text>
            </View>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>{t.spectator.standingsTitle}</Text>
        <Text style={styles.tapHint}>{t.spectator.tapHint}</Text>
        <View style={styles.boardCard}>
          {board.map((row, index) => {
            const isRemembered = row.player.id === rememberedId;
            return (
              <TouchableOpacity
                key={row.player.id}
                style={[
                  styles.boardRow,
                  index > 0 && styles.boardRowDivider,
                  isRemembered && styles.boardRowMine,
                ]}
                activeOpacity={0.7}
                onPress={() => openBreakdown(row.player.id)}
                accessibilityRole="button"
                accessibilityLabel={t.scoreBreakdown.openRankedFor(
                  row.rank,
                  row.player.name,
                  row.total
                )}
              >
                <Text style={styles.boardRank}>{row.rank}</Text>
                <View style={styles.boardNameBlock}>
                  <Text style={styles.boardName} numberOfLines={1}>
                    {row.player.name}
                  </Text>
                  {isRemembered ? (
                    <View style={styles.youChip}>
                      <Text style={styles.youChipText}>{t.spectator.you}</Text>
                    </View>
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.boardTotal,
                    row.total < 0 && styles.negativeText,
                  ]}
                >
                  {row.total}
                </Text>
                <Text style={styles.boardInfo}>ⓘ</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {scoredRounds >= 2 ? (
          <View style={styles.chartCard}>
            <ScoreChart game={activeGame} />
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.exitButton}
          onPress={onExit}
          accessibilityRole="button"
        >
          <Text style={styles.exitButtonText}>{t.spectator.openApp}</Text>
        </TouchableOpacity>
      </ScrollView>

      <ScoreBreakdownModal
        visible={scorePlayerId !== null}
        game={activeGame}
        playerId={scorePlayerId}
        onClose={() => setScorePlayerId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    width: "100%",
    alignSelf: "center",
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  mascot: { width: 56, height: 56, marginRight: spacing.sm },
  headerCopy: { flex: 1, minWidth: 0 },
  eyebrowRow: { flexDirection: "row", alignItems: "center" },
  eyebrow: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(92, 214, 160, 0.16)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  liveBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.positive,
    marginRight: 5,
  },
  liveBadgeText: {
    color: colors.positive,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "800",
  },
  progress: { color: colors.textDim, fontSize: 13, marginTop: 2 },
  statusBanner: {
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  statusBannerEnded: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.bgElevated,
  },
  statusBannerReconnecting: {
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: colors.bgElevated,
  },
  statusBannerTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 2,
  },
  statusBannerBody: { color: colors.textDim, fontSize: 12, lineHeight: 17 },
  snapshotLine: {
    color: colors.textDim,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  refreshBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: colors.goldDim,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  refreshIcon: { fontSize: 15, marginRight: spacing.sm, lineHeight: 19 },
  refreshText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  connectingText: {
    color: colors.textDim,
    fontSize: 15,
    textAlign: "center",
    marginTop: spacing.md,
  },
  sectionTitle: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tapHint: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  identityCard: {
    backgroundColor: colors.card,
    borderColor: colors.gold,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  identityTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  identityHint: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  identityChips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  identityChip: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    margin: 4,
    minHeight: 40,
    justifyContent: "center",
    maxWidth: "100%",
  },
  identityChipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  turnCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    alignItems: "center",
  },
  turnRound: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  turnDealer: { color: colors.textDim, fontSize: 13, textAlign: "center" },
  turnDealerName: { color: colors.text, fontWeight: "800" },
  turnOrderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  turnArrow: { color: colors.textDim, fontSize: 16, marginHorizontal: 4 },
  turnChip: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    margin: 2,
    maxWidth: 130,
  },
  turnChipLead: { backgroundColor: colors.gold, borderColor: colors.gold },
  turnChipGhost: { borderColor: colors.accent, borderStyle: "dashed" },
  turnChipMine: { borderColor: colors.accent, borderWidth: 2 },
  turnChipText: { color: colors.text, fontSize: 12, fontWeight: "700" },
  turnChipLeadText: { color: colors.bg },
  turnHint: {
    color: colors.textDim,
    fontSize: 10,
    marginTop: 4,
    fontStyle: "italic",
    textAlign: "center",
  },
  boardCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  boardRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  boardRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.cardBorder,
  },
  boardRowMine: { backgroundColor: colors.bgElevated },
  boardRank: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "900",
    width: 26,
  },
  boardNameBlock: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  boardName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
  },
  youChip: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  youChipText: {
    color: colors.bg,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  boardTotal: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: "900",
    marginLeft: spacing.sm,
  },
  boardInfo: { color: colors.textDim, fontSize: 14, marginLeft: spacing.sm },
  negativeText: { color: colors.negative },
  chartCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  invalidWrap: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  invalidMascot: { width: 96, height: 96, marginBottom: spacing.md },
  invalidTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  invalidBody: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  exitButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignSelf: "center",
  },
  exitButtonText: { color: colors.gold, fontSize: 15, fontWeight: "800" },
});
