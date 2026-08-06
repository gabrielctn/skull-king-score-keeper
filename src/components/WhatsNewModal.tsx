import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, radius, spacing } from "../theme";
import { browserLocale, useI18n } from "../i18n/context";
import {
  CURRENT_RELEASE,
  CURRENT_RELEASE_DATE,
  PAST_RELEASES,
} from "../releases";
import GlassSurface from "./GlassSurface";
import DisclosureChevron from "./DisclosureChevron";

interface Props {
  visible: boolean;
  onClose: () => void;
  /**
   * Offer the older releases behind a toggle. Settings does; the copy that
   * opens itself after an update does not, because someone who just updated
   * wants to know what changed, not to re-read what already shipped.
   */
  showHistory?: boolean;
}

/**
 * Once-per-release changelog dialog. The home screen opens it automatically
 * for returning users; the settings screen offers it on demand, with history.
 */
export default function WhatsNewModal({
  visible,
  onClose,
  showHistory = false,
}: Props) {
  const { t, lang } = useI18n();
  const [historyOpen, setHistoryOpen] = React.useState(false);

  const formatDate = (iso: string) =>
    new Date(`${iso}T12:00:00Z`).toLocaleDateString(browserLocale(lang), {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const releaseDate = formatDate(CURRENT_RELEASE_DATE);

  // Collapse the history again between openings, so the dialog always starts
  // on what is new.
  React.useEffect(() => {
    if (!visible) setHistoryOpen(false);
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <GlassSurface
          intensity={56}
          style={styles.releaseDialog}
          accessibilityViewIsModal
        >
          <Text style={styles.releaseEyebrow}>
            {t.whatsNew.version(CURRENT_RELEASE, releaseDate)}
          </Text>
          <Text style={styles.releaseTitle}>{t.whatsNew.title}</Text>
          <ScrollView
            style={styles.releaseScroll}
            contentContainerStyle={styles.releaseScrollContent}
          >
            {t.whatsNew.items.map((item, index) => (
              <View key={index} style={styles.releaseItem}>
                <Text style={styles.releaseBullet}>✦</Text>
                <Text style={styles.releaseItemText}>{item}</Text>
              </View>
            ))}

            {showHistory ? (
              <>
                <TouchableOpacity
                  style={styles.historyToggle}
                  onPress={() => setHistoryOpen((open) => !open)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: historyOpen }}
                >
                  <Text style={styles.historyToggleText}>
                    {t.whatsNew.historyTitle}
                  </Text>
                  <DisclosureChevron expanded={historyOpen} />
                </TouchableOpacity>

                {historyOpen
                  ? PAST_RELEASES.map((release) => (
                      <View key={release.version} style={styles.historyRelease}>
                        <Text style={styles.historyVersion}>
                          {t.whatsNew.version(
                            release.version,
                            formatDate(release.date)
                          )}
                        </Text>
                        {(t.whatsNew.history[release.version] ?? []).map(
                          (item, index) => (
                            <View key={index} style={styles.releaseItem}>
                              <Text style={styles.releaseBullet}>✦</Text>
                              <Text style={styles.releaseItemText}>{item}</Text>
                            </View>
                          )
                        )}
                      </View>
                    ))
                  : null}
              </>
            ) : null}
          </ScrollView>
          <TouchableOpacity
            style={styles.releaseCloseButton}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={styles.releaseCloseText}>{t.whatsNew.close}</Text>
          </TouchableOpacity>
        </GlassSurface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  historyToggle: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  historyToggleText: { color: colors.gold, fontSize: 13, fontWeight: "800" },
  historyRelease: { marginTop: spacing.sm },
  historyVersion: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  releaseDialog: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "86%",
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
  releaseItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  releaseBullet: {
    color: colors.gold,
    fontSize: 12,
    marginEnd: spacing.sm,
    marginTop: 3,
  },
  releaseItemText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 21 },
  releaseCloseButton: {
    backgroundColor: colors.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  releaseCloseText: { color: colors.bg, fontSize: 16, fontWeight: "800" },
});
