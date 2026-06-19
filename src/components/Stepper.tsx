import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius } from "../theme";

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  compact?: boolean;
}

export default function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  label,
  compact,
}: Props) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, value <= min && styles.btnDisabled]}
          onPress={dec}
          disabled={value <= min}
          accessibilityLabel={`Decrease ${label ?? "value"}`}
        >
          <Text style={styles.btnText}>−</Text>
        </TouchableOpacity>
        <Text style={[styles.value, compact && styles.valueCompact]}>{value}</Text>
        <TouchableOpacity
          style={[styles.btn, value >= max && styles.btnDisabled]}
          onPress={inc}
          disabled={value >= max}
          accessibilityLabel={`Increase ${label ?? "value"}`}
        >
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  label: { color: colors.textDim, fontSize: 12, marginBottom: 4 },
  row: { flexDirection: "row", alignItems: "center" },
  btn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.35 },
  btnText: { color: colors.gold, fontSize: 22, lineHeight: 24, fontWeight: "700" },
  value: {
    minWidth: 44,
    textAlign: "center",
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
  },
  valueCompact: { minWidth: 34, fontSize: 18 },
});
