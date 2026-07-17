import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Player } from "../types";
import { createGame } from "../scoring";
import { Game } from "../types";
import Stepper from "../components/Stepper";
import ToggleSwitch from "../components/ToggleSwitch";
import {
  ROUND_STRUCTURE_IDS,
  RoundStructureId,
  structureCards,
} from "../roundStructures";
import { colors, radius, spacing } from "../theme";
import { illustrations } from "../assets/illustrations";
import { useI18n } from "../i18n/context";
import { getResponsiveLayout } from "../responsive";

interface Props {
  onStart: (game: Game) => void;
  onBack: () => void;
}

let idCounter = 0;
const newId = () => `p_${Date.now()}_${idCounter++}`;

export default function SetupScreen({ onStart, onBack }: Props) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  const [players, setPlayers] = useState<Player[]>([
    { id: newId(), name: "" },
    { id: newId(), name: "" },
  ]);
  const [rounds, setRounds] = useState(10);
  const [structure, setStructure] = useState<RoundStructureId>("classic");
  const [roundVariantsVisible, setRoundVariantsVisible] = useState(false);
  const [advanced, setAdvanced] = useState(true);
  const [newExpansion, setNewExpansion] = useState(false);
  const [twoPlayerGhost, setTwoPlayerGhost] = useState(true);

  const setName = (id: string, name: string) =>
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));

  const addPlayer = () =>
    setPlayers((prev) => [...prev, { id: newId(), name: "" }]);

  const removePlayer = (id: string) =>
    setPlayers((prev) => prev.filter((p) => p.id !== id));

  // Seating order = clockwise table order, which drives the dealer / play-order
  // indicator in-game; let players reorder without retyping.
  const movePlayer = (index: number, dir: -1 | 1) =>
    setPlayers((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });

  const named = players
    .map((p) => ({ ...p, name: p.name.trim() }))
    .filter((p) => p.name.length > 0);

  const canStart = named.length >= 2;
  // The Greybeard ghost is the official 2-player variant; only offer it (and
  // only apply it) when there are exactly two real players.
  const isTwoPlayer = named.length === 2;
  const visibleStructureIds = roundVariantsVisible
    ? ROUND_STRUCTURE_IDS
    : ROUND_STRUCTURE_IDS.filter(
        (id) => id === "classic" || id === structure
      );

  const start = () => {
    if (!canStart) return;
    const cardsPerRound = structureCards(structure, rounds);
    onStart(
      createGame(
        named,
        cardsPerRound.length,
        advanced,
        isTwoPlayer && twoPlayerGhost,
        newExpansion,
        cardsPerRound
      )
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={[
            styles.header,
            {
              maxWidth: layout.formMaxWidth,
              paddingHorizontal: layout.screenPadding,
            },
          ]}
        >
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.back}>‹ {t.common.back}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t.setup.title}</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              maxWidth: layout.formMaxWidth,
              padding: layout.screenPadding,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.greeter}>
            <Image
              source={illustrations.parrot}
              style={styles.parrot}
              resizeMode="contain"
            />
            <Text style={styles.greeterText}>{t.setup.crew}</Text>
          </View>

          <Text style={styles.section}>{t.setup.players}</Text>
          <Text style={styles.seatingHint}>{t.setup.seatingHint}</Text>
          {players.map((p, i) => (
            <View key={p.id} style={styles.playerRow}>
              <Text style={styles.playerNum}>{i + 1}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.setup.playerPlaceholder(i + 1)}
                placeholderTextColor={colors.textDim}
                value={p.name}
                onChangeText={(t) => setName(p.id, t)}
                returnKeyType="done"
                maxLength={20}
              />
              <View style={styles.reorder}>
                <TouchableOpacity
                  onPress={() => movePlayer(i, -1)}
                  disabled={i === 0}
                  style={[styles.reorderBtn, i === 0 && styles.reorderBtnDisabled]}
                >
                  <Text style={styles.reorderText}>▲</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => movePlayer(i, 1)}
                  disabled={i === players.length - 1}
                  style={[
                    styles.reorderBtn,
                    i === players.length - 1 && styles.reorderBtnDisabled,
                  ]}
                >
                  <Text style={styles.reorderText}>▼</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => removePlayer(p.id)}
                disabled={players.length <= 2}
                style={[
                  styles.removeBtn,
                  players.length <= 2 && styles.removeBtnDisabled,
                ]}
              >
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={addPlayer}>
            <Text style={styles.addText}>{t.setup.addPlayer}</Text>
          </TouchableOpacity>

          {isTwoPlayer ? (
            <>
              <Text style={[styles.section, { marginTop: spacing.lg }]}>
                {t.setup.twoPlayers}
              </Text>
              <View style={styles.advancedRow}>
                <View style={{ flex: 1, marginRight: spacing.md }}>
                  <Text style={styles.advancedTitle}>{t.setup.ghostTitle}</Text>
                  <Text style={styles.advancedHint}>{t.setup.ghostHint}</Text>
                </View>
                <ToggleSwitch
                  value={twoPlayerGhost}
                  onValueChange={setTwoPlayerGhost}
                  accessibilityLabel={t.setup.ghostTitle}
                />
              </View>
            </>
          ) : null}

          <Text style={[styles.section, { marginTop: spacing.lg }]}>
            {t.setup.rounds}
          </Text>
          <Text style={styles.seatingHint}>{t.setup.structureHint}</Text>
          <View accessibilityRole="radiogroup" accessibilityLabel={t.setup.rounds}>
            {visibleStructureIds.map((id) => {
              const selected = structure === id;
              const cards = structureCards(id, id === "classic" ? rounds : 10);
              return (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.structureRow,
                    selected && styles.structureRowSelected,
                  ]}
                  onPress={() => setStructure(id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  aria-checked={selected}
                  accessibilityLabel={`${t.setup.structureNames[id]} · ${t.setup.structureRounds(cards.length)}`}
                >
                  <View
                    style={[styles.radio, selected && styles.radioSelected]}
                  >
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.structureHeader}>
                      <Text style={styles.advancedTitle}>
                        {t.setup.structureNames[id]}
                      </Text>
                      <Text style={styles.structureRounds}>
                        {t.setup.structureRounds(cards.length)}
                      </Text>
                    </View>
                    <Text style={styles.structureCards}>
                      {cards.join(" · ")}
                    </Text>
                    {id === "classic" && selected ? (
                      <View style={styles.classicStepper}>
                        <Stepper
                          value={rounds}
                          onChange={setRounds}
                          min={1}
                          max={10}
                          label={t.setup.rounds}
                        />
                        <Text style={styles.roundsHint}>
                          {t.setup.roundsHint}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={styles.structureToggle}
            onPress={() => setRoundVariantsVisible((visible) => !visible)}
            accessibilityRole="button"
            accessibilityState={{ expanded: roundVariantsVisible }}
            accessibilityLabel={
              roundVariantsVisible
                ? t.setup.hideOtherStructures
                : t.setup.showOtherStructures
            }
          >
            <Text style={styles.structureToggleText}>
              {roundVariantsVisible
                ? t.setup.hideOtherStructures
                : t.setup.showOtherStructures}
            </Text>
            <View style={styles.structureToggleIcon}>
              <View
                style={[
                  styles.structureToggleChevron,
                  roundVariantsVisible &&
                    styles.structureToggleChevronExpanded,
                ]}
              />
            </View>
          </TouchableOpacity>

          <Text style={[styles.section, { marginTop: spacing.lg }]}>
            {t.setup.expansion}
          </Text>
          <View style={styles.advancedRow}>
            <View style={{ flex: 1, marginRight: spacing.md }}>
              <Text style={styles.advancedTitle}>{t.setup.advancedTitle}</Text>
              <Text style={styles.advancedHint}>{t.setup.advancedHint}</Text>
            </View>
            <ToggleSwitch
              value={advanced}
              onValueChange={setAdvanced}
              accessibilityLabel={t.setup.advancedTitle}
            />
          </View>
          <View style={[styles.advancedRow, { marginTop: spacing.sm }]}>
            <View style={{ flex: 1, marginRight: spacing.md }}>
              <Text style={styles.advancedTitle}>
                {t.setup.newExpansionTitle}
              </Text>
              <Text style={styles.advancedHint}>
                {t.setup.newExpansionHint}
              </Text>
            </View>
            <ToggleSwitch
              value={newExpansion}
              onValueChange={setNewExpansion}
              accessibilityLabel={t.setup.newExpansionTitle}
            />
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              maxWidth: layout.formMaxWidth,
              paddingHorizontal: layout.screenPadding,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
            onPress={start}
            disabled={!canStart}
          >
            <Text style={styles.startText}>
              {canStart ? t.setup.start : t.setup.needPlayers}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingVertical: spacing.sm,
  },
  back: { color: colors.gold, fontSize: 17 },
  title: { color: colors.text, fontSize: 20, fontWeight: "700" },
  scroll: {
    width: "100%",
    alignSelf: "center",
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  greeter: { alignItems: "center", marginBottom: spacing.md },
  parrot: { width: 104, height: 118 },
  greeterText: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  section: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  playerNum: {
    width: 24,
    color: colors.textDim,
    fontSize: 16,
    textAlign: "center",
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 16,
    marginHorizontal: spacing.sm,
  },
  seatingHint: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  reorder: { marginRight: spacing.xs },
  reorderBtn: {
    width: 26,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  reorderBtnDisabled: { opacity: 0.2 },
  reorderText: { color: colors.gold, fontSize: 12 },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnDisabled: { opacity: 0.25 },
  removeText: { color: colors.negative, fontSize: 18 },
  addBtn: {
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  addText: { color: colors.gold, fontSize: 16, fontWeight: "600" },
  roundsHint: { color: colors.textDim, fontSize: 12, marginTop: spacing.sm },
  structureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  structureRowSelected: { borderColor: colors.gold },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    marginTop: 1,
  },
  radioSelected: { borderColor: colors.gold },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gold,
  },
  structureHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  structureRounds: { color: colors.textDim, fontSize: 12 },
  structureCards: { color: colors.textDim, fontSize: 13, marginTop: 4 },
  classicStepper: { alignItems: "center", marginTop: spacing.sm },
  structureToggle: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  structureToggleText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "600",
  },
  structureToggleIcon: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginStart: spacing.xs,
  },
  structureToggleChevron: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.gold,
    transform: [{ rotate: "45deg" }],
  },
  structureToggleChevronExpanded: { transform: [{ rotate: "-135deg" }] },
  advancedRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  advancedTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  advancedHint: { color: colors.textDim, fontSize: 12, marginTop: 4, lineHeight: 16 },
  footer: { width: "100%", alignSelf: "center", padding: spacing.md },
  startBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  startBtnDisabled: { backgroundColor: colors.goldDim },
  startText: { color: colors.bg, fontSize: 18, fontWeight: "800" },
});
