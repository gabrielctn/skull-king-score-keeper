import qrcode from "qrcode-generator";

/** Quiet-zone width in modules around the symbol, per the QR specification. */
const QUIET_ZONE_MODULES = 4;

/**
 * Render `value` as a QR code image data URL (GIF), sized so that displaying
 * it at `displaySize` CSS pixels stays crisp on high-density screens.
 * Returns null when the value cannot fit in a QR code.
 */
export function qrCodeDataUrl(
  value: string,
  displaySize: number
): string | null {
  try {
    // Type 0 picks the smallest QR version that fits; level M keeps a good
    // scan-robustness/density balance for phone-to-phone scanning.
    const qr = qrcode(0, "M");
    qr.addData(value, "Byte");
    qr.make();
    const totalModules = qr.getModuleCount() + QUIET_ZONE_MODULES * 2;
    const cellSize = Math.max(2, Math.ceil((displaySize * 2) / totalModules));
    return qr.createDataURL(cellSize, cellSize * QUIET_ZONE_MODULES);
  } catch {
    return null;
  }
}
