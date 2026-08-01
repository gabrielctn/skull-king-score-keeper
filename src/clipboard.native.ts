import * as Clipboard from "expo-clipboard";

/** Copy text through the platform pasteboard on iOS and Android. */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    return await Clipboard.setStringAsync(text);
  } catch {
    return false;
  }
}
