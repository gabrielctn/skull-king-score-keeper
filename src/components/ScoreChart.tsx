import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { browserLocale, useI18n } from "../i18n/context";
import { standings } from "../scoring";
import { cumulativeScoreSeries } from "../stats";
import { colors, scoreSeriesColors, spacing } from "../theme";
import type { Game } from "../types";

interface Props {
  game: Game;
}

const CHART_WIDTH = 640;
const CHART_HEIGHT = 210;
const PLOT = {
  left: 52,
  right: 18,
  top: 18,
  bottom: 32,
} as const;

function distinctRoundTicks(roundNumbers: readonly number[]): number[] {
  if (roundNumbers.length <= 7) return [...roundNumbers];

  const indexes = new Set<number>([0, roundNumbers.length - 1]);
  for (let index = 1; index < 6; index += 1) {
    indexes.add(Math.round((index * (roundNumbers.length - 1)) / 6));
  }
  return [...indexes]
    .sort((a, b) => a - b)
    .map((index) => roundNumbers[index]);
}

/** Responsive, dependency-free cumulative score chart for the web app. */
export default function ScoreChart({ game }: Props) {
  const { t, lang } = useI18n();
  const series = useMemo(() => cumulativeScoreSeries(game), [game]);

  const roundNumbers = useMemo(
    () =>
      [...new Set(series.flatMap((player) => player.points.map((p) => p.roundNumber)))].sort(
        (a, b) => a - b
      ),
    [series]
  );
  const formatScore = useMemo(
    () => new Intl.NumberFormat(browserLocale(lang), { maximumFractionDigits: 0 }),
    [lang]
  );

  if (roundNumbers.length < 2) return null;

  const firstRound = roundNumbers[0];
  const lastRound = roundNumbers[roundNumbers.length - 1];
  const totals = series.flatMap((player) => player.points.map((point) => point.total));
  const observedMin = Math.min(0, ...totals);
  const observedMax = Math.max(0, ...totals);
  const observedSpan = observedMax - observedMin;
  const domainPadding = observedSpan === 0 ? 10 : Math.max(5, observedSpan * 0.08);
  const domainMin = observedMin - domainPadding;
  const domainMax = observedMax + domainPadding;
  const domainSpan = domainMax - domainMin;
  const plotWidth = CHART_WIDTH - PLOT.left - PLOT.right;
  const plotHeight = CHART_HEIGHT - PLOT.top - PLOT.bottom;

  const xForRound = (roundNumber: number) =>
    PLOT.left +
    ((roundNumber - firstRound) / Math.max(1, lastRound - firstRound)) * plotWidth;
  const yForTotal = (total: number) =>
    PLOT.top + ((domainMax - total) / domainSpan) * plotHeight;

  const leader = standings(game, lastRound)[0];
  const ariaLabel = t.stats.chartLabel(
    leader?.player.name ?? "",
    roundNumbers.length
  );
  const xTicks = distinctRoundTicks(roundNumbers);
  const yTicks = [...new Set([observedMin, 0, observedMax])].sort((a, b) => b - a);

  return (
    <View style={styles.root}>
      <Text accessibilityRole="header" style={styles.heading}>
        {t.stats.scoreEvolution}
      </Text>
      <svg
        {...({ dir: "ltr" } as const)}
        role="img"
        aria-label={ariaLabel}
        width="100%"
        height={CHART_HEIGHT}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ direction: "ltr", display: "block", overflow: "visible" }}
      >
        <title>{ariaLabel}</title>

        {xTicks.map((roundNumber) => {
          const x = xForRound(roundNumber);
          return (
            <g key={`round-${roundNumber}`}>
              <line
                x1={x}
                x2={x}
                y1={PLOT.top}
                y2={PLOT.top + plotHeight}
                stroke={colors.cardBorder}
                strokeWidth="1"
                strokeDasharray="3 6"
              />
              <text
                x={x}
                y={CHART_HEIGHT - 8}
                fill={colors.textDim}
                fontSize="11"
                textAnchor="middle"
              >
                {roundNumber}
              </text>
            </g>
          );
        })}

        {yTicks.map((total) => {
          const y = yForTotal(total);
          const isZero = total === 0;
          return (
            <g key={`total-${total}`}>
              <line
                x1={PLOT.left}
                x2={PLOT.left + plotWidth}
                y1={y}
                y2={y}
                stroke={isZero ? colors.textDim : colors.cardBorder}
                strokeWidth={isZero ? "1.5" : "1"}
                strokeDasharray={isZero ? undefined : "3 6"}
              />
              <text
                x={PLOT.left - 9}
                y={y + 4}
                fill={isZero ? colors.text : colors.textDim}
                fontSize="11"
                textAnchor="end"
              >
                {formatScore.format(total)}
              </text>
            </g>
          );
        })}

        {series.map((player, playerIndex) => {
          if (player.points.length === 0) return null;
          const color = scoreSeriesColors[playerIndex % scoreSeriesColors.length];
          const path = player.points
            .map(
              (point, pointIndex) =>
                `${pointIndex === 0 ? "M" : "L"} ${xForRound(point.roundNumber).toFixed(2)} ${yForTotal(point.total).toFixed(2)}`
            )
            .join(" ");

          return (
            <g key={player.playerId}>
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {player.points.map((point) => (
                <circle
                  key={point.roundNumber}
                  cx={xForRound(point.roundNumber)}
                  cy={yForTotal(point.total)}
                  r="3.5"
                  fill={colors.card}
                  stroke={color}
                  strokeWidth="2"
                />
              ))}
            </g>
          );
        })}
      </svg>

      <View style={styles.legend}>
        {series.map((player, playerIndex) => (
          <View key={player.playerId} style={styles.legendItem}>
            <View
              style={[
                styles.legendSwatch,
                {
                  backgroundColor:
                    scoreSeriesColors[playerIndex % scoreSeriesColors.length],
                },
              ]}
            />
            <Text numberOfLines={1} style={styles.legendName}>
              {player.name}
            </Text>
          </View>
        ))}
      </View>
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
  legend: {
    direction: "ltr",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: spacing.xs,
    marginHorizontal: -spacing.sm,
  },
  legendItem: {
    direction: "ltr",
    flexDirection: "row",
    alignItems: "center",
    minWidth: 96,
    maxWidth: "50%",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  legendSwatch: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 6,
  },
  legendName: {
    flexShrink: 1,
    color: colors.textDim,
    fontSize: 12,
    writingDirection: "auto",
  },
});
