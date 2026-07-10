import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { LootUse, Player, RoundEntries } from "../types";
import { lootAllianceSucceeded, madeBid } from "../scoring";
import { colors, radius, spacing } from "../theme";
import { useI18n } from "../i18n/context";

interface Props {
  players: Player[];
  entries: RoundEntries;
  lootUses: LootUse[];
  roundRecorded: boolean;
  legacyLootCount?: number;
  onChange: (next: LootUse[]) => void;
  style?: StyleProp<ViewStyle>;
}

let lootIdCounter = 0;
const newLootId = () => `loot_${Date.now()}_${lootIdCounter++}`;

export default function LootTracker({
  players,
  entries,
  lootUses,
  roundRecorded,
  legacyLootCount = 0,
  onChange,
  style,
}: Props) {
  const { t } = useI18n();
  const playerById = new Map(players.map((player) => [player.id, player]));

  const updateUse = (id: string, patch: Partial<LootUse>) =>
    onChange(
      lootUses.map((lootUse) =>
        lootUse.id === id ? { ...lootUse, ...patch } : lootUse
      )
    );

  const removeUse = (id: string) =>
    onChange(lootUses.filter((lootUse) => lootUse.id !== id));

  const addUse = () => {
    if (lootUses.length >= 2) return;
    onChange([
      ...lootUses,
      { id: newLootId(), playedById: null, boundToId: null },
    ]);
  };

  const hasIncompleteUse = lootUses.some(
    (lootUse) => lootUse.playedById === null || lootUse.boundToId === null
  );

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.title}>⚓ {t.loot.title}</Text>
          <Text style={styles.hint}>{t.loot.hint}</Text>
        </View>
        {legacyLootCount === 0 && lootUses.length < 2 ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={addUse}
            accessibilityRole="button"
            accessibilityLabel={t.loot.record}
          >
            <Text style={styles.addButtonText}>{t.loot.record}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {legacyLootCount > 0 ? (
        <Text style={styles.legacyNotice}>{t.loot.legacyNotice}</Text>
      ) : null}

      {lootUses.map((lootUse, index) => {
        const playedBy = lootUse.playedById
          ? playerById.get(lootUse.playedById)
          : undefined;
        const boundTo = lootUse.boundToId
          ? playerById.get(lootUse.boundToId)
          : undefined;
        const isComplete = !!playedBy && !!boundTo;
        const isSelfWin =
          isComplete && lootUse.playedById === lootUse.boundToId;
        const succeeded =
          isComplete && lootAllianceSucceeded(entries, lootUse);
        const missedNames =
          isComplete && !isSelfWin
            ? [playedBy, boundTo]
                .filter(
                  (player): player is Player =>
                    !!player && !madeBid(entries[player.id])
                )
                .map((player) => player.name)
                .join(", ")
            : "";

        return (
          <View key={lootUse.id} style={styles.use}>
            <View style={styles.useHeader}>
              <Text style={styles.useTitle}>{t.loot.useNumber(index + 1)}</Text>
              <TouchableOpacity
                onPress={() => removeUse(lootUse.id)}
                accessibilityRole="button"
                accessibilityLabel={t.loot.removeLabel(index + 1)}
                hitSlop={8}
              >
                <Text style={styles.removeText}>{t.loot.remove}</Text>
              </TouchableOpacity>
            </View>

            {!playedBy ? (
              <PlayerPicker
                prompt={t.loot.playedByPrompt}
                players={players}
                onSelect={(playerId) =>
                  updateUse(lootUse.id, {
                    playedById: playerId,
                    boundToId: null,
                  })
                }
              />
            ) : !boundTo ? (
              <>
                <View style={styles.singlePlayer}>
                  <Text style={styles.playerName}>{playedBy.name}</Text>
                  <Text style={styles.playerRole}>{t.loot.playedByRole}</Text>
                </View>
                <PlayerPicker
                  prompt={t.loot.winnerPrompt}
                  players={players}
                  onSelect={(playerId) =>
                    updateUse(lootUse.id, { boundToId: playerId })
                  }
                />
              </>
            ) : (
              <>
                <View style={styles.pairRow}>
                  <View style={styles.playerIdentity}>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {playedBy.name}
                    </Text>
                    <Text style={styles.playerRole}>{t.loot.playedByRole}</Text>
                  </View>
                  <Text style={styles.link}>↔</Text>
                  <View style={styles.playerIdentity}>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {boundTo.name}
                    </Text>
                    <Text style={styles.playerRole}>{t.loot.winnerRole}</Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.status,
                    isSelfWin
                      ? styles.statusNeutral
                      : roundRecorded
                        ? succeeded
                          ? styles.statusSuccess
                          : styles.statusFailed
                        : styles.statusPending,
                  ]}
                >
                  {isSelfWin
                    ? t.loot.selfWin(playedBy.name)
                    : roundRecorded
                      ? succeeded
                        ? t.loot.success
                        : t.loot.failed(missedNames)
                      : t.loot.pendingPair(playedBy.name, boundTo.name)}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    updateUse(lootUse.id, {
                      playedById: null,
                      boundToId: null,
                    })
                  }
                  accessibilityRole="button"
                  style={styles.changeButton}
                >
                  <Text style={styles.changeText}>{t.loot.change}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        );
      })}

      {hasIncompleteUse ? (
        <Text style={styles.incomplete}>⚠ {t.loot.incomplete}</Text>
      ) : lootUses.length === 2 ? (
        <Text style={styles.maxRecorded}>{t.loot.maxRecorded}</Text>
      ) : null}
    </View>
  );
}

