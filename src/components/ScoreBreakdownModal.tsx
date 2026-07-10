import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Game } from "../types";
import {
  PlayerRoundScoreBreakdown,
  ScoreBreakdownItem,
  playerScoreHistory,
} from "../scoring";
import { Strings } from "../i18n/types";
import { useI18n } from "../i18n/context";
import { illustrations } from "../assets/illustrations";
import { colors, radius, spacing } from "../theme";
import { getResponsiveLayout } from "../responsive";

interface Props {
  visible: boolean;
  game: Game;
  playerId: string | null;
  onClose: () => void;
}

const signed = (value: number) => `${value > 0 ? "+" : ""}${value}`;

function itemLabel(
  item: ScoreBreakdownItem,
  round: PlayerRoundScoreBreakdown,
  copy: Strings["scoreBreakdown"]
): string {
  if (item.key === "bid") {
    if (round.bid === 0) {
      return round.madeBid
        ? copy.zeroBidSuccess(round.cardsDealt)
        : copy.zeroBidMissed(round.cardsDealt);
    }
    return round.madeBid
      ? copy.bidSuccess(round.bid)
      : copy.bidMissed(round.bid, Math.abs(round.tricks - round.bid));
  }

  const labels: Record<Exclude<ScoreBreakdownItem["key"], "bid">, string> = {
    colored14: copy.items.colored14(item.count),
    black14: copy.items.black14,
    mermaidByPirate: copy.items.mermaidByPirate(item.count),
    pirateBySkullKing: copy.items.pirateBySkullKing(item.count),
    mermaidCapturesSkullKing: copy.items.mermaidCapturesSkullKing,
    rascalWager: round.madeBid
      ? copy.items.rascalWon
      : copy.items.rascalLost,
    expansion7: copy.items.expansion7(item.count),
    expansion8: copy.items.expansion8(item.count),
    davyJonesLeviathans: copy.items.davyJonesLeviathans(item.count),
    secondCaptured: copy.items.secondCaptured,
    legacyLoot: copy.items.legacyLoot(item.count),
    loot: item.applied
      ? copy.items.loot(item.count)
      : copy.items.lootMissed(item.count),
    lootSelfWin: copy.items.lootSelfWin(item.count),
  };
  return labels[item.key];
}

