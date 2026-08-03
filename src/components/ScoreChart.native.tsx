import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { browserLocale, useI18n } from "../i18n/context";
import { standings } from "../scoring";
import { cumulativeScoreSeries } from "../stats";
import { colors, radius, scoreSeriesColors, spacing } from "../theme";
import type { Game } from "../types";

interface Props {
  game: Game;
}

/**
 * Native score history uses compact per-player rows. The web implementation
 * keeps its responsive SVG, whose DOM elements are not valid React Native
 * components.
 */
export default function ScoreChart({ game }: Props) {
  const { t, lang } = useI18n();
  const series = useMemo(() => cumulativeScoreSeries(game), [game]);
  const roundsPlayed = Math.max(
    0,
    ...series.flatMap((player) =>
      player.points.map((point) => point.roundNumber)
    )
  );
  const formatScore = useMemo(
    () =>
      new Intl.NumberFormat(browserLocale(lang), {
        maximumFractionDigits: 0,
        signDisplay: "exceptZero",
      }),
    [lang]
  );

  if (roundsPlayed < 2) return null;

  const leader = standings(game, roundsPlayed)[0];
  const accessibilityLabel = t.stats.chartLabel(
    leader?.player.name ?? "",
    roundsPlayed
  );

  return (
    <View
      style={styles.root}
      accessible
      accessibilityLabel={accessibilityLabel}
    >
      <Text accessibilityRole="header" style={styles.heading}>
        {t.stats.scoreEvolution}
      </Text>
      {series.map((player, playerIndex) => {
        const color =
          scoreSeriesColors[playerIndex % scoreSeriesColors.length];
        return (
          <View key={player.playerId} style={styles.playerRow}>
            <View style={styles.playerHeading}>
              <View style={[styles.legendSwatch, { backgroundColor: color }]} />
              <Text numberOfLines={1} style={styles.playerName}>
                {player.name}
              </Text>
            </View>
            <View style={styles.points}>
              {player.points.map((point) => (
                <View
                  key={point.roundNumber}
                  style={[styles.point, { borderColor: color }]}
                >
                  <Text style={styles.roundNumber}>{point.roundNumber}</Text>
                  <Text style={[styles.total, { color }]}>
                    {formatScore.format(point.total)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: "stretch",
    width: "100%",
    marginTop: spacing.md,
  },
  heading: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  playerRow: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  playerHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  legendSwatch: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginEnd: spacing.xs,
  },
  playerName: {
    flexShrink: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  points: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  point: {
    minWidth: 42,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
  },
  roundNumber: {
    color: colors.textDim,
    fontSize: 10,
  },
  total: {
    fontSize: 12,
    fontWeight: "800",
  },
});
