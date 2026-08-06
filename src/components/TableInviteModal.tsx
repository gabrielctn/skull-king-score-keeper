import React from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  InviteError,
  InviteFailure,
  TableInvite,
  buildJoinUrl,
  cloudBackupManager,
} from "../cloudSync";
import { formatCountdown, formatInviteCode, inviteSecondsLeft } from "../tableInvites";
import { webShareBaseUrl } from "../appUrl";
import { qrCodeDataUrl } from "../qr";
import { illustrations } from "../assets/illustrations";
import { useI18n } from "../i18n/context";
import { getResponsiveLayout } from "../responsive";
import { colors, radius, spacing } from "../theme";
import { copyTextToClipboard } from "../clipboard";
import CopyButton from "./CopyButton";

interface Props {
  visible: boolean;
  /** Name of the table being shared, for the sheet's subtitle. */
  tableName: string | null;
  onClose: () => void;
}

const QR_MAX_SIZE = 200;

/**
 * The host's side of an invite: a short code the guest types into the app they
 * already have.
 *
 * The QR code below it is deliberately the *second* option, for the friend who
 * has not installed anything yet — scanning cannot open an installed PWA or the
 * iOS app, so it can only ever land someone on the web version.
 */
export default function TableInviteModal({ visible, tableName, onClose }: Props) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  const [invite, setInvite] = React.useState<TableInvite | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [failure, setFailure] = React.useState<InviteFailure | null>(null);
  const [now, setNow] = React.useState(() => Date.now());
  const [syncCode, setSyncCode] = React.useState<string | null>(null);
  const [linkCopied, setLinkCopied] = React.useState(false);

  const qrSize = Math.max(
    150,
    Math.min(QR_MAX_SIZE, width - spacing.lg * 2 - spacing.md * 2)
  );

  const mint = React.useCallback(async () => {
    setBusy(true);
    setFailure(null);
    try {
      setInvite(await cloudBackupManager().createInvite());
    } catch (error) {
      setInvite(null);
      setFailure(error instanceof InviteError ? error.reason : "offline");
    } finally {
      setBusy(false);
    }
  }, []);

  // One code per opening of the sheet: reopening it after the countdown ran
  // out should hand out a fresh one rather than show a dead code.
  React.useEffect(() => {
    if (!visible) {
      setInvite(null);
      setFailure(null);
      setLinkCopied(false);
      // The sync code belongs to whichever table was open. Dropping it on close
      // means a sheet reopened after a table switch shows no QR until the new
      // table's code arrives, rather than briefly offering the old table's.
      setSyncCode(null);
      return;
    }
    void mint();
  }, [visible, mint]);

  // The link fallback needs this table's own code, fetched while the sheet is
  // open.
  React.useEffect(() => {
    if (!visible) return;
    let active = true;
    void cloudBackupManager()
      .syncCode()
      .then((code) => {
        if (active) setSyncCode(code);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [visible]);

  // Tick the countdown while the sheet is open, and only then.
  React.useEffect(() => {
    if (!visible || !invite) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [visible, invite]);

  const secondsLeft = invite ? inviteSecondsLeft(invite.expiresAt, now) : 0;
  const expired = invite !== null && secondsLeft === 0;

  const joinUrl = syncCode ? buildJoinUrl(syncCode, webShareBaseUrl()) : null;
  const joinQr = React.useMemo(
    () => (joinUrl ? qrCodeDataUrl(joinUrl, qrSize) : null),
    [joinUrl, qrSize]
  );

  const copyLink = () => {
    if (!joinUrl) return;
    void copyTextToClipboard(joinUrl)
      .then((copied) => setLinkCopied(copied))
      .catch(() => undefined);
  };

  const failureText = (reason: InviteFailure): string =>
    reason === "unsupported"
      ? t.tableInvite.unsupported
      : reason === "throttled"
        ? t.tableInvite.throttled
        : t.tableInvite.offline;

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
                source={illustrations.treasureChest}
                style={styles.mascot}
                resizeMode="contain"
              />
              <View style={styles.identityCopy}>
                <Text style={styles.title}>{t.tableInvite.title}</Text>
                <Text style={styles.subtitle} numberOfLines={2}>
                  {tableName
                    ? t.tableInvite.subtitleNamed(tableName)
                    : t.tableInvite.subtitle}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={t.common.dismiss}
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.codeCard}>
              {/* The instructions only make sense while there is a code. */}
              {failure && !busy ? null : (
                <Text style={styles.steps}>{t.tableInvite.steps}</Text>
              )}

              {busy ? (
                <ActivityIndicator
                  color={colors.gold}
                  style={styles.spinner}
                  accessibilityLabel={t.tableInvite.minting}
                />
              ) : null}

              {invite && !busy ? (
                <>
                  <Text
                    style={[styles.code, expired && styles.codeExpired]}
                    accessibilityLabel={t.tableInvite.codeLabel(
                      invite.code.split("").join(" ")
                    )}
                    selectable
                  >
                    {formatInviteCode(invite.code)}
                  </Text>
                  <Text
                    style={[styles.countdown, expired && styles.countdownExpired]}
                    accessibilityLiveRegion="polite"
                  >
                    {expired
                      ? t.tableInvite.expired
                      : t.tableInvite.expiresIn(formatCountdown(secondsLeft))}
                  </Text>
                </>
              ) : null}

              {failure && !busy ? (
                <Text style={styles.error} accessibilityRole="alert">
                  {failureText(failure)}
                </Text>
              ) : null}

              {!busy ? (
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={() => void mint()}
                  accessibilityRole="button"
                >
                  <Text style={styles.refreshText}>
                    ↻ {invite ? t.tableInvite.newCode : t.tableInvite.retry}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <Text style={styles.warning}>{t.tableInvite.warning}</Text>

            <View style={styles.divider} />

            <Text style={styles.fallbackTitle}>{t.tableInvite.noAppTitle}</Text>
            <Text style={styles.fallbackHint}>{t.tableInvite.noAppHint}</Text>
            {joinQr ? (
              <View style={styles.qrCard}>
                <Image
                  source={{ uri: joinQr }}
                  style={{ width: qrSize, height: qrSize }}
                  resizeMode="contain"
                  accessible
                  accessibilityRole="image"
                  accessibilityLabel={t.tableInvite.qrLabel}
                />
              </View>
            ) : null}
            <CopyButton
              style={[styles.linkButton, !joinUrl && styles.linkButtonDisabled]}
              onPress={copyLink}
              disabled={!joinUrl}
              accessibilityLabel={
                linkCopied ? t.tableInvite.linkCopied : t.tableInvite.copyLink
              }
            >
              <Text style={styles.linkButtonText} accessibilityLiveRegion="polite">
                🔗{" "}
                {linkCopied ? t.tableInvite.linkCopied : t.tableInvite.copyLink}
              </Text>
            </CopyButton>
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
  sheetWide: { maxWidth: 480, maxHeight: "86%", borderRadius: radius.lg },
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
  identity: { flex: 1, flexDirection: "row", alignItems: "center", minWidth: 0 },
  mascot: { width: 48, height: 48, marginEnd: spacing.sm },
  identityCopy: { flex: 1, minWidth: 0 },
  title: { color: colors.text, fontSize: 20, lineHeight: 25, fontWeight: "800" },
  subtitle: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  closeButton: {
    width: 38,
    height: 38,
    marginStart: spacing.sm,
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
  codeCard: {
    borderWidth: 1,
    borderColor: colors.goldDim,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    padding: spacing.md,
    marginTop: spacing.xs,
    alignItems: "center",
  },
  steps: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  spinner: { marginTop: spacing.md },
  code: {
    color: colors.gold,
    // Big enough to read across a table, and monospaced so O/0 and the rest of
    // the alphabet keep the same width in every group.
    fontSize: 42,
    lineHeight: 52,
    fontWeight: "800",
    letterSpacing: 4,
    fontVariant: ["tabular-nums"],
    marginTop: spacing.sm,
    textAlign: "center",
  },
  codeExpired: { color: colors.textDim },
  countdown: { color: colors.textDim, fontSize: 12, marginTop: spacing.xs },
  countdownExpired: { color: colors.negative },
  error: {
    color: colors.negative,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  refreshButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  refreshText: { color: colors.accent, fontSize: 13, fontWeight: "800" },
  warning: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: spacing.md,
  },
  fallbackTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  fallbackHint: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.xs,
  },
  qrCard: {
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  linkButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  linkButtonDisabled: { opacity: 0.5 },
  linkButtonText: { color: colors.text, fontSize: 14, fontWeight: "700" },
});
