import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BonusInput, Game, RoundEntries, RoundEntry } from "../types";
import {
  cardsForRound,
  emptyEntry,
  isRoundComplete,
  playerTotal,
  scoreRound,
  standings,
} from "../scoring";
import Stepper from "../components/Stepper";
import BonusEditor from "../components/BonusEditor";
import RulesModal from "../components/RulesModal";
import { colors, radius, spacing } from "../theme";

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
  const tricksMatch = tricksTotal === cards;
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
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.sideBtn}>
          <Text style={styles.headerBtn}>‹ Home</Text>
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
            <Text style={styles.roundTitle}>Round {displayRound}</Text>
            <Text style={styles.roundCards}>cards dealt</Text>
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

      <ScrollView contentContainerStyle={styles.scroll}>
        {game.players.map((p) => {
          const entry = draft[p.id] ?? emptyEntry();
          const roundScore = scoreRound(cards, entry);
          const open = !!expanded[p.id];
          return (
            <View key={p.id} style={styles.playerCard}>
              <View style={styles.playerHeader}>
                <Text style={styles.playerName} numberOfLines={1}>
                  {p.name}
                </Text>
                <View style={styles.playerScores}>
                  <Text
                    style={[
                      styles.roundScore,
                      roundScore >= 0 ? styles.pos : styles.neg,
                    ]}
                  >
                    {roundScore >= 0 ? "+" : ""}
                    {roundScore}
                  </Text>
                  <Text style={styles.totalScore}>
                    {playerTotal(game, p.id)} total
                  </Text>
                </View>
              </View>

              <View style={styles.steppers}>
                <Stepper
                  label="Bid"
                  value={Math.min(entry.bid, cards)}
                  min={0}
                  max={cards}
                  onChange={(v) => update(p.id, "bid", v)}
                  compact
                />
                <Stepper
                  label="Won"
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
                    Bonus {open ? "▾" : "▸"}
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
          style={[styles.tricksHint, tricksMatch ? styles.hintOk : styles.hintWarn]}
        >
          Tricks recorded: {tricksTotal} / {cards}
          {tricksMatch ? "  ✓" : "  (should equal cards dealt, unless a Kraken voided a trick)"}
        </Text>
      </ScrollView>

      <View style={styles.boardStrip}>
        {board.map((row) => (
          <View key={row.player.id} style={styles.boardItem}>
            <Text style={styles.boardName} numberOfLines={1}>
              {row.player.name}
            </Text>
            <Text style={styles.boardTotal}>{row.total}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.scoreBtn} onPress={commitRound}>
          <Text style={styles.scoreBtnText}>
            {displayRound === game.totalRounds && !alreadyRecorded
              ? "Finish game 🏁"
              : alreadyRecorded
                ? "Update round"
                : "Score round →"}
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
  scroll: { padding: spacing.md, paddingBottom: spacing.sm },
  playerCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
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
  hintOk: { color: colors.positive },
  hintWarn: { color: colors.textDim },
  boardStrip: {
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
  footer: { padding: spacing.md },
  scoreBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  scoreBtnText: { color: colors.bg, fontSize: 18, fontWeight: "800" },
});
