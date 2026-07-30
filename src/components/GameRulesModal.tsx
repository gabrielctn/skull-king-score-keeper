import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Game, ScoringMode } from "../types";
import ToggleSwitch from "./ToggleSwitch";
import { colors, radius, spacing } from "../theme";
import { useI18n } from "../i18n/context";
import { getResponsiveLayout } from "../responsive";

interface Props {
  visible: boolean;
  game: Game;
  onClose: () => void;
  /** Receives the updated game; the caller persists it like any other edit. */
  onChange: (game: Game) => void;
}

/**
 * Mid-game rules editor. Every score is derived at render time from the
 * recorded entries, so changing a rule here transparently recomputes rounds
 * that were already scored — which is exactly what a table that forgot to
 * enable an option at setup wants.
 */
export default function GameRulesModal({
  visible,
  game,
  onClose,
  onChange,
}: Props) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);

  // Re-apply the same invariants as game creation so a mode switch can never
  // leave a stale flag behind (e.g. Rascal bets on a classic-scoring game).
  const apply = (updates: Partial<Game>) => {
    const next: Game = { ...game, ...updates, updatedAt: Date.now() };
    next.rascalBets = next.scoringMode === "rascal" && next.rascalBets;
    next.bonusesRequireBid =
      next.scoringMode === "classic" && next.bonusesRequireBid;
    next.twoPlayerGhost = game.players.length === 2 && next.twoPlayerGhost;
    onChange(next);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, layout.isTablet && styles.backdropWide]}>
        <View style={[styles.sheet, layout.isTablet && styles.sheetWide]}>
          <View style={styles.header}>
            <Text style={styles.title}>⚙ {t.gameSettings.title}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.close}
              accessibilityRole="button"
            >
              <Text style={styles.closeText}>{t.gameSettings.close}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                {t.gameSettings.recomputeHint}
              </Text>
            </View>

            <Text style={styles.section}>{t.setup.scoring}</Text>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel={t.setup.scoring}
            >
              {(["classic", "rascal"] as const).map((mode: ScoringMode) => {
                const selected = game.scoringMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.row, selected && styles.rowSelected]}
                    onPress={() => apply({ scoringMode: mode })}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    aria-checked={selected}
                    accessibilityLabel={t.setup.scoringNames[mode]}
                  >
                    <View
                      style={[styles.radio, selected && styles.radioSelected]}
                    >
                      {selected ? <View style={styles.radioDot} /> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>
                        {mode === "classic" ? "☠️ " : "🎲 "}
                        {t.setup.scoringNames[mode]}
                      </Text>
                      <Text style={styles.rowHint}>
                        {t.setup.scoringHints[mode]}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            {game.scoringMode === "rascal" ? (
              <View style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{t.setup.rascalBetsTitle}</Text>
                  <Text style={styles.rowHint}>{t.setup.rascalBetsHint}</Text>
                </View>
                <ToggleSwitch
                  value={game.rascalBets}
                  onValueChange={(rascalBets) => apply({ rascalBets })}
                  accessibilityLabel={t.setup.rascalBetsTitle}
                />
              </View>
            ) : (
              <View style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>
                    {t.setup.bonusesRequireBidTitle}
                  </Text>
                  <Text style={styles.rowHint}>
                    {t.setup.bonusesRequireBidHint}
                  </Text>
                </View>
                <ToggleSwitch
                  value={game.bonusesRequireBid}
                  onValueChange={(bonusesRequireBid) =>
                    apply({ bonusesRequireBid })
                  }
                  accessibilityLabel={t.setup.bonusesRequireBidTitle}
                />
              </View>
            )}

            <Text style={[styles.section, styles.sectionSpacing]}>
              {t.setup.expansion}
            </Text>
            <View style={styles.row}>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>{t.setup.advancedTitle}</Text>
                <Text style={styles.rowHint}>{t.setup.advancedHint}</Text>
              </View>
              <ToggleSwitch
                value={game.advancedCards}
                onValueChange={(advancedCards) => apply({ advancedCards })}
                accessibilityLabel={t.setup.advancedTitle}
              />
            </View>
            <View style={styles.row}>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>{t.setup.newExpansionTitle}</Text>
                <Text style={styles.rowHint}>{t.setup.newExpansionHint}</Text>
              </View>
              <ToggleSwitch
                value={game.newExpansion}
                onValueChange={(newExpansion) => apply({ newExpansion })}
                accessibilityLabel={t.setup.newExpansionTitle}
              />
            </View>

            {game.players.length === 2 ? (
              <View style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{t.setup.ghostTitle}</Text>
                  <Text style={styles.rowHint}>{t.setup.ghostHint}</Text>
                </View>
                <ToggleSwitch
                  value={game.twoPlayerGhost}
                  onValueChange={(twoPlayerGhost) => apply({ twoPlayerGhost })}
                  accessibilityLabel={t.setup.ghostTitle}
                />
              </View>
            ) : null}
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
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: "88%",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sheetWide: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "86%",
    borderRadius: radius.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  title: { color: colors.gold, fontSize: 20, fontWeight: "800" },
  close: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  closeText: { color: colors.gold, fontSize: 16, fontWeight: "700" },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  notice: {
    borderLeftWidth: 2,
    borderLeftColor: colors.goldDim,
    paddingLeft: spacing.md,
    marginBottom: spacing.lg,
  },
  noticeText: { color: colors.textDim, fontSize: 13, lineHeight: 18 },
  section: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  sectionSpacing: { marginTop: spacing.lg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.controlBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowSelected: { borderColor: colors.gold },
  rowCopy: { flex: 1, marginEnd: spacing.md },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  rowHint: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.controlBorder,
    alignItems: "center",
    justifyContent: "center",
    marginEnd: spacing.md,
  },
  radioSelected: { borderColor: colors.gold },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gold,
  },
});
