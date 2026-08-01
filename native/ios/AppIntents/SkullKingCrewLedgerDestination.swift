import AppIntents

@available(iOS 16.0, *)
enum SkullKingCrewLedgerDestination: String, AppEnum, CaseIterable, Sendable {
  case newGame
  case continueGame
  case statistics

  static let typeDisplayRepresentation: TypeDisplayRepresentation = "Destination"

  static let caseDisplayRepresentations: [Self: DisplayRepresentation] = [
    .newGame: "New Game",
    .continueGame: "Current Game",
    .statistics: "Statistics",
  ]
}
