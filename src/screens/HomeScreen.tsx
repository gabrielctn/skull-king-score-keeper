import React from "react";
import {
  Image,
  Linking,
  Modal,
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
import { browserLocale, useI18n } from "../i18n/context";
import { getResponsiveLayout } from "../responsive";
import { CURRENT_RELEASE } from "../releases";
import { loadSeenRelease, saveSeenRelease } from "../storage";
import WhatsNewModal from "../components/WhatsNewModal";

const SUPPORT_URL = "https://buymeacoffee.com/gabrielctn";

interface Props {
  gameHistory: Game[];
  currentGameId: string | null;
  onNewGame: () => void;
  onOpenGame: (game: Game) => void;
  onDeleteGame: (gameId: string) => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export default function HomeScreen({
  gameHistory,
  currentGameId,
  onNewGame,
  onOpenGame,
  onDeleteGame,
  onOpenStats,
  onOpenSettings,
}: Props) {
  const { t, lang } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  const [pendingDelete, setPendingDelete] = React.useState<Game | null>(null);
  const [whatsNewOpen, setWhatsNewOpen] = React.useState(false);
  const activeGame =
    gameHistory.find(
      (historyGame) =>
        historyGame.id === currentGameId && historyGame.status === "in_progress"
    ) ?? gameHistory.find((historyGame) => historyGame.status === "in_progress");
  React.useEffect(() => {
    let active = true;
    void loadSeenRelease().then((seen) => {
      if (!active || seen === CURRENT_RELEASE) return;
      // A changelog is useful to returning users, not as a first-launch modal.
      // Mark the release as seen when there is no prior game proving that the
      // person has used an earlier version.
      if (seen === null && gameHistory.length === 0) {
        void saveSeenRelease(CURRENT_RELEASE);
        return;
      }
      setWhatsNewOpen(true);
    });
    return () => {
      active = false;
    };
  }, [gameHistory.length]);
  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString(browserLocale(lang), {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const deletePendingGame = () => {
    if (!pendingDelete) return;
    onDeleteGame(pendingDelete.id);
    setPendingDelete(null);
  };
  const openSupportPage = () => {
    void Linking.openURL(SUPPORT_URL).catch(() => undefined);
  };
  const closeWhatsNew = () => {
    setWhatsNewOpen(false);
    void saveSeenRelease(CURRENT_RELEASE);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topActions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onOpenStats}
          accessibilityRole="button"
          accessibilityLabel={t.stats.open}
        >
          <Text style={styles.topActionIcon}>🏆</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, styles.iconButtonLast]}
          onPress={onOpenSettings}
          accessibilityRole="button"
          accessibilityLabel={t.settings.open}
        >
          <Text style={styles.topActionIcon}>{"⚙︎"}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.container,
            {
              maxWidth: layout.contentMaxWidth,
              padding: layout.screenPadding,
            },
            layout.isDesktop && styles.containerDesktop,
          ]}
        >
        <View style={[styles.hero, layout.isDesktop && styles.heroDesktop]}>
          <View style={styles.emblemWrap}>
            <View style={styles.emblemBg}>
              <Image
                source={illustrations.compass}
                style={styles.compass}
                resizeMode="contain"
              />
            </View>
            <Image
              source={illustrations.skullKing}
              style={styles.skullKing}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.unofficial}>{t.home.unofficial}</Text>
          <Text style={styles.title}>{t.home.title}</Text>
          <Text style={styles.subtitle}>{t.home.subtitle}</Text>
        </View>

        <View style={[styles.actions, layout.isDesktop && styles.actionsDesktop]}>
          {activeGame ? (
            <>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => onOpenGame(activeGame)}
                accessibilityRole="button"
              >
                <Text style={styles.primaryBtnText}>{t.home.resume}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={onNewGame}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryBtnText}>{t.common.newGame}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onNewGame}
              accessibilityRole="button"
            >
              <Text style={styles.primaryBtnText}>{t.common.newGame}</Text>
            </TouchableOpacity>
          )}

          {gameHistory.length > 0 ? (
            <View style={styles.history}>
              <Text style={styles.historyTitle}>{t.home.history}</Text>
              <Text style={styles.historyHint}>{t.home.historyHint}</Text>
              <View style={styles.historyList}>
                {gameHistory.map((historyGame, index) => {
                  const gameLeader = historyGame.players.length
                    ? standings(historyGame)[0]
                    : null;
                  const date = formatDate(historyGame.updatedAt);
                  return (
                    <View
                      key={historyGame.id}
                      style={[
                        styles.historyRow,
                        index < gameHistory.length - 1 && styles.historyRowBorder,
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.historyOpen}
                        onPress={() => onOpenGame(historyGame)}
                        accessibilityRole="button"
                        accessibilityLabel={t.home.openGame(date)}
                      >
                        <View style={styles.historyTopline}>
                          <Text style={styles.historyDate}>{date}</Text>
                          <Text
                            style={[
                              styles.historyStatus,
                              historyGame.status === "finished"
                                ? styles.historyStatusFinished
                                : styles.historyStatusActive,
                            ]}
                          >
                            {historyGame.status === "finished"
                              ? t.home.finished
                              : t.home.inProgress}
                          </Text>
                        </View>
                        <Text style={styles.historyMeta} numberOfLines={1}>
                          {t.home.playersRound(
                            historyGame.players.length,
                            Math.min(historyGame.currentRound, historyGame.totalRounds),
                            historyGame.totalRounds
                          )}
                        </Text>
                        {gameLeader ? (
                          <Text style={styles.historyLeader} numberOfLines={1}>
                            {t.home.leading(gameLeader.player.name, gameLeader.total)}
                          </Text>
                        ) : null}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => setPendingDelete(historyGame)}
                        accessibilityRole="button"
                        accessibilityLabel={t.home.deleteGame(date)}
                      >
                        <Text style={styles.deleteIcon}>×</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View style={styles.support}>
            <TouchableOpacity
              style={styles.supportBtn}
              onPress={openSupportPage}
              accessibilityRole="link"
              accessibilityLabel={t.home.support}
              accessibilityHint={t.home.supportHint}
            >
              <Text style={styles.supportText}>{t.home.support}</Text>
            </TouchableOpacity>
            <Text style={styles.supportHint}>{t.home.supportHint}</Text>
            <Text style={styles.disclaimer}>{t.home.disclaimer}</Text>
          </View>

          <Text style={styles.footer}>{t.home.offline}</Text>
        </View>
        </View>
      </ScrollView>
      <Modal
        visible={pendingDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingDelete(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmDialog} accessibilityRole="alert">
            <Text style={styles.confirmTitle}>{t.home.deleteTitle}</Text>
            <Text style={styles.confirmMessage}>{t.home.deleteMessage}</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setPendingDelete(null)}
                accessibilityRole="button"
              >
                <Text style={styles.cancelText}>{t.home.deleteCancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={deletePendingGame}
                accessibilityRole="button"
              >
                <Text style={styles.confirmDeleteText}>{t.home.deleteConfirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <WhatsNewModal visible={whatsNewOpen} onClose={closeWhatsNew} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: "center" },
  topActions: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
    flexDirection: "row",
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    marginEnd: spacing.sm,
  },
  iconButtonLast: { marginEnd: 0 },
  topActionIcon: { color: colors.gold, fontSize: 21, lineHeight: 24 },
  container: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    justifyContent: "center",
  },
  containerDesktop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { alignItems: "center", marginBottom: spacing.xl },
  heroDesktop: { flex: 1, marginBottom: 0 },
  emblemWrap: {
    width: 230,
    height: 210,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  emblemBg: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  compass: { width: 230, height: 230, opacity: 0.16 },
  skullKing: { width: 170, height: 190 },
  unofficial: {
    color: colors.goldDim,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.gold,
    fontSize: 38,
    lineHeight: 43,
    fontWeight: "800",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  subtitle: { color: colors.textDim, fontSize: 17, marginTop: spacing.xs },
  actions: { width: "100%", alignSelf: "center" },
  actionsDesktop: { flex: 1, maxWidth: 380 },
  primaryBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  primaryBtnText: { color: colors.bg, fontSize: 18, fontWeight: "800" },
  secondaryBtn: {
    minHeight: 48,
    borderColor: colors.goldDim,
    borderWidth: 1,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  secondaryBtnText: { color: colors.gold, fontSize: 16, fontWeight: "800" },
  history: { marginTop: spacing.xl },
  historyTitle: { color: colors.text, fontSize: 19, fontWeight: "800" },
  historyHint: { color: colors.textDim, fontSize: 13, marginTop: spacing.xs },
  historyList: {
    marginTop: spacing.md,
    backgroundColor: colors.bgElevated,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  historyRow: { flexDirection: "row", alignItems: "stretch" },
  historyRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  historyOpen: { flex: 1, padding: spacing.md },
  historyTopline: { flexDirection: "row", alignItems: "center" },
  historyDate: { flex: 1, color: colors.text, fontSize: 15, fontWeight: "700" },
  historyStatus: {
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  historyStatusActive: {
    color: colors.gold,
    backgroundColor: "rgba(232,184,75,0.12)",
  },
  historyStatusFinished: {
    color: colors.positive,
    backgroundColor: "rgba(92,214,160,0.12)",
  },
  historyMeta: { color: colors.text, marginTop: spacing.sm, fontSize: 13 },
  historyLeader: { color: colors.textDim, marginTop: 3, fontSize: 12 },
  deleteBtn: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.cardBorder,
  },
  deleteIcon: { color: colors.textDim, fontSize: 28, fontWeight: "300" },
  support: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.cardBorder,
    alignItems: "center",
  },
  supportBtn: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.goldDim,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  supportText: { color: colors.gold, fontSize: 15, fontWeight: "800" },
  supportHint: {
    color: colors.textDim,
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  disclaimer: {
    color: colors.textDim,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  confirmDialog: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  confirmTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
  confirmMessage: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  confirmActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacing.lg,
  },
  cancelBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  cancelText: { color: colors.text, fontSize: 15, fontWeight: "700" },
  confirmDeleteBtn: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
  },
  confirmDeleteText: { color: colors.text, fontSize: 15, fontWeight: "800" },
  footer: {
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.md,
    fontSize: 12,
  },
});
