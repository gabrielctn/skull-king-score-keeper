import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { BonusInput, Game, RoundEntries, RoundEntry } from "../types";
import {
  cardsForRound,
  emptyEntry,
  ghostTricks,
  isRoundComplete,
  playerTotal,
  scoreRound,
  standings,
} from "../scoring";
import { dealerIndex, playOrder } from "../turnOrder";
import { useI18n } from "../i18n/context";
import Stepper from "../components/Stepper";
import BonusEditor from "../components/BonusEditor";
import RulesModal from "../components/RulesModal";
import { colors, radius, spacing } from "../theme";
import { getResponsiveLayout } from "../responsive";

interface Props {
  game: Game;
  onUpdateGame: (game: Game) => void;
  onFinish: (game: Game) => void;
  onExit: () => void;
}

function cloneRound(round: RoundEntries, playerIds: string[]): RoundEntries {
  const out: RoundEntries = {};
  for (const id of playerIds) {
    const e = round?.[id];
    out[id] = e
      ? { ...e, bonus: { ...e.bonus } }
      : emptyEntry();
  }
  return out;
}

export default function GameScreen({
  game,
  onUpdateGame,
  onFinish,
  onExit,
}: Props) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  const playerIds = useMemo(() => game.players.map((p) => p.id), [game.players]);
  const [displayRound, setDisplayRound] = useState(
    Math.min(game.currentRound, game.totalRounds)
  );
  const [draft, setDraft] = useState<RoundEntries>(() =>
    cloneRound(game.rounds[displayRound - 1], playerIds)
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [rulesOpen, setRulesOpen] = useState(false);

  const cards = cardsForRound(game, displayRound);
  // Indicative dealer / first-trick order for the round being shown.
  const dealer = game.players[dealerIndex(game, displayRound)];
  const order = playOrder(game, displayRound);

  // Reseed the draft whenever the visible round changes.
  useEffect(() => {
    setDraft(cloneRound(game.rounds[displayRound - 1], playerIds));
  }, [displayRound, game.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (playerId: string, field: keyof RoundEntry, value: number) => {
    setDraft((prev) => {
      const capped =
        (field === "bid" || field === "tricks") && value > cards
          ? cards
          : value;
      return { ...prev, [playerId]: { ...prev[playerId], [field]: capped } };
    });
  };

  const updateBonus = (playerId: string, bonus: BonusInput) =>
    setDraft((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], bonus },
    }));

  const setCards = (value: number) => {
    const next: Game = {
      ...game,
      cardsDealt: game.cardsDealt.map((c, i) =>
        i === displayRound - 1 ? value : c
      ),
      updatedAt: Date.now(),
    };
    onUpdateGame(next);
  };

  const tricksTotal = playerIds.reduce(
    (sum, id) => sum + (draft[id]?.tricks ?? 0),
    0
  );
  // In the 2-player variant the Greybeard ghost steals the leftover tricks, so
  // the players' total may be below the cards dealt; only an impossible total
  // above the cards dealt is a problem.
  const ghost = ghostTricks(game, tricksTotal, cards);
  const tricksOk = game.twoPlayerGhost
    ? tricksTotal <= cards
    : tricksTotal === cards;
  const alreadyRecorded = isRoundComplete(game, displayRound);

  const commitRound = () => {
    const recordedRound: RoundEntries = {};
    for (const id of playerIds) {
      recordedRound[id] = { ...draft[id], recorded: true };
    }
    const rounds = game.rounds.map((r, i) =>
      i === displayRound - 1 ? recordedRound : r
    );
    const next: Game = { ...game, rounds, updatedAt: Date.now() };

    const allRecorded = next.rounds.every((r) =>
      playerIds.every((id) => r[id]?.recorded)
    );
    if (allRecorded) {
      next.status = "finished";
      next.currentRound = game.totalRounds;
      onUpdateGame(next);
      onFinish(next);
      return;
    }
    next.currentRound = Math.min(displayRound + 1, game.totalRounds);
    onUpdateGame(next);
    if (displayRound < game.totalRounds) setDisplayRound(displayRound + 1);
  };

  const board = standings(game);

  return (
    <SafeAreaView style={styles.safe}>
      <View
        style={[
          styles.header,
          {
            maxWidth: layout.gameContentMaxWidth,
            paddingHorizontal: layout.screenPadding,
          },
        ]}
      >
        <TouchableOpacity onPress={onExit} style={styles.sideBtn}>
          <Text style={styles.headerBtn}>‹ {t.common.home}</Text>
        </TouchableOpacity>
        <View style={styles.roundNav}>
          <TouchableOpacity
            onPress={() => setDisplayRound((r) => Math.max(1, r - 1))}
            disabled={displayRound <= 1}
          >
            <Text style={[styles.chevron, displayRound <= 1 && styles.disabled]}>
              ‹
            </Text>
          </TouchableOpacity>
          <View style={styles.roundInfo}>
            <Text style={styles.roundTitle}>{t.game.round(displayRound)}</Text>
            <Text style={styles.roundCards}>{t.game.cardsDealt}</Text>
            <Stepper value={cards} onChange={setCards} min={1} max={20} compact />
          </View>
          <TouchableOpacity
            onPress={() =>
              setDisplayRound((r) => Math.min(game.totalRounds, r + 1))
            }
            disabled={displayRound >= game.totalRounds}
          >
            <Text
              style={[
                styles.chevron,
                displayRound >= game.totalRounds && styles.disabled,
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => setRulesOpen(true)}
          style={[styles.sideBtn, { alignItems: "flex-end" }]}
        >
          <Text style={styles.help}>?</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.turnBanner,
          {
            maxWidth: layout.gameContentMaxWidth,
            paddingHorizontal: layout.screenPadding,
          },
        ]}
      >
        <Text style={styles.turnDealer}>
          🃏 <Text style={styles.turnDealerName}>{dealer.name}</Text>{" "}
          {t.game.dealsVerb}
        </Text>
        <View style={styles.turnOrderRow}>
          {order.map((slot, i) => (
            <React.Fragment key={i}>
              {i > 0 ? <Text style={styles.turnArrow}>›</Text> : null}
              <View
                style={[
                  styles.turnChip,
                  slot.kind === "ghost" && styles.turnChipGhost,
                  i === 0 && styles.turnChipLead,
                ]}
              >
                <Text
                  style={[
                    styles.turnChipText,
                    i === 0 && styles.turnChipLeadText,
                  ]}
                  numberOfLines={1}
                >
                  {slot.kind === "ghost"
                    ? `👻 ${t.game.ghostName}`
                    : slot.player.name}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>
        <Text style={styles.turnHint}>{t.game.playOrderHint}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            maxWidth: layout.gameContentMaxWidth,
            paddingHorizontal: layout.screenPadding,
          },
          layout.gameColumns === 2 && styles.scrollDesktop,
        ]}
      >
        {game.players.map((p) => {
          const entry = draft[p.id] ?? emptyEntry();
          const roundScore = scoreRound(cards, entry);
          const open = !!expanded[p.id];
          const b = entry.bonus;
          const entryTouched =
            entry.recorded ||
            entry.bid > 0 ||
            entry.tricks > 0 ||
            b.colored14 > 0 ||
            b.black14 ||
            b.mermaidByPirate > 0 ||
            b.pirateBySkullKing > 0 ||
            b.mermaidCapturesSkullKing ||
            b.loot > 0 ||
            b.rascalWager > 0;
          return (
            <View
              key={p.id}
              style={[
                styles.playerCard,
                layout.gameColumns === 2 && styles.playerCardDesktop,
              ]}
            >
              <View style={styles.playerHeader}>
                <Text style={styles.playerName} numberOfLines={1}>
                  {p.name}
                </Text>
                <View style={styles.playerScores}>
                  {entryTouched ? (
                    <Text
                      style={[
                        styles.roundScore,
                        roundScore >= 0 ? styles.pos : styles.neg,
                      ]}
                    >
                      {roundScore >= 0 ? "+" : ""}
                      {roundScore}
                    </Text>
                  ) : (
                    <Text style={[styles.roundScore, styles.scorePlaceholder]}>
                      —
                    </Text>
                  )}
                  <Text style={styles.totalScore}>
                    {t.game.total(playerTotal(game, p.id))}
                  </Text>
                </View>
              </View>

              <View style={styles.steppers}>
                <Stepper
                  label={t.game.bid}
                  value={Math.min(entry.bid, cards)}
                  min={0}
                  max={cards}
                  onChange={(v) => update(p.id, "bid", v)}
                  compact
                />
                <Stepper
                  label={t.game.won}
                  value={Math.min(entry.tricks, cards)}
                  min={0}
                  max={cards}
                  onChange={(v) => update(p.id, "tricks", v)}
                  compact
                />
                <TouchableOpacity
                  style={styles.bonusToggle}
                  onPress={() =>
                    setExpanded((prev) => ({ ...prev, [p.id]: !prev[p.id] }))
                  }
                >
                  <Text style={styles.bonusToggleText}>
                    {t.game.bonus} {open ? "▾" : "▸"}
                  </Text>
                </TouchableOpacity>
              </View>

              {open ? (
                <BonusEditor
                  bonus={entry.bonus}
                  advanced={game.advancedCards}
                  onChange={(b) => updateBonus(p.id, b)}
                />
              ) : null}
            </View>
          );
        })}

        <Text
          style={[
            styles.tricksHint,
            layout.gameColumns === 2 && styles.fullWidth,
            tricksOk ? styles.hintOk : styles.hintWarn,
          ]}
        >
          {t.game.tricksRecorded(tricksTotal, cards)}
          {game.twoPlayerGhost
            ? tricksOk
              ? t.game.ghostTook(ghost)
              : t.game.tricksWarnOver
            : tricksOk
              ? t.game.tricksOk
              : t.game.tricksWarnNormal}
        </Text>
      </ScrollView>

      <View
        style={[
          styles.boardStrip,
          {
            maxWidth: layout.gameContentMaxWidth,
            paddingHorizontal: layout.screenPadding,
          },
        ]}
      >
        {board.map((row) => (
          <View key={row.player.id} style={styles.boardItem}>
            <Text style={styles.boardName} numberOfLines={1}>
              {row.player.name}
            </Text>
            <Text style={styles.boardTotal}>{row.total}</Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.footer,
          {
            maxWidth: layout.gameContentMaxWidth,
            paddingHorizontal: layout.screenPadding,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.scoreBtn, layout.isTablet && styles.scoreBtnWide]}
          onPress={commitRound}
        >
          <Text style={styles.scoreBtnText}>
            {displayRound === game.totalRounds && !alreadyRecorded
              ? t.game.finish
              : alreadyRecorded
                ? t.game.updateRound
                : t.game.scoreRound}
          </Text>
        </TouchableOpacity>
      </View>

      <RulesModal visible={rulesOpen} onClose={() => setRulesOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  sideBtn: { width: 64 },
  headerBtn: { color: colors.gold, fontSize: 17 },
  help: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: "800",
    width: 30,
    height: 30,
    textAlign: "center",
    lineHeight: 28,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 15,
    overflow: "hidden",
  },
  roundNav: { flexDirection: "row", alignItems: "center" },
  chevron: {
    color: colors.gold,
    fontSize: 34,
    paddingHorizontal: spacing.sm,
    fontWeight: "700",
  },
  disabled: { opacity: 0.25 },
  roundInfo: { alignItems: "center", minWidth: 120 },
  roundTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
  roundCards: { color: colors.textDim, fontSize: 11, marginBottom: 2 },
  turnBanner: {
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  turnDealer: { color: colors.textDim, fontSize: 13 },
  turnDealerName: { color: colors.text, fontWeight: "800" },
  turnOrderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  turnArrow: { color: colors.textDim, fontSize: 16, marginHorizontal: 4 },
  turnChip: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    margin: 2,
    maxWidth: 130,
  },
  turnChipLead: { backgroundColor: colors.gold, borderColor: colors.gold },
  turnChipGhost: { borderColor: colors.accent, borderStyle: "dashed" },
  turnChipText: { color: colors.text, fontSize: 12, fontWeight: "700" },
  turnChipLeadText: { color: colors.bg },
  turnHint: {
    color: colors.textDim,
    fontSize: 10,
    marginTop: 4,
    fontStyle: "italic",
  },
  scroll: {
    width: "100%",
    alignSelf: "center",
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  scrollDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    columnGap: spacing.md,
  },
  playerCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  playerCardDesktop: {
    flexBasis: "48%",
    marginBottom: spacing.md,
  },
  playerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  playerName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
    marginRight: spacing.sm,
  },
  playerScores: { alignItems: "flex-end" },
  roundScore: { fontSize: 18, fontWeight: "800" },
  totalScore: { color: colors.textDim, fontSize: 12 },
  pos: { color: colors.positive },
  neg: { color: colors.negative },
  scorePlaceholder: { color: colors.textDim },
  steppers: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  bonusToggle: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.bgElevated,
  },
  bonusToggleText: { color: colors.gold, fontWeight: "700", fontSize: 13 },
  tricksHint: {
    textAlign: "center",
    fontSize: 12,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  fullWidth: { width: "100%" },
  hintOk: { color: colors.positive },
  hintWarn: { color: colors.textDim },
  boardStrip: {
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  boardItem: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    margin: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  boardName: { color: colors.textDim, fontSize: 12, maxWidth: 80 },
  boardTotal: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "800",
    marginLeft: spacing.xs,
  },
  footer: { width: "100%", alignSelf: "center", padding: spacing.md },
  scoreBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  scoreBtnWide: { alignSelf: "center", width: "100%", maxWidth: 440 },
  scoreBtnText: { color: colors.bg, fontSize: 18, fontWeight: "800" },
});
