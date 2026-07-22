import { Platform } from "react-native";

type InstallOutcome = "accepted" | "dismissed";
export type PwaInstallMode = "prompt" | "manual_ios" | "none";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: InstallOutcome; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installedThisSession = false;
let initialized = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

/**
 * Capture Chromium's one-shot install event so the UI can offer installation
 * after the user has completed a game, when the value of the PWA is clear.
 */
export function initializePwaInstallPrompt(): void {
  if (
    initialized ||
    Platform.OS !== "web" ||
    typeof window === "undefined"
  ) {
    return;
  }
  initialized = true;

  window.addEventListener("beforeinstallprompt", (rawEvent) => {
    const event = rawEvent as BeforeInstallPromptEvent;
    event.preventDefault();
    deferredPrompt = event;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installedThisSession = true;
    notify();
  });
}

export function subscribeToInstallPrompt(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isPwaInstalled(): boolean {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;
  const standaloneDisplay = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone = Boolean(
    (window.navigator as Navigator & { standalone?: boolean }).standalone
  );
  return Boolean(standaloneDisplay || iosStandalone);
}

export function canPromptPwaInstall(): boolean {
  return deferredPrompt !== null && !isPwaInstalled();
}

/**
 * True once the browser has fired `appinstalled` in this session. The current
 * tab keeps running as a normal browser tab after an install, so `display-mode`
 * stays non-standalone here — this flag lets the UI confirm success anyway.
 */
export function wasAppInstalled(): boolean {
  return installedThisSession;
}

export function isIosBrowser(): boolean {
  if (Platform.OS !== "web" || typeof navigator === "undefined") return false;
  const userAgent = navigator.userAgent;
  const classicIos = /iPad|iPhone|iPod/.test(userAgent);
  const ipadDesktopMode =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return classicIos || ipadDesktopMode;
}

export function getPwaInstallMode(): PwaInstallMode {
  if (isPwaInstalled()) return "none";
  if (canPromptPwaInstall()) return "prompt";
  return isIosBrowser() ? "manual_ios" : "none";
}

export async function promptPwaInstall(): Promise<InstallOutcome | "unavailable"> {
  const prompt = deferredPrompt;
  if (!prompt || isPwaInstalled()) return "unavailable";

  deferredPrompt = null;
  notify();
  await prompt.prompt();
  const choice = await prompt.userChoice;
  return choice.outcome;
}
