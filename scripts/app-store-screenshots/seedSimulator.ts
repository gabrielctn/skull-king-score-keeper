import { execFileSync, type ExecFileException } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import {
  APP_STORE_FIXTURE_SCENARIOS,
  createAppStoreScreenshotSeed,
  type AppStoreFixtureScenario,
} from "../../src/appStoreScreenshotFixture";
import type { AppStoreScreenshotLocale } from "./contracts";
import {
  type AsyncStorageEntries,
  writeAsyncStorageLayout,
} from "./asyncStorageIos";

export interface SeedSimulatorOptions {
  udid: string;
  simulatorName: string;
  locale: AppStoreScreenshotLocale;
  scenario: AppStoreFixtureScenario;
  destination: "home" | "continueGame" | "statistics" | "newGame";
}

const EXPECTED_VERSION = "1.11.1";
const EXPECTED_BUILD = "7";
const BUNDLE_ID = "com.gabrielcretin.skullking";
const CAPTURE_SIMULATOR_PREFIX = "Skull King Capture ";
const DESTINATION_KEY =
  "skullkingcrewledger.appIntents.pendingDestination";
const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const FIXTURE_OWNER = {
  ownerId: "00000000-0000-4000-8000-000000000111",
  writerKey: "7".repeat(64),
} as const;

const DESTINATIONS = [
  "home",
  "continueGame",
  "statistics",
  "newGame",
] as const;

export function assertCaptureSimulatorName(simulatorName: string): void {
  if (!simulatorName.startsWith(CAPTURE_SIMULATOR_PREFIX)) {
    throw new Error(
      `Refusing to modify simulator "${simulatorName}"; its name must start with "${CAPTURE_SIMULATOR_PREFIX}"`
    );
  }
}

export function buildSeedEntries(
  options: Pick<SeedSimulatorOptions, "locale" | "scenario">
): AsyncStorageEntries {
  const seed = createAppStoreScreenshotSeed(
    options.locale,
    options.scenario
  );
  const membership = {
    ...FIXTURE_OWNER,
    name: seed.tableName,
  };

  return {
    "skullking:currentGame": JSON.stringify(seed.currentGame),
    "skullking:gameHistory": JSON.stringify(seed.history),
    "skullking:gameDeletions": JSON.stringify(seed.deletions),
    "skullking:lang": seed.locale,
    "skullking:seenRelease": seed.seenRelease,
    "skullking:settings": JSON.stringify(seed.settings),
    "skullking:supportPrompt": JSON.stringify(seed.supportPrompt),
    "skullking:tableName": seed.tableName,
    "skullking:tables": JSON.stringify([membership]),
    "skullking:cloudOwner": JSON.stringify(FIXTURE_OWNER),
  };
}

function readJson(relativePath: string): any {
  return JSON.parse(
    readFileSync(resolve(PROJECT_ROOT, relativePath), "utf8")
  );
}

export function assertScreenshotBuildVersion(): void {
  const packageJson = readJson("package.json");
  const packageLock = readJson("package-lock.json");
  const appJson = readJson("app.json");

  const versions = [
    ["package.json", packageJson.version],
    ["package-lock.json", packageLock.version],
    ["package-lock.json root package", packageLock.packages?.[""]?.version],
    ["app.json", appJson.expo?.version],
  ] as const;

  for (const [source, version] of versions) {
    if (version !== EXPECTED_VERSION) {
      throw new Error(
        `${source} must report version ${EXPECTED_VERSION}, got ${String(version)}`
      );
    }
  }
  if (appJson.expo?.ios?.buildNumber !== EXPECTED_BUILD) {
    throw new Error(
      `app.json must report iOS build ${EXPECTED_BUILD}, got ${String(appJson.expo?.ios?.buildNumber)}`
    );
  }
}

function requiredFlag(
  flags: ReadonlyMap<string, string>,
  name: string
): string {
  const value = flags.get(name);
  if (!value) throw new Error(`Missing required --${name} flag`);
  return value;
}

