import React from "react";
import {
  Image,
  SafeAreaView,
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
import { Lang } from "../i18n/types";

interface Props {
  savedGame: Game | null;
  onNewGame: () => void;
  onResume: () => void;
}

export default function HomeScreen({ savedGame, onNewGame, onResume }: Props) {
  const { t, lang, setLang } = useI18n();
  const leader =
    savedGame && savedGame.players.length
      ? standings(savedGame)[0]
      : null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.langSwitch}>
        {(["fr", "en"] as Lang[]).map((l) => (
          <TouchableOpacity
            key={l}
            onPress={() => setLang(l)}
            style={[styles.langBtn, lang === l && styles.langBtnOn]}
            accessibilityRole="button"
          >
            <Text style={[styles.langText, lang === l && styles.langTextOn]}>
              {l.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.emblemWrap}>
            <View style={styles.emblemBg} pointerEvents="none">
              <Image
                source={illustrations.compass}
                style={styles.compass}
                resizeMode="contain"
              />
            </View>
            <Image
              source={illustrations.skullKing}
              style={styles.skullKing}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Skull King</Text>
          <Text style={styles.subtitle}>{t.home.subtitle}</Text>
        </View>

        {savedGame ? (
          <TouchableOpacity style={styles.resumeCard} onPress={onResume}>
            <Text style={styles.resumeLabel}>{t.home.resume}</Text>
            <Text style={styles.resumeMeta}>
              {t.home.playersRound(
                savedGame.players.length,
                Math.min(savedGame.currentRound, savedGame.totalRounds),
                savedGame.totalRounds
              )}
            </Text>
            {leader ? (
              <Text style={styles.resumeLeader}>
                {t.home.leading(leader.player.name, leader.total)}
              </Text>
            ) : null}
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.primaryBtn} onPress={onNewGame}>
          <Text style={styles.primaryBtnText}>{t.common.newGame}</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>{t.home.offline}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  langSwitch: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  langBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.bgElevated,
    minWidth: 38,
    alignItems: "center",
  },
  langBtnOn: { backgroundColor: colors.gold },
  langText: { color: colors.textDim, fontSize: 13, fontWeight: "800" },
  langTextOn: { color: colors.bg },
  container: { flex: 1, padding: spacing.lg, justifyContent: "center" },
  hero: { alignItems: "center", marginBottom: spacing.xl },
  emblemWrap: {
    width: 230,
    height: 210,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  emblemBg: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  compass: { width: 230, height: 230, opacity: 0.16 },
  skullKing: { width: 170, height: 190 },
  title: { color: colors.gold, fontSize: 42, fontWeight: "800", letterSpacing: 1 },
  subtitle: { color: colors.textDim, fontSize: 18, marginTop: spacing.xs },
  resumeCard: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  resumeLabel: { color: colors.gold, fontSize: 18, fontWeight: "700" },
  resumeMeta: { color: colors.text, marginTop: spacing.xs },
  resumeLeader: { color: colors.textDim, marginTop: spacing.xs, fontSize: 13 },
  primaryBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  primaryBtnText: { color: colors.bg, fontSize: 18, fontWeight: "800" },
  footer: {
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.xl,
    fontSize: 12,
  },
});
