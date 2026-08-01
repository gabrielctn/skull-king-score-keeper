import React from "react";
import {
  Platform,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface Props {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
}

/**
 * A native touch target with a real HTML button on web. The latter keeps
 * clipboard writes inside the browser's trusted click event.
 */
export default function CopyButton({
  children,
  onPress,
  disabled = false,
  style,
  accessibilityLabel,
}: Props) {
  if (Platform.OS === "web") {
    const flattened = StyleSheet.flatten(style) as React.CSSProperties;
    return React.createElement(
      "button",
      {
        type: "button",
        onClick: onPress,
        disabled,
        "aria-label": accessibilityLabel,
        style: {
          ...flattened,
          border: "none",
          font: "inherit",
          cursor: disabled ? "default" : "pointer",
        },
      },
      children
    );
  }

  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </TouchableOpacity>
  );
}
