import React from "react";
import {
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { colors, radius, spacing } from "../theme";
import {
  browserLocale,
  languageNativeName,
  SUPPORTED_LANGS,
  useI18n,
} from "../i18n/context";
import { Lang } from "../i18n/types";
import { getResponsiveLayout } from "../responsive";
import {
  AppSettings,
  loadSeenRelease,
  saveSeenRelease,
} from "../storage";
import { CURRENT_RELEASE, CURRENT_RELEASE_DATE } from "../releases";
import { isWakeLockSupported } from "../wakeLock";
import {
  cloudBackupManager,
  cloudConfigured,
  CloudStatus,
} from "../cloudSync";
import ToggleSwitch from "../components/ToggleSwitch";
import WhatsNewModal from "../components/WhatsNewModal";
import InstallAppSection from "../components/InstallAppSection";

const FEEDBACK_EMAIL = "gabrielcretin@gmail.com";

interface Props {
  settings: AppSettings;
  /** Enables the destructive "delete all games" action. */
  hasGames: boolean;
  onUpdateSettings: (settings: AppSettings) => void;
  onBack: () => void;
  onExportBackup: () => Promise<void>;
  onImportBackup: () => Promise<number | null>;
  onDeleteAllGames: () => Promise<void>;
  /** Adopt another device's sync code, merge its games, return the new count. */
  onLinkDevice: (code: string) => Promise<number | null>;
}

export default function SettingsScreen({
  settings,
  hasGames,
  onUpdateSettings,
  onBack,
  onExportBackup,
  onImportBackup,
  onDeleteAllGames,
  onLinkDevice,
}: Props) {
  const { t, lang, setLang } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  const [dataBusy, setDataBusy] = React.useState(false);
  const [dataMessage, setDataMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = React.useState(false);
  const [whatsNewOpen, setWhatsNewOpen] = React.useState(false);
  const [releaseSeen, setReleaseSeen] = React.useState(true);
  const [cloudStatus, setCloudStatus] = React.useState<CloudStatus>(() =>
    cloudBackupManager().getStatus()
  );
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [syncCode, setSyncCode] = React.useState<string | null>(null);
  const [codeCopied, setCodeCopied] = React.useState(false);
  const [pasteCode, setPasteCode] = React.useState("");
  const [linkBusy, setLinkBusy] = React.useState(false);
  const [linkMessage, setLinkMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  React.useEffect(() => {
    let active = true;
    void loadSeenRelease().then((seen) => {
      if (active) setReleaseSeen(seen === CURRENT_RELEASE);
    });
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    const cloud = cloudBackupManager();
    setCloudStatus(cloud.getStatus());
    return cloud.subscribe(setCloudStatus);
  }, []);

  // Fetch this device's sync code lazily, only once the link panel is opened.
  React.useEffect(() => {
    if (!linkOpen || syncCode || !cloudConfigured()) return;
    let active = true;
    void cloudBackupManager()
      .syncCode()
      .then((code) => {
        if (active) setSyncCode(code);
      });
    return () => {
      active = false;
    };
  }, [linkOpen, syncCode]);

  const copySyncCode = async () => {
    if (!syncCode) return;
    try {
      await navigator.clipboard.writeText(syncCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      // Clipboard unavailable: the code is selectable in the field instead.
    }
  };

  const linkDevice = async () => {
    const code = pasteCode.trim();
    if (!code || linkBusy) return;
    setLinkBusy(true);
    setLinkMessage(null);
    try {
      await onLinkDevice(code);
      setPasteCode("");
      // Adopting a code changes this device's identity, so its own code changes.
      setSyncCode(null);
      setLinkMessage({ type: "success", text: t.settings.cloud.linkSuccess });
    } catch {
      setLinkMessage({ type: "error", text: t.settings.cloud.linkError });
    } finally {
      setLinkBusy(false);
    }
  };

  const cloudStatusText: Record<CloudStatus, string> = {
    unavailable: t.settings.cloud.statusUnavailable,
    idle: t.settings.cloud.statusIdle,
    syncing: t.settings.cloud.statusSyncing,
    synced: t.settings.cloud.statusSynced,
    offline: t.settings.cloud.statusOffline,
  };

  const releaseDate = new Date(
    `${CURRENT_RELEASE_DATE}T12:00:00Z`
  ).toLocaleDateString(browserLocale(lang), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const exportBackup = async () => {
    setDataBusy(true);
    setDataMessage(null);
    try {
      await onExportBackup();
    } catch {
      setDataMessage({ type: "error", text: t.settings.backupError });
    } finally {
      setDataBusy(false);
    }
  };

  const importBackup = async () => {
    setDataBusy(true);
    setDataMessage(null);
    try {
      const imported = await onImportBackup();
      if (imported !== null) {
        setDataMessage({
          type: "success",
          text: t.settings.importSuccess(imported),
        });
      }
    } catch {
      setDataMessage({ type: "error", text: t.settings.backupError });
    } finally {
      setDataBusy(false);
    }
  };

  const deleteAllGames = async () => {
    setDeleteAllOpen(false);
    setDataBusy(true);
    setDataMessage(null);
    try {
      await onDeleteAllGames();
      setDataMessage({ type: "success", text: t.settings.deleteAllSuccess });
    } catch {
      setDataMessage({ type: "error", text: t.common.storageError });
    } finally {
      setDataBusy(false);
    }
  };

  const openFeedback = () => {
    const subject = encodeURIComponent("Skull King feedback");
    void Linking.openURL(
      `mailto:${FEEDBACK_EMAIL}?subject=${subject}`
    ).catch(() => undefined);
  };

  const openWhatsNew = () => {
    setWhatsNewOpen(true);
    setReleaseSeen(true);
    void saveSeenRelease(CURRENT_RELEASE);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View
        style={[
          styles.header,
          {
            maxWidth: layout.formMaxWidth,
            paddingHorizontal: layout.screenPadding,
          },
        ]}
      >
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          accessibilityRole="button"
        >
          <Text style={styles.back}>‹ {t.common.back}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t.settings.title}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            maxWidth: layout.formMaxWidth,
            padding: layout.screenPadding,
          },
        ]}
      >
        <Text style={styles.section}>{t.settings.languageTitle}</Text>
        <View style={styles.languageList}>
          {SUPPORTED_LANGS.map((option: Lang, index) => (
            <TouchableOpacity
              key={option}
              onPress={() => setLang(option)}
              style={[
                styles.languageRow,
                index < SUPPORTED_LANGS.length - 1 && styles.languageRowBorder,
              ]}
              accessibilityRole="radio"
              accessibilityLabel={languageNativeName(option)}
              accessibilityState={{ checked: lang === option }}
            >
              <Text
                style={[
                  styles.languageName,
                  lang === option && styles.languageNameOn,
                ]}
              >
                {languageNativeName(option)}
              </Text>
              {lang === option ? (
                <Text style={styles.languageCheck}>✓</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        <InstallAppSection />

        {isWakeLockSupported() ? (
          <>
            <Text style={[styles.section, styles.sectionSpacing]}>
              {t.settings.gameTitle}
            </Text>
            <View style={styles.settingRow}>
              <View style={styles.settingCopy}>
                <Text style={styles.settingTitle}>
                  {t.settings.keepAwakeTitle}
                </Text>
                <Text style={styles.settingHint}>
                  {t.settings.keepAwakeHint}
                </Text>
              </View>
              <ToggleSwitch
                value={settings.keepAwake}
                onValueChange={(keepAwake) =>
                  onUpdateSettings({ ...settings, keepAwake })
                }
                accessibilityLabel={t.settings.keepAwakeTitle}
              />
            </View>
          </>
        ) : null}

        <Text style={[styles.section, styles.sectionSpacing]}>
          {t.settings.dataTitle}
        </Text>
        <Text style={styles.dataHint}>{t.settings.dataHint}</Text>
        {cloudConfigured() ? (
          <>
            <View style={styles.cloudCard}>
              <Text style={styles.cloudIcon}>
                {cloudStatus === "synced"
                  ? "☁️"
                  : cloudStatus === "offline"
                    ? "⚠️"
                    : "🔄"}
              </Text>
              <View style={styles.cloudCopy}>
                <Text style={styles.cloudTitle}>{t.settings.cloud.title}</Text>
                <Text style={styles.cloudBody}>
                  {cloudStatusText[cloudStatus]}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.linkToggle}
              onPress={() => setLinkOpen((open) => !open)}
              accessibilityRole="button"
              accessibilityState={{ expanded: linkOpen }}
            >
              <Text style={styles.linkToggleText}>
                {t.settings.cloud.linkTitle}
              </Text>
              <Text style={styles.linkChevron}>{linkOpen ? "⌃" : "⌄"}</Text>
            </TouchableOpacity>

            {linkOpen ? (
              <View style={styles.linkPanel}>
                <Text style={styles.linkHint}>{t.settings.cloud.linkHint}</Text>

                <Text style={styles.codeLabel}>{t.settings.cloud.codeLabel}</Text>
                <View style={styles.codeRow}>
                  <TextInput
                    style={styles.codeValue}
                    value={syncCode ?? "…"}
                    editable={false}
                    selectTextOnFocus
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.codeCopy}
                    onPress={() => void copySyncCode()}
                    disabled={!syncCode}
                    accessibilityRole="button"
                    accessibilityLabel={t.settings.cloud.copy}
                  >
                    <Text style={styles.codeCopyText}>
                      {codeCopied
                        ? t.settings.cloud.copied
                        : t.settings.cloud.copy}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.codeLabel, styles.pasteLabel]}>
                  {t.settings.cloud.pasteLabel}
                </Text>
                <TextInput
                  style={styles.pasteInput}
                  value={pasteCode}
                  onChangeText={setPasteCode}
                  placeholder="SKC1.…"
                  placeholderTextColor={colors.textDim}
                  autoCapitalize="none"
                  autoCorrect={false}
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.linkButton,
                    (linkBusy || pasteCode.trim().length === 0) &&
                      styles.linkButtonDisabled,
                  ]}
                  onPress={() => void linkDevice()}
                  disabled={linkBusy || pasteCode.trim().length === 0}
                  accessibilityRole="button"
                >
                  <Text style={styles.linkButtonText}>
                    {linkBusy
                      ? t.settings.cloud.linking
                      : t.settings.cloud.linkButton}
                  </Text>
                </TouchableOpacity>
                {linkMessage ? (
                  <Text
                    style={[
                      styles.linkMessage,
                      linkMessage.type === "success"
                        ? styles.linkMessageSuccess
                        : styles.linkMessageError,
                    ]}
                    accessibilityRole="alert"
                  >
                    {linkMessage.text}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </>
        ) : null}
        <View style={styles.dataActions}>
          <TouchableOpacity
            style={styles.dataButton}
            onPress={() => void exportBackup()}
            disabled={dataBusy}
            accessibilityRole="button"
            accessibilityState={{ disabled: dataBusy }}
          >
            <Text style={styles.dataButtonText}>{t.settings.exportBackup}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dataButton, styles.dataButtonLast]}
            onPress={() => void importBackup()}
            disabled={dataBusy}
            accessibilityRole="button"
            accessibilityState={{ disabled: dataBusy }}
          >
            <Text style={styles.dataButtonText}>{t.settings.importBackup}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.deleteAllButton,
            (dataBusy || !hasGames) && styles.deleteAllButtonDisabled,
          ]}
          onPress={() => setDeleteAllOpen(true)}
          disabled={dataBusy || !hasGames}
          accessibilityRole="button"
          accessibilityState={{ disabled: dataBusy || !hasGames }}
        >
          <Text style={styles.deleteAllText}>{t.settings.deleteAll}</Text>
        </TouchableOpacity>
        {dataMessage ? (
          <Text
            style={[
              styles.dataMessage,
              dataMessage.type === "success"
                ? styles.dataMessageSuccess
                : styles.dataMessageError,
            ]}
            accessibilityRole="alert"
          >
            {dataMessage.text}
          </Text>
        ) : null}

        <Text style={[styles.section, styles.sectionSpacing]}>
          {t.settings.feedbackTitle}
        </Text>
        <Text style={styles.dataHint}>{t.settings.feedbackHint}</Text>
        <TouchableOpacity
          style={styles.feedbackButton}
          onPress={openFeedback}
          accessibilityRole="button"
          accessibilityLabel={t.settings.feedbackButton}
          accessibilityHint={FEEDBACK_EMAIL}
        >
          <Text style={styles.feedbackButtonText}>
            {t.settings.feedbackButton}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.whatsNewRow}
          onPress={openWhatsNew}
          accessibilityRole="button"
          accessibilityLabel={t.whatsNew.open}
        >
          <Text style={styles.whatsNewIcon}>✦</Text>
          <View style={styles.whatsNewCopy}>
            <View style={styles.whatsNewTopline}>
              <Text style={styles.whatsNewTitle}>{t.whatsNew.open}</Text>
              {!releaseSeen ? (
                <Text style={styles.whatsNewBadge}>{t.whatsNew.badge}</Text>
              ) : null}
            </View>
            <Text style={styles.whatsNewVersion}>
              {t.whatsNew.version(CURRENT_RELEASE, releaseDate)}
            </Text>
          </View>
          <Text style={styles.whatsNewChevron}>›</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>{t.home.offline}</Text>
      </ScrollView>

      <Modal
        visible={deleteAllOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteAllOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmDialog} accessibilityRole="alert">
            <Text style={styles.confirmTitle}>{t.settings.deleteAllTitle}</Text>
            <Text style={styles.confirmMessage}>
              {t.settings.deleteAllMessage}
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeleteAllOpen(false)}
                accessibilityRole="button"
              >
                <Text style={styles.cancelText}>
                  {t.settings.deleteAllCancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={() => void deleteAllGames()}
                accessibilityRole="button"
              >
                <Text style={styles.confirmDeleteText}>
                  {t.settings.deleteAllConfirm}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <WhatsNewModal
        visible={whatsNewOpen}
        onClose={() => setWhatsNewOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  back: { color: colors.gold, fontSize: 17 },
  backButton: { minHeight: 44, justifyContent: "center" },
  title: { color: colors.text, fontSize: 20, fontWeight: "700" },
  scroll: {
    width: "100%",
    alignSelf: "center",
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  sectionSpacing: { marginTop: spacing.xl },
  languageList: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  languageRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  languageRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  languageName: { flex: 1, color: colors.text, fontSize: 16 },
  languageNameOn: { color: colors.gold, fontWeight: "700" },
  languageCheck: { color: colors.gold, fontSize: 16, fontWeight: "800" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  settingCopy: { flex: 1, marginEnd: spacing.md },
  settingTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  settingHint: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  dataHint: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: spacing.md,
  },
  cloudCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgElevated,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cloudIcon: { fontSize: 18, marginEnd: spacing.sm, lineHeight: 22 },
  cloudCopy: { flex: 1 },
  cloudTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  cloudBody: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  linkToggle: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  linkToggleText: { color: colors.gold, fontSize: 14, fontWeight: "800" },
  linkChevron: { color: colors.gold, fontSize: 16, fontWeight: "800" },
  linkPanel: {
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  linkHint: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: spacing.md,
  },
  codeLabel: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  pasteLabel: { marginTop: spacing.md },
  codeRow: { flexDirection: "row", alignItems: "stretch" },
  codeValue: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    backgroundColor: colors.bg,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginEnd: spacing.sm,
  },
  codeCopy: {
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
  },
  codeCopyText: { color: colors.bg, fontSize: 13, fontWeight: "800" },
  pasteInput: {
    color: colors.text,
    fontSize: 13,
    backgroundColor: colors.bg,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  linkButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  linkButtonDisabled: { opacity: 0.5 },
  linkButtonText: { color: colors.bg, fontSize: 14, fontWeight: "800" },
  linkMessage: { fontSize: 12, marginTop: spacing.sm },
  linkMessageSuccess: { color: colors.positive },
  linkMessageError: { color: colors.negative },
  dataActions: { flexDirection: "row" },
  dataButton: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    marginEnd: spacing.sm,
  },
  dataButtonLast: { marginEnd: 0 },
  dataButtonText: { color: colors.gold, fontSize: 14, fontWeight: "800" },
  deleteAllButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.negative,
    borderWidth: 1,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  deleteAllButtonDisabled: { opacity: 0.4 },
  deleteAllText: { color: colors.negative, fontSize: 14, fontWeight: "800" },
  dataMessage: { fontSize: 12, marginTop: spacing.sm },
  dataMessageSuccess: { color: colors.positive },
  dataMessageError: { color: colors.negative },
  feedbackButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  feedbackButtonText: { color: colors.gold, fontSize: 14, fontWeight: "800" },
  whatsNewRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgElevated,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  whatsNewIcon: { color: colors.gold, fontSize: 16, marginEnd: spacing.md },
  whatsNewCopy: { flex: 1 },
  whatsNewTopline: { flexDirection: "row", alignItems: "center" },
  whatsNewTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  whatsNewBadge: {
    color: colors.bg,
    backgroundColor: colors.gold,
    fontSize: 10,
    fontWeight: "800",
    overflow: "hidden",
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginStart: spacing.sm,
  },
  whatsNewVersion: { color: colors.textDim, fontSize: 12, marginTop: 3 },
  whatsNewChevron: {
    color: colors.textDim,
    fontSize: 24,
    fontWeight: "300",
    marginStart: spacing.sm,
  },
  footer: {
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.xl,
    fontSize: 12,
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
});
