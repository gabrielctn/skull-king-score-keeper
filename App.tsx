import React, { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { Game } from "./src/types";
import {
  clearGame,
  loadGame,
  loadGameHistory,
  loadLang,
  saveGame,
  saveGameHistory,
} from "./src/storage";
import { colors } from "./src/theme";
import { I18nProvider, detectLang } from "./src/i18n/context";
import { Lang } from "./src/i18n/types";
import HomeScreen from "./src/screens/HomeScreen";
import SetupScreen from "./src/screens/SetupScreen";
import GameScreen from "./src/screens/GameScreen";
import ResultsScreen from "./src/screens/ResultsScreen";
import { registerServiceWorker } from "./src/registerServiceWorker";

type Screen = "home" | "setup" | "game" | "results";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [game, setGame] = useState<Game | null>(null);
  const [gameHistory, setGameHistory] = useState<Game[]>([]);
  const [lang, setLang] = useState<Lang | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the saved game and language on launch, and register the PWA
  // service worker (web only). Loading the language here (before first paint)
  // avoids a flash of the wrong language.
  useEffect(() => {
    registerServiceWorker();
    (async () => {
      const [saved, history, savedLang] = await Promise.all([
        loadGame(),
        loadGameHistory(),
        loadLang(),
      ]);
      if (saved) setGame(saved);
      const migratedHistory = saved
        ? [saved, ...history.filter((item) => item.id !== saved.id)].sort(
            (a, b) => b.updatedAt - a.updatedAt
          )
        : history;
      setGameHistory(migratedHistory);
      if (saved && history.every((item) => item.id !== saved.id)) {
        void saveGameHistory(migratedHistory);
      }
      setLang(savedLang ?? detectLang());
      setLoading(false);
    })();
  }, []);

  const persist = (g: Game) => {
    setGame(g);
    void saveGame(g);
    setGameHistory((previous) => {
      const next = [g, ...previous.filter((item) => item.id !== g.id)].sort(
        (a, b) => b.updatedAt - a.updatedAt
      );
      void saveGameHistory(next);
      return next;
    });
  };

  const handleNewGame = () => setScreen("setup");

  const handleStart = (g: Game) => {
    persist(g);
    setScreen("game");
  };

  const handleOpenHistory = (selectedGame: Game) => {
    setGame(selectedGame);
    void saveGame(selectedGame);
    setScreen(selectedGame.status === "finished" ? "results" : "game");
  };

  const handleDeleteHistory = (gameId: string) => {
    setGameHistory((previous) => {
      const next = previous.filter((item) => item.id !== gameId);
      void saveGameHistory(next);
      return next;
    });
    if (game?.id === gameId) {
      setGame(null);
      void clearGame();
    }
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

  if (loading || lang === null) {
    return (
      <View style={styles.loader}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <I18nProvider initialLang={lang}>
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        {screen === "home" && (
          <HomeScreen
            gameHistory={gameHistory}
            onNewGame={handleNewGame}
            onOpenGame={handleOpenHistory}
            onDeleteGame={handleDeleteHistory}
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
    </I18nProvider>
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
