import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Game } from "../types";
import { standings } from "../scoring";
import { colors, radius, spacing } from "../theme";
import { illustrations } from "../assets/illustrations";
import { useI18n } from "../i18n/context";

interface Props {
  game: Game;
  onNewGame: () => void;
  onHome: () => void;
  onReview: () => void;
}

const medal = (rank: number) =>
  rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";

export default function ResultsScreen({
  game,
  onNewGame,
  onHome,
  onReview,
}: Props) {
  const { t } = useI18n();
  const rows = standings(game);
  const winner = rows[0];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.chest}>
          <Image
            source={illustrations.treasureChest}
            style={styles.treasureChest}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>{t.results.gameOver}</Text>
        {winner ? (
          <Text style={styles.winner}>
            {t.results.winner(winner.player.name, winner.total)}
          </Text>
        ) : null}

        <View style={styles.card}>
          {rows.map((row) => (
            <View key={row.player.id} style={styles.row}>
              <Text style={styles.rank}>
                {medal(row.rank) || row.rank}
              </Text>
              <Text style={styles.name} numberOfLines={1}>
                {row.player.name}
              </Text>
              <Text
                style={[
                  styles.total,
                  row.total >= 0 ? styles.pos : styles.neg,
                ]}
              >
                {row.total}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.secondaryBtn} onPress={onReview}>
          <Text style={styles.secondaryText}>{t.results.review}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={onNewGame}>
          <Text style={styles.primaryText}>{t.common.newGame}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={onHome}>
          <Text style={styles.linkText}>{t.results.backHome}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, alignItems: "center" },
  chest: { marginTop: spacing.md, marginBottom: spacing.xs },
  treasureChest: { width: 190, height: 165 },
  title: { color: colors.gold, fontSize: 34, fontWeight: "800" },
  winner: {
    color: colors.text,
    fontSize: 18,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  card: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
  },
  rank: { width: 40, fontSize: 20, color: colors.text, textAlign: "center" },
  name: { flex: 1, color: colors.text, fontSize: 18, marginLeft: spacing.sm },
  total: { fontSize: 20, fontWeight: "800" },
  pos: { color: colors.positive },
  neg: { color: colors.negative },
  primaryBtn: {
    alignSelf: "stretch",
    backgroundColor: colors.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  primaryText: { color: colors.bg, fontSize: 18, fontWeight: "800" },
  secondaryBtn: {
    alignSelf: "stretch",
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  secondaryText: { color: colors.gold, fontSize: 16, fontWeight: "600" },
  linkBtn: { paddingVertical: spacing.md },
  linkText: { color: colors.textDim, fontSize: 15 },
});
