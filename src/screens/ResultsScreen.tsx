import React, { useEffect, useState } from "react";
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
import { standings } from "../scoring";
import { colors, radius, spacing } from "../theme";
import { illustrations } from "../assets/illustrations";
import { useI18n } from "../i18n/context";
import { getResponsiveLayout } from "../responsive";
import ScoreBreakdownModal from "../components/ScoreBreakdownModal";
import {
  getPwaInstallMode,
  PwaInstallMode,
  promptPwaInstall,
  subscribeToInstallPrompt,
} from "../pwaInstall";

interface Props {
  game: Game;
  onRematch: () => void;
  onNewGame: () => void;
  onHome: () => void;
  onReview: () => void;
}

const medal = (rank: number) =>
  rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";

export default function ResultsScreen({
  game,
  onRematch,
  onNewGame,
  onHome,
  onReview,
}: Props) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  const rows = standings(game);
  const winner = rows[0];
  const [scorePlayerId, setScorePlayerId] = useState<string | null>(null);
  const [installMode, setInstallMode] = useState<PwaInstallMode>(
    getPwaInstallMode()
  );
  const [installDismissed, setInstallDismissed] = useState(false);
  const [installFailed, setInstallFailed] = useState(false);

  useEffect(
    () =>
      subscribeToInstallPrompt(() =>
        setInstallMode(getPwaInstallMode())
      ),
    []
  );

  const installApp = async () => {
    setInstallFailed(false);
    try {
      await promptPwaInstall();
    } catch {
      setInstallFailed(true);
    } finally {
      setInstallMode(getPwaInstallMode());
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            maxWidth: layout.formMaxWidth,
            padding: layout.screenPadding,
          },
        ]}
      >
        <View style={styles.chest}>
          <Image
            source={illustrations.treasureChest}
            style={styles.treasureChest}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>{t.results.gameOver}</Text>
        {winner ? (
          <Text style={styles.winner}>
            {t.results.winner(winner.player.name, winner.total)}
          </Text>
        ) : null}

        <View style={styles.card}>
          {rows.map((row) => (
            <TouchableOpacity
              key={row.player.id}
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => setScorePlayerId(row.player.id)}
              accessibilityRole="button"
              accessibilityLabel={t.scoreBreakdown.openRankedFor(
                row.rank,
                row.player.name,
                row.total
              )}
            >
              <Text style={styles.rank}>
                {medal(row.rank) || row.rank}
              </Text>
              <Text style={styles.name} numberOfLines={1}>
                {row.player.name}
              </Text>
              <Text
                style={[
                  styles.total,
                  row.total >= 0 ? styles.pos : styles.neg,
                ]}
              >
                {row.total}
              </Text>
              <Text style={styles.scoreInfo}>ⓘ</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onReview}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryText}>{t.results.review}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onRematch}
          accessibilityRole="button"
        >
          <Text style={styles.primaryText}>{t.results.rematch}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onNewGame}
          accessibilityRole="button"
        >
          <Text style={styles.primaryText}>{t.common.newGame}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={onHome}
          accessibilityRole="button"
        >
          <Text style={styles.linkText}>{t.results.backHome}</Text>
        </TouchableOpacity>
        {(installMode !== "none" || installFailed) && !installDismissed ? (
          <View style={styles.installPrompt}>
            <Text style={styles.installTitle}>{t.results.installTitle}</Text>
            <Text
              style={[
                styles.installHint,
                installFailed && styles.installError,
              ]}
              accessibilityRole={installFailed ? "alert" : undefined}
            >
              {installFailed
                ? t.results.installError
                : installMode === "manual_ios"
                  ? t.results.installIosHint
                  : t.results.installHint}
            </Text>
            <View style={styles.installActions}>
              <TouchableOpacity
                style={styles.installDismiss}
                onPress={() => setInstallDismissed(true)}
                accessibilityRole="button"
              >
                <Text style={styles.installDismissText}>
                  {t.results.installDismiss}
                </Text>
              </TouchableOpacity>
              {installMode === "prompt" && !installFailed ? (
                <TouchableOpacity
                  style={styles.installButton}
                  onPress={() => void installApp()}
                  accessibilityRole="button"
                >
                  <Text style={styles.installButtonText}>
                    {t.results.install}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : null}
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
    padding: spacing.lg,
    alignItems: "center",
  },
  chest: { marginTop: spacing.md, marginBottom: spacing.xs },
  treasureChest: { width: 190, height: 165 },
  title: { color: colors.gold, fontSize: 34, fontWeight: "800" },
  winner: {
    color: colors.text,
    fontSize: 18,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  card: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  rank: { width: 40, fontSize: 20, color: colors.text, textAlign: "center" },
  name: { flex: 1, color: colors.text, fontSize: 18, marginLeft: spacing.sm },
  total: { fontSize: 20, fontWeight: "800" },
  scoreInfo: { color: colors.gold, fontSize: 13, marginLeft: spacing.sm },
  pos: { color: colors.positive },
  neg: { color: colors.negative },
  primaryBtn: {
    alignSelf: "stretch",
    backgroundColor: colors.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  primaryText: { color: colors.bg, fontSize: 18, fontWeight: "800" },
  secondaryBtn: {
    alignSelf: "stretch",
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  secondaryText: { color: colors.gold, fontSize: 16, fontWeight: "600" },
  linkBtn: { paddingVertical: spacing.md },
  linkText: { color: colors.textDim, fontSize: 15 },
  installPrompt: {
    alignSelf: "stretch",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.cardBorder,
    marginTop: spacing.sm,
    paddingTop: spacing.lg,
  },
  installTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  installHint: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  installError: { color: colors.negative },
  installActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: spacing.md,
  },
  installDismiss: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  installDismissText: { color: colors.textDim, fontSize: 14, fontWeight: "700" },
  installButton: {
    minHeight: 44,
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginStart: spacing.sm,
  },
  installButtonText: { color: colors.bg, fontSize: 14, fontWeight: "800" },
});
