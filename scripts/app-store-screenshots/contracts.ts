import { join } from "node:path";

export const APP_STORE_SCREENSHOT_LOCALES = ["en", "fr"] as const;

export const APP_STORE_SCREENSHOT_DEVICES = {
  "iphone-6.9": { width: 1320, height: 2868 },
  "ipad-13": { width: 2064, height: 2752 },
} as const;

export type AppStoreScreenshotLocale =
  (typeof APP_STORE_SCREENSHOT_LOCALES)[number];
export type AppStoreScreenshotDevice =
  keyof typeof APP_STORE_SCREENSHOT_DEVICES;

const APP_STORE_LOCALE_DIRECTORIES: Readonly<
  Record<AppStoreScreenshotLocale, "en-US" | "fr-FR">
> = {
  en: "en-US",
  fr: "fr-FR",
};

export interface AppStoreScreenshotShot {
  index: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  stem: string;
  headline: Readonly<Record<AppStoreScreenshotLocale, string>>;
  rawSources: readonly string[];
}

export const APP_STORE_SCREENSHOT_SHOTS = [
  {
    index: 1,
    stem: "01-score-every-round",
    headline: {
      en: "Score every round. We do the math.",
      fr: "Notez chaque manche. On fait les calculs.",
    },
    rawSources: ["game-active"],
  },
  {
    index: 2,
    stem: "02-follow-scores-live",
    headline: {
      en: "Everyone follows the scores live.",
      fr: "Tout l’équipage suit les scores en direct.",
    },
    rawSources: ["live-host", "live-spectator"],
  },
  {
    index: 3,
    stem: "03-crown-the-winner",
    headline: {
      en: "Crown the winner.",
      fr: "Couronnez le vainqueur.",
    },
    rawSources: ["results-top", "results-details"],
  },
  {
    index: 4,
    stem: "04-crew-hall-of-fame",
    headline: {
      en: "Build your crew’s hall of fame.",
      fr: "Créez le palmarès de votre équipage.",
    },
    rawSources: ["stats-top", "stats-records"],
  },
  {
    index: 5,
    stem: "05-one-shared-ledger",
    headline: {
      en: "One crew. One shared ledger.",
      fr: "Un équipage. Un carnet partagé.",
    },
    rawSources: ["settings-invite"],
  },
  {
    index: 6,
    stem: "06-classic-rascal-expansion",
    headline: {
      en: "Classic, Rascal and expansion cards.",
      fr: "Classique, Rascal et cartes d’extension.",
    },
    rawSources: ["setup-scoring", "setup-expansion"],
  },
  {
    index: 7,
    stem: "07-greybeards-ghost",
    headline: {
      en: "Two players? Summon Greybeard’s Ghost.",
      fr: "À deux ? Invoquez le fantôme Barbe Grise.",
    },
    rawSources: ["greybeard-setup", "greybeard-game"],
  },
  {
    index: 8,
    stem: "08-offline-ad-free",
    headline: {
      en: "Every round saved. Offline. Ad-free.",
      fr: "Chaque manche sauvegardée. Hors ligne. Sans pub.",
    },
    rawSources: ["home"],
  },
] as const satisfies readonly AppStoreScreenshotShot[];

export function finalScreenshotPath(
  root: string,
  locale: AppStoreScreenshotLocale,
  device: AppStoreScreenshotDevice,
  stem: string
): string {
  return join(
    root,
    APP_STORE_LOCALE_DIRECTORIES[locale],
    device,
    `${stem}.png`
  );
}
