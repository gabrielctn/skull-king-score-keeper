import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { colors } from "../theme";

interface Props {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
}

/** Shared binary control with an animated track and thumb. */
export default function ToggleSwitch({
  value,
  onValueChange,
  accessibilityLabel,
  disabled = false,
}: Props) {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [progress, value]);

  const trackColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.bgElevated, colors.gold],
  });
  const borderColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.cardBorder, colors.gold],
  });
  const thumbOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 22],
  });

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      aria-checked={value}
      aria-disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Animated.View
        style={[
          styles.track,
          { backgroundColor: trackColor, borderColor },
        ]}
      >
        <Animated.View
          style={[styles.thumb, { transform: [{ translateX: thumbOffset }] }]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: 52,
    height: 30,
    borderRadius: 15,
  },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.45 },
  track: {
    width: 52,
    height: 30,
    padding: 3,
    justifyContent: "center",
    borderRadius: 15,
    borderWidth: 1,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.text,
    shadowColor: colors.bg,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.28,
    shadowRadius: 2,
    elevation: 2,
  },
});
