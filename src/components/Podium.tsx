import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ViewStyle } from "react-native";
import { useI18n } from "../i18n/context";
import type { Standing } from "../scoring";
import type { AwardKind, GameAward } from "../stats";
import {
  colors,
  radius,
  scoreSeriesColors,
  spacing,
} from "../theme";

interface Props {
  rows: readonly Standing[];
  awards: readonly GameAward[];
}

interface ConfettiParticle {
  id: number;
  color: string;
  left: number;
  size: number;
  drift: number;
  fall: number;
  rotation: number;
  delayMs: number;
  durationMs: number;
  round: boolean;
}

interface WebOrderStyle extends ViewStyle {
  order: number;
}

const CELEBRATION_DURATION_MS = 2000;
const AWARD_PRIORITY: readonly AwardKind[] = [
  "lookout",
  "zeroBidRoyalty",
  "comeback",
  "reckless",
  "castaway",
];

function initialReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** Tracks live OS/browser motion changes and removes both listener API variants. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(initialReducedMotion);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    let query: MediaQueryList;
    try {
      query = window.matchMedia("(prefers-reduced-motion: reduce)");
    } catch {
      return;
    }

    const update = (event: MediaQueryListEvent) => setReduced(event.matches);
    setReduced(query.matches);

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", update);
      return () => query.removeEventListener("change", update);
    }

    if (typeof query.addListener === "function") {
      query.addListener(update);
      return () => query.removeListener(update);
    }
  }, []);

  return reduced;
}

function createConfettiParticles(): readonly ConfettiParticle[] {
  return Array.from({ length: 28 }, (_, index) => ({
    id: index,
    color: scoreSeriesColors[index % scoreSeriesColors.length],
    left: 3 + ((index * 37) % 94),
    size: 5 + (index % 3) * 2,
    drift: ((index * 29) % 81) - 40,
    fall: 255 + (index % 4) * 24,
    rotation: 240 + (index % 6) * 85,
    delayMs: 40 + (index % 7) * 65 + Math.floor(index / 7) * 20,
    durationMs: 1200 + (index % 5) * 55,
    round: index % 4 === 0,
  }));
}

function visualOrder(index: number): WebOrderStyle {
  return { order: index === 0 ? 2 : index === 1 ? 1 : 3 };
}

function medalForRank(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  return "🥉";
}

function stepHeight(rank: number): number {
  if (rank === 1) return 112;
  if (rank === 2) return 86;
  return 64;
}

function stepColor(rank: number): string {
  if (rank === 1) return colors.gold;
  if (rank === 2) return "#8fa8b8";
  return "#a86f45";
}

