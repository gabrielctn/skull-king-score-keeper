import Foundation
import React

@objc(SkullKingCrewLedgerAppIntents)
final class SkullKingCrewLedgerAppIntents: RCTEventEmitter {
  private var hasListeners = false

  override init() {
    super.init()
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleDestinationNotification(_:)),
      name: SkullKingCrewLedgerDestinationStore.notificationName,
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
    [SkullKingCrewLedgerDestinationStore.eventName]
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
      SkullKingCrewLedgerDestinationStore.takePendingDestination() ?? NSNull()
    )
  }

  @objc
  private func handleDestinationNotification(_ notification: Notification) {
    guard
      hasListeners,
      let destination = SkullKingCrewLedgerDestinationStore.destination(
        from: notification
      ),
      let pending = SkullKingCrewLedgerDestinationStore.takePendingDestination(
        matching: destination
      )
    else {
      return
    }

    sendEvent(
      withName: SkullKingCrewLedgerDestinationStore.eventName,
      body: pending
    )
  }
}
