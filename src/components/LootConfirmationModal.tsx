import React, { useMemo } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { LootUse, Player, RoundEntries } from "../types";
import { lootAllianceSucceeded, madeBid } from "../scoring";
import { useI18n } from "../i18n/context";
import { colors, radius, spacing } from "../theme";
import { getResponsiveLayout } from "../responsive";

interface Props {
  visible: boolean;
  players: Player[];
  entries: RoundEntries;
  lootUses: LootUse[];
  onConfirm: () => void;
}

export default function LootConfirmationModal({
  visible,
  players,
  entries,
  lootUses,
  onConfirm,
}: Props) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  const playerById = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players]
  );
  const alliances = lootUses.filter(
    (lootUse) =>
      lootUse.playedById !== null &&
      lootUse.boundToId !== null &&
      lootUse.playedById !== lootUse.boundToId
  );
  const participantIds = Array.from(
    new Set(
      alliances.flatMap((lootUse) => [
        lootUse.playedById as string,
        lootUse.boundToId as string,
      ])
    )
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={() => undefined}
    >
      <View style={styles.backdrop}>
        <View
          style={[styles.sheet, layout.isTablet && styles.sheetWide]}
          accessibilityViewIsModal
        >
          <Text style={styles.eyebrow}>{t.lootConfirmation.eyebrow}</Text>
          <Text style={styles.title}>⚓ {t.lootConfirmation.title}</Text>
          <Text style={styles.intro}>
            {t.lootConfirmation.intro(participantIds.length)}
          </Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.players}>
              {participantIds.map((playerId) => {
                const player = playerById.get(playerId);
                const success = madeBid(entries[playerId]);
                if (!player) return null;
                return (
                  <View key={playerId} style={styles.playerRow}>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {player.name}
                    </Text>
                    <View
                      style={[
                        styles.bidStatus,
                        success ? styles.bidSuccess : styles.bidMissed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.bidStatusText,
                          success ? styles.successText : styles.missedText,
                        ]}
                      >
                        {success ? "✓ " : "× "}
                        {success
                          ? t.lootConfirmation.madeBid
                          : t.lootConfirmation.missedBid}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {alliances.map((lootUse, index) => {
              const playedBy = playerById.get(lootUse.playedById as string);
              const boundTo = playerById.get(lootUse.boundToId as string);
              const success = lootAllianceSucceeded(entries, lootUse);
              return (
                <View key={lootUse.id} style={styles.allianceRow}>
                  <Text style={styles.allianceNames} numberOfLines={1}>
                    {t.loot.useNumber(index + 1)} · {playedBy?.name} ↔{" "}
                    {boundTo?.name}
                  </Text>
                  <Text
                    style={[
                      styles.allianceResult,
                      success ? styles.successText : styles.missedText,
                    ]}
                  >
                    {success
                      ? t.lootConfirmation.allianceBonus
                      : t.lootConfirmation.noAllianceBonus}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={onConfirm}
            accessibilityRole="button"
          >
            <Text style={styles.confirmText}>
              {t.lootConfirmation.confirm}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  sheet: {
    width: "100%",
    maxHeight: "88%",
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.goldDim,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  sheetWide: { maxWidth: 600 },
  eyebrow: {
    color: colors.negative,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  title: {
    color: colors.gold,
    fontSize: 23,
    fontWeight: "800",
    marginTop: spacing.xs,
  },
  intro: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  scroll: { flexGrow: 0 },
  scrollContent: { paddingBottom: spacing.sm },
  players: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.cardBorder,
  },
  playerRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  playerName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: spacing.sm,
  },
  bidStatus: {
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  bidSuccess: { borderColor: colors.positive },
  bidMissed: { borderColor: colors.negative },
  bidStatusText: { fontSize: 12, fontWeight: "800" },
  successText: { color: colors.positive },
  missedText: { color: colors.negative },
  allianceRow: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  allianceNames: { color: colors.text, fontSize: 13, fontWeight: "700" },
  allianceResult: { fontSize: 12, fontWeight: "700", marginTop: 3 },
  confirmButton: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    alignItems: "center",
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  confirmText: { color: colors.bg, fontSize: 16, fontWeight: "800" },
});
