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
import { CURRENT_RELEASE, CURRENT_RELEASE_DATE } from "../releases";

interface Props {
  visible: boolean;
  onClose: () => void;
}

/**
 * Once-per-release changelog dialog. The home screen opens it automatically
 * for returning users; the settings screen offers it on demand.
 */
export default function WhatsNewModal({ visible, onClose }: Props) {
  const { t, lang } = useI18n();
  const releaseDate = new Date(
    `${CURRENT_RELEASE_DATE}T12:00:00Z`
  ).toLocaleDateString(browserLocale(lang), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
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
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={styles.releaseCloseText}>{t.whatsNew.close}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  releaseBullet: {
    color: colors.gold,
    fontSize: 12,
    marginRight: spacing.sm,
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
