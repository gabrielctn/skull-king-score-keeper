import * as Crypto from "expo-crypto";

/** Fill a byte array with cryptographically secure values on native devices. */
export function fillSecureRandomValues(bytes: Uint8Array): Uint8Array {
  return Crypto.getRandomValues(bytes);
}
