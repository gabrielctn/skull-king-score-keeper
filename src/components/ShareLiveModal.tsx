import React, { useEffect, useMemo, useRef, useState } from "react";
import {
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
 * The game master's live-follow sheet: a QR code encoding the current game
 * snapshot. It re-renders on every saved change, so whatever is on screen is
 * always the latest recorded state; players re-scan whenever they want a
 * fresh view of their score.
 */
export default function ShareLiveModal({ visible, game, onClose }: Props) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle"
  );
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const qrSize = Math.max(
    180,
    Math.min(QR_MAX_SIZE, width - spacing.lg * 2 - spacing.md * 2)
  );

  // The QR is rebuilt whenever the game changes while the sheet is open —
  // every bid, trick or bonus the game master records is reflected live.
  const share = useMemo(() => {
    if (!visible) return null;
    try {
      const base = webShareBaseUrl();
      if (!base) return null;
      const url = buildShareUrl(game, base);
      const dataUrl = qrCodeDataUrl(url, qrSize);
      return dataUrl ? { url, dataUrl } : null;
    } catch {
      return null;
    }
  }, [visible, game, qrSize]);

  useEffect(() => {
    if (!visible) setCopyState("idle");
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, [visible]);

  const showCopyFeedback = (state: "copied" | "error") => {
    setCopyState(state);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyState("idle"), 2500);
  };

  const canCopy =
    Platform.OS === "web" &&
    typeof navigator !== "undefined" &&
    !!navigator.clipboard?.writeText;

  const handleCopy = () => {
    if (!share || !canCopy) return;
    navigator.clipboard.writeText(share.url).then(
      () => showCopyFeedback("copied"),
      () => showCopyFeedback("error")
    );
  };

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
            {share ? (
              <View style={styles.qrCard}>
                <Image
                  source={{ uri: share.dataUrl }}
                  style={{ width: qrSize, height: qrSize }}
                  resizeMode="contain"
                  accessible
                  accessibilityRole="image"
                  accessibilityLabel={t.liveShare.qrLabel}
                />
              </View>
            ) : (
              <View style={styles.qrErrorBox}>
                <Text style={styles.qrErrorText}>{t.liveShare.qrError}</Text>
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

            {share && canCopy ? (
              <View style={styles.copyBlock}>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopy}
                  accessibilityRole="button"
                  accessibilityLabel={t.liveShare.copyLink}
                >
                  <Text style={styles.copyButtonText}>
                    🔗 {t.liveShare.copyLink}
                  </Text>
                </TouchableOpacity>
                {copyState !== "idle" ? (
                  <Text
                    style={[
                      styles.copyFeedback,
                      copyState === "error" && styles.copyFeedbackError,
                    ]}
                    accessibilityLiveRegion="polite"
                  >
                    {copyState === "copied"
                      ? t.liveShare.copied
                      : t.liveShare.copyError}
                  </Text>
                ) : null}
              </View>
            ) : null}
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
    alignItems: "center",
  },
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
  copyBlock: { width: "100%", alignItems: "center", marginTop: spacing.xs },
  copyButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  copyButtonText: { color: colors.gold, fontSize: 14, fontWeight: "800" },
  copyFeedback: {
    color: colors.positive,
    fontSize: 12,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  copyFeedbackError: { color: colors.negative },
});
