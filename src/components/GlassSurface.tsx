import React, { useEffect, useState } from "react";
import { BlurView } from "expo-blur";
import {
  AccessibilityInfo,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";
import { colors } from "../theme";

interface Props extends Omit<ViewProps, "style"> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}

/**
 * A restrained translucent surface for navigation and temporary overlays.
 * Android keeps a performant translucent fallback because its native blur
 * implementation is still experimental; reduced-transparency users get the
 * same high-contrast fallback on every platform.
 */
export default function GlassSurface({
  children,
  style,
  intensity = 44,
  ...viewProps
}: Props) {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceTransparencyEnabled?.().then((enabled) => {
      if (mounted) setReduceTransparency(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener?.(
      "reduceTransparencyChanged",
      setReduceTransparency
    );
    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  const fallback = reduceTransparency || Platform.OS === "android";
  if (fallback) {
    return (
      <View
        {...viewProps}
        style={[styles.surface, styles.opaqueSurface, style]}
      >
        <View style={styles.highlight} />
        {children}
      </View>
    );
  }

  return (
    <BlurView
      {...viewProps}
      intensity={intensity}
      tint={
        Platform.OS === "ios"
          ? "systemThinMaterialDark"
          : "systemUltraThinMaterialDark"
      }
      style={[styles.surface, style]}
    >
      <View style={styles.highlight} />
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    overflow: "hidden",
  },
  opaqueSurface: {
    backgroundColor: colors.glassOpaque,
  },
  highlight: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.glassHighlight,
    pointerEvents: "none",
  },
});
