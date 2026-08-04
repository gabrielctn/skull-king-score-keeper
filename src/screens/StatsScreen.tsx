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
import {
  aggregateStats,
  MIN_RATED_ROUNDS,
  MIN_ZERO_BIDS,
  PlayerStats,
  Rate,
  StatsSnapshot,
} from "../stats";
import { colors, radius, spacing } from "../theme";
import { Game } from "../types";
import GlassSurface from "../components/GlassSurface";

interface Props {
  gameHistory: Game[];
  /** Name of the shared game table these stats belong to, if any. */
  tableName?: string | null;
  onBack: () => void;
}

/** Bragging rights are gold; the records nobody wants are red. */
type RecordTone = "fame" | "shame";

/** Everything one record card shows, already formatted for display. */
interface RecordCardData {
  key: string;
  icon: string;
  label: string;
  /** Plain-words statement of exactly what the app measured. */
  hint: string;
  /** Null until somebody actually qualifies for the record. */
  holder: {
    name: string;
    value: string;
    unit?: string;
    /** Where and when it happened, or the sample it rests on. */
    meta?: string;
  } | null;
}

interface Formatters {
  percent: (rate: number | null) => string;
  number: (value: number) => string;
  integer: (value: number) => string;
  date: (value: number) => string;
}

const rankMedal = (rank: number) =>
  rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : String(rank);

/** A rate as a bar width, clamped so bad data cannot overflow the track. */
const barWidth = (rate: number): `${number}%` =>
  `${Math.max(0, Math.min(100, Math.round(rate * 100)))}%` as `${number}%`;

