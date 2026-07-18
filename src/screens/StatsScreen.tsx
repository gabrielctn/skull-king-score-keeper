import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { browserLocale, useI18n } from "../i18n/context";
import { getResponsiveLayout } from "../responsive";
import { aggregateStats, PlayerStats, Rate } from "../stats";
import { colors, radius, spacing } from "../theme";
import { Game } from "../types";

interface Props {
  gameHistory: Game[];
  onBack: () => void;
}

const rankMedal = (rank: number) =>
  rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : String(rank);

export default function StatsScreen({ gameHistory, onBack }: Props) {
  const { t, lang } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  const snapshot = useMemo(() => aggregateStats(gameHistory), [gameHistory]);
  const [selectedIdentity, setSelectedIdentity] = useState<string | null>(null);
  const backButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const selected =
    snapshot.players.find((player) => player.identity === selectedIdentity) ?? null;

  useEffect(() => {
    if (!selected) return;
    AccessibilityInfo.announceForAccessibility(t.stats.playerTitle(selected.name));
    const focusTimer = setTimeout(() => {
      const focusable = backButtonRef.current as unknown as {
        focus?: () => void;
      } | null;
      focusable?.focus?.();
    }, 0);
    return () => clearTimeout(focusTimer);
  }, [selected, t]);

  const locale = browserLocale(lang);
  const percent = (rate: number | null) =>
    rate === null
      ? t.stats.unavailable
      : new Intl.NumberFormat(locale, {
          style: "percent",
          maximumFractionDigits: 0,
        }).format(rate);
  const number = (value: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
  const date = (value: number) =>
    new Date(value).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const goBack = () => {
    if (selected) setSelectedIdentity(null);
    else onBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View
        style={[
          styles.header,
          {
            maxWidth: layout.formMaxWidth,
            paddingHorizontal: layout.screenPadding,
          },
        ]}
      >
        <TouchableOpacity
          ref={backButtonRef}
          onPress={goBack}
          style={styles.backButton}
          accessibilityRole="button"
        >
          <Text style={styles.back}>‹ {t.common.back}</Text>
        </TouchableOpacity>
        <Text
          style={styles.title}
          numberOfLines={1}
          accessibilityRole="header"
          accessibilityLiveRegion="polite"
        >
          {selected ? t.stats.playerTitle(selected.name) : t.stats.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            maxWidth: layout.formMaxWidth,
            padding: layout.screenPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {snapshot.players.length === 0 ? (
          <EmptyState />
        ) : selected ? (
          <PlayerDetail
            player={selected}
            percent={percent}
            number={number}
            date={date}
          />
        ) : (
          <>
            <View style={styles.hero}>
              <Text style={styles.heroIcon}>🏆</Text>
              <Text style={styles.heroTitle}>{t.stats.groupTitle}</Text>
            </View>

            <Text style={styles.sectionTitle}>{t.stats.leaderboard}</Text>
            <View style={styles.card}>
              {snapshot.players.map((player, index) => (
                <TouchableOpacity
                  key={player.identity}
                  style={[
                    styles.leaderRow,
                    index < snapshot.players.length - 1 && styles.rowBorder,
                  ]}
                  onPress={() => setSelectedIdentity(player.identity)}
                  accessibilityRole="button"
                  accessibilityLabel={`${player.name}. ${t.stats.playerSummary(
                    player.gamesPlayed,
                    player.wins
                  )}`}
                >
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{rankMedal(index + 1)}</Text>
                  </View>
                  <View style={styles.leaderCopy}>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {player.name}
                    </Text>
                    <Text style={styles.playerSummary}>
                      {t.stats.playerSummary(player.gamesPlayed, player.wins)}
                    </Text>
                  </View>
                  <View style={styles.rateColumn}>
                    <Text style={styles.rateValue}>{percent(player.winRate)}</Text>
                    <Text style={styles.rateLabel}>{t.stats.winRate}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>{t.stats.records}</Text>
            <View style={styles.recordGrid}>
              <RecordCard
                icon="👑"
                label={t.stats.bestFinalScore}
                value={
                  snapshot.records.bestFinalScore
                    ? t.stats.scoreRecordHolder(
                        snapshot.records.bestFinalScore.name,
                        snapshot.records.bestFinalScore.score,
                        date(snapshot.records.bestFinalScore.playedAt)
                      )
                    : t.stats.unavailable
                }
              />
              <RecordCard
                icon="🌊"
                label={t.stats.worstRound}
                value={
                  snapshot.records.worstRound
                    ? t.stats.roundRecordHolder(
                        snapshot.records.worstRound.name,
                        snapshot.records.worstRound.score,
                        snapshot.records.worstRound.roundNumber,
                        date(snapshot.records.worstRound.playedAt)
                      )
                    : t.stats.unavailable
                }
              />
              <RecordCard
                icon="🎯"
                label={t.stats.bestExactBid}
                value={
                  snapshot.records.bestExactBidRate
                    ? t.stats.rateRecordHolder(
                        snapshot.records.bestExactBidRate.name,
                        percent(snapshot.records.bestExactBidRate.rate),
                        snapshot.records.bestExactBidRate.successes,
                        snapshot.records.bestExactBidRate.attempts
                      )
                    : t.stats.unavailable
                }
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState() {
  const { t } = useI18n();
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🗺️</Text>
      <Text style={styles.emptyTitle}>{t.stats.emptyTitle}</Text>
      <Text style={styles.emptyBody}>{t.stats.emptyBody}</Text>
    </View>
  );
}

function RecordCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.recordCard}>
      <Text style={styles.recordIcon}>{icon}</Text>
      <Text style={styles.recordLabel}>{label}</Text>
      <Text style={styles.recordValue}>{value}</Text>
    </View>
  );
}

function PlayerDetail({
  player,
  percent,
  number,
  date,
}: {
  player: PlayerStats;
  percent: (value: number | null) => string;
  number: (value: number) => string;
  date: (value: number) => string;
}) {
  const { t } = useI18n();
  const rateValue = (rate: Rate) => percent(rate.rate);
  const rateCaption = (rate: Rate) =>
    rate.attempts > 0
      ? t.stats.bidSummary(rate.successes, rate.attempts)
      : t.stats.unavailable;

  return (
    <>
      <View style={styles.playerHero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {Array.from(player.name.trim())[0]?.toLocaleUpperCase() ?? "☠"}
          </Text>
        </View>
        <Text style={styles.detailName}>{player.name}</Text>
        <Text style={styles.detailSummary}>
          {t.stats.playerSummary(player.gamesPlayed, player.wins)}
        </Text>
      </View>

      <View style={styles.metricGrid}>
        <Metric label={t.stats.gamesPlayed} value={String(player.gamesPlayed)} />
        <Metric label={t.stats.wins} value={String(player.wins)} />
        <Metric label={t.stats.winRate} value={percent(player.winRate)} />
        <Metric
          label={t.stats.exactBidRate}
          value={rateValue(player.exactBids)}
          caption={rateCaption(player.exactBids)}
        />
        <Metric
          label={t.stats.zeroBidRate}
          value={rateValue(player.zeroBids)}
          caption={rateCaption(player.zeroBids)}
        />
        <Metric label={t.stats.averagePoints} value={number(player.averagePoints)} />
        <Metric
          label={t.stats.bestScore}
          value={
            player.bestFinalScore === null
              ? t.stats.unavailable
              : String(player.bestFinalScore)
          }
        />
        <Metric label={t.stats.winStreak} value={String(player.currentWinStreak)} />
      </View>

      <Text style={styles.sectionTitle}>{t.stats.recentGames}</Text>
      <View style={styles.card}>
        {player.recentGames.map((game, index) => (
          <View
            key={`${game.gameId}_${game.playerId}_${index}`}
            style={[
              styles.recentRow,
              index < player.recentGames.length - 1 && styles.rowBorder,
            ]}
          >
            <Text style={styles.recentMedal}>{rankMedal(game.rank)}</Text>
            <View style={styles.recentCopy}>
              <Text style={styles.recentDate}>
                {t.stats.recentGame(
                  date(game.playedAt),
                  game.rank,
                  game.finalScore
                )}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

function Metric({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {caption ? <Text style={styles.metricCaption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    width: "100%",
    alignSelf: "center",
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: { width: 92, minHeight: 44, justifyContent: "center" },
  back: { color: colors.gold, fontSize: 17 },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  headerSpacer: { width: 92 },
  scroll: {
    width: "100%",
    alignSelf: "center",
    paddingBottom: spacing.xl,
  },
  hero: { alignItems: "center", marginBottom: spacing.xl },
  heroIcon: { fontSize: 56, lineHeight: 66 },
  heroTitle: {
    color: colors.gold,
    fontSize: 27,
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  leaderRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  rankBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgElevated,
  },
  rankText: { color: colors.gold, fontSize: 19, fontWeight: "800" },
  leaderCopy: { flex: 1, minWidth: 0, marginStart: spacing.sm },
  playerName: { color: colors.text, fontSize: 17, fontWeight: "800" },
  playerSummary: { color: colors.textDim, fontSize: 12, marginTop: 3 },
  rateColumn: { alignItems: "flex-end", marginStart: spacing.sm },
  rateValue: { color: colors.positive, fontSize: 16, fontWeight: "800" },
  rateLabel: { color: colors.textDim, fontSize: 10, marginTop: 2 },
  chevron: { color: colors.goldDim, fontSize: 25, marginStart: spacing.sm },
  recordGrid: { marginHorizontal: -spacing.xs },
  recordCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  recordIcon: { fontSize: 24 },
  recordLabel: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "800",
    marginTop: spacing.sm,
  },
  recordValue: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  empty: {
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: { fontSize: 58 },
  emptyTitle: {
    color: colors.gold,
    fontSize: 25,
    fontWeight: "800",
    textAlign: "center",
    marginTop: spacing.md,
  },
  emptyBody: {
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  playerHero: { alignItems: "center", marginBottom: spacing.lg },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderColor: colors.goldDim,
    borderWidth: 2,
  },
  avatarText: { color: colors.gold, fontSize: 34, fontWeight: "800" },
  detailName: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    marginTop: spacing.sm,
  },
  detailSummary: { color: colors.textDim, fontSize: 14, marginTop: 4 },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.xs,
  },
  metric: {
    width: "48%",
    minHeight: 116,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: "1%",
    marginBottom: spacing.sm,
  },
  metricLabel: { color: colors.textDim, fontSize: 12, lineHeight: 16 },
  metricValue: {
    color: colors.gold,
    fontSize: 25,
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  metricCaption: { color: colors.textDim, fontSize: 11, marginTop: 3 },
  recentRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  recentMedal: { width: 36, color: colors.gold, fontSize: 18 },
  recentCopy: { flex: 1, minWidth: 0 },
  recentDate: { color: colors.text, fontSize: 13, fontWeight: "700" },
});