function PlayerPicker({
  prompt,
  players,
  onSelect,
}: {
  prompt: string;
  players: Player[];
  onSelect: (playerId: string) => void;
}) {
  return (
    <View>
      <Text style={styles.prompt}>{prompt}</Text>
      <View style={styles.playerChoices}>
        {players.map((player) => (
          <TouchableOpacity
            key={player.id}
            style={styles.playerChoice}
            onPress={() => onSelect(player.id)}
            accessibilityRole="button"
            accessibilityLabel={`${prompt} ${player.name}`}
          >
            <Text style={styles.playerChoiceText} numberOfLines={1}>
              {player.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    backgroundColor: colors.bgElevated,
    borderColor: colors.goldDim,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headingCopy: { flex: 1, marginRight: spacing.md },
  title: { color: colors.gold, fontSize: 16, fontWeight: "800" },
  hint: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.xs,
  },
  addButton: {
    backgroundColor: colors.gold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  addButtonText: { color: colors.bg, fontSize: 12, fontWeight: "800" },
  legacyNotice: {
    color: colors.gold,
    fontSize: 11,
    lineHeight: 15,
    marginTop: spacing.sm,
  },
  use: {
    borderTopColor: colors.cardBorder,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
  },
  useHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  useTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  removeText: { color: colors.negative, fontSize: 12, fontWeight: "700" },
  prompt: { color: colors.text, fontSize: 13, marginBottom: spacing.sm },
  playerChoices: { flexDirection: "row", flexWrap: "wrap" },
  playerChoice: {
    maxWidth: 140,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    marginRight: 6,
    marginBottom: 6,
  },
  playerChoiceText: { color: colors.text, fontSize: 12, fontWeight: "700" },
  singlePlayer: {
    borderLeftColor: colors.gold,
    borderLeftWidth: 2,
    paddingLeft: spacing.sm,
    marginBottom: spacing.md,
  },
  pairRow: { flexDirection: "row", alignItems: "center" },
  playerIdentity: { flex: 1, minWidth: 0 },
  playerName: { color: colors.text, fontSize: 15, fontWeight: "800" },
  playerRole: { color: colors.textDim, fontSize: 10, marginTop: 2 },
  link: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: "800",
    marginHorizontal: spacing.md,
  },
  status: { fontSize: 12, lineHeight: 16, marginTop: spacing.sm },
  statusPending: { color: colors.gold },
  statusSuccess: { color: colors.positive },
  statusFailed: { color: colors.negative },
  statusNeutral: { color: colors.textDim },
  changeButton: { alignSelf: "flex-start", marginTop: spacing.sm },
  changeText: { color: colors.gold, fontSize: 12, fontWeight: "700" },
  incomplete: {
    color: colors.negative,
    fontSize: 12,
    lineHeight: 16,
    marginTop: spacing.sm,
  },
  maxRecorded: { color: colors.textDim, fontSize: 11, marginTop: spacing.sm },
});
