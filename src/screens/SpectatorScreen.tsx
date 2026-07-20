import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
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
import { browserLocale, useI18n } from "../i18n/context";
import { loadSpectatorIdentity, saveSpectatorIdentity } from "../storage";
import ScoreBreakdownModal from "../components/ScoreBreakdownModal";
import ScoreChart from "../components/ScoreChart";
import { illustrations } from "../assets/illustrations";
import { colors, radius, spacing } from "../theme";
import { getResponsiveLayout } from "../responsive";

interface Props {
  /** Decoded snapshot, or null when the scanned share code was unreadable. */
  game: Game | null;
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
 * Read-only view of the game master's snapshot, opened by scanning the live
 * QR code. Players check their own bids, tricks and bonuses here instead of
 * asking the game master; nothing on this screen writes to the game.
 */
export default function SpectatorScreen({ game, onExit }: Props) {
  const { t, lang } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  const [scorePlayerId, setScorePlayerId] = useState<string | null>(null);
  const [rememberedId, setRememberedId] = useState<string | null>(null);

  const board = useMemo(() => (game ? standings(game) : []), [game]);
  const scoredRounds = useMemo(() => {
    if (!game) return 0;
    let count = 0;
    for (let round = 1; round <= game.totalRounds; round++) {
      if (isRoundComplete(game, round)) count++;
    }
    return count;
  }, [game]);

  // A device follows one table at a time: when this snapshot is the same game
  // as last time, reopen that player's score details straight away.
  useEffect(() => {
    let cancelled = false;
    if (!game) return;
    void loadSpectatorIdentity().then((identity) => {
      if (cancelled || !identity || identity.gameId !== game.id) return;
      const player = game.players.find(
        (candidate) =>
          candidate.id === identity.playerId &&
          candidate.name === identity.playerName
      );
      if (player) {
        setRememberedId(player.id);
        setScorePlayerId(player.id);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [game?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!game) {
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

  const snapshotTime = formatSnapshotTime(game.updatedAt, browserLocale(lang));
  const openPlayer = (playerId: string, playerName: string) => {
    setScorePlayerId(playerId);
    setRememberedId(playerId);
    void saveSpectatorIdentity({ gameId: game.id, playerId, playerName });
  };

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
            <Text style={styles.eyebrow}>{t.spectator.eyebrow}</Text>
            <Text style={styles.title}>{t.spectator.title}</Text>
            <Text style={styles.progress}>
              {game.status === "finished"
                ? t.spectator.finished
                : scoredRounds === 0
                  ? t.spectator.noRounds
                  : t.spectator.roundProgress(scoredRounds, game.totalRounds)}
            </Text>
          </View>
        </View>

        {snapshotTime ? (
          <Text style={styles.snapshotLine}>
            {t.spectator.snapshotAt(snapshotTime)}
          </Text>
        ) : null}

        <View style={styles.refreshBox}>
          <Text style={styles.refreshIcon}>🔄</Text>
          <Text style={styles.refreshText}>{t.spectator.refreshHint}</Text>
        </View>

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
                onPress={() => openPlayer(row.player.id, row.player.name)}
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
            <ScoreChart game={game} />
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
        game={game}
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
  eyebrow: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "800",
  },
  progress: { color: colors.textDim, fontSize: 13, marginTop: 2 },
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
