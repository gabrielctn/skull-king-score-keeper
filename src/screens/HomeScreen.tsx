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
import {
  browserLocale,
  languageLabel,
  SUPPORTED_LANGS,
  useI18n,
} from "../i18n/context";
import { Lang } from "../i18n/types";
import { getResponsiveLayout } from "../responsive";
import { CURRENT_RELEASE, CURRENT_RELEASE_DATE } from "../releases";
import { loadSeenRelease, saveSeenRelease } from "../storage";

const SUPPORT_URL = "https://buymeacoffee.com/gabrielctn";

interface Props {
  gameHistory: Game[];
  onNewGame: () => void;
  onOpenGame: (game: Game) => void;
  onDeleteGame: (gameId: string) => void;
}

export default function HomeScreen({
  gameHistory,
  onNewGame,
  onOpenGame,
  onDeleteGame,
}: Props) {
  const { t, lang, setLang } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  const [pendingDelete, setPendingDelete] = React.useState<Game | null>(null);
  const [whatsNewOpen, setWhatsNewOpen] = React.useState(false);
  const [releaseSeen, setReleaseSeen] = React.useState(true);
  React.useEffect(() => {
    let active = true;
    void loadSeenRelease().then((seen) => {
      if (!active || seen === CURRENT_RELEASE) return;
      setReleaseSeen(false);
      setWhatsNewOpen(true);
    });
    return () => {
      active = false;
    };
  }, []);
  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString(browserLocale(lang), {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const releaseDate = new Date(`${CURRENT_RELEASE_DATE}T12:00:00Z`).toLocaleDateString(
    browserLocale(lang),
    { day: "numeric", month: "long", year: "numeric" }
  );

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
    setReleaseSeen(true);
    void saveSeenRelease(CURRENT_RELEASE);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.langSwitch}>
        {SUPPORTED_LANGS.map((l: Lang) => (
          <TouchableOpacity
            key={l}
            onPress={() => setLang(l)}
            style={[styles.langBtn, lang === l && styles.langBtnOn]}
            accessibilityRole="button"
          >
            <Text style={[styles.langText, lang === l && styles.langTextOn]}>
              {languageLabel(l)}
            </Text>
          </TouchableOpacity>
        ))}
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
          <TouchableOpacity style={styles.primaryBtn} onPress={onNewGame}>
            <Text style={styles.primaryBtnText}>{t.common.newGame}</Text>
          </TouchableOpacity>

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

          <TouchableOpacity
            style={styles.whatsNewButton}
            onPress={() => setWhatsNewOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t.whatsNew.open}
          >
            <Text style={styles.whatsNewIcon}>✦</Text>
            <Text style={styles.whatsNewText}>{t.whatsNew.open}</Text>
            {!releaseSeen ? (
              <Text style={styles.whatsNewBadge}>{t.whatsNew.badge}</Text>
            ) : null}
          </TouchableOpacity>

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
      <Modal
        visible={whatsNewOpen}
        transparent
        animationType="fade"
        onRequestClose={closeWhatsNew}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.releaseDialog} accessibilityViewIsModal>
            <Text style={styles.releaseEyebrow}>
              {t.whatsNew.version(CURRENT_RELEASE, releaseDate)}
            </Text>
            <Text style={styles.releaseTitle}>{t.whatsNew.title}</Text>
            <ScrollView
              style={styles.releaseScroll}
              contentContainerStyle={styles.releaseScrollContent}
            >
              <View style={styles.updateNotice}>
                <Text style={styles.updateNoticeIcon}>↻</Text>
                <View style={styles.updateNoticeCopy}>
                  <Text style={styles.updateNoticeTitle}>
                    {t.whatsNew.automaticUpdatesTitle}
                  </Text>
                  <Text style={styles.updateNoticeBody}>
                    {t.whatsNew.automaticUpdatesBody}
                  </Text>
                </View>
              </View>
              {t.whatsNew.items.map((item, index) => (
                <View key={index} style={styles.releaseItem}>
                  <Text style={styles.releaseBullet}>✦</Text>
                  <Text style={styles.releaseItemText}>{item}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.releaseCloseButton}
              onPress={closeWhatsNew}
              accessibilityRole="button"
            >
              <Text style={styles.releaseCloseText}>{t.whatsNew.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: "center" },
  langSwitch: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  langBtn: {
    paddingHorizontal: 7,
    paddingVertical: 6,
    backgroundColor: colors.bgElevated,
    minWidth: 36,
    alignItems: "center",
  },
  langBtnOn: { backgroundColor: colors.gold },
  langText: { color: colors.textDim, fontSize: 13, fontWeight: "800" },
  langTextOn: { color: colors.bg },
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
  whatsNewButton: {
    minHeight: 44,
    marginTop: spacing.md,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  whatsNewIcon: { color: colors.gold, fontSize: 15, marginRight: spacing.sm },
  whatsNewText: { color: colors.text, fontSize: 14, fontWeight: "700" },
  whatsNewBadge: {
    color: colors.bg,
    backgroundColor: colors.gold,
    fontSize: 10,
    fontWeight: "800",
    overflow: "hidden",
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: spacing.sm,
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
  releaseDialog: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "86%",
    backgroundColor: colors.bg,
    borderColor: colors.goldDim,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  releaseEyebrow: {
    color: colors.goldDim,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  releaseTitle: {
    color: colors.gold,
    fontSize: 28,
    fontWeight: "800",
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  releaseScroll: { flexGrow: 0 },
  releaseScrollContent: { paddingBottom: spacing.sm },
  updateNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  updateNoticeIcon: {
    color: colors.positive,
    fontSize: 24,
    fontWeight: "700",
    marginRight: spacing.md,
  },
  updateNoticeCopy: { flex: 1 },
  updateNoticeTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  updateNoticeBody: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  releaseItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  releaseBullet: { color: colors.gold, fontSize: 12, marginRight: spacing.sm, marginTop: 3 },
  releaseItemText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 21 },
  releaseCloseButton: {
    backgroundColor: colors.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  releaseCloseText: { color: colors.bg, fontSize: 16, fontWeight: "800" },
  footer: {
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.md,
    fontSize: 12,
  },
});
