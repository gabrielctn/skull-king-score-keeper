import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  AnalyticsConsent,
  enableGoogleAnalytics,
  loadAnalyticsConsent,
  saveAnalyticsConsent,
} from "../analytics";
import { useI18n } from "../i18n/context";
import { colors, radius, spacing } from "../theme";
import GlassSurface from "./GlassSurface";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Web-only analytics consent prompt. Google is never contacted before opt-in. */
export default function CookieConsentBanner() {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const [consent, setConsent] = useState<AnalyticsConsent | null>(() =>
    loadAnalyticsConsent()
  );
  const reducedMotion = useRef(prefersReducedMotion()).current;
  const reveal = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;

  useEffect(() => {
    if (consent === "accepted") {
      enableGoogleAnalytics();
      return;
    }
    if (consent !== null || reducedMotion) return;

    Animated.timing(reveal, {
      toValue: 1,
      duration: 240,
      useNativeDriver: false,
    }).start();
  }, [consent, reducedMotion, reveal]);

  const choose = (choice: AnalyticsConsent) => {
    saveAnalyticsConsent(choice);
    setConsent(choice);
  };

  if (Platform.OS !== "web" || consent !== null) return null;

  const compact = width < 620;
  return (
    <View style={styles.positioner}>
      <Animated.View
        style={[
          styles.motionSurface,
          {
            opacity: reveal,
            transform: [
              {
                translateY: reveal.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          },
        ]}
      >
        <GlassSurface
          intensity={54}
          accessibilityRole="alert"
          accessibilityLabel={t.cookies.accessibilityLabel}
          style={[styles.banner, compact && styles.bannerCompact]}
        >
          <Text style={[styles.message, compact && styles.messageCompact]}>
            {t.cookies.message}
          </Text>
          <View style={[styles.actions, compact && styles.actionsCompact]}>
            <Pressable
              accessibilityRole="button"
              onPress={() => choose("declined")}
              style={({ pressed }) => [
                styles.button,
                styles.declineButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.declineText}>{t.cookies.decline}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => choose("accepted")}
              style={({ pressed }) => [
                styles.button,
                styles.acceptButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.acceptText}>{t.cookies.accept}</Text>
            </Pressable>
          </View>
        </GlassSurface>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  positioner: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  motionSurface: {
    width: "100%",
    maxWidth: 760,
  },
  banner: {
    width: "100%",
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderColor: colors.goldDim,
    borderRadius: radius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerCompact: {
    alignItems: "stretch",
    flexDirection: "column",
  },
  message: {
    flex: 1,
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 19,
    paddingEnd: spacing.md,
  },
  messageCompact: {
    paddingEnd: 0,
    paddingBottom: 10,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionsCompact: {
    justifyContent: "flex-end",
  },
  button: {
    minWidth: 92,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    borderRadius: radius.sm,
  },
  declineButton: {
    marginEnd: spacing.sm,
    borderWidth: 1,
    borderColor: colors.controlBorder,
  },
  acceptButton: {
    backgroundColor: colors.gold,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  declineText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  acceptText: {
    color: colors.bg,
    fontSize: 13,
    fontWeight: "800",
  },
});
