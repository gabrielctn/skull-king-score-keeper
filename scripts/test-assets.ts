import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

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

function pngInfo(path: string) {
  const data = readFileSync(path);
  const signature = "89504e470d0a1a0a";
  check(`${path} is a PNG`, data.subarray(0, 8).toString("hex") === signature);
  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
    colorType: data[25],
  };
}

function walk(path: string): string[] {
  if (!existsSync(path)) return [];
  return readdirSync(path).flatMap((entry) => {
    const child = join(path, entry);
    return statSync(child).isDirectory() ? walk(child) : [child];
  });
}

const transparentIllustrations = [
  "assets/illustrations/skull-king.png",
  "assets/illustrations/compass.png",
  "assets/illustrations/parrot.png",
  "assets/illustrations/mermaid.png",
  "assets/illustrations/treasure-chest.png",
];

for (const path of transparentIllustrations) {
  check(`${path} exists`, existsSync(path));
  if (!existsSync(path)) continue;
  const info = pngInfo(path);
  check(`${path} is at least 1024px`, Math.min(info.width, info.height) >= 1024);
  check(`${path} has alpha`, info.colorType === 4 || info.colorType === 6);
}

const brandAssets = [
  ["assets/icon.png", 1024, 1024, false],
  ["assets/adaptive-icon.png", 1024, 1024, true],
  ["assets/splash-icon.png", 1024, 1024, true],
  ["assets/favicon.png", 48, 48, false],
] as const;

for (const [path, width, height, requireAlpha] of brandAssets) {
  check(`${path} exists`, existsSync(path));
  if (!existsSync(path)) continue;
  const info = pngInfo(path);
  check(`${path} dimensions`, info.width === width && info.height === height);
  if (requireAlpha) {
    check(`${path} has alpha`, info.colorType === 4 || info.colorType === 6);
  }
}

const appConfig = JSON.parse(readFileSync("app.json", "utf8")).expo;
check("Expo icon reference", appConfig.icon === "./assets/icon.png");
check("Expo splash reference", appConfig.splash.image === "./assets/splash-icon.png");
check(
  "Expo adaptive icon reference",
  appConfig.android.adaptiveIcon.foregroundImage === "./assets/adaptive-icon.png"
);
check("Expo favicon reference", appConfig.web.favicon === "./assets/favicon.png");

const sourceFiles = walk("src").filter((path) =>
  [".ts", ".tsx"].includes(extname(path))
);
const forbidden = sourceFiles.filter((path) => {
  const source = readFileSync(path, "utf8");
  return (
    source.includes("react-native-svg") ||
    source.includes("../illustrations")
  );
});
check(
  "No source file consumes SVG illustrations",
  forbidden.length === 0,
  forbidden.map((path) => relative(".", path)).join(", ")
);

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
check(
  "react-native-svg dependency removed",
  !packageJson.dependencies?.["react-native-svg"]
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
