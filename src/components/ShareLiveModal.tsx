import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Game } from "../types";
import { useI18n } from "../i18n/context";
import { buildShareUrl, webShareBaseUrl } from "../shareLink";
import {
  MasterLiveState,
  buildLiveUrl,
  liveSessionManager,
} from "../liveSession";
import { liveConfigured } from "../liveConfig";
import { qrCodeDataUrl } from "../qr";
import { illustrations } from "../assets/illustrations";
import { colors, radius, spacing } from "../theme";
import { getResponsiveLayout } from "../responsive";

interface Props {
  visible: boolean;
  game: Game;
  onClose: () => void;
}

const QR_MAX_SIZE = 264;

/**
 * The game master's sharing sheet. When a live backend is configured, the
 * primary action starts a real-time session (players see the scores update on
 * their own phones); the QR-encoded offline snapshot stays available as a
 * fallback for tables with no connection. Without a backend, only the snapshot
 * is offered.
 */
export default function ShareLiveModal({ visible, game, onClose }: Props) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  const live = liveConfigured();
  const manager = useMemo(() => (live ? liveSessionManager() : null), [live]);
  const [liveState, setLiveState] = useState<MasterLiveState>(
    () => manager?.getState() ?? { status: "idle", sessionId: null, gameId: null }
  );
  const [snapshotOpen, setSnapshotOpen] = useState(!live);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle"
  );
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const qrSize = Math.max(
    180,
    Math.min(QR_MAX_SIZE, width - spacing.lg * 2 - spacing.md * 2)
  );

  useEffect(() => {
    if (!manager) return;
    setLiveState(manager.getState());
    return manager.subscribe(setLiveState);
  }, [manager]);

  useEffect(() => {
    if (!visible) {
      setCopyState("idle");
      setSnapshotOpen(!live);
    }
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, [visible, live]);

  const baseUrl = useMemo(() => webShareBaseUrl(), []);

  // Session id belongs to *this* game only (a stale singleton from another
  // game must not surface here).
  const liveSessionId =
    liveState.gameId === game.id ? liveState.sessionId : null;

  const liveQr = useMemo(() => {
    if (!visible || !liveSessionId || !baseUrl) return null;
    const url = buildLiveUrl(liveSessionId, baseUrl);
    const dataUrl = qrCodeDataUrl(url, qrSize);
    return dataUrl ? { url, dataUrl } : null;
  }, [visible, liveSessionId, baseUrl, qrSize]);

  // The offline snapshot re-encodes on every game change while visible.
  const snapshot = useMemo(() => {
    if (!visible || !snapshotOpen || !baseUrl) return null;
    try {
      const url = buildShareUrl(game, baseUrl);
      const dataUrl = qrCodeDataUrl(url, qrSize);
      return dataUrl ? { url, dataUrl } : null;
    } catch {
      return null;
    }
  }, [visible, snapshotOpen, game, baseUrl, qrSize]);

  const canCopy =
    Platform.OS === "web" &&
    typeof navigator !== "undefined" &&
    !!navigator.clipboard?.writeText;

  const showCopyFeedback = (state: "copied" | "error") => {
    setCopyState(state);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyState("idle"), 2500);
  };

  const copy = (url: string) => {
    if (!canCopy) return;
    navigator.clipboard.writeText(url).then(
      () => showCopyFeedback("copied"),
      () => showCopyFeedback("error")
    );
  };

  const status = liveState.status;
  const sessionActive = liveSessionId !== null && status !== "stopping";
  const starting = status === "starting";
  const startFailed = status === "error" && !liveSessionId;

  const statusPill = () => {
    if (status === "syncing") return { text: t.liveShare.statusSyncing, tone: "sync" as const };
    if (status === "error") return { text: t.liveShare.statusOffline, tone: "error" as const };
    return { text: t.liveShare.statusLive, tone: "live" as const };
  };

  const copyFeedbackNode =
    copyState !== "idle" ? (
      <Text
        style={[
          styles.copyFeedback,
          copyState === "error" && styles.copyFeedbackError,
        ]}
        accessibilityLiveRegion="polite"
      >
        {copyState === "copied" ? t.liveShare.copied : t.liveShare.copyError}
      </Text>
    ) : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, layout.isTablet && styles.backdropWide]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessible={false}
        />
        <View
          style={[styles.sheet, layout.isTablet && styles.sheetWide]}
          accessibilityViewIsModal
        >
          {!layout.isTablet ? <View style={styles.grabber} /> : null}

          <View style={styles.header}>
            <View style={styles.identity}>
              <Image
                source={illustrations.parrot}
                style={styles.mascot}
                resizeMode="contain"
              />
              <View style={styles.identityCopy}>
                <Text style={styles.title}>{t.liveShare.title}</Text>
                <Text style={styles.subtitle}>{t.liveShare.subtitle}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={t.liveShare.close}
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Live section (only when a backend is configured). */}
            {live ? (
              <View style={styles.liveCard}>
                {sessionActive ? (
                  <>
                    <View style={styles.liveHeaderRow}>
                      <Text style={styles.liveOnTitle}>
                        {t.liveShare.liveOnTitle}
                      </Text>
                      <View
                        style={[
                          styles.pill,
                          statusPill().tone === "live" && styles.pillLive,
                          statusPill().tone === "sync" && styles.pillSync,
                          statusPill().tone === "error" && styles.pillError,
                        ]}
                      >
                        {statusPill().tone === "live" ? (
                          <View style={styles.liveDot} />
                        ) : null}
                        <Text style={styles.pillText}>{statusPill().text}</Text>
                      </View>
                    </View>

                    {liveQr ? (
                      <View style={styles.qrCard}>
                        <Image
                          source={{ uri: liveQr.dataUrl }}
                          style={{ width: qrSize, height: qrSize }}
                          resizeMode="contain"
                          accessible
                          accessibilityRole="image"
                          accessibilityLabel={t.liveShare.qrLabel}
                        />
                      </View>
                    ) : null}

                    <Text style={styles.liveScanHint}>
                      {t.liveShare.liveScanHint}
                    </Text>
                    {status === "error" ? (
                      <Text style={styles.liveErrorText}>
                        {t.liveShare.liveError}
                      </Text>
                    ) : null}

                    {liveQr && canCopy ? (
                      <TouchableOpacity
                        style={styles.copyButton}
                        onPress={() => copy(liveQr.url)}
                        accessibilityRole="button"
                        accessibilityLabel={t.liveShare.copyLink}
                      >
                        <Text style={styles.copyButtonText}>
                          🔗 {t.liveShare.copyLink}
                        </Text>
                      </TouchableOpacity>
                    ) : null}

                    <TouchableOpacity
                      style={styles.stopButton}
                      onPress={() => manager?.stop()}
                      accessibilityRole="button"
                    >
                      <Text style={styles.stopButtonText}>
                        {t.liveShare.stop}
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.liveHint}>{t.liveShare.liveHint}</Text>
                    {startFailed ? (
                      <Text style={styles.liveErrorText}>
                        {t.liveShare.liveError}
                      </Text>
                    ) : null}
                    <TouchableOpacity
                      style={[
                        styles.startButton,
                        starting && styles.startButtonBusy,
                      ]}
                      onPress={() => manager?.start(game)}
                      disabled={starting}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: starting }}
                    >
                      {starting ? (
                        <ActivityIndicator color={colors.bg} />
                      ) : (
                        <Text style={styles.startButtonText}>
                          🛰 {t.liveShare.start}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ) : null}

            {/* Offline snapshot fallback. Primary when there is no backend. */}
            {live ? (
              <TouchableOpacity
                style={styles.snapshotToggle}
                onPress={() => setSnapshotOpen((open) => !open)}
                accessibilityRole="button"
                accessibilityState={{ expanded: snapshotOpen }}
              >
                <View style={styles.snapshotToggleCopy}>
                  <Text style={styles.snapshotTitle}>
                    {t.liveShare.snapshotTitle}
                  </Text>
                  <Text style={styles.snapshotToggleAction}>
                    {snapshotOpen
                      ? t.liveShare.snapshotToggleHide
                      : t.liveShare.snapshotToggleShow}
                  </Text>
                </View>
                <Text style={[styles.chevron, snapshotOpen && styles.chevronOpen]}>
                  ›
                </Text>
              </TouchableOpacity>
            ) : null}

            {snapshotOpen ? (
              <View style={styles.snapshotSection}>
                {snapshot ? (
                  <View style={styles.qrCard}>
                    <Image
                      source={{ uri: snapshot.dataUrl }}
                      style={{ width: qrSize, height: qrSize }}
                      resizeMode="contain"
                      accessible
                      accessibilityRole="image"
                      accessibilityLabel={t.liveShare.qrLabel}
                    />
                  </View>
                ) : (
                  <View style={styles.qrErrorBox}>
                    <Text style={styles.qrErrorText}>
                      {t.liveShare.qrError}
                    </Text>
                  </View>
                )}

                <View style={styles.hintRow}>
                  <Text style={styles.hintIcon}>📷</Text>
                  <Text style={styles.hintText}>{t.liveShare.scanHint}</Text>
                </View>
                <View style={styles.hintRow}>
                  <Text style={styles.hintIcon}>🔄</Text>
                  <Text style={styles.hintText}>{t.liveShare.updateHint}</Text>
                </View>
                <View style={styles.hintRow}>
                  <Text style={styles.hintIcon}>📶</Text>
                  <Text style={styles.hintText}>{t.liveShare.networkHint}</Text>
                </View>

                {snapshot && canCopy ? (
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copy(snapshot.url)}
                    accessibilityRole="button"
                    accessibilityLabel={t.liveShare.copyLink}
                  >
                    <Text style={styles.copyButtonText}>
                      🔗 {t.liveShare.copyLink}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            {/* One shared copy-confirmation line for whichever link was copied. */}
            <View style={styles.copyFeedbackSlot}>{copyFeedbackNode}</View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  backdropWide: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sheet: {
    width: "100%",
    maxHeight: "91%",
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: "hidden",
  },
  sheetWide: {
    maxWidth: 480,
    maxHeight: "86%",
    borderRadius: radius.lg,
  },
  grabber: {
    width: 42,
    height: 4,
    alignSelf: "center",
    borderRadius: 2,
    backgroundColor: colors.cardBorder,
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  identity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  mascot: { width: 48, height: 48, marginRight: spacing.sm },
  identityCopy: { flex: 1, minWidth: 0 },
  title: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  closeButton: {
    width: 38,
    height: 38,
    marginLeft: spacing.sm,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 29,
    fontWeight: "300",
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    alignItems: "stretch",
  },
  liveCard: {
    borderWidth: 1,
    borderColor: colors.goldDim,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    padding: spacing.md,
    marginTop: spacing.xs,
    alignItems: "center",
  },
  liveHeaderRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  liveOnTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillLive: { backgroundColor: "rgba(92, 214, 160, 0.16)" },
  pillSync: { backgroundColor: "rgba(230, 195, 92, 0.16)" },
  pillError: { backgroundColor: "rgba(255, 107, 107, 0.16)" },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.positive,
    marginRight: 6,
  },
  pillText: { color: colors.text, fontSize: 11, fontWeight: "800" },
  liveHint: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  liveScanHint: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  liveErrorText: {
    color: colors.negative,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  startButton: {
    minHeight: 50,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  startButtonBusy: { opacity: 0.7 },
  startButtonText: { color: colors.bg, fontSize: 16, fontWeight: "800" },
  stopButton: {
    minHeight: 44,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  stopButtonText: { color: colors.negative, fontSize: 14, fontWeight: "800" },
  snapshotToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.cardBorder,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  snapshotToggleCopy: { flex: 1, minWidth: 0 },
  snapshotTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  snapshotToggleAction: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  chevron: {
    color: colors.textDim,
    fontSize: 24,
    marginLeft: spacing.sm,
    transform: [{ rotate: "90deg" }],
  },
  chevronOpen: { transform: [{ rotate: "-90deg" }] },
  snapshotSection: { alignItems: "center", paddingTop: spacing.xs },
  qrCard: {
    backgroundColor: "#ffffff",
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  qrErrorBox: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    padding: spacing.lg,
    marginVertical: spacing.md,
  },
  qrErrorText: {
    color: colors.negative,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  hintRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  hintIcon: { fontSize: 15, marginRight: spacing.sm, lineHeight: 19 },
  hintText: {
    flex: 1,
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 19,
  },
  copyButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  copyButtonText: { color: colors.gold, fontSize: 14, fontWeight: "800" },
  copyFeedbackSlot: { alignItems: "center" },
  copyFeedback: {
    color: colors.positive,
    fontSize: 12,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  copyFeedbackError: { color: colors.negative },
});
