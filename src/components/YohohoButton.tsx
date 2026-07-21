import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, radius, spacing } from "../theme";
import { useI18n } from "../i18n/context";

/**
 * The pirate cry is bundled through Metro (like every image asset) so it gets
 * content-hashed into the web export and picked up by the service-worker
 * precache. Two encodings ship: the original AAC recording for the best quality
 * on Apple devices, and an MP3 fallback for browsers that lack an AAC decoder
 * (e.g. Firefox on Linux, or Chromium without proprietary codecs). The browser
 * plays the first `<source>` whose type it can decode.
 *
 * On Expo web a required asset resolves to its URL string, which is exactly
 * what an `<audio>` source needs. (Playback is web-only; see `play` below.)
 */
const AUDIO_SOURCES: { module: string | number; type: string }[] = [
  {
    module: require("../../assets/audio/yohoho.m4a"),
    // The explicit AAC codec lets browsers without an AAC decoder rule this out
    // up front and fall straight through to the MP3, instead of fetching and
    // failing on it first.
    type: 'audio/mp4; codecs="mp4a.40.2"',
  },
  { module: require("../../assets/audio/yohoho.mp3"), type: "audio/mpeg" },
];

/**
 * Build a web `<audio>` element with both encodings as `<source>` children,
 * letting the browser pick the one it supports. Returns null off the web or if
 * no source resolves to a URL.
 */
function createAudioElement(): HTMLAudioElement | null {
  if (Platform.OS !== "web" || typeof document === "undefined") return null;
  const el = document.createElement("audio");
  el.preload = "auto";
  for (const { module, type } of AUDIO_SOURCES) {
    if (typeof module !== "string") continue;
    const source = document.createElement("source");
    source.src = module;
    source.type = type;
    el.appendChild(source);
  }
  return el.querySelector("source") ? el : null;
}

/**
 * A deliberately over-the-top "YOHOHO!" button. At the start of each round —
 * just before every player calls their bid — the game master can tap it to
 * blast a short pirate battle cry through the room. It is purely for laughs:
 * tapping plays the sound, skipping it changes nothing about scoring. The
 * speaker glyph, the "♪" and the caption make clear it is an audio button.
 */
export default function YohohoButton() {
  const { t } = useI18n();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const bounce = useRef(new Animated.Value(1)).current;
  const wiggle = useRef(new Animated.Value(0)).current;

  // Release the shared element (and its listeners) when the screen unmounts.
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const play = useCallback(() => {
    const el = audioRef.current ?? createAudioElement();
    if (!el) return;
    if (!audioRef.current) {
      const stop = () => setPlaying(false);
      el.addEventListener("ended", stop);
      el.addEventListener("pause", stop);
      el.addEventListener("error", stop);
      audioRef.current = el;
    }
    // Restart from the top so rapid re-taps re-fire the shout instead of being
    // ignored while it is still playing.
    try {
      el.currentTime = 0;
    } catch {
      // Ignore: some browsers throw until the media is seekable.
    }
    setPlaying(true);
    const started = el.play();
    if (started && typeof started.catch === "function") {
      started.catch(() => setPlaying(false));
    }
  }, []);

  const handlePress = () => {
    play();
    bounce.setValue(1);
    wiggle.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 0.9,
          duration: 90,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(bounce, {
          toValue: 1,
          friction: 3,
          tension: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(wiggle, {
          toValue: -1,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.timing(wiggle, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(wiggle, {
          toValue: 0,
          duration: 90,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const rotate = wiggle.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-5deg", "5deg"],
  });

  return (
    <View style={styles.wrap}>
      <Animated.View style={{ transform: [{ scale: bounce }, { rotate }] }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={t.game.yohohoA11y}
          style={[styles.button, playing && styles.buttonPlaying]}
        >
          <Text style={styles.speaker}>{playing ? "📣" : "🔊"}</Text>
          <Text style={styles.label}>YOHOHO!</Text>
          <Text style={styles.notes}>♪</Text>
        </TouchableOpacity>
      </Animated.View>
      <Text style={styles.hint}>{t.game.yohohoHint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", marginTop: spacing.sm },
  button: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    columnGap: spacing.xs,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.gold,
    // A faint gold wash so the plaque reads as a treasure sign on the dark bg.
    backgroundColor: "rgba(232,184,75,0.14)",
  },
  buttonPlaying: { backgroundColor: "rgba(232,184,75,0.3)" },
  speaker: { fontSize: 18 },
  label: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: 2.5,
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    // A decorative display face on the web for a playful, hand-painted feel,
    // with the heavy weight/letter-spacing carrying the look everywhere else.
    ...Platform.select({
      web: {
        fontFamily: '"Papyrus", "Chalkduster", "Snell Roundhand", fantasy',
      },
      default: {},
    }),
  },
  notes: { color: colors.gold, fontSize: 14, fontWeight: "700" },
  hint: {
    color: colors.textDim,
    fontSize: 10,
    fontStyle: "italic",
    marginTop: 3,
  },
});
