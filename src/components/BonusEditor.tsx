import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BonusInput } from "../types";
import {
  BONUS_VALUES,
  captureBonus,
  expansionColorBonus,
} from "../scoring";
import Stepper from "./Stepper";
import ToggleSwitch from "./ToggleSwitch";
import { colors, radius, spacing } from "../theme";
import { useI18n } from "../i18n/context";

interface Props {
  bonus: BonusInput;
  advanced: boolean;
  newExpansion: boolean;
  bidMade: boolean;
  onChange: (next: BonusInput) => void;
}

const signedPoints = (points: number) => `${points >= 0 ? "+" : ""}${points}`;

function BooleanRow({
  value,
  onValueChange,
  label,
  points,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  points: number;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        {label} <Text style={styles.pts}>{signedPoints(points)}</Text>
      </Text>
      <ToggleSwitch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={`${label}, ${signedPoints(points)}`}
      />
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
  const { t } = useI18n();
  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        {label}{" "}
        <Text style={styles.pts}>
          {signedPoints(points)} {t.bonus.each}
        </Text>
      </Text>
      <Stepper value={value} onChange={onChange} min={0} max={max} compact />
    </View>
  );
}

export default function BonusEditor({
  bonus,
  advanced,
  newExpansion,
  bidMade,
  onChange,
}: Props) {
  const { t } = useI18n();
  const set = <K extends keyof BonusInput>(key: K, value: BonusInput[K]) =>
    onChange({ ...bonus, [key]: value });

  return (
    <View style={styles.wrap}>
      <CountRow
        label={t.bonus.colored14}
        points={BONUS_VALUES.colored14}
        value={bonus.colored14}
        max={3}
        onChange={(v) => set("colored14", v)}
      />
      <BooleanRow
        label={t.bonus.black14}
        points={BONUS_VALUES.black14}
        value={bonus.black14}
        onValueChange={(value) => set("black14", value)}
      />
      <CountRow
        label={t.bonus.mermaidByPirate}
        points={BONUS_VALUES.mermaidByPirate}
        value={bonus.mermaidByPirate}
        max={2}
        onChange={(v) => set("mermaidByPirate", v)}
      />
      <CountRow
        label={t.bonus.pirateBySkullKing}
        points={BONUS_VALUES.pirateBySkullKing}
        value={bonus.pirateBySkullKing}
        max={newExpansion ? 7 : 6}
        onChange={(v) => set("pirateBySkullKing", v)}
      />
      <BooleanRow
        label={t.bonus.mermaidCapturesSkullKing}
        points={BONUS_VALUES.mermaidCapturesSkullKing}
        value={bonus.mermaidCapturesSkullKing}
        onValueChange={(value) => set("mermaidCapturesSkullKing", value)}
      />

      {newExpansion ? (
        <>
          <View style={styles.divider} />
          <Text style={styles.subheading}>{t.bonus.newExpansion}</Text>
          <CountRow
            label={t.bonus.expansion7}
            points={BONUS_VALUES.expansion7}
            value={bonus.expansion7}
            max={4}
            onChange={(v) => set("expansion7", v)}
          />
          <CountRow
            label={t.bonus.expansion8}
            points={BONUS_VALUES.expansion8}
            value={bonus.expansion8}
            max={4}
            onChange={(v) => set("expansion8", v)}
          />
          <Text style={styles.conditionalHint}>{t.bonus.expansionColorHint}</Text>
          <CountRow
            label={t.bonus.davyJonesLeviathans}
            points={BONUS_VALUES.davyJonesLeviathan}
            value={bonus.davyJonesLeviathans}
            max={3}
            onChange={(v) => set("davyJonesLeviathans", v)}
          />
          <BooleanRow
            label={t.bonus.secondCaptured}
            points={BONUS_VALUES.secondCaptured}
            value={bonus.secondCaptured}
            onValueChange={(value) => set("secondCaptured", value)}
          />
        </>
      ) : null}

      {advanced ? (
        <>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>{t.bonus.rascal}</Text>
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

      <Text style={styles.sum}>
        {t.bonus.cardBonus(
          captureBonus(bonus) + expansionColorBonus(bonus, bidMade)
        )}
      </Text>
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
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.cardBorder,
    marginBottom: spacing.sm,
  },
  subheading: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  conditionalHint: {
    color: colors.textDim,
    fontSize: 11,
    lineHeight: 15,
    marginTop: -spacing.xs,
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
