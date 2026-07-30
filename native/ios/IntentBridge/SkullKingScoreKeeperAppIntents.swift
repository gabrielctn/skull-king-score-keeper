import Foundation
import React

@objc(SkullKingScoreKeeperAppIntents)
final class SkullKingScoreKeeperAppIntents: RCTEventEmitter {
  private var hasListeners = false

  override init() {
    super.init()
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleDestinationNotification(_:)),
      name: SkullKingScoreKeeperDestinationStore.notificationName,
      object: nil
    )
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
  }

  override static func requiresMainQueueSetup() -> Bool {
    true
  }

  override func supportedEvents() -> [String]! {
    [SkullKingScoreKeeperDestinationStore.eventName]
  }

  override func startObserving() {
    hasListeners = true
  }

  override func stopObserving() {
    hasListeners = false
  }

  @objc(getPendingDestination:rejecter:)
  func getPendingDestination(
    _ resolve: RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    resolve(
      SkullKingScoreKeeperDestinationStore.takePendingDestination() ?? NSNull()
    )
  }

  @objc
  private func handleDestinationNotification(_ notification: Notification) {
    guard
      hasListeners,
      let destination = SkullKingScoreKeeperDestinationStore.destination(
        from: notification
      ),
      let pending = SkullKingScoreKeeperDestinationStore.takePendingDestination(
        matching: destination
      )
    else {
      return
    }

    sendEvent(
      withName: SkullKingScoreKeeperDestinationStore.eventName,
      body: pending
    )
  }
}