export default function ScoreBreakdownModal({
  visible,
  game,
  playerId,
  onClose,
}: Props) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  const player = game.players.find((candidate) => candidate.id === playerId);
  const history = useMemo(
    () => (playerId ? playerScoreHistory(game, playerId) : []),
    [game, playerId]
  );
  const [expandedRound, setExpandedRound] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const shouldRevealLatest = useRef(false);
  const latestRoundY = useRef<number | null>(null);

  useEffect(() => {
    if (visible) {
      shouldRevealLatest.current = history.length > 0;
      setExpandedRound(
        history.length > 0 ? history[history.length - 1].roundNumber : null
      );
    }
  }, [visible, playerId, history.length]);

  const totals = useMemo(
    () =>
      history.reduce(
        (sum, round) => {
          for (const item of round.items) {
            if (item.points > 0) sum.earned += item.points;
            if (item.points < 0) sum.lost += item.points;
          }
          return sum;
        },
        { earned: 0, lost: 0 }
      ),
    [history]
  );
  const total =
    history.length > 0 ? history[history.length - 1].runningTotal : 0;

  const revealLatestRound = (y?: number) => {
    if (typeof y === "number") latestRoundY.current = y;
    if (!shouldRevealLatest.current || latestRoundY.current === null) return;
    shouldRevealLatest.current = false;
    scrollRef.current?.scrollTo({
      y: Math.max(0, latestRoundY.current - spacing.xs),
      animated: false,
    });
  };

  if (!player) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, layout.isTablet && styles.backdropWide]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessible={false}
        />
        <View
          style={[styles.sheet, layout.isTablet && styles.sheetWide]}
          accessibilityViewIsModal
        >
          {!layout.isTablet ? <View style={styles.grabber} /> : null}

          <View style={styles.header}>
            <View style={styles.identity}>
              <Image
                source={illustrations.compass}
                style={styles.compass}
                resizeMode="contain"
              />
              <View style={styles.identityCopy}>
                <Text style={styles.eyebrow}>{t.scoreBreakdown.title}</Text>
                <Text style={styles.playerName} numberOfLines={1}>
                  {player.name}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={t.scoreBreakdown.close}
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summary}>
            <View style={styles.totalBlock}>
              <Text style={styles.summaryLabel}>
                {t.scoreBreakdown.currentScore}
              </Text>
              <Text
                style={[
                  styles.scoreTotal,
                  total < 0 ? styles.negativeText : styles.positiveText,
                ]}
              >
                {total}
              </Text>
            </View>
            <View style={styles.ledger}>
              <View style={styles.ledgerColumn}>
                <Text style={styles.ledgerLabel}>{t.scoreBreakdown.earned}</Text>
                <Text style={[styles.ledgerValue, styles.positiveText]}>
                  {signed(totals.earned)}
                </Text>
              </View>
              <View style={styles.ledgerColumn}>
                <Text style={styles.ledgerLabel}>{t.scoreBreakdown.lost}</Text>
                <Text style={[styles.ledgerValue, styles.negativeText]}>
                  {totals.lost}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.hint}>{t.scoreBreakdown.recordedHint}</Text>

          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => revealLatestRound()}
          >
            <Text style={styles.sectionTitle}>
              {t.scoreBreakdown.historyTitle}
            </Text>

            {history.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyMark}>—</Text>
                <Text style={styles.emptyText}>{t.scoreBreakdown.noRounds}</Text>
              </View>
            ) : (
              history.map((round, index) => {
                const open = expandedRound === round.roundNumber;
                const last = index === history.length - 1;
                return (
                  <View
                    key={round.roundNumber}
                    style={styles.roundRow}
                    onLayout={
                      last
                        ? (event) =>
                            revealLatestRound(event.nativeEvent.layout.y)
                        : undefined
                    }
                  >
                    <View style={styles.timeline}>
                      <View
                        style={[
                          styles.timelineDot,
                          round.madeBid
                            ? styles.timelineDotExact
                            : styles.timelineDotMissed,
                        ]}
                      />
                      {!last ? <View style={styles.timelineLine} /> : null}
                    </View>

                    <View style={[styles.roundBody, last && styles.lastRoundBody]}>
                      <TouchableOpacity
                        style={styles.roundHeader}
                        activeOpacity={0.72}
                        onPress={() =>
                          setExpandedRound(open ? null : round.roundNumber)
                        }
                        accessibilityRole="button"
                        accessibilityState={{ expanded: open }}
                        accessibilityLabel={`${t.scoreBreakdown.round(
                          round.roundNumber
                        )} · ${t.scoreBreakdown.roundSummary(
                          round.bid,
                          round.tricks
                        )} · ${
                          round.madeBid
                            ? t.scoreBreakdown.exact
                            : t.scoreBreakdown.missed
                        } · ${signed(round.total)}`}
                        accessibilityHint={
                          open
                            ? t.scoreBreakdown.collapseRound(round.roundNumber)
                            : t.scoreBreakdown.expandRound(round.roundNumber)
                        }
                      >
                        <View style={styles.roundCopy}>
                          <View style={styles.roundTitleRow}>
                            <Text style={styles.roundTitle}>
                              {t.scoreBreakdown.round(round.roundNumber)}
                            </Text>
                            <View
                              style={[
                                styles.statusBadge,
                                round.madeBid
                                  ? styles.statusExact
                                  : styles.statusMissed,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusText,
                                  round.madeBid
                                    ? styles.positiveText
                                    : styles.negativeText,
                                ]}
                              >
                                {round.madeBid
                                  ? t.scoreBreakdown.exact
                                  : t.scoreBreakdown.missed}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.roundSummary}>
                            {t.scoreBreakdown.roundSummary(
                              round.bid,
                              round.tricks
                            )}
                          </Text>
                        </View>
                        <View style={styles.roundScoreBlock}>
                          <Text
                            style={[
                              styles.roundScore,
                              round.total < 0
                                ? styles.negativeText
                                : styles.positiveText,
                            ]}
                          >
                            {signed(round.total)}
                          </Text>
                          <Text style={[styles.chevron, open && styles.chevronOpen]}>
                            ›
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {open ? (
                        <View style={styles.details}>
                          {round.items.map((item, itemIndex) => (
                            <View
                              key={`${item.key}_${itemIndex}`}
                              style={[
                                styles.detailLine,
                                itemIndex > 0 && styles.detailDivider,
                              ]}
                            >
                              <View style={styles.detailLabelBlock}>
                                <Text
                                  style={[
                                    styles.detailLabel,
                                    !item.applied && styles.ignoredText,
                                  ]}
                                >
                                  {itemLabel(item, round, t.scoreBreakdown)}
                                </Text>
                                {!item.applied ? (
                                  <Text style={styles.ignoredCaption}>
                                    {t.scoreBreakdown.ignored}
                                  </Text>
                                ) : null}
                              </View>
                              <Text
                                style={[
                                  styles.detailPoints,
                                  item.points > 0 && styles.positiveText,
                                  item.points < 0 && styles.negativeText,
                                  item.points === 0 && styles.ignoredText,
                                ]}
                              >
                                {signed(item.points)}
                              </Text>
                            </View>
                          ))}
                          <View style={styles.runningTotal}>
                            <Text style={styles.runningLabel}>
                              {t.scoreBreakdown.runningTotal}
                            </Text>
                            <Text style={styles.runningValue}>
                              {round.runningTotal}
                            </Text>
                          </View>
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  backdropWide: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  sheet: {
    width: "100%",
    maxHeight: "91%",
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: "hidden",
  },
  sheetWide: {
    maxWidth: 680,
    maxHeight: "86%",
    borderRadius: radius.lg,
  },
  grabber: {
    width: 42,
    height: 4,
    alignSelf: "center",
    borderRadius: 2,
    backgroundColor: colors.cardBorder,
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  identity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  compass: { width: 48, height: 48, marginRight: spacing.sm },
  identityCopy: { flex: 1, minWidth: 0 },
  eyebrow: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  playerName: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "800",
  },
  closeButton: {
    width: 38,
    height: 38,
    marginLeft: spacing.sm,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.bgElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 29,
    fontWeight: "300",
  },
  summary: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    flexDirection: "row",
    alignItems: "stretch",
  },
  totalBlock: {
    minWidth: 132,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: "center",
  },
  summaryLabel: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  scoreTotal: { fontSize: 38, lineHeight: 43, fontWeight: "900" },
  ledger: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.cardBorder,
  },
  ledgerColumn: { flex: 1, alignItems: "center", paddingHorizontal: 4 },
  ledgerLabel: { color: colors.textDim, fontSize: 11, marginBottom: 2 },
  ledgerValue: { fontSize: 16, fontWeight: "800" },
  hint: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.cardBorder,
  },
  emptyMark: { color: colors.goldDim, fontSize: 28, marginBottom: spacing.xs },
  emptyText: { color: colors.textDim, fontSize: 14, textAlign: "center" },
  roundRow: { flexDirection: "row" },
  timeline: { width: 24, alignSelf: "stretch", alignItems: "center" },
  timelineDot: {
    width: 9,
    height: 9,
    marginTop: 24,
    borderRadius: 5,
    borderWidth: 2,
    zIndex: 1,
  },
  timelineDotExact: {
    borderColor: colors.positive,
    backgroundColor: colors.bg,
  },
  timelineDotMissed: {
    borderColor: colors.negative,
    backgroundColor: colors.bg,
  },
  timelineLine: {
    position: "absolute",
    top: 32,
    bottom: -24,
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.cardBorder,
  },
  roundBody: {
    flex: 1,
    minWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  lastRoundBody: { borderBottomWidth: 0 },
  roundHeader: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingLeft: spacing.xs,
  },
  roundCopy: { flex: 1, minWidth: 0 },
  roundTitleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  roundTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginRight: spacing.sm,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  statusExact: { backgroundColor: "rgba(92, 214, 160, 0.12)" },
  statusMissed: { backgroundColor: "rgba(255, 107, 107, 0.12)" },
  statusText: { fontSize: 10, fontWeight: "800" },
  roundSummary: { color: colors.textDim, fontSize: 12, marginTop: 3 },
  roundScoreBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: spacing.sm,
  },
  roundScore: { fontSize: 18, fontWeight: "900", minWidth: 42, textAlign: "right" },
  chevron: {
    color: colors.textDim,
    fontSize: 23,
    lineHeight: 25,
    marginLeft: spacing.sm,
    transform: [{ rotate: "90deg" }],
  },
  chevronOpen: { transform: [{ rotate: "-90deg" }] },
  details: {
    backgroundColor: colors.bgElevated,
    borderLeftWidth: 2,
    borderLeftColor: colors.goldDim,
    borderRadius: radius.sm,
    marginLeft: spacing.xs,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  detailLine: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 7,
  },
  detailDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.cardBorder,
  },
  detailLabelBlock: { flex: 1, minWidth: 0, paddingRight: spacing.sm },
  detailLabel: { color: colors.text, fontSize: 12, lineHeight: 16 },
  detailPoints: { fontSize: 13, fontWeight: "800", textAlign: "right" },
  ignoredText: { color: colors.textDim },
  ignoredCaption: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 1,
  },
  runningTotal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingVertical: spacing.sm,
  },
  runningLabel: { color: colors.gold, fontSize: 11, fontWeight: "700" },
  runningValue: { color: colors.gold, fontSize: 15, fontWeight: "900" },
  positiveText: { color: colors.positive },
  negativeText: { color: colors.negative },
});
