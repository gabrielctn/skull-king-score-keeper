import { readFileSync } from "node:fs";
import { en } from "../src/i18n/en";
import { fr } from "../src/i18n/fr";
import { de } from "../src/i18n/de";
import { es } from "../src/i18n/es";
import { ar } from "../src/i18n/ar";
import { zh } from "../src/i18n/zh";
import { APP_STORE_ANNUAL_COST_EUR } from "../src/support";

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
const supportSource = readFileSync("src/support.ts", "utf8");
const rulesSource = readFileSync("src/components/RulesModal.tsx", "utf8");
const readme = readFileSync("README.md", "utf8");
const buildPwa = readFileSync("scripts/build-pwa.mjs", "utf8");
const iosConfigPlugin = readFileSync(
  "plugins/withSkullKingCrewLedgerAppIntents.js",
  "utf8"
);
// expo.name drives the generated Xcode project, workspace and shared scheme.
// Keep it aligned with the names shown by iOS and the web app.
const displayName = appConfig.ios.infoPlist.CFBundleDisplayName;
const visibleBranding = JSON.stringify({
  projectName: appConfig.name,
  slug: appConfig.slug,
  displayName,
  web: appConfig.web,
  manifest,
  locales: [en, fr, de, es, ar, zh],
});

check(
  "native and PWA names match the App Store name",
  appConfig.name === "Skull King Crew Ledger" &&
    appConfig.slug === "skull-king-crew-ledger" &&
    displayName === appConfig.name &&
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
  "the Xcode project name matches the Xcode Cloud workflow",
  // Prebuild removes spaces to derive SkullKingCrewLedger for the project,
  // workspace and shared scheme stored by the App Store Connect workflow.
  appConfig.name.replace(/[^A-Za-z0-9]/g, "") === "SkullKingCrewLedger"
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
  supportSource.includes(
    'export const SUPPORT_URL = "https://buymeacoffee.com/gabrielctn"'
  ) && homeSource.includes("Linking.openURL(SUPPORT_URL)")
);
check(
  "home discloses what the App Store listing costs every year",
  homeSource.includes("t.home.supportCost(APP_STORE_ANNUAL_COST_EUR)") &&
    supportSource.includes("export const APP_STORE_ANNUAL_COST_EUR = 100")
);
for (const [language, strings] of Object.entries({ en, fr, es, de, ar, zh })) {
  const cost = APP_STORE_ANNUAL_COST_EUR;
  check(
    `${language} names the App Store and the yearly amount`,
    [strings.home.supportCost(cost), strings.supportPrompt.cost(cost)].every(
      (copy) => copy.includes("App Store") && copy.includes(String(cost))
    )
  );
}
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