/** Top-three result treatment with accessible, motion-aware celebration. */
export default function Podium({ rows, awards }: Props) {
  const { t } = useI18n();
  const prefersReducedMotion = usePrefersReducedMotion();
  const visibleRows = rows.slice(0, 3);
  const orderedAwards = useMemo(
    () =>
      [...awards].sort(
        (left, right) =>
          AWARD_PRIORITY.indexOf(left.kind) - AWARD_PRIORITY.indexOf(right.kind)
      ),
    [awards]
  );

  const revealValuesRef = useRef<Animated.Value[] | null>(null);
  if (revealValuesRef.current === null) {
    revealValuesRef.current = [0, 1, 2].map(
      () => new Animated.Value(prefersReducedMotion ? 1 : 0)
    );
  }
  const revealValues = revealValuesRef.current;

  const confettiProgressRef = useRef<Animated.Value | null>(null);
  if (confettiProgressRef.current === null) {
    confettiProgressRef.current = new Animated.Value(0);
  }
  const confettiProgress = confettiProgressRef.current;

  const [particles] = useState<readonly ConfettiParticle[]>(() =>
    prefersReducedMotion ? [] : createConfettiParticles()
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const hasCelebratedRef = useRef(prefersReducedMotion);
  const entranceAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const confettiAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stopActiveMotion = () => {
      entranceAnimationRef.current?.stop();
      entranceAnimationRef.current = null;
      confettiAnimationRef.current?.stop();
      confettiAnimationRef.current = null;
      if (confettiTimerRef.current !== null) {
        clearTimeout(confettiTimerRef.current);
        confettiTimerRef.current = null;
      }
    };

    if (prefersReducedMotion) {
      stopActiveMotion();
      hasCelebratedRef.current = true;
      revealValues.forEach((value) => value.setValue(1));
      confettiProgress.setValue(1);
      setShowConfetti(false);
      return stopActiveMotion;
    }

    if (hasCelebratedRef.current) {
      revealValues.forEach((value) => value.setValue(1));
      setShowConfetti(false);
      return stopActiveMotion;
    }

    hasCelebratedRef.current = true;
    revealValues.forEach((value) => value.setValue(0));
    confettiProgress.setValue(0);

    entranceAnimationRef.current = Animated.stagger(
      115,
      revealValues.map((value) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        })
      )
    );
    entranceAnimationRef.current.start();

    if (particles.length > 0) {
      setShowConfetti(true);
      confettiAnimationRef.current = Animated.timing(confettiProgress, {
        toValue: 1,
        duration: CELEBRATION_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: false,
      });
      confettiAnimationRef.current.start();
      confettiTimerRef.current = setTimeout(() => {
        confettiTimerRef.current = null;
        setShowConfetti(false);
      }, CELEBRATION_DURATION_MS);
    }

    return stopActiveMotion;
  }, [confettiProgress, particles.length, prefersReducedMotion, revealValues]);

  return (
    <View style={styles.root}>
      <Text accessibilityRole="header" style={styles.heading}>
        {t.results.podiumTitle}
      </Text>

      <View style={styles.podiumRow}>
        {visibleRows.map((row, index) => {
          const reveal = revealValues[index];
          return (
            <Animated.View
              key={row.player.id}
              accessible
              accessibilityLabel={t.results.podiumPlace(
                row.rank,
                row.player.name,
                row.total
              )}
              style={[
                styles.podiumColumn,
                visualOrder(index),
                {
                  opacity: reveal,
                  transform: [
                    {
                      translateY: reveal.interpolate({
                        inputRange: [0, 1],
                        outputRange: [28, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.playerBlock}>
                <Text style={styles.medal}>{medalForRank(row.rank)}</Text>
                <Text numberOfLines={1} style={styles.playerName}>
                  {row.player.name}
                </Text>
                <Text style={styles.playerScore}>{row.total}</Text>
              </View>
              <View
                style={[
                  styles.step,
                  {
                    height: stepHeight(row.rank),
                    backgroundColor: stepColor(row.rank),
                  },
                ]}
              >
                <Text style={styles.stepRank}>{row.rank}</Text>
              </View>
            </Animated.View>
          );
        })}

        {visibleRows.length === 2 ? (
          <View
            accessible={false}
            style={[styles.podiumColumn, visualOrder(2)]}
          />
        ) : null}
      </View>

      {orderedAwards.length > 0 ? (
        <View style={styles.awardsSection}>
          <Text accessibilityRole="header" style={styles.awardsTitle}>
            {t.awards.title}
          </Text>
          <View style={styles.awardsRow}>
            {orderedAwards.map((award) => (
              <View key={award.kind} style={styles.awardItem}>
                <Text style={styles.awardName}>{t.awards.names[award.kind]}</Text>
                <Text numberOfLines={1} style={styles.awardPlayer}>
                  {award.playerName}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {showConfetti && particles.length > 0 ? (
        <View
          pointerEvents="none"
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          aria-hidden
          style={styles.confettiOverlay}
        >
          {particles.map((particle) => {
            const start = particle.delayMs / CELEBRATION_DURATION_MS;
            const end = Math.min(
              0.97,
              (particle.delayMs + particle.durationMs) /
                CELEBRATION_DURATION_MS
            );
            const enter = start + 0.035;
            const fade = end - 0.08;
            const opacity = confettiProgress.interpolate({
              inputRange: [0, start, enter, fade, end, 1],
              outputRange: [0, 0, 1, 1, 0, 0],
              extrapolate: "clamp",
            });
            const translateY = confettiProgress.interpolate({
              inputRange: [0, start, end, 1],
              outputRange: [-20, -20, particle.fall, particle.fall],
              extrapolate: "clamp",
            });
            const translateX = confettiProgress.interpolate({
              inputRange: [0, start, end, 1],
              outputRange: [0, 0, particle.drift, particle.drift],
              extrapolate: "clamp",
            });
            const rotate = confettiProgress.interpolate({
              inputRange: [0, start, end, 1],
              outputRange: [
                "0deg",
                "0deg",
                `${particle.rotation}deg`,
                `${particle.rotation}deg`,
              ],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={particle.id}
                style={[
                  styles.confettiParticle,
                  {
                    left: `${particle.left}%`,
                    width: particle.size,
                    height: particle.size * 1.7,
                    borderRadius: particle.round ? particle.size : 1,
                    backgroundColor: particle.color,
                    opacity,
                    transform: [{ translateX }, { translateY }, { rotate }],
                  },
                ]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: "stretch",
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  heading: {
    color: colors.gold,
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  podiumRow: {
    direction: "ltr",
    flexDirection: "row",
    alignItems: "flex-end",
    width: "100%",
    minHeight: 218,
  },
  podiumColumn: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0,
    alignItems: "stretch",
    justifyContent: "flex-end",
    paddingHorizontal: 3,
  },
  playerBlock: {
    alignItems: "center",
    minWidth: 0,
    paddingHorizontal: 2,
    marginBottom: 6,
  },
  medal: {
    fontSize: 27,
    lineHeight: 33,
  },
  playerName: {
    alignSelf: "stretch",
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
    writingDirection: "auto",
  },
  playerScore: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    marginTop: 1,
  },
  step: {
    alignItems: "center",
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingTop: spacing.sm,
    shadowColor: colors.bg,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },
  stepRank: {
    color: colors.bg,
    fontSize: 24,
    fontWeight: "900",
  },
  awardsSection: {
    marginTop: spacing.lg,
  },
  awardsTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
  awardsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.xs,
  },
  awardItem: {
    minWidth: 138,
    maxWidth: "100%",
    flexGrow: 1,
    borderStartWidth: 2,
    borderStartColor: colors.goldDim,
    paddingStart: spacing.sm,
    paddingEnd: spacing.md,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  awardName: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "800",
  },
  awardPlayer: {
    color: colors.textDim,
    fontSize: 13,
    writingDirection: "auto",
    marginTop: 2,
  },
  confettiOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    overflow: "hidden",
  },
  confettiParticle: {
    position: "absolute",
    top: -12,
  },
});
