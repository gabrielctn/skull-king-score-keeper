/** Fill a byte array with cryptographically secure values in web runtimes. */
export function fillSecureRandomValues(bytes: Uint8Array): Uint8Array {
  return crypto.getRandomValues(bytes);
}
