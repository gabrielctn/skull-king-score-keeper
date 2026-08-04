import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  APP_STORE_SCREENSHOT_DEVICES,
  APP_STORE_SCREENSHOT_LOCALES,
  APP_STORE_SCREENSHOT_SHOTS,
  finalScreenshotPath,
  type AppStoreScreenshotDevice,
} from "./contracts";
import { inspectPng } from "./png";

interface ExpectedExport {
  path: string;
  relativePath: string;
  width: number;
  height: number;
}

function portableRelative(root: string, path: string): string {
  return relative(root, path).split(sep).join("/");
}

function expectedExports(root: string): ExpectedExport[] {
  return APP_STORE_SCREENSHOT_LOCALES.flatMap((locale) =>
    (Object.keys(APP_STORE_SCREENSHOT_DEVICES) as AppStoreScreenshotDevice[]).flatMap(
      (device) =>
        APP_STORE_SCREENSHOT_SHOTS.map((shot) => {
          const path = finalScreenshotPath(root, locale, device, shot.stem);
          return {
            path,
            relativePath: portableRelative(root, path),
            ...APP_STORE_SCREENSHOT_DEVICES[device],
          };
        })
    )
  );
}

function pngFilesBelow(directory: string): string[] {
  if (!existsSync(directory)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...pngFilesBelow(path));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
      files.push(path);
    }
  }
  return files;
}

export function validateAppStoreScreenshotExports(root: string): void {
  const absoluteRoot = resolve(root);
  const expected = expectedExports(absoluteRoot);
  if (expected.length !== 32) {
    throw new Error(
      `Screenshot contract must define exactly 32 exports, got ${expected.length}`
    );
  }

  const expectedPaths = new Set(expected.map((entry) => entry.relativePath));
  const actualPaths = new Set(
    pngFilesBelow(absoluteRoot).map((path) => portableRelative(absoluteRoot, path))
  );
  const missing = [...expectedPaths].filter((path) => !actualPaths.has(path));
  const unexpected = [...actualPaths].filter((path) => !expectedPaths.has(path));
  const treeErrors: string[] = [];
  if (missing.length > 0) {
    treeErrors.push(`Missing PNG files:\n${missing.sort().join("\n")}`);
  }
  if (unexpected.length > 0) {
    treeErrors.push(
      `Unexpected PNG files:\n${unexpected.sort().join("\n")}`
    );
  }
  if (treeErrors.length > 0) throw new Error(treeErrors.join("\n\n"));

  const errors: string[] = [];
  const reports: string[] = [];
  const contentHashes = new Map<string, string>();
  for (const exportFile of expected) {
    try {
      const buffer = readFileSync(exportFile.path);
      const hash = createHash("sha256").update(buffer).digest("hex");
      const duplicateOf = contentHashes.get(hash);
      if (duplicateOf) {
        errors.push(
          `${exportFile.relativePath}: byte-for-byte duplicate of ${duplicateOf}`
        );
      } else {
        contentHashes.set(hash, exportFile.relativePath);
      }

      const inspection = inspectPng(buffer);
      if (
        inspection.width !== exportFile.width ||
        inspection.height !== exportFile.height
      ) {
        errors.push(
          `${exportFile.relativePath}: expected ${exportFile.width}x${exportFile.height}, got ${inspection.width}x${inspection.height}`
        );
      }
      if (!inspection.opaque) {
        errors.push(`${exportFile.relativePath}: final PNG must be fully opaque`);
      }
      reports.push(
        `${exportFile.relativePath}: ${inspection.width}x${inspection.height}, opaque ${inspection.colorType === 2 ? "RGB" : "RGBA"}`
      );
    } catch (error) {
      errors.push(
        `${exportFile.relativePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (errors.length > 0) throw new Error(errors.join("\n"));
  for (const report of reports) console.log(report);
  console.log("32 App Store screenshots valid");
}

function main(): void {
  const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  const root = process.argv[2]
    ? resolve(process.argv[2])
    : join(projectRoot, "marketing", "app-store", "screenshots");
  validateAppStoreScreenshotExports(root);
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : null;
if (invokedPath === import.meta.url) main();