export default function StatsScreen({ gameHistory, tableName, onBack }: Props) {
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
  const integer = (value: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
  const date = (value: number) =>
    new Date(value).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const format: Formatters = { percent, number, integer, date };

  const goBack = () => {
    if (selected) setSelectedIdentity(null);
    else onBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        stickyHeaderIndices={[0]}
        contentContainerStyle={[
          styles.scroll,
          {
            maxWidth: layout.formMaxWidth,
            paddingHorizontal: layout.screenPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerLayer} pointerEvents="box-none">
          <GlassSurface
            intensity={72}
            style={[
              styles.header,
              { paddingHorizontal: layout.screenPadding },
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
            <View style={styles.titleBlock}>
              <Text
                style={styles.title}
                numberOfLines={1}
                accessibilityRole="header"
                accessibilityLiveRegion="polite"
              >
                {selected ? t.stats.playerTitle(selected.name) : t.stats.title}
              </Text>
              {!selected && tableName ? (
                <Text style={styles.tableName} numberOfLines={1}>
                  ⚓ {tableName}
                </Text>
              ) : null}
            </View>
            <View style={styles.headerSpacer} />
          </GlassSurface>
        </View>

        <View
          style={[
            styles.statsContent,
            { paddingTop: layout.screenPadding },
          ]}
        >
        {snapshot.players.length === 0 ? (
          <EmptyState />
        ) : selected ? (
          <PlayerDetail player={selected} format={format} />
        ) : (
          <CrewRecords
            snapshot={snapshot}
            format={format}
            twoColumns={layout.isTablet}
            onSelect={setSelectedIdentity}
          />
        )}
        </View>
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

function CrewRecords({
  snapshot,
  format,
  twoColumns,
  onSelect,
}: {
  snapshot: StatsSnapshot;
  format: Formatters;
  twoColumns: boolean;
  onSelect: (identity: string) => void;
}) {
  const { t } = useI18n();
  const { percent, number, integer, date } = format;
  const { records, summary, players } = snapshot;

  const fame: RecordCardData[] = [
    {
      key: "bestFinalScore",
      icon: "👑",
      label: t.stats.bestFinalScore,
      hint: t.stats.bestFinalScoreHint,
      holder: records.bestFinalScore && {
        name: records.bestFinalScore.name,
        value: integer(records.bestFinalScore.score),
        unit: t.stats.unitPoints,
        meta: date(records.bestFinalScore.playedAt),
      },
    },
    {
      key: "biggestRound",
      icon: "💰",
      label: t.stats.biggestRound,
      hint: t.stats.biggestRoundHint,
      holder: records.biggestRound && {
        name: records.biggestRound.name,
        value: integer(records.biggestRound.score),
        unit: t.stats.unitPoints,
        meta: t.stats.roundMeta(
          records.biggestRound.roundNumber,
          date(records.biggestRound.playedAt)
        ),
      },
    },
    {
      key: "bestExactBid",
      icon: "🎯",
      label: t.stats.bestExactBid,
      hint: t.stats.bestExactBidHint(MIN_RATED_ROUNDS),
      holder: records.bestExactBidRate && {
        name: records.bestExactBidRate.name,
        value: percent(records.bestExactBidRate.rate),
        meta: t.stats.sampleMeta(
          records.bestExactBidRate.successes,
          records.bestExactBidRate.attempts
        ),
      },
    },
    {
      key: "zeroBidMaster",
      icon: "🕳️",
      label: t.stats.zeroBidMaster,
      hint: t.stats.zeroBidMasterHint(MIN_ZERO_BIDS),
      holder: records.zeroBidMaster && {
        name: records.zeroBidMaster.name,
        value: percent(records.zeroBidMaster.rate),
        meta: t.stats.sampleMeta(
          records.zeroBidMaster.successes,
          records.zeroBidMaster.attempts
        ),
      },
    },
    {
      key: "longestStreak",
      icon: "🔥",
      label: t.stats.longestStreak,
      hint: t.stats.longestStreakHint,
      holder: records.longestStreak && {
        name: records.longestStreak.name,
        value: integer(records.longestStreak.streak),
        unit: t.stats.unitWins(records.longestStreak.streak),
      },
    },
    {
      key: "biggestComeback",
      icon: "🧭",
      label: t.stats.biggestComeback,
      hint: t.stats.biggestComebackHint,
      holder: records.biggestComeback && {
        name: records.biggestComeback.name,
        value: integer(records.biggestComeback.placesGained),
        unit: t.stats.unitPlaces(records.biggestComeback.placesGained),
        meta: t.stats.comebackMeta(
          records.biggestComeback.fromRank,
          records.biggestComeback.toRank,
          date(records.biggestComeback.playedAt)
        ),
      },
    },
    {
      key: "biggestBonusHaul",
      icon: "💎",
      label: t.stats.biggestBonusHaul,
      hint: t.stats.biggestBonusHaulHint,
      holder: records.biggestBonusHaul && {
        name: records.biggestBonusHaul.name,
        value: integer(records.biggestBonusHaul.score),
        unit: t.stats.unitPoints,
        meta: date(records.biggestBonusHaul.playedAt),
      },
    },
  ];

  const shame: RecordCardData[] = [
    {
      key: "worstFinalScore",
      icon: "💀",
      label: t.stats.worstFinalScore,
      hint: t.stats.worstFinalScoreHint,
      holder: records.worstFinalScore && {
        name: records.worstFinalScore.name,
        value: integer(records.worstFinalScore.score),
        unit: t.stats.unitPoints,
        meta: date(records.worstFinalScore.playedAt),
      },
    },
    {
      key: "worstRound",
      icon: "🌊",
      label: t.stats.worstRound,
      hint: t.stats.worstRoundHint,
      holder: records.worstRound && {
        name: records.worstRound.name,
        value: integer(records.worstRound.score),
        unit: t.stats.unitPoints,
        meta: t.stats.roundMeta(
          records.worstRound.roundNumber,
          date(records.worstRound.playedAt)
        ),
      },
    },
    {
      key: "mostLastPlaces",
      icon: "🪝",
      label: t.stats.mostLastPlaces,
      hint: t.stats.mostLastPlacesHint,
      holder: records.mostLastPlaces && {
        name: records.mostLastPlaces.name,
        value: integer(records.mostLastPlaces.count),
        unit: t.stats.unitGames(records.mostLastPlaces.count),
        meta: t.stats.lastPlaceMeta(
          percent(records.mostLastPlaces.count / records.mostLastPlaces.outOf),
          records.mostLastPlaces.outOf
        ),
      },
    },
    {
      key: "boldestBidder",
      icon: "💣",
      label: t.stats.boldestBidder,
      hint: t.stats.boldestBidderHint,
      holder: records.boldestBidder && {
        name: records.boldestBidder.name,
        value: percent(records.boldestBidder.aggression),
        meta: t.stats.appetiteMeta(
          number(records.boldestBidder.averageBid),
          records.boldestBidder.roundsPlayed
        ),
      },
    },
  ];

  return (
    <>
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🏆</Text>
        <Text style={styles.heroTitle}>{t.stats.groupTitle}</Text>
      </View>

      <View style={styles.summaryRow}>
        <SummaryTile
          icon="🗓️"
          value={integer(summary.totalGames)}
          label={t.stats.totalGames}
        />
        <SummaryTile
          icon="🎴"
          value={integer(summary.totalRounds)}
          label={t.stats.totalRounds}
        />
        <SummaryTile
          icon="💰"
          value={integer(summary.totalPlunder)}
          label={t.stats.totalPlunder}
        />
        <SummaryTile
          icon="🏴‍☠️"
          value={integer(summary.totalPlayers)}
          label={t.stats.totalPlayers}
        />
      </View>

      <Text style={styles.sectionTitle}>{t.stats.leaderboard}</Text>
      <View style={styles.card}>
        {players.map((player, index) => (
          <TouchableOpacity
            key={player.identity}
            style={[
              styles.leaderRow,
              index < players.length - 1 && styles.rowBorder,
            ]}
            onPress={() => onSelect(player.identity)}
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
              <View style={styles.winBarTrack}>
                <View
                  style={[
                    styles.winBarFill,
                    { width: barWidth(player.winRate) },
                  ]}
                />
              </View>
            </View>
            <View style={styles.rateColumn}>
              <Text style={styles.rateValue}>{percent(player.winRate)}</Text>
              <Text style={styles.rateLabel}>{t.stats.winRate}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>{t.stats.hallOfFame}</Text>
      <View style={styles.recordGrid}>
        {fame.map((record) => (
          <RecordCard
            key={record.key}
            record={record}
            tone="fame"
            twoColumns={twoColumns}
          />
        ))}
      </View>

      <Text style={[styles.sectionTitle, styles.sectionTitleShame]}>
        {t.stats.hallOfShame}
      </Text>
      <View style={styles.recordGrid}>
        {shame.map((record) => (
          <RecordCard
            key={record.key}
            record={record}
            tone="shame"
            twoColumns={twoColumns}
          />
        ))}
      </View>
    </>
  );
}

function RecordCard({
  record,
  tone,
  twoColumns,
}: {
  record: RecordCardData;
  tone: RecordTone;
  twoColumns: boolean;
}) {
  const { t } = useI18n();
  const shame = tone === "shame";
  const { holder } = record;
  // A record without a unit must not leave a gap before the full stop, which
  // some screen readers voice as an extra pause.
  const spokenValue = holder
    ? [holder.value, holder.unit].filter(Boolean).join(" ")
    : t.stats.recordUnclaimed;
  const spoken = holder
    ? `${record.label}: ${holder.name}, ${spokenValue}. ${record.hint}`
    : `${record.label}: ${spokenValue}. ${record.hint}`;

  return (
    <View
      style={[
        styles.recordCard,
        shame && styles.recordCardShame,
        twoColumns && styles.recordCardHalf,
      ]}
      accessible
      accessibilityLabel={spoken}
    >
      <View style={styles.recordHead}>
        <View
          style={[
            styles.recordIconBadge,
            shame && styles.recordIconBadgeShame,
          ]}
        >
          <Text style={styles.recordIcon}>{record.icon}</Text>
        </View>
        <View style={styles.recordHeadCopy}>
          <Text style={[styles.recordLabel, shame && styles.recordLabelShame]}>
            {record.label}
          </Text>
          <Text style={styles.recordHint}>{record.hint}</Text>
        </View>
      </View>

      {holder ? (
        <>
          <View style={styles.recordValueRow}>
            <Text
              style={[styles.recordValue, shame && styles.recordValueShame]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {holder.value}
            </Text>
            {holder.unit ? (
              <Text style={styles.recordUnit}>{holder.unit}</Text>
            ) : null}
          </View>
          <Text style={styles.recordHolder} numberOfLines={1}>
            {holder.name}
          </Text>
          {holder.meta ? (
            <Text style={styles.recordMeta}>{holder.meta}</Text>
          ) : null}
        </>
      ) : (
        <Text style={styles.recordEmpty}>{t.stats.recordUnclaimed}</Text>
      )}
    </View>
  );
}

function SummaryTile({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.summaryTile}>
      <Text style={styles.summaryIcon}>{icon}</Text>
      <Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.summaryLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function PlayerDetail({
  player,
  format,
}: {
  player: PlayerStats;
  format: Formatters;
}) {
  const { t } = useI18n();
  const { percent, number, integer, date } = format;
  const rateCaption = (rate: Rate) =>
    rate.attempts > 0
      ? t.stats.bidSummary(rate.successes, rate.attempts)
      : t.stats.unavailable;
  const score = (value: number | null) =>
    value === null ? t.stats.unavailable : integer(value);

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

      <Text style={styles.sectionTitle}>{t.stats.metricsResults}</Text>
      <View style={styles.metricGrid}>
        <Metric label={t.stats.gamesPlayed} value={integer(player.gamesPlayed)} />
        <Metric label={t.stats.wins} value={integer(player.wins)} />
        <Metric
          label={t.stats.winRate}
          value={percent(player.winRate)}
          caption={t.stats.outOfGames(player.wins, player.gamesPlayed)}
        />
        <Metric
          label={t.stats.rivalsBeaten}
          value={percent(player.rivalsBeaten)}
          caption={t.stats.rivalsBeatenCaption}
        />
        <Metric
          label={t.stats.averageRank}
          value={
            player.gamesPlayed > 0
              ? number(player.averageRank)
              : t.stats.unavailable
          }
          caption={t.stats.seatsCaption(number(player.averageTableSize))}
        />
        <Metric
          label={t.stats.lastPlaces}
          value={integer(player.lastPlaces)}
          caption={t.stats.outOfGames(player.lastPlaces, player.gamesPlayed)}
        />
        <Metric
          label={t.stats.winStreak}
          value={integer(player.currentWinStreak)}
        />
        <Metric
          label={t.stats.longestWinStreak}
          value={integer(player.longestWinStreak)}
        />
      </View>

      <Text style={styles.sectionTitle}>{t.stats.metricsBidding}</Text>
      <View style={styles.metricGrid}>
        <Metric
          label={t.stats.exactBidRate}
          value={percent(player.exactBids.rate)}
          caption={rateCaption(player.exactBids)}
        />
        <Metric
          label={t.stats.zeroBidRate}
          value={percent(player.zeroBids.rate)}
          caption={rateCaption(player.zeroBids)}
        />
        <Metric
          label={t.stats.bidAppetite}
          value={percent(player.bidAggression)}
          caption={t.stats.bidCaption(number(player.averageBid))}
        />
        <Metric
          label={t.stats.roundsPlayed}
          value={integer(player.roundsPlayed)}
        />
      </View>

      <Text style={styles.sectionTitle}>{t.stats.metricsScoring}</Text>
      <View style={styles.metricGrid}>
        <Metric
          label={t.stats.averagePoints}
          value={number(player.averagePoints)}
          caption={t.stats.perGame}
        />
        <Metric
          label={t.stats.pointsPerRound}
          value={number(player.pointsPerRound)}
          caption={t.stats.perRound}
        />
        <Metric label={t.stats.bestScore} value={score(player.bestFinalScore)} />
        <Metric label={t.stats.worstScore} value={score(player.worstFinalScore)} />
        <Metric label={t.stats.bestRoundScore} value={score(player.bestRound)} />
        <Metric label={t.stats.worstRoundScore} value={score(player.worstRound)} />
        <Metric
          label={t.stats.bonusPoints}
          value={integer(player.bonusPoints)}
          caption={t.stats.fromSpecialCards}
        />
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
      <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {caption ? <Text style={styles.metricCaption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  headerLayer: {
    width: "100%",
    paddingTop: spacing.sm,
    zIndex: 20,
  },
  header: {
    width: "100%",
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.lg,
  },
  backButton: { width: 92, minHeight: 44, justifyContent: "center" },
  back: { color: colors.gold, fontSize: 17 },
  titleBlock: { flex: 1, alignItems: "center" },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  tableName: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  headerSpacer: { width: 92 },
  scroll: {
    width: "100%",
    alignSelf: "center",
  },
  statsContent: {
    width: "100%",
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
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitleShame: { color: colors.negative },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  leaderRow: {
    minHeight: 78,
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
  winBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.bgElevated,
    marginTop: 6,
    overflow: "hidden",
  },
  winBarFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.positive,
  },
  rateColumn: { alignItems: "flex-end", marginStart: spacing.sm },
  rateValue: { color: colors.positive, fontSize: 16, fontWeight: "800" },
  rateLabel: { color: colors.textDim, fontSize: 10, marginTop: 2 },
  chevron: { color: colors.goldDim, fontSize: 25, marginStart: spacing.sm },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.sm,
  },
  summaryTile: {
    width: "48%",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    marginHorizontal: "1%",
    marginBottom: spacing.sm,
    alignItems: "center",
  },
  summaryIcon: { fontSize: 18, marginBottom: 2 },
  summaryValue: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: "800",
  },
  summaryLabel: {
    color: colors.textDim,
    fontSize: 10,
    textAlign: "center",
    marginTop: 3,
    lineHeight: 13,
  },
  recordGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.xs,
  },
  recordCard: {
    width: "98%",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: "1%",
    marginBottom: spacing.sm,
  },
  recordCardHalf: { width: "48%" },
  recordCardShame: { borderColor: "rgba(255, 107, 107, 0.3)" },
  recordHead: { flexDirection: "row", alignItems: "flex-start" },
  recordIconBadge: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  recordIconBadgeShame: { borderColor: "rgba(255, 107, 107, 0.45)" },
  recordIcon: { fontSize: 20 },
  recordHeadCopy: { flex: 1, minWidth: 0, marginStart: spacing.sm },
  recordLabel: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  recordLabelShame: { color: colors.negative },
  recordHint: {
    color: colors.textDim,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  recordValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: spacing.md,
  },
  recordValue: {
    color: colors.gold,
    fontSize: 30,
    fontWeight: "800",
  },
  recordValueShame: { color: colors.negative },
  recordUnit: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: "700",
    marginStart: spacing.xs,
  },
  recordHolder: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 2,
  },
  recordMeta: { color: colors.textDim, fontSize: 11, marginTop: 3 },
  recordEmpty: {
    color: colors.textDim,
    fontSize: 14,
    fontStyle: "italic",
    marginTop: spacing.md,
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
    // No fixed height: a wrapped row already stretches to its tallest tile, so
    // a bare number tile no longer trails a block of empty card.
    minHeight: 92,
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
