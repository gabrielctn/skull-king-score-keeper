import AppIntents

@available(iOS 16.0, *)
struct StartNewGameIntent: AppIntent {
  static let title: LocalizedStringResource = "Start New Game"
  static let description = IntentDescription("Open Score Keeper to set up a new game.")
  static let openAppWhenRun = true

  @available(iOS 26.0, *)
  static var supportedModes: IntentModes { .foreground(.immediate) }

  func perform() async throws -> some IntentResult {
    IntentDestinationStore.setPendingDestination(
      ScoreKeeperDestination.newGame.rawValue
    )
    return .result()
  }
}

@available(iOS 16.0, *)
struct ContinueGameIntent: AppIntent {
  static let title: LocalizedStringResource = "Continue Game"
  static let description = IntentDescription("Open Score Keeper on the current game.")
  static let openAppWhenRun = true

  @available(iOS 26.0, *)
  static var supportedModes: IntentModes { .foreground(.immediate) }

  func perform() async throws -> some IntentResult {
    IntentDestinationStore.setPendingDestination(
      ScoreKeeperDestination.continueGame.rawValue
    )
    return .result()
  }
}

@available(iOS 16.0, *)
struct OpenStatisticsIntent: AppIntent {
  static let title: LocalizedStringResource = "Open Statistics"
  static let description = IntentDescription("Open Score Keeper statistics.")
  static let openAppWhenRun = true

  @available(iOS 26.0, *)
  static var supportedModes: IntentModes { .foreground(.immediate) }

  func perform() async throws -> some IntentResult {
    IntentDestinationStore.setPendingDestination(
      ScoreKeeperDestination.statistics.rawValue
    )
    return .result()
  }
}
