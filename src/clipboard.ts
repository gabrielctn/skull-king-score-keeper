const MODERN_CLIPBOARD_TIMEOUT_MS = 750;

async function copyWithModernClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    return false;
  }

  try {
    return await Promise.race([
      navigator.clipboard.writeText(text).then(
        () => true,
        () => false
      ),
      new Promise<boolean>((resolve) =>
        setTimeout(() => resolve(false), MODERN_CLIPBOARD_TIMEOUT_MS)
      ),
    ]);
  } catch {
    return false;
  }
}

function copyWithSelectionFallback(text: string): boolean {
  if (typeof document === "undefined" || !document.body) return false;

  const textArea = document.createElement("textarea");
  const previouslyFocused = document.activeElement as HTMLElement | null;
  textArea.value = text;
  textArea.readOnly = true;
  textArea.setAttribute("aria-hidden", "true");
  Object.assign(textArea.style, {
    position: "fixed",
    top: "0",
    left: "-9999px",
    opacity: "0",
  });
  document.body.appendChild(textArea);
  textArea.select();
  textArea.setSelectionRange(0, text.length);

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textArea);
    previouslyFocused?.focus?.();
  }
}

/** Copy text in browsers, including insecure/permission-limited contexts. */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  // Start the modern request, but run the selection fallback immediately while
  // the browser still considers this code part of the user's click gesture.
  const modernCopy = copyWithModernClipboard(text);
  if (copyWithSelectionFallback(text)) return true;
  return modernCopy;
}
