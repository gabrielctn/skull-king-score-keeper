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
  gameSource.includes("const bonusCount =") &&
    gameSource.includes("styles.bonusBadge")
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
