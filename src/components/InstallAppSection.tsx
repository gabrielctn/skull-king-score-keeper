import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, spacing } from "../theme";
import { useI18n } from "../i18n/context";
import {
  getPwaInstallMode,
  isPwaInstalled,
  promptPwaInstall,
  PwaInstallMode,
  subscribeToInstallPrompt,
  wasAppInstalled,
} from "../pwaInstall";

/**
 * Settings block that helps players keep the app on their phone.
 *
 * On browsers that expose the install prompt (Android Chrome/Edge…) it offers a
 * one-tap install button. Everywhere else — notably iOS Safari, where the
 * prompt does not exist — it shows a step-by-step guide for both iPhone and
 * Android so even non-technical players can add the app to their home screen.
 */
export default function InstallAppSection() {
  const { t } = useI18n();
  const [installMode, setInstallMode] = React.useState<PwaInstallMode>(
    getPwaInstallMode()
  );
  const [installed, setInstalled] = React.useState(
    () => isPwaInstalled() || wasAppInstalled()
  );
  const [installFailed, setInstallFailed] = React.useState(false);
  // Auto-open the guide when there is no one-tap button to offer (iOS, or any
  // browser where the prompt is unavailable), so the steps are right there.
  const [guideOpen, setGuideOpen] = React.useState(
    () => getPwaInstallMode() !== "prompt"
  );

  React.useEffect(
    () =>
      subscribeToInstallPrompt(() => {
        setInstallMode(getPwaInstallMode());
        setInstalled(isPwaInstalled() || wasAppInstalled());
      }),
    []
  );

  if (Platform.OS !== "web") return null;

  const copy = t.settings.install;

  const install = async () => {
    setInstallFailed(false);
    try {
      const outcome = await promptPwaInstall();
      if (outcome === "accepted") setInstalled(true);
    } catch {
      setInstallFailed(true);
    } finally {
      setInstallMode(getPwaInstallMode());
      setInstalled(isPwaInstalled() || wasAppInstalled());
    }
  };

  return (
    <>
      <Text style={[styles.section, styles.sectionSpacing]}>{copy.title}</Text>

      {installed ? (
        <View style={styles.installedCard} accessibilityRole="summary">
          <Text style={styles.installedIcon}>✓</Text>
          <View style={styles.installedCopy}>
            <Text style={styles.installedTitle}>{copy.installedTitle}</Text>
            <Text style={styles.installedBody}>{copy.installedBody}</Text>
          </View>
        </View>
      ) : (
        <>
          {installMode === "prompt" ? (
            <>
              <Text style={styles.hint}>{copy.promptHint}</Text>
              <TouchableOpacity
                style={styles.installButton}
                onPress={() => void install()}
                accessibilityRole="button"
                accessibilityLabel={copy.button}
              >
                <Text style={styles.installButtonText}>{copy.button}</Text>
              </TouchableOpacity>
              {installFailed ? (
                <Text style={styles.errorText} accessibilityRole="alert">
                  {copy.error}
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.hint}>{copy.manualHint}</Text>
          )}

          <TouchableOpacity
            style={styles.guideToggle}
            onPress={() => setGuideOpen((open) => !open)}
            accessibilityRole="button"
            accessibilityState={{ expanded: guideOpen }}
          >
            <Text style={styles.guideToggleText}>{copy.guideTitle}</Text>
            <Text style={styles.guideChevron}>{guideOpen ? "⌃" : "⌄"}</Text>
          </TouchableOpacity>

          {guideOpen ? (
            <View style={styles.guideBody}>
              <PlatformGuide title={copy.iosTitle} steps={copy.iosSteps} />
              <PlatformGuide
                title={copy.androidTitle}
                steps={copy.androidSteps}
                last
              />
            </View>
          ) : null}
        </>
      )}
    </>
  );
}

function PlatformGuide({
  title,
  steps,
  last,
}: {
  title: string;
  steps: string[];
  last?: boolean;
}) {
  return (
    <View style={[styles.platformCard, last && styles.platformCardLast]}>
      <Text style={styles.platformTitle}>{title}</Text>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>{index + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  sectionSpacing: { marginTop: spacing.xl },
  hint: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: spacing.md,
  },
  installButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderRadius: radius.md,
  },
  installButtonText: { color: colors.bg, fontSize: 16, fontWeight: "800" },
  errorText: {
    color: colors.negative,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  installedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgElevated,
    borderColor: colors.positive,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  installedIcon: {
    color: colors.positive,
    fontSize: 22,
    fontWeight: "900",
    marginEnd: spacing.md,
  },
  installedCopy: { flex: 1 },
  installedTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  installedBody: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  guideToggle: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  guideToggleText: { color: colors.gold, fontSize: 14, fontWeight: "800" },
  guideChevron: { color: colors.gold, fontSize: 16, fontWeight: "800" },
  guideBody: { marginTop: spacing.sm },
  platformCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  platformCardLast: { marginBottom: 0 },
  platformTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: spacing.xs,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgElevated,
    borderColor: colors.goldDim,
    borderWidth: 1,
    marginEnd: spacing.sm,
    marginTop: 1,
  },
  stepBadgeText: { color: colors.gold, fontSize: 12, fontWeight: "800" },
  stepText: {
    flex: 1,
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 19,
  },
});
