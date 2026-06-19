import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BonusInput } from "../types";
import { BONUS_VALUES, captureBonus } from "../scoring";
import Stepper from "./Stepper";
import { colors, radius, spacing } from "../theme";

interface Props {
  bonus: BonusInput;
  advanced: boolean;
  onChange: (next: BonusInput) => void;
}

function Toggle({
  on,
  onToggle,
  label,
  points,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
  points: number;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        {label} <Text style={styles.pts}>+{points}</Text>
      </Text>
      <TouchableOpacity
        style={[styles.toggle, on && styles.toggleOn]}
        onPress={onToggle}
        accessibilityRole="switch"
        accessibilityState={{ checked: on }}
      >
        <Text style={[styles.toggleText, on && styles.toggleTextOn]}>
          {on ? "Yes" : "No"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function CountRow({
  label,
  points,
  value,
  max,
  onChange,
}: {
  label: string;
  points: number;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        {label} <Text style={styles.pts}>+{points} ea.</Text>
      </Text>
      <Stepper value={value} onChange={onChange} min={0} max={max} compact />
    </View>
  );
}

export default function BonusEditor({ bonus, advanced, onChange }: Props) {
  const set = <K extends keyof BonusInput>(key: K, value: BonusInput[K]) =>
    onChange({ ...bonus, [key]: value });

  return (
    <View style={styles.wrap}>
      <CountRow
        label="Colored 14s"
        points={BONUS_VALUES.colored14}
        value={bonus.colored14}
        max={3}
        onChange={(v) => set("colored14", v)}
      />
      <Toggle
        label="Black 14 (Jolly Roger)"
        points={BONUS_VALUES.black14}
        on={bonus.black14}
        onToggle={() => set("black14", !bonus.black14)}
      />
      <CountRow
        label="Mermaid taken by a pirate"
        points={BONUS_VALUES.mermaidByPirate}
        value={bonus.mermaidByPirate}
        max={2}
        onChange={(v) => set("mermaidByPirate", v)}
      />
      <CountRow
        label="Pirate taken by Skull King"
        points={BONUS_VALUES.pirateBySkullKing}
        value={bonus.pirateBySkullKing}
        max={6}
        onChange={(v) => set("pirateBySkullKing", v)}
      />
      <Toggle
        label="Mermaid captures Skull King"
        points={BONUS_VALUES.mermaidCapturesSkullKing}
        on={bonus.mermaidCapturesSkullKing}
        onToggle={() =>
          set("mermaidCapturesSkullKing", !bonus.mermaidCapturesSkullKing)
        }
      />

      {advanced ? (
        <>
          <View style={styles.divider} />
          <CountRow
            label="Loot alliance (both hit bid)"
            points={BONUS_VALUES.loot}
            value={bonus.loot}
            max={2}
            onChange={(v) => set("loot", v)}
          />
          <View style={styles.row}>
            <Text style={styles.label}>Rascal wager</Text>
            <View style={styles.segment}>
              {([0, 10, 20] as const).map((w) => (
                <TouchableOpacity
                  key={w}
                  style={[
                    styles.segBtn,
                    bonus.rascalWager === w && styles.segBtnOn,
                  ]}
                  onPress={() => set("rascalWager", w)}
                >
                  <Text
                    style={[
                      styles.segText,
                      bonus.rascalWager === w && styles.segTextOn,
                    ]}
                  >
                    {w}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      ) : null}

      <Text style={styles.sum}>Capture bonus: +{captureBonus(bonus)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.cardBorder,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  label: { color: colors.text, fontSize: 14, flex: 1, marginRight: spacing.sm },
  pts: { color: colors.gold, fontSize: 12 },
  toggle: {
    minWidth: 56,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.bgElevated,
    alignItems: "center",
  },
  toggleOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  toggleText: { color: colors.textDim, fontWeight: "700" },
  toggleTextOn: { color: colors.bg },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.cardBorder,
    marginBottom: spacing.sm,
  },
  segment: { flexDirection: "row" },
  segBtn: {
    minWidth: 40,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.bgElevated,
    alignItems: "center",
    marginLeft: 6,
    borderRadius: radius.sm,
  },
  segBtnOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  segText: { color: colors.textDim, fontWeight: "700" },
  segTextOn: { color: colors.bg },
  sum: {
    color: colors.textDim,
    fontSize: 12,
    textAlign: "right",
    marginTop: spacing.xs,
  },
});
