import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

export type AsyncStorageEntries = Readonly<Record<string, string>>;

export interface AsyncStorageLayout {
  manifest: Record<string, string | null>;
  files: ReadonlyMap<string, string>;
}

const INLINE_VALUE_THRESHOLD = 1024;
const EXPECTED_BUNDLE_ID = "com.gabrielcretin.skullking";
const STORAGE_DIRECTORY_PARTS = [
  "Library",
  "Application Support",
  EXPECTED_BUNDLE_ID,
  "RCTAsyncLocalStorage_V1",
] as const;

export function asyncStorageFileName(key: string): string {
  return createHash("md5").update(key, "utf8").digest("hex");
}

export function buildAsyncStorageLayout(
  entries: AsyncStorageEntries
): AsyncStorageLayout {
  const manifest: Record<string, string | null> = {};
  const files = new Map<string, string>();

  for (const [key, value] of Object.entries(entries)) {
    if (value.length <= INLINE_VALUE_THRESHOLD) {
      manifest[key] = value;
      continue;
    }

    manifest[key] = null;
    files.set(asyncStorageFileName(key), value);
  }

  return { manifest, files };
}

function storageDirectory(dataContainer: string, bundleId: string): string {
  if (bundleId !== EXPECTED_BUNDLE_ID) {
    throw new Error(
      `Refusing to seed unexpected bundle identifier: ${bundleId}`
    );
  }

  const container = resolve(dataContainer);
  const directory = resolve(container, ...STORAGE_DIRECTORY_PARTS);
  const relativeDirectory = relative(container, directory);
  const expectedSuffix = join(...STORAGE_DIRECTORY_PARTS);

  if (
    relativeDirectory === "" ||
    relativeDirectory === ".." ||
    relativeDirectory.startsWith(`..${sep}`) ||
    resolve(container, relativeDirectory) !== directory ||
    !directory.endsWith(expectedSuffix)
  ) {
    throw new Error(`Unsafe AsyncStorage directory: ${directory}`);
  }

  return directory;
}

export function writeAsyncStorageLayout(
  dataContainer: string,
  bundleId: string,
  entries: AsyncStorageEntries
): void {
  const directory = storageDirectory(dataContainer, bundleId);
  const layout = buildAsyncStorageLayout(entries);

  rmSync(directory, { recursive: true, force: true });
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    join(directory, "manifest.json"),
    JSON.stringify(layout.manifest),
    "utf8"
  );

  for (const [fileName, value] of layout.files) {
    writeFileSync(join(directory, fileName), value, "utf8");
  }
}
