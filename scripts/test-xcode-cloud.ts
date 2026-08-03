import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let passed = 0;
let failed = 0;

function check(label: string, ok: boolean) {
  if (ok) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

const root = process.cwd();
const sourceScript = join(root, "ios/ci_scripts/ci_post_clone.sh");
const appConfig = JSON.parse(readFileSync(join(root, "app.json"), "utf8"));

function runPostClone(createWorkspace: boolean) {
  const fixture = mkdtempSync(join(tmpdir(), "skullking-xcode-cloud-"));
  const scriptsDirectory = join(fixture, "ios/ci_scripts");
  const binDirectory = join(fixture, "bin");
  const fixtureScript = join(scriptsDirectory, "ci_post_clone.sh");

  mkdirSync(scriptsDirectory, { recursive: true });
  mkdirSync(binDirectory, { recursive: true });
  copyFileSync(sourceScript, fixtureScript);
  copyFileSync(join(root, "app.json"), join(fixture, "app.json"));
  chmodSync(fixtureScript, 0o755);

  for (const command of ["brew", "npm"]) {
    const stub = join(binDirectory, command);
    writeFileSync(stub, "#!/bin/sh\nexit 0\n");
    chmodSync(stub, 0o755);
  }

  const npxStub = join(binDirectory, "npx");
  writeFileSync(
    npxStub,
    `#!/bin/sh
if [ "\${STUB_CREATE_WORKSPACE:-0}" = "1" ]; then
  mkdir -p "$CI_PRIMARY_REPOSITORY_PATH/ios/SkullKingCrewLedger.xcworkspace"
fi
exit 0
`
  );
  chmodSync(npxStub, 0o755);

  const result = spawnSync(fixtureScript, [], {
    cwd: fixture,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${binDirectory}:${process.env.PATH ?? ""}`,
      CI_PRIMARY_REPOSITORY_PATH: fixture,
      CI_WORKSPACE: fixture,
      CI_BUILD_NUMBER: "",
      STUB_CREATE_WORKSPACE: createWorkspace ? "1" : "0",
    },
  });

  return {
    fixture,
    result,
    scriptSurvived: existsSync(fixtureScript),
  };
}

console.log("\nXcode Cloud technical identity");
check(
  "Expo uses the Crew Ledger project name",
  appConfig.expo.name === "Skull King Crew Ledger"
);
check(
  "Expo uses the Crew Ledger project slug",
  appConfig.expo.slug === "skull-king-crew-ledger"
);

const success = runPostClone(true);
const failure = runPostClone(false);

try {
  check(
    "post-clone accepts the Crew Ledger workspace",
    success.result.status === 0
  );
  check("post-clone preserves its CI scripts", success.scriptSurvived);
  check(
    "post-clone rejects a missing Crew Ledger workspace",
    failure.result.status !== 0
  );
  check(
    "the missing-workspace error names the expected path",
    failure.result.stderr.includes(
      "prebuild did not generate ios/SkullKingCrewLedger.xcworkspace."
    )
  );
  check(
    "the diagnostic names the Crew Ledger Expo project",
    failure.result.stderr.includes(
      'Check that expo.name in app.json is still "Skull King Crew Ledger".'
    )
  );
  check(
    "the diagnostic no longer mentions the legacy project name",
    !failure.result.stderr.includes("Skull King Score Keeper")
  );
} finally {
  rmSync(success.fixture, { recursive: true, force: true });
  rmSync(failure.fixture, { recursive: true, force: true });
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
