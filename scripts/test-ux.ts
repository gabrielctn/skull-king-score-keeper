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
const xcodeCloudSource = readFileSync(
  "ios/ci_scripts/ci_post_clone.sh",
  "utf8"
);
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
const bonusEditorSource = readFileSync("src/components/BonusEditor.tsx", "utf8");
const gameRulesSource = readFileSync(
  "src/components/GameRulesModal.tsx",
  "utf8"
);
const settingsSource = readFileSync("src/screens/SettingsScreen.tsx", "utf8");
const statsSource = readFileSync("src/screens/StatsScreen.tsx", "utf8");
const spectatorSource = readFileSync("src/screens/SpectatorScreen.tsx", "utf8");
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
  "the local iOS build number is a positive integer",
  /^[1-9]\d*$/.test(appConfig.ios.buildNumber)
);
check(
  "Xcode Cloud stamps its unique build number before generating iOS",
  xcodeCloudSource.includes("CI_BUILD_NUMBER") &&
    xcodeCloudSource.indexOf("CI_BUILD_NUMBER") <
      xcodeCloudSource.indexOf("npx expo prebuild --platform ios")
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
check(
  "new expansion is on by default for new games",
  /const \[newExpansion, setNewExpansion\] = useState\(true\)/.test(setupSource)
);
check(
  "bonus editor groups count rows before toggle rows",
  bonusEditorSource.indexOf("t.bonus.pirateBySkullKing") <
    bonusEditorSource.indexOf("t.bonus.black14") &&
    bonusEditorSource.indexOf("t.bonus.black14") <
      bonusEditorSource.indexOf("t.bonus.mermaidCapturesSkullKing")
);
check(
  "game header exposes a labeled Live pill that reflects the session state",
  gameSource.includes("t.liveShare.badge") &&
    gameSource.includes("styles.livePillActive") &&
    gameSource.includes("liveSessionManager")
);
check(
  "turn order names the leader and numbers the seats",
  gameSource.includes("t.game.playOrderLead(") &&
    gameSource.includes("styles.turnChipNum") &&
    spectatorSource.includes("t.game.playOrderLead(") &&
    spectatorSource.includes("styles.turnChipNum")
);
check(
  "game rules can be edited mid-game through the header modal",
  gameSource.includes("GameRulesModal") &&
    gameSource.includes("t.gameSettings.open")
);
check(
  "mid-game rule edits re-apply the creation invariants",
  gameRulesSource.includes('next.scoringMode === "rascal" && next.rascalBets') &&
    gameRulesSource.includes(
      'next.scoringMode === "classic" && next.bonusesRequireBid'
    )
);
check(
  "the app consumes table join links behind an explicit confirmation",
  appSource.includes("consumeScannedJoinCode") &&
    appSource.includes("JoinTableModal")
);
check(
  "settings share the table through a QR code and invite link",
  settingsSource.includes("buildJoinUrl") &&
    settingsSource.includes("qrCodeDataUrl") &&
    settingsSource.includes("t.settings.cloud.copyLink")
);
check(
  "settings expose invite and join as separate actions",
  settingsSource.includes("const [inviteOpen, setInviteOpen]") &&
    settingsSource.includes("const [joinOpen, setJoinOpen]") &&
    settingsSource.includes("t.settings.cloud.shareTitle") &&
    settingsSource.includes("t.settings.cloud.joinTitle") &&
    settingsSource.includes("expanded: inviteOpen") &&
    settingsSource.includes("expanded: joinOpen")
);
check(
  "settings let the crew name their shared table",
  settingsSource.includes("t.settings.cloud.tableNameLabel") &&
    settingsSource.includes("onRenameTable")
);
check(
  "statistics display the shared table name",
  statsSource.includes("tableName") && appSource.includes("tableName={tableName}")
);
check(
  "settings list every table with a switch and a way to add one",
  settingsSource.includes("t.settings.cloud.tablesTitle") &&
    settingsSource.includes("onSwitchTable(membership.ownerId)") &&
    settingsSource.includes("t.settings.cloud.newTable")
);
check(
  "the last remaining table cannot be removed by accident",
  settingsSource.includes("tables.length > 1 ? (") &&
    appSource.includes("if (tablesRef.current.length <= 1) return;")
);
check(
  "joining a table keeps the other tables instead of merging histories",
  appSource.includes("const handleJoinTable") &&
    appSource.includes("adoptTableData(data, owner)") &&
    !appSource.includes("mergeBackupData(\n      localData,")
);
check(
  "a table change flushes pending games to the table being left",
  appSource.includes("flushBeforeTableChange") &&
    appSource.includes("await cloudBackupManager().flushPending()")
);

for (const [language, strings] of Object.entries({ en, fr, es, de, ar, zh })) {
  check(
    `${language} labels provisional scores`,
    strings.game.roundPointsPreview.trim().length > 0
  );
  check(
    `${language} release notes describe this release`,
    strings.whatsNew.items.length === 6
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
