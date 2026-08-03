import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  BonusInput,
  Game,
  LootUse,
  RascalBet,
  RoundEntries,
} from "../types";
import {
  RASCAL_POINTS_PER_CARD,
  activeLootUses,
  bonusCount,
  cardsForRound,
  emptyEntry,
  entryHasInput,
  ghostTricks,
  isRoundComplete,
  lootAvailable,
  lootBonusForPlayer,
  madeBid,
  scoreRound,
  standings,
} from "../scoring";
import { dealerIndex, playOrder } from "../turnOrder";
import { useI18n } from "../i18n/context";
import Stepper from "../components/Stepper";
import BonusEditor from "../components/BonusEditor";
import LootTracker from "../components/LootTracker";
import LootConfirmationModal from "../components/LootConfirmationModal";
import RulesModal from "../components/RulesModal";
import GameRulesModal from "../components/GameRulesModal";
import ScoreBreakdownModal from "../components/ScoreBreakdownModal";
import ShareLiveModal from "../components/ShareLiveModal";
import ScoreChart from "../components/ScoreChart";
import { MasterLiveState, liveSessionManager } from "../liveSession";
import { liveConfigured } from "../liveConfig";
import { colors, radius, spacing } from "../theme";
import { getResponsiveLayout } from "../responsive";
import { useKeepAwake } from "../wakeLock";
import GlassSurface from "../components/GlassSurface";

