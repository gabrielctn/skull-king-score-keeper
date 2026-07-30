import AppIntents

@available(iOS 16.0, *)
struct SkullKingScoreKeeperAppShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: StartNewGameIntent(),
      phrases: [
        "Start a new game with \(.applicationName)",
      ],
      shortTitle: "Start New Game",
      systemImageName: "plus.circle"
    )

    AppShortcut(
      intent: ContinueGameIntent(),
      phrases: [
        "Continue my game in \(.applicationName)",
      ],
      shortTitle: "Continue Game",
      systemImageName: "play.circle"
    )

    AppShortcut(
      intent: OpenStatisticsIntent(),
      phrases: [
        "Open statistics in \(.applicationName)",
      ],
      shortTitle: "Open Statistics",
      systemImageName: "chart.bar.xaxis"
    )
  }
}
