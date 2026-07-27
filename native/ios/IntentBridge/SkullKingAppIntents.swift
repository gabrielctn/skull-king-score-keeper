import Foundation
import React

@objc(SkullKingAppIntents)
final class SkullKingAppIntents: RCTEventEmitter {
  private var hasListeners = false

  override init() {
    super.init()
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleDestinationNotification(_:)),
      name: IntentDestinationStore.notificationName,
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
    [IntentDestinationStore.eventName]
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
    resolve(IntentDestinationStore.takePendingDestination() ?? NSNull())
  }

  @objc
  private func handleDestinationNotification(_ notification: Notification) {
    guard
      hasListeners,
      let destination = IntentDestinationStore.destination(from: notification),
      let pending = IntentDestinationStore.takePendingDestination(
        matching: destination
      )
    else {
      return
    }

    sendEvent(
      withName: IntentDestinationStore.eventName,
      body: pending
    )
  }
}
