import React from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, radius, spacing } from "../theme";
import { illustrations } from "../assets/illustrations";

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface Entry {
  title: string;
  body: string;
}

const SCORING: Entry[] = [
  { title: "Bid 1 or more", body: "Hit it exactly: +20 per trick won. Miss (over or under): -10 per trick of difference, and no points for tricks made." },
  { title: "Bid zero", body: "Win 0 tricks: +10 x cards dealt this round. Win any trick: -10 x cards dealt this round." },
];

const BONUSES: Entry[] = [
  { title: "Colored 14  (+10 each)", body: "Each yellow / purple / green 14 you capture (win the trick it's in) at round end." },
  { title: "Black 14  (+20)", body: "Capturing the black (Jolly Roger / trump) 14." },
  { title: "Mermaid taken by a pirate  (+20 each)", body: "Your pirate wins a trick containing a mermaid." },
  { title: "Pirate taken by Skull King  (+30 each)", body: "Your Skull King wins a trick containing pirate(s)." },
  { title: "Mermaid captures Skull King  (+40)", body: "Your mermaid wins a trick containing the Skull King. (Mermaid beats Skull King beats Pirates beats Mermaid.)" },
  { title: "Bonuses count regardless of your bid", body: "You keep capture bonuses even if you missed your bid. They go to whoever captures the card, no matter who played it." },
];

const SPECIAL: Entry[] = [
  { title: "Escape / Tigress-as-escape", body: "Always loses the trick. Used to safely dump a trick you don't want." },
  { title: "Pirate (x5) & Tigress", body: "Beat all numbered cards. Tigress can be played as a pirate or an escape." },
  { title: "Skull King", body: "Beats all numbers and all pirates (+30 each captured). Only a mermaid can beat it." },
  { title: "Mermaid (x2)", body: "Beats all numbers and beats the Skull King (+40), but loses to pirates. If a pirate, Skull King and a mermaid are all in one trick, the mermaid always wins." },
  { title: "Kraken", body: "The trick is destroyed: NOBODY wins it, the cards are set aside. No trick counts and no captures happen for it. The next trick is led by whoever would have won." },
  { title: "White Whale", body: "All special cards are nullified and lose; the highest NUMBER wins the trick (trump included). If only specials were played, the trick is discarded. No special-card capture bonuses occur in a whale trick." },
  { title: "Kraken vs White Whale", body: "If both hit the same trick, the second one played takes effect; apply that card's rule." },
  { title: "Loot / Butin  (+20 each ally)", body: "Forms an alliance with whoever wins that trick. If BOTH allies hit their exact bid, each gets +20. Enter it only when the alliance succeeded." },
  { title: "Rascal pirate wager (0/10/20)", body: "A side bet: gain the wager if you hit your bid, lose it if you miss." },
];

function Section({ heading, entries }: { heading: string; entries: Entry[] }) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.heading}>{heading}</Text>
      {entries.map((e) => (
        <View key={e.title} style={styles.entry}>
          <Text style={styles.entryTitle}>{e.title}</Text>
          <Text style={styles.entryBody}>{e.body}</Text>
        </View>
      ))}
    </View>
  );
}

export default function RulesModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.mermaidCrop}>
                <Image
                  source={illustrations.mermaid}
                  style={styles.mermaid}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Scoring &amp; Cards</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.close}>
              <Text style={styles.closeText}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Section heading="Scoring" entries={SCORING} />
            <Section heading="Bonus points" entries={BONUSES} />
            <Section heading="Special cards" entries={SPECIAL} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: "88%",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  mermaidCrop: {
    width: 42,
    height: 48,
    overflow: "hidden",
    alignItems: "center",
  },
  mermaid: {
    position: "absolute",
    top: -3,
    width: 82,
    height: 102,
  },
  title: { color: colors.gold, fontSize: 20, fontWeight: "800" },
  close: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  closeText: { color: colors.gold, fontSize: 16, fontWeight: "700" },
  scroll: { padding: spacing.md },
  heading: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  entry: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  entryTitle: { color: colors.text, fontSize: 15, fontWeight: "700", marginBottom: 2 },
  entryBody: { color: colors.textDim, fontSize: 13, lineHeight: 18 },
});
