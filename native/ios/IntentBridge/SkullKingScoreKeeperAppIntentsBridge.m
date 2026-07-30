#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(SkullKingScoreKeeperAppIntents, RCTEventEmitter)

RCT_EXTERN_METHOD(getPendingDestination:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