interface Props {
  game: Game;
  /** From the app settings: hold a screen wake lock while scoring. */
  keepAwake: boolean;
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

/**
 * Draft entries live in the same persisted structure as scored entries.  A
 * round only contributes to the score once every entry is explicitly marked
 * as recorded, so clearing this flag is what makes editing a scored round
 * safe.
 */
function unrecordRound(
  round: RoundEntries,
  playerIds: string[]
): RoundEntries {
  const out = cloneRound(round, playerIds);
  for (const id of playerIds) out[id].recorded = false;
  return out;
}

/** Return the earliest round that still needs to be scored. */
function firstUnrecordedRound(game: Game): number | null {
  for (let index = 0; index < game.totalRounds; index++) {
    const round = game.rounds[index];
    if (!game.players.every((player) => round?.[player.id]?.recorded)) {
      return index + 1;
    }
  }
  return null;
}

function roundHasInput(
  game: Game,
  roundNumber: number,
  round: RoundEntries
): boolean {
  if (isRoundComplete(game, roundNumber)) return true;
  if ((game.lootUses[roundNumber - 1] ?? []).length > 0) return true;
  if ((game.discardedTricks[roundNumber - 1] ?? 0) > 0) return true;
  return game.players.some((player) => {
    const entry = round[player.id];
    return Boolean(entry && entryHasInput(entry));
  });
}

/** Everything a round's controls and its "can this be scored?" checks need. */
interface RoundState {
  cards: number;
  /** Tricks destroyed by a Kraken, clamped to what the round could hold. */
  discardedTricks: number;
  tricksTotal: number;
  accountedTricks: number;
  /** Tricks the Greybeard ghost took (0 outside the 2-player variant). */
  ghost: number;
  /** True when the recorded tricks are a possible outcome for this round. */
  tricksOk: boolean;
  lootUses: LootUse[];
  /** A Loot card is on the table but its pair is not fully identified yet. */
  lootIncomplete: boolean;
  /** At least one complete alliance between two different players. */
  hasLootAlliance: boolean;
}

/**
 * Derive a round's state from a game and the entries being edited.
 *
 * Render reads this from props while the commit path reads it from the refs
 * holding the freshest values, so it takes both sources explicitly rather than
 * closing over either.
 */
function deriveRoundState(
  game: Game,
  entries: RoundEntries,
  roundNumber: number
): RoundState {
  const cards = cardsForRound(game, roundNumber);
  const discardedTricks = Math.min(
    cards,
    Math.max(0, game.discardedTricks[roundNumber - 1] ?? 0)
  );
  const tricksTotal = game.players.reduce(
    (sum, player) => sum + (entries[player.id]?.tricks ?? 0),
    0
  );
  const accountedTricks = tricksTotal + discardedTricks;
  const lootUses = activeLootUses(game, roundNumber);

  return {
    cards,
    discardedTricks,
    tricksTotal,
    accountedTricks,
    ghost: ghostTricks(game, tricksTotal, cards, discardedTricks),
    // In the 2-player variant the Greybeard ghost steals the leftover tricks,
    // so the players' total may be below the cards dealt; only an impossible
    // total above the cards dealt is a problem.
    tricksOk: game.twoPlayerGhost
      ? accountedTricks <= cards
      : accountedTricks === cards,
    lootUses,
    lootIncomplete: lootUses.some(
      (lootUse) => lootUse.playedById === null || lootUse.boundToId === null
    ),
    hasLootAlliance: lootUses.some(
      (lootUse) =>
        lootUse.playedById !== null &&
        lootUse.boundToId !== null &&
        lootUse.playedById !== lootUse.boundToId
    ),
  };
}

export default function GameScreen({
  game,
  keepAwake,
  onUpdateGame,
  onFinish,
  onExit,
}: Props) {
  const { t } = useI18n();
  useKeepAwake(keepAwake);
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  const playerIds = useMemo(() => game.players.map((p) => p.id), [game.players]);
  const [displayRound, setDisplayRound] = useState(
    Math.min(game.currentRound, game.totalRounds)
  );
  const [draft, setDraft] = useState<RoundEntries>(() =>
    cloneRound(game.rounds[displayRound - 1], playerIds)
  );
  // Event handlers can fire before a parent re-render has supplied the game we
  // just persisted. Keep immediate refs so consecutive edits always compose
  // instead of overwriting one another with an older prop/state snapshot.
  const latestGame = useRef(game);
  const receivedGame = useRef(game);
  const latestDraft = useRef(draft);
  if (receivedGame.current !== game) {
    receivedGame.current = game;
    latestGame.current = game;
  }
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [rulesOpen, setRulesOpen] = useState(false);
  const [gameRulesOpen, setGameRulesOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [liveState, setLiveState] = useState<MasterLiveState | null>(() =>
    liveConfigured() ? liveSessionManager().getState() : null
  );

  // Reflect the live-session state on the header pill (gold while sharing).
  useEffect(() => {
    if (!liveConfigured()) return;
    const manager = liveSessionManager();
    setLiveState(manager.getState());
    return manager.subscribe(setLiveState);
  }, []);
  const liveActive =
    liveState !== null &&
    liveState.gameId === game.id &&
    (liveState.status === "live" || liveState.status === "syncing");
  const [scorePlayerId, setScorePlayerId] = useState<string | null>(null);
  const [lootReviewOpen, setLootReviewOpen] = useState(false);
  const [untouchedReviewOpen, setUntouchedReviewOpen] = useState(false);
  const [lootReviewed, setLootReviewed] = useState(() =>
    isRoundComplete(game, displayRound)
  );
  const [draftRoundNumber, setDraftRoundNumber] = useState(displayRound);
  const [roundTouched, setRoundTouched] = useState(() =>
    roundHasInput(game, displayRound, draft)
  );

  // Indicative dealer / first-trick order for the round being shown.
  const dealer = game.players[dealerIndex(game, displayRound)];
  const order = playOrder(game, displayRound);

  // Reseed the draft whenever the visible round changes.
  useEffect(() => {
    const shownGame = latestGame.current;
    const shownDraft = cloneRound(
      shownGame.rounds[displayRound - 1],
      playerIds
    );
    latestDraft.current = shownDraft;
    setDraft(shownDraft);
    setDraftRoundNumber(displayRound);
    setLootReviewed(isRoundComplete(shownGame, displayRound));
    setLootReviewOpen(false);
    setUntouchedReviewOpen(false);
    setRoundTouched(roundHasInput(shownGame, displayRound, shownDraft));
  }, [displayRound, game.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Persist an editable round immediately. Optional round-level changes are
   * written in the same Game update so cards, Loot and Kraken state cannot get
   * out of sync with the bid/trick/bonus draft.
   */
  const persistDraft = (
    nextDraft: RoundEntries,
    updates: Partial<
      Pick<Game, "cardsDealt" | "lootUses" | "discardedTricks">
    > = {}
  ) => {
    const current = latestGame.current;
    const unrecordedDraft = unrecordRound(nextDraft, playerIds);
    const rounds = current.rounds.map((round, index) =>
      index === displayRound - 1 ? unrecordedDraft : round
    );
    const next: Game = {
      ...current,
      ...updates,
      rounds,
      status: "in_progress",
      updatedAt: Date.now(),
    };
    next.currentRound = firstUnrecordedRound(next) ?? next.totalRounds;

    latestDraft.current = unrecordedDraft;
    latestGame.current = next;
    setDraft(unrecordedDraft);
    setRoundTouched(true);
    onUpdateGame(next);
  };

  const update = (
    playerId: string,
    field: "bid" | "tricks",
    value: number
  ) => {
    setLootReviewed(false);
    const capped = Math.min(
      value,
      cardsForRound(latestGame.current, displayRound)
    );
    persistDraft({
      ...latestDraft.current,
      [playerId]: {
        ...latestDraft.current[playerId],
        [field]: capped,
      },
    });
  };

  const updateBonus = (playerId: string, bonus: BonusInput) =>
    persistDraft({
      ...latestDraft.current,
      [playerId]: { ...latestDraft.current[playerId], bonus },
    });

  const updateRascalBet = (playerId: string, rascalBet: RascalBet) =>
    persistDraft({
      ...latestDraft.current,
      [playerId]: { ...latestDraft.current[playerId], rascalBet },
    });

  const setCards = (value: number) => {
    setLootReviewed(false);
    const current = latestGame.current;
    const cappedDraft = cloneRound(latestDraft.current, playerIds);
    for (const id of playerIds) {
      cappedDraft[id].bid = Math.min(cappedDraft[id].bid, value);
      cappedDraft[id].tricks = Math.min(cappedDraft[id].tricks, value);
    }
    persistDraft(cappedDraft, {
      cardsDealt: current.cardsDealt.map((roundCards, index) =>
        index === displayRound - 1 ? value : roundCards
      ),
    });
  };

  const {
    cards,
    discardedTricks,
    accountedTricks,
    ghost,
    tricksOk,
    lootUses,
    lootIncomplete,
    hasLootAlliance,
  } = deriveRoundState(game, draft, displayRound);
  const roundReady = tricksOk;
  const alreadyRecorded = isRoundComplete(game, displayRound);
  const showLootTracker = lootAvailable(game);

  useEffect(() => {
    if (
      draftRoundNumber === displayRound &&
      roundReady &&
      hasLootAlliance &&
      !lootIncomplete &&
      !lootReviewed
    ) {
      setLootReviewOpen(true);
    }
  }, [
    displayRound,
    draftRoundNumber,
    hasLootAlliance,
    lootIncomplete,
    lootReviewed,
    roundReady,
  ]);

  const updateLootUses = (nextUses: LootUse[]) => {
    setLootReviewed(false);
    const current = latestGame.current;
    persistDraft(latestDraft.current, {
      lootUses: current.lootUses.map((roundUses, index) =>
        index === displayRound - 1 ? nextUses.slice(0, 2) : roundUses
      ),
    });
  };

  const toggleDiscardedTrick = () => {
    const current = latestGame.current;
    const nextCount =
      deriveRoundState(current, latestDraft.current, displayRound)
        .discardedTricks > 0
        ? 0
        : 1;
    persistDraft(latestDraft.current, {
      discardedTricks: current.discardedTricks.map((count, index) =>
        index === displayRound - 1 ? nextCount : count
      ),
    });
  };

  const commitRound = (allowUntouched = false) => {
    const current = latestGame.current;
    const currentDraft = cloneRound(latestDraft.current, playerIds);
    const round = deriveRoundState(current, currentDraft, displayRound);

    if (!round.tricksOk || round.lootIncomplete) return;
    if (
      !allowUntouched &&
      !roundTouched &&
      !isRoundComplete(current, displayRound)
    ) {
      setUntouchedReviewOpen(true);
      return;
    }
    if (round.hasLootAlliance && !lootReviewed) {
      setLootReviewOpen(true);
      return;
    }
    const recordedRound: RoundEntries = {};
    for (const id of playerIds) {
      recordedRound[id] = {
        ...currentDraft[id],
        bonus: { ...currentDraft[id].bonus },
        recorded: true,
      };
    }
    const rounds = current.rounds.map((round, index) =>
      index === displayRound - 1 ? recordedRound : round
    );
    const next: Game = { ...current, rounds, updatedAt: Date.now() };
    const nextRound = firstUnrecordedRound(next);

    latestDraft.current = recordedRound;
    latestGame.current = next;
    setDraft(recordedRound);
    if (nextRound === null) {
      next.status = "finished";
      next.currentRound = next.totalRounds;
      // Only the first completion counts: later corrections must not stretch
      // the reported duration by however long the review took.
      next.finishedAt = current.finishedAt ?? next.updatedAt;
      onUpdateGame(next);
      onFinish(next);
      return;
    }
    next.status = "in_progress";
    next.currentRound = nextRound;
    onUpdateGame(next);
    setDisplayRound(nextRound);
  };

  const board = standings(game);
  const roundNavigation = (
    <View style={[styles.roundNav, !layout.isTablet && styles.roundNavMobile]}>
      <TouchableOpacity
        style={styles.roundArrow}
        onPress={() => setDisplayRound((r) => Math.max(1, r - 1))}
        disabled={displayRound <= 1}
        accessibilityRole="button"
        accessibilityLabel={t.game.round(Math.max(1, displayRound - 1))}
        accessibilityState={{ disabled: displayRound <= 1 }}
      >
        <Text style={[styles.chevron, displayRound <= 1 && styles.disabled]}>
          ‹
        </Text>
      </TouchableOpacity>
      <View style={styles.roundInfo}>
        <Text style={styles.roundTitle}>{t.game.round(displayRound)}</Text>
        <Text style={styles.roundCards}>{t.game.cardsDealt}</Text>
        <Stepper
          value={cards}
          onChange={setCards}
          min={1}
          max={20}
          accessibilityLabel={t.game.cardsDealt}
          compact
        />
      </View>
      <TouchableOpacity
        style={styles.roundArrow}
        onPress={() =>
          setDisplayRound((r) => Math.min(game.totalRounds, r + 1))
        }
        disabled={displayRound >= game.totalRounds}
        accessibilityRole="button"
        accessibilityLabel={t.game.round(
          Math.min(game.totalRounds, displayRound + 1)
        )}
        accessibilityState={{ disabled: displayRound >= game.totalRounds }}
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
  );
  const scoreButton = (
    <TouchableOpacity
      style={[
        styles.scoreBtn,
        layout.isTablet && !layout.isDesktop && styles.scoreBtnWide,
        (!roundReady || lootIncomplete) && styles.scoreBtnDisabled,
      ]}
      onPress={() => commitRound()}
      disabled={!roundReady || lootIncomplete}
      accessibilityRole="button"
      accessibilityState={{ disabled: !roundReady || lootIncomplete }}
      aria-disabled={!roundReady || lootIncomplete}
    >
      <Text style={styles.scoreBtnText}>
        {displayRound === game.totalRounds && !alreadyRecorded
          ? t.game.finish
          : alreadyRecorded
            ? t.game.updateRound
            : t.game.scoreRound}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <GlassSurface
        intensity={42}
        style={[
          styles.header,
          {
            width: Math.max(
              0,
              layout.gameContentMaxWidth - layout.screenPadding * 2
            ),
            paddingHorizontal: layout.screenPadding,
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            onPress={onExit}
            style={styles.sideBtn}
            accessibilityRole="button"
            accessibilityLabel={t.common.home}
          >
            <Text style={styles.headerBtn}>‹ {t.common.home}</Text>
          </TouchableOpacity>
          {layout.isTablet ? roundNavigation : null}
          <View style={styles.sideActions}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => setGameRulesOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={t.gameSettings.open}
            >
              <Text style={styles.help}>⚙</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.livePill, liveActive && styles.livePillActive]}
              onPress={() => setShareOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={t.liveShare.open}
              accessibilityState={{ selected: liveActive }}
            >
              <Text
                style={[
                  styles.livePillText,
                  liveActive && styles.livePillTextActive,
                ]}
              >
                📡 {t.liveShare.badge}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => setRulesOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={t.rules.title}
            >
              <Text style={styles.help}>?</Text>
            </TouchableOpacity>
          </View>
        </View>
        {!layout.isTablet ? roundNavigation : null}
      </GlassSurface>

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
                  <Text
                    style={[
                      styles.turnChipNum,
                      i === 0 && styles.turnChipLeadText,
                    ]}
                  >
                    {i + 1}
                  </Text>{" "}
                  {slot.kind === "ghost"
                    ? `👻 ${t.game.ghostName}`
                    : slot.player.name}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>
        <Text style={styles.turnHint}>
          {t.game.playOrderLead(
            order[0]?.kind === "player" ? order[0].player.name : t.game.ghostName
          )}
        </Text>
        {game.scoringMode === "rascal" ? (
          <Text style={styles.rascalStake}>
            🎲 {t.game.rascalStake(RASCAL_POINTS_PER_CARD * cards)}
          </Text>
        ) : null}
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
        {showLootTracker ? (
          <LootTracker
            key={`${game.id}_${displayRound}`}
            players={game.players}
            entries={draft}
            lootUses={lootUses}
            roundRecorded={alreadyRecorded}
            legacyLootCount={playerIds.reduce(
              (total, id) => total + (draft[id]?.legacyLoot ?? 0),
              0
            )}
            onChange={updateLootUses}
            style={layout.gameColumns === 2 ? styles.fullWidth : undefined}
          />
        ) : null}

        {game.players.map((p) => {
          const entry = draft[p.id] ?? emptyEntry();
          const roundScore = scoreRound(
            cards,
            entry,
            lootBonusForPlayer(draft, lootUses, p.id),
            game.scoringMode,
            game.bonusesRequireBid
          );
          const open = !!expanded[p.id];
          const bonuses = bonusCount(entry.bonus);
          const showRoundScore =
            alreadyRecorded ||
            roundTouched ||
            entry.recorded ||
            entryHasInput(entry);
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
                  <Text style={styles.roundScoreLabel}>
                    {alreadyRecorded
                      ? t.game.roundPoints
                      : t.game.roundPointsPreview}
                  </Text>
                  {showRoundScore ? (
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
                      …
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.steppers}>
                <Stepper
                  label={t.game.bid}
                  accessibilityLabel={`${p.name} · ${t.game.bid}`}
                  value={Math.min(entry.bid, cards)}
                  min={0}
                  max={cards}
                  onChange={(v) => update(p.id, "bid", v)}
                  compact
                />
                <Stepper
                  label={t.game.won}
                  accessibilityLabel={`${p.name} · ${t.game.won}`}
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
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  accessibilityLabel={`${t.game.bonus} · ${p.name}${
                    bonuses > 0 ? ` · ${bonuses}` : ""
                  }`}
                >
                  <View style={styles.bonusToggleContent}>
                    <Text style={styles.bonusToggleText}>
                      {t.game.bonus} {open ? "▾" : "▸"}
                    </Text>
                    {bonuses > 0 ? (
                      <View style={styles.bonusBadge}>
                        <Text style={styles.bonusBadgeText}>{bonuses}</Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              </View>

              {game.scoringMode === "rascal" && game.rascalBets ? (
                <View
                  style={styles.betRow}
                  accessibilityRole="radiogroup"
                  accessibilityLabel={t.game.rascalBetFor(p.name)}
                >
                  {(["buckshot", "cannonball"] as const).map((bet) => {
                    const selected = entry.rascalBet === bet;
                    return (
                      <TouchableOpacity
                        key={bet}
                        style={[
                          styles.betChip,
                          selected && styles.betChipSelected,
                        ]}
                        onPress={() => updateRascalBet(p.id, bet)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        aria-checked={selected}
                      >
                        <Text
                          style={[
                            styles.betChipText,
                            selected && styles.betChipTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {bet === "buckshot" ? "🖐" : "✊"}{" "}
                          {t.game.rascalBetNames[bet]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}

              {open ? (
                <BonusEditor
                  bonus={entry.bonus}
                  advanced={game.advancedCards}
                  newExpansion={game.newExpansion}
                  bidMade={madeBid(entry)}
                  bonusesRequireBid={game.bonusesRequireBid}
                  onChange={(b) => updateBonus(p.id, b)}
                />
              ) : null}
            </View>
          );
        })}

        <TouchableOpacity
          style={[
            styles.krakenButton,
            layout.gameColumns === 2 && styles.fullWidth,
            discardedTricks > 0 && styles.krakenButtonActive,
          ]}
          onPress={toggleDiscardedTrick}
          accessibilityRole="button"
          accessibilityState={{ selected: discardedTricks > 0 }}
        >
          <Text
            style={[
              styles.krakenButtonText,
              discardedTricks > 0 && styles.krakenButtonTextActive,
            ]}
          >
            {discardedTricks > 0
              ? `✓ ${t.game.krakenRecorded}`
              : t.game.krakenRecord}
          </Text>
          {discardedTricks > 0 ? (
            <Text style={styles.krakenUndo}>{t.game.krakenUndo}</Text>
          ) : null}
        </TouchableOpacity>

        <Text
          style={[
            styles.tricksHint,
            layout.gameColumns === 2 && styles.fullWidth,
            tricksOk ? styles.hintOk : styles.hintWarn,
          ]}
        >
          {t.game.tricksRecorded(accountedTricks, cards)}
          {game.twoPlayerGhost
            ? tricksOk
              ? t.game.ghostTook(ghost)
              : t.game.tricksWarnOver
            : tricksOk
              ? t.game.tricksOk
              : t.game.tricksWarnNormal}
        </Text>

        <View
          style={[
            styles.totalScoreCard,
            layout.gameColumns === 2 && styles.fullWidth,
          ]}
        >
          <View style={styles.boardHeading}>
            <Text style={styles.boardTitle}>{t.game.totalScoreTitle}</Text>
            <Text style={styles.boardCaption}>
              {alreadyRecorded
                ? t.game.totalIncludesRound
                : t.game.totalExcludesRound}
            </Text>
          </View>

          <View style={styles.boardStrip}>
            {board.map((row) => (
              <TouchableOpacity
                key={row.player.id}
                style={styles.boardItem}
                activeOpacity={0.7}
                onPress={() => setScorePlayerId(row.player.id)}
                accessibilityRole="button"
                accessibilityLabel={t.scoreBreakdown.openRankedFor(
                  row.rank,
                  row.player.name,
                  row.total
                )}
              >
                <Text style={styles.boardName} numberOfLines={1}>
                  {row.player.name}
                </Text>
                <Text style={styles.boardTotal}>{row.total}</Text>
                <Text style={styles.boardInfo}>ⓘ</Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScoreChart game={game} />
        </View>
        {layout.isDesktop ? (
          <View style={[styles.footer, styles.footerDesktop, styles.fullWidth]}>
            {scoreButton}
          </View>
        ) : null}
      </ScrollView>

      {!layout.isDesktop ? (
        <View
          style={[
            styles.footer,
            {
              maxWidth: layout.gameContentMaxWidth,
              paddingHorizontal: layout.screenPadding,
            },
          ]}
        >
          {scoreButton}
        </View>
      ) : null}

      <RulesModal visible={rulesOpen} onClose={() => setRulesOpen(false)} />
      <GameRulesModal
        visible={gameRulesOpen}
        game={game}
        onClose={() => setGameRulesOpen(false)}
        onChange={onUpdateGame}
      />
      <ShareLiveModal
        visible={shareOpen}
        game={game}
        onClose={() => setShareOpen(false)}
      />
      <Modal
        visible={untouchedReviewOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setUntouchedReviewOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassSurface
            intensity={54}
            style={styles.confirmDialog}
            accessibilityRole="alert"
            accessibilityViewIsModal
          >
            <Text style={styles.confirmTitle}>{t.game.untouchedTitle}</Text>
            <Text style={styles.confirmMessage}>{t.game.untouchedMessage}</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancel}
                onPress={() => setUntouchedReviewOpen(false)}
                accessibilityRole="button"
              >
                <Text style={styles.confirmCancelText}>
                  {t.game.untouchedCancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmAccept}
                onPress={() => {
                  setUntouchedReviewOpen(false);
                  commitRound(true);
                }}
                accessibilityRole="button"
              >
                <Text style={styles.confirmAcceptText}>
                  {t.game.untouchedConfirm}
                </Text>
              </TouchableOpacity>
            </View>
          </GlassSurface>
        </View>
      </Modal>
      <ScoreBreakdownModal
        visible={scorePlayerId !== null}
        game={game}
        playerId={scorePlayerId}
        onClose={() => setScorePlayerId(null)}
      />
      <LootConfirmationModal
        visible={lootReviewOpen}
        players={game.players}
        entries={draft}
        lootUses={lootUses}
        onConfirm={() => {
          setLootReviewed(true);
          setLootReviewOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  header: {
    alignSelf: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    borderRadius: radius.lg,
  },
  headerTopRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideBtn: { flex: 1, minHeight: 44, justifyContent: "center" },
  sideActions: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    columnGap: spacing.sm,
  },
  headerBtn: { color: colors.gold, fontSize: 17 },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.controlBorder,
    borderRadius: 22,
  },
  help: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  livePill: {
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  livePillActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  livePillText: { color: colors.gold, fontSize: 13, fontWeight: "800" },
  livePillTextActive: { color: colors.bg },
  roundNav: { flexDirection: "row", alignItems: "center" },
  roundNavMobile: { alignSelf: "center", marginTop: spacing.xs },
  roundArrow: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: {
    color: colors.gold,
    fontSize: 34,
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
  turnChipNum: { color: colors.textDim, fontSize: 11, fontWeight: "900" },
  turnChipLeadText: { color: colors.bg },
  turnHint: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 4,
  },
  rascalStake: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "700",
    marginTop: spacing.xs,
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
    marginEnd: spacing.sm,
  },
  playerScores: { alignItems: "flex-end" },
  roundScoreLabel: {
    color: colors.textDim,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  roundScore: { fontSize: 18, fontWeight: "800" },
  pos: { color: colors.positive },
  neg: { color: colors.negative },
  scorePlaceholder: { color: colors.textDim },
  steppers: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    columnGap: spacing.xs,
  },
  bonusToggle: {
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    backgroundColor: colors.bgElevated,
  },
  bonusToggleContent: { flexDirection: "row", alignItems: "center" },
  bonusToggleText: { color: colors.gold, fontWeight: "700", fontSize: 13 },
  bonusBadge: {
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    borderRadius: 10,
    marginStart: spacing.xs,
    paddingHorizontal: 5,
  },
  bonusBadgeText: { color: colors.bg, fontSize: 11, fontWeight: "900" },
  betRow: {
    flexDirection: "row",
    marginTop: spacing.sm,
    columnGap: spacing.sm,
  },
  betChip: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.controlBorder,
    borderRadius: radius.sm,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.sm,
  },
  betChipSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.card,
  },
  betChipText: { color: colors.textDim, fontSize: 13, fontWeight: "700" },
  betChipTextSelected: { color: colors.gold },
  tricksHint: {
    textAlign: "center",
    fontSize: 12,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  fullWidth: { width: "100%" },
  krakenButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.controlBorder,
    borderRadius: radius.sm,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  krakenButtonActive: {
    borderColor: colors.positive,
    backgroundColor: colors.card,
  },
  krakenButtonText: { color: colors.gold, fontSize: 13, fontWeight: "800" },
  krakenButtonTextActive: { color: colors.positive },
  krakenUndo: {
    color: colors.textDim,
    fontSize: 11,
    marginStart: spacing.sm,
    textDecorationLine: "underline",
  },
  hintOk: { color: colors.positive },
  hintWarn: { color: colors.textDim },
  totalScoreCard: {
    width: "100%",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  boardHeading: {
    width: "100%",
    alignItems: "center",
  },
  boardTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  boardCaption: {
    color: colors.textDim,
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
  },
  boardStrip: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  boardItem: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    margin: 3,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
  },
  boardName: { color: colors.textDim, fontSize: 12, maxWidth: 80 },
  boardTotal: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "800",
    marginStart: spacing.xs,
  },
  boardInfo: { color: colors.gold, fontSize: 12, marginStart: 4 },
  footer: { width: "100%", alignSelf: "center", padding: spacing.md },
  footerDesktop: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: spacing.md,
  },
  scoreBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  scoreBtnWide: { alignSelf: "center", width: "100%", maxWidth: 440 },
  scoreBtnDisabled: { opacity: 0.45 },
  scoreBtnText: { color: colors.bg, fontSize: 18, fontWeight: "800" },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  confirmDialog: {
    width: "100%",
    maxWidth: 420,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  confirmTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
  confirmMessage: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  confirmActions: {
    marginTop: spacing.lg,
  },
  confirmCancel: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  confirmCancelText: { color: colors.text, fontSize: 14, fontWeight: "700" },
  confirmAccept: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  confirmAcceptText: { color: colors.bg, fontSize: 14, fontWeight: "800" },
});
