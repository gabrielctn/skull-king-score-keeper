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

check(
  "native and PWA names match the App Store name",
  appConfig.name === "Skull King Score Keeper" &&
    appConfig.web.name === appConfig.name &&
    appConfig.web.shortName === appConfig.name &&
    manifest.name === appConfig.name &&
    manifest.short_name === appConfig.name
);
check("web and manifest full names match", appConfig.web.name === manifest.name);
check(
  "localized home branding matches the app name",
  [en, fr, de, es, ar, zh].every(
    ({ home }) =>
      home.title === "Skull King" && home.subtitle === "Score Keeper"
  )
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

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
