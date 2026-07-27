import { readFileSync } from "node:fs";
import { ar } from "../src/i18n/ar";
import { de } from "../src/i18n/de";
import { en } from "../src/i18n/en";
import { es } from "../src/i18n/es";
import { fr } from "../src/i18n/fr";
import { zh } from "../src/i18n/zh";
import { CURRENT_RELEASE } from "../src/releases";

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

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const packageLock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const appConfig = JSON.parse(readFileSync("app.json", "utf8")).expo;
const cookieSource = readFileSync(
  "src/components/CookieConsentBanner.tsx",
  "utf8"
);
const stepperSource = readFileSync("src/components/Stepper.tsx", "utf8");
const setupSource = readFileSync("src/screens/SetupScreen.tsx", "utf8");
const homeSource = readFileSync("src/screens/HomeScreen.tsx", "utf8");
const appSource = readFileSync("App.tsx", "utf8");
const gameSource = readFileSync("src/screens/GameScreen.tsx", "utf8");
const resultsSource = readFileSync("src/screens/ResultsScreen.tsx", "utf8");
const scoreBreakdownSource = readFileSync(
  "src/components/ScoreBreakdownModal.tsx",
  "utf8"
);
const podiumSource = readFileSync("src/components/Podium.tsx", "utf8");
const chartSource = readFileSync("src/components/ScoreChart.tsx", "utf8");
const ltrViewSource = readFileSync("src/components/LtrView.tsx", "utf8");
const playerFacingTextSources = [
  "src/i18n/en.ts",
  "src/i18n/fr.ts",
  "src/i18n/es.ts",
  "src/i18n/de.ts",
  "src/i18n/ar.ts",
  "src/i18n/zh.ts",
  "app.json",
  "web/manifest.webmanifest",
].map((path) => readFileSync(path, "utf8"));

check(
  "release versions stay aligned",
  [packageJson.version, packageLock.version, packageLock.packages[""].version, appConfig.version]
    .every((version) => version === CURRENT_RELEASE)
);
check(
  "consent prompt participates in page layout",
  !cookieSource.includes('position: "absolute"')
);
check(
  "active game is excluded from recent history",
  homeSource.includes("historyGame.id !== activeGame.id")
);
check(
  "active game summary shows progress, activity and every player",
  homeSource.includes("t.home.playersRound(") &&
    homeSource.includes("t.home.lastPlayed(") &&
    homeSource.includes("activeGame.players.map((player)")
);
check(
  "active game can be abandoned after a dedicated confirmation",
  homeSource.includes('intent: "abandon"') &&
    homeSource.includes("t.home.abandonMessage") &&
    appSource.includes("const nextCurrent = current?.id === gameId ? null : current")
);
check(
  "quick setup exposes an active-rule summary",
  setupSource.includes("const activeRules = [") &&
    setupSource.includes("styles.ruleChips")
);
check(
  "two-player ghost control is outside advanced customization",
  setupSource.indexOf("{isTwoPlayer ? (") <
    setupSource.indexOf("{customizationVisible ? (")
);
check(
  "stepper supports context-rich accessible labels",
  stepperSource.includes("accessibilityLabel?: string") &&
    stepperSource.includes("accessibilityLabel ?? label")
);
check(
  "untouched round score no longer appears just because the round is valid",
  !gameSource.includes("alreadyRecorded || roundReady || entryTouched") &&
    gameSource.includes("t.game.roundPointsPreview")
);
check(
  "collapsed bonus editors expose recorded counts",
  gameSource.includes("bonusCount(entry.bonus)") &&
    gameSource.includes("styles.bonusBadge")
);
check(
  "bonus control keeps a compact-screen gap when its count is visible",
  gameSource.includes("steppers: {") &&
    gameSource.includes("columnGap: spacing.xs") &&
    gameSource.includes("bonusToggle: {") &&
    gameSource.includes("paddingHorizontal: spacing.xs")
);
check(
  "player-facing text contains no en or em dashes",
  !/[–—]/u.test(
    [
      ...playerFacingTextSources,
      gameSource,
      scoreBreakdownSource,
    ].join("\n")
  )
);
check(
  "desktop round validation is rendered inside the score sheet",
  gameSource.includes("layout.isDesktop ? (") &&
    gameSource.includes("styles.footerDesktop")
);
check(
  "results have one primary next action",
  resultsSource.includes("style={styles.reviewBtn}") &&
    resultsSource.includes("style={styles.secondaryBtn}")
);

// React Native Web deletes `direction` from a StyleSheet and logs an error for
// it, so a view that must not mirror under Arabic cannot ask for it that way —
// it has to go through LtrView, which sets the DOM `dir` attribute on web.
// Without this the podium renders bronze-gold-silver in a right-to-left locale.
const rnStyleSources: [string, string][] = [
  ["src/components/Podium.tsx", podiumSource],
  ["src/components/ScoreChart.tsx", chartSource],
  ["src/screens/GameScreen.tsx", gameSource],
  ["src/screens/HomeScreen.tsx", homeSource],
  ["src/screens/ResultsScreen.tsx", resultsSource],
  ["src/screens/SetupScreen.tsx", setupSource],
];
for (const [name, source] of rnStyleSources) {
  const stylesheet = source.slice(source.indexOf("StyleSheet.create("));
  check(
    `${name} keeps "direction" out of its StyleSheet`,
    !/\bdirection:\s*["']/.test(stylesheet),
    'react-native-web rejects it; wrap the view in LtrView instead'
  );
}
check(
  "the views that must not mirror in RTL go through LtrView",
  podiumSource.includes("<LtrView style={styles.podiumRow}>") &&
    chartSource.includes("<LtrView style={styles.legend}>")
);
check(
  "LtrView sets the DOM dir attribute on web, not a direction style",
  ltrViewSource.includes('dir: "ltr"') &&
    ltrViewSource.includes('Platform.OS === "web"')
);

for (const [language, strings] of Object.entries({ en, fr, es, de, ar, zh })) {
  check(
    `${language} labels provisional scores`,
    strings.game.roundPointsPreview.trim().length > 0
  );
  check(
    `${language} release notes describe this UX release`,
    strings.whatsNew.items.length === 2
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
