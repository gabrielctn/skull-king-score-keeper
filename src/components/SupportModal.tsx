import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, spacing } from "../theme";
import { useI18n } from "../i18n/context";
import { APP_STORE_ANNUAL_COST_EUR } from "../support";
import GlassSurface from "./GlassSurface";

interface Props {
  visible: boolean;
  /** Opens the donation page. The prompt does not come back afterwards. */
  onDonate: () => void;
  /** Closes the prompt; it may return after the quiet period. */
  onLater: () => void;
  /** Declines for good. The home screen keeps its support button. */
  onNever: () => void;
}

/**
 * Optional support ask shown once the podium celebration has played out. It
 * states what the App Store listing costs so the invitation reads as covering
 * a bill rather than as a paywall in disguise.
 */
export default function SupportModal({
  visible,
  onDonate,
  onLater,
  onNever,
}: Props) {
  const { t } = useI18n();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onLater}
    >
      <View style={styles.overlay}>
        <GlassSurface
          intensity={56}
          style={styles.dialog}
          accessibilityViewIsModal
        >
          <Text style={styles.coin}>☕</Text>
          <Text style={styles.title}>{t.supportPrompt.title}</Text>
          <Text style={styles.body}>{t.supportPrompt.body}</Text>
          <View style={styles.costCard}>
            <Text style={styles.costText}>
              {t.supportPrompt.cost(APP_STORE_ANNUAL_COST_EUR)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.donateButton}
            onPress={onDonate}
            accessibilityRole="link"
            accessibilityLabel={t.supportPrompt.donate}
          >
            <Text style={styles.donateText}>{t.supportPrompt.donate}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.laterButton}
            onPress={onLater}
            accessibilityRole="button"
          >
            <Text style={styles.laterText}>{t.supportPrompt.later}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.neverButton}
            onPress={onNever}
            accessibilityRole="button"
          >
            <Text style={styles.neverText}>{t.supportPrompt.never}</Text>
          </TouchableOpacity>
        </GlassSurface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  dialog: {
    width: "100%",
    maxWidth: 460,
    borderColor: colors.goldDim,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  coin: { fontSize: 34 },
  title: {
    color: colors.gold,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginTop: spacing.sm,
  },
  body: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  costCard: {
    alignSelf: "stretch",
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  costText: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  donateButton: {
    alignSelf: "stretch",
    minHeight: 52,
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  donateText: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  laterButton: {
    alignSelf: "stretch",
    minHeight: 48,
    justifyContent: "center",
    borderColor: colors.controlBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  laterText: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  neverButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  neverText: { color: colors.textDim, fontSize: 13, textAlign: "center" },
});