export function parseSeedSimulatorArgs(
  args: readonly string[]
): SeedSimulatorOptions {
  const flags = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if (!flag?.startsWith("--") || !value || value.startsWith("--")) {
      throw new Error(`Invalid flag sequence near ${flag ?? "end of input"}`);
    }
    const name = flag.slice(2);
    if (
      ![
        "udid",
        "simulator-name",
        "locale",
        "scenario",
        "destination",
      ].includes(name)
    ) {
      throw new Error(`Unknown flag --${name}`);
    }
    if (flags.has(name)) throw new Error(`Duplicate flag --${name}`);
    flags.set(name, value);
  }

  const locale = requiredFlag(flags, "locale");
  const scenario = requiredFlag(flags, "scenario");
  const destination = requiredFlag(flags, "destination");
  if (locale !== "en" && locale !== "fr") {
    throw new Error(`Unsupported locale: ${locale}`);
  }
  if (
    !(APP_STORE_FIXTURE_SCENARIOS as readonly string[]).includes(scenario)
  ) {
    throw new Error(`Unsupported scenario: ${scenario}`);
  }
  if (!(DESTINATIONS as readonly string[]).includes(destination)) {
    throw new Error(`Unsupported destination: ${destination}`);
  }

  return {
    udid: requiredFlag(flags, "udid"),
    simulatorName: requiredFlag(flags, "simulator-name"),
    locale,
    scenario: scenario as AppStoreFixtureScenario,
    destination: destination as SeedSimulatorOptions["destination"],
  };
}

function terminateApp(udid: string): void {
  try {
    execFileSync("xcrun", ["simctl", "terminate", udid, BUNDLE_ID], {
      encoding: "utf8",
      stdio: "pipe",
    });
  } catch (error) {
    const processError = error as ExecFileException;
    const detail = `${processError.stderr ?? ""}\n${processError.message}`;
    if (!/found nothing to terminate|no such process|not running/i.test(detail)) {
      throw error;
    }
  }
}

function resolveDataContainer(udid: string): string {
  const container = execFileSync(
    "xcrun",
    ["simctl", "get_app_container", udid, BUNDLE_ID, "data"],
    { encoding: "utf8" }
  ).trim();
  if (!container) throw new Error("simctl returned an empty app data container");
  return container;
}

function setPendingDestination(
  udid: string,
  destination: SeedSimulatorOptions["destination"]
): void {
  if (destination === "home") {
    try {
      execFileSync(
        "xcrun",
        ["simctl", "spawn", udid, "defaults", "delete", BUNDLE_ID, DESTINATION_KEY],
        { encoding: "utf8", stdio: "pipe" }
      );
    } catch (error) {
      const processError = error as ExecFileException;
      const detail = `${processError.stderr ?? ""}\n${processError.message}`;
      if (!/does not exist|not found/i.test(detail)) throw error;
    }
    return;
  }

  execFileSync(
    "xcrun",
    [
      "simctl",
      "spawn",
      udid,
      "defaults",
      "write",
      BUNDLE_ID,
      DESTINATION_KEY,
      destination,
    ],
    { encoding: "utf8" }
  );
}

export function seedSimulator(options: SeedSimulatorOptions): void {
  assertScreenshotBuildVersion();
  assertCaptureSimulatorName(options.simulatorName);
  terminateApp(options.udid);

  const entries = buildSeedEntries(options);
  const dataContainer = resolveDataContainer(options.udid);
  writeAsyncStorageLayout(dataContainer, BUNDLE_ID, entries);
  setPendingDestination(options.udid, options.destination);

  const currentGame = JSON.parse(entries["skullking:currentGame"]);
  const history = JSON.parse(entries["skullking:gameHistory"]);
  console.log(`Locale: ${options.locale}`);
  console.log(`Scenario: ${options.scenario}`);
  console.log(`Destination: ${options.destination}`);
  console.log(`Container: ${dataContainer}`);
  console.log(`Current game: ${String(currentGame.id)}`);
  console.log(`History games: ${String(history.length)}`);
}

function main(): void {
  const options = parseSeedSimulatorArgs(process.argv.slice(2));
  seedSimulator(options);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) main();
