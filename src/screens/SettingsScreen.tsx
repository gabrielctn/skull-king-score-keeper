import React from "react";
import {
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
  isPersistentStorageSupported,
  isStoragePersisted,
  requestPersistentStorage,
} from "../storagePersistence";
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
}

export default function SettingsScreen({
  settings,
  hasGames,
  onUpdateSettings,
  onBack,
  onExportBackup,
  onImportBackup,
  onDeleteAllGames,
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
  const [storageSupported, setStorageSupported] = React.useState(false);
  const [storagePersisted, setStoragePersisted] = React.useState(false);
  const [storageBusy, setStorageBusy] = React.useState(false);

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
    let active = true;
    setStorageSupported(isPersistentStorageSupported());
    void isStoragePersisted().then((persisted) => {
      if (active) setStoragePersisted(persisted);
    });
    return () => {
      active = false;
    };
  }, []);

  const protectStorage = async () => {
    setStorageBusy(true);
    try {
      setStoragePersisted(await requestPersistentStorage());
    } finally {
      setStorageBusy(false);
    }
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
        {storageSupported ? (
          <View style={styles.durabilityCard}>
            <Text style={styles.durabilityIcon}>
              {storagePersisted ? "🛡️" : "⚠️"}
            </Text>
            <View style={styles.durabilityCopy}>
              <Text style={styles.durabilityTitle}>
                {storagePersisted
                  ? t.settings.durability.protectedTitle
                  : t.settings.durability.atRiskTitle}
              </Text>
              <Text style={styles.durabilityBody}>
                {storagePersisted
                  ? t.settings.durability.protectedBody
                  : t.settings.durability.atRiskBody}
              </Text>
              {!storagePersisted ? (
                <TouchableOpacity
                  style={[
                    styles.durabilityButton,
                    storageBusy && styles.durabilityButtonDisabled,
                  ]}
                  onPress={() => void protectStorage()}
                  disabled={storageBusy}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: storageBusy }}
                >
                  <Text style={styles.durabilityButtonText}>
                    {storageBusy
                      ? t.settings.durability.protecting
                      : t.settings.durability.protect}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
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
  durabilityCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.bgElevated,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  durabilityIcon: { fontSize: 18, marginEnd: spacing.sm, lineHeight: 22 },
  durabilityCopy: { flex: 1 },
  durabilityTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  durabilityBody: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  durabilityButton: {
    alignSelf: "flex-start",
    minHeight: 40,
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  durabilityButtonDisabled: { opacity: 0.5 },
  durabilityButtonText: { color: colors.bg, fontSize: 13, fontWeight: "800" },
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
