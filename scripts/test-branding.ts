import { readFileSync } from "node:fs";
import { en } from "../src/i18n/en";
import { fr } from "../src/i18n/fr";
import { de } from "../src/i18n/de";
import { es } from "../src/i18n/es";
import { ar } from "../src/i18n/ar";
import { zh } from "../src/i18n/zh";

let passed = 0;
let failed = 0;

function check(label: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}${detail ? `: ${detail}` : ""}`);
  }
}

const appConfig = JSON.parse(readFileSync("app.json", "utf8")).expo;
const manifest = JSON.parse(readFileSync("web/manifest.webmanifest", "utf8"));
const homeSource = readFileSync("src/screens/HomeScreen.tsx", "utf8");
const rulesSource = readFileSync("src/components/RulesModal.tsx", "utf8");
const readme = readFileSync("README.md", "utf8");
const buildPwa = readFileSync("scripts/build-pwa.mjs", "utf8");
const iosConfigPlugin = readFileSync(
  "plugins/withSkullKingCrewLedgerAppIntents.js",
  "utf8"
);
// expo.name is the generated Xcode project name, not a name the shipped apps
// show: iOS reads CFBundleDisplayName and the web app reads web.name. Android
// would label itself from expo.name, but it is not a target this app ships to.
const displayName = appConfig.ios.infoPlist.CFBundleDisplayName;
const visibleBranding = JSON.stringify({
  displayName,
  web: appConfig.web,
  manifest,
  locales: [en, fr, de, es, ar, zh],
});

check(
  "native and PWA names match the App Store name",
  displayName === "Skull King Crew Ledger" &&
    // CFBundleName defaults to the Xcode product name, which is pinned to the
    // old one, so it is set explicitly to keep it out of the shipped bundle.
    appConfig.ios.infoPlist.CFBundleName === displayName &&
    appConfig.web.name === displayName &&
    appConfig.web.shortName === displayName &&
    manifest.name === displayName &&
    manifest.short_name === displayName
);
check("web and manifest full names match", appConfig.web.name === manifest.name);
check(
  "localized home branding matches the app name",
  [en, fr, de, es, ar, zh].every(
    ({ home }) =>
      home.title === "Skull King" && home.subtitle === "Crew Ledger"
  )
);
check(
  "legacy app name is absent from visible branding",
  !visibleBranding.includes("Skull King Score Keeper")
);
check(
  "registered identifiers remain compatible",
  appConfig.ios.bundleIdentifier === "com.gabrielcretin.skullking" &&
    appConfig.experiments.baseUrl === "/skull-king-crew-ledger" &&
    manifest.id === "/skull-king-crew-ledger/"
);
check(
  "the Xcode project name stays pinned to the Xcode Cloud workflow",
  // prebuild derives ios/SkullKingScoreKeeper.xcworkspace and its scheme from
  // expo.name, and the App Store Connect workflow stores both by name: renaming
  // this fails the archive with "Workspace ... does not exist".
  appConfig.name === "Skull King Score Keeper"
);
check(
  "PWA descriptions are explicitly unofficial",
  /unofficial/i.test(appConfig.web.description) && /unofficial/i.test(manifest.description)
);
check(
  "home title is localized rather than hardcoded to the game name",
  homeSource.includes("{t.home.title}") &&
    !homeSource.includes('<Text style={styles.title}>Skull King</Text>')
);
check(
  "home exposes the optional support destination",
  homeSource.includes("https://buymeacoffee.com/gabrielctn")
);
check(
  "rules link to the publisher's official page",
  rulesSource.includes("https://www.grandpabecksgames.com/pages/skull-king")
);
check(
  "French copy carries the non-affiliation notice",
  fr.home.unofficial === "Application non officielle" &&
    fr.home.disclaimer.includes("sans affiliation")
);
check(
  "English copy carries the non-affiliation notice",
  en.home.unofficial.includes("Unofficial") &&
    en.home.disclaimer.includes("no affiliation")
);
check(
  "New locale copy carries the non-affiliation notice",
  de.home.unofficial.includes("Inoffizielle") &&
    de.home.disclaimer.includes("ohne Verbindung") &&
    ar.home.unofficial.includes("غير رسمي") &&
    ar.home.disclaimer.includes("من دون أي انتساب") &&
    zh.home.unofficial.includes("非官方") &&
    zh.home.disclaimer.includes("无任何隶属")
);
check("README identifies the project as unofficial", readme.includes("Unofficial fan project"));
check(
  "Apple installed title is sourced from app configuration",
  buildPwa.includes('content="${installedAppTitle}"')
);
check(
  "generated Xcode release metadata is sourced from app configuration",
  iosConfigPlugin.includes('"MARKETING_VERSION"') &&
    iosConfigPlugin.includes('"CURRENT_PROJECT_VERSION"') &&
    iosConfigPlugin.includes("config.ios?.version ?? config.version") &&
    iosConfigPlugin.includes("config.ios?.buildNumber")
);
check(
  "native App Intent sources use the current app name",
  iosConfigPlugin.includes("SkullKingCrewLedger") &&
    !iosConfigPlugin.includes("SkullKingScoreKeeper")
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
