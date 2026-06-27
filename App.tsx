import React, { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { Game } from "./src/types";
import { clearGame, loadGame, saveGame } from "./src/storage";
import { colors } from "./src/theme";
import HomeScreen from "./src/screens/HomeScreen";
import SetupScreen from "./src/screens/SetupScreen";
import GameScreen from "./src/screens/GameScreen";
import ResultsScreen from "./src/screens/ResultsScreen";
import { registerServiceWorker } from "./src/registerServiceWorker";

type Screen = "home" | "setup" | "game" | "results";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore any saved game on launch, and register the PWA service worker (web only).
  useEffect(() => {
    registerServiceWorker();
    (async () => {
      const saved = await loadGame();
      if (saved) setGame(saved);
      setLoading(false);
    })();
  }, []);

  const persist = (g: Game) => {
    setGame(g);
    void saveGame(g);
  };

  const handleNewGame = () => setScreen("setup");

  const handleStart = (g: Game) => {
    persist(g);
    setScreen("game");
  };

  const handleResume = () => {
    if (!game) return;
    setScreen(game.status === "finished" ? "results" : "game");
  };

  const handleFinish = (g: Game) => {
    persist(g);
    setScreen("results");
  };

  const handleHome = () => setScreen("home");

  const handleNewFromResults = () => {
    void clearGame();
    setGame(null);
    setScreen("setup");
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      {screen === "home" && (
        <HomeScreen
          savedGame={game}
          onNewGame={handleNewGame}
          onResume={handleResume}
        />
      )}
      {screen === "setup" && (
        <SetupScreen onStart={handleStart} onBack={handleHome} />
      )}
      {screen === "game" && game && (
        <GameScreen
          game={game}
          onUpdateGame={persist}
          onFinish={handleFinish}
          onExit={handleHome}
        />
      )}
      {screen === "results" && game && (
        <ResultsScreen
          game={game}
          onNewGame={handleNewFromResults}
          onHome={handleHome}
          onReview={() => setScreen("game")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  loader: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
});
