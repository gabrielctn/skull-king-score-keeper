import Foundation

enum IntentDestinationStore {
  static let eventName = "SkullKingAppIntentDestination"
  static let notificationName = Notification.Name(
    "SkullKingAppIntentDestinationNotification"
  )

  private static let pendingDestinationKey =
    "skullking.appIntents.pendingDestination"
  private static let destinationUserInfoKey = "destination"
  private static let validDestinations: Set<String> = [
    "newGame",
    "continueGame",
    "statistics",
  ]
  private static let lock = NSLock()

  static func setPendingDestination(_ destination: String) {
    guard validDestinations.contains(destination) else { return }

    lock.lock()
    UserDefaults.standard.set(destination, forKey: pendingDestinationKey)
    lock.unlock()

    DispatchQueue.main.async {
      NotificationCenter.default.post(
        name: notificationName,
        object: nil,
        userInfo: [destinationUserInfoKey: destination]
      )
    }
  }

  static func destination(from notification: Notification) -> String? {
    guard
      let destination = notification.userInfo?[destinationUserInfoKey] as? String,
      validDestinations.contains(destination)
    else {
      return nil
    }
    return destination
  }

  static func takePendingDestination(matching expected: String? = nil) -> String? {
    lock.lock()
    defer { lock.unlock() }

    guard
      let destination = UserDefaults.standard.string(
        forKey: pendingDestinationKey
      ),
      validDestinations.contains(destination),
      expected == nil || expected == destination
    else {
      return nil
    }

    UserDefaults.standard.removeObject(forKey: pendingDestinationKey)
    return destination
  }
}
