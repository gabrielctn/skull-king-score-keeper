# Raster Illustrations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the five React Native SVG illustrations and four Expo brand assets with a coherent, original painted raster collection in a distinct nautical-pirate direction.

**Architecture:** Generate six source rasters with the built-in image generator: five transparent subjects plus one opaque leather-and-map texture. Post-process them into project-owned PNG files, derive the Expo icon variants from the same Skull King source, expose app illustrations through one typed asset manifest, and render them with React Native `Image`. A focused asset test validates file presence, PNG dimensions, alpha requirements, Expo references, and the complete removal of SVG illustration usage.

**Tech Stack:** Expo 54, React Native 0.81, TypeScript 5.9, built-in image generation, local chroma-key removal, Pillow/ImageMagick-compatible raster processing, Node asset validation.

---

## File Structure

### New files

- `assets/illustrations/skull-king.png` — transparent painted Skull King emblem.
- `assets/illustrations/compass.png` — transparent engraved compass rose.
- `assets/illustrations/parrot.png` — transparent painted pirate parrot.
- `assets/illustrations/mermaid.png` — transparent painted mermaid.
- `assets/illustrations/treasure-chest.png` — transparent painted open treasure chest.
- `assets/brand/leather-map-texture.png` — opaque square leather/map texture used to derive brand assets.
- `src/assets/illustrations.ts` — typed manifest for local illustration sources.
- `scripts/test-assets.ts` — structural validation of raster assets and SVG removal.
- `scripts/build-brand-assets.py` — deterministic composition of icon, adaptive icon, splash, and favicon.

### Modified files

- `src/screens/HomeScreen.tsx` — render Skull King and compass with `Image`.
- `src/screens/SetupScreen.tsx` — render parrot with `Image`.
- `src/components/RulesModal.tsx` — render mermaid with `Image`.
- `src/screens/ResultsScreen.tsx` — render treasure chest with `Image`.
- `package.json` — add `test:assets` and remove `react-native-svg`.
- `package-lock.json` — synchronize dependency removal.
- `assets/icon.png` — replace with derived raster icon.
- `assets/adaptive-icon.png` — replace with derived transparent foreground.
- `assets/splash-icon.png` — replace with derived transparent emblem.
- `assets/favicon.png` — replace with reduced icon.

### Deleted files

- `src/illustrations/SkullKing.tsx`
- `src/illustrations/Compass.tsx`
- `src/illustrations/Parrot.tsx`
- `src/illustrations/Mermaid.tsx`
- `src/illustrations/TreasureChest.tsx`
- `src/illustrations/index.ts`

## Shared Art Direction

All generated subjects use the following invariant:

```text
Original painted pirate-card illustration inspired by antique nautical game-box art, without copying any existing logo or composition. Traditional gouache and ink texture, hand-painted irregular contours, engraved hatching, warm theatrical light, aged gold and copper, burnt-leather browns, charcoal black, restrained turquoise edge shadows. Adult and dramatic rather than cute, chibi, glossy vector, flat clip-art, or modern 3D. No text, no lettering, no watermark, no logo, no UI frame.
```

Transparent sources are generated on perfectly flat `#ff00ff` chroma-key backgrounds, because magenta is absent from the target palette.

---

### Task 1: Add the asset contract test

**Files:**
- Create: `scripts/test-assets.ts`
- Modify: `package.json:5-12`

- [ ] **Step 1: Write the failing asset validator**

Create `scripts/test-assets.ts`:

```ts
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

const sourceFiles = walk("src").filter((path) => [".ts", ".tsx"].includes(extname(path)));
const forbidden = sourceFiles.filter((path) => {
  const source = readFileSync(path, "utf8");
  return source.includes("react-native-svg") || source.includes("../illustrations");
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
```

- [ ] **Step 2: Add the test script**

Change the `scripts` object in `package.json` to include:

```json
"test:assets": "node --import tsx scripts/test-assets.ts"
```

- [ ] **Step 3: Run the test and verify the new contract fails**

Run:

```bash
npm run test:assets
```

Expected: FAIL for missing `assets/illustrations/*.png`, remaining SVG consumers, and the `react-native-svg` dependency.

- [ ] **Step 4: Commit the failing contract**

```bash
git add scripts/test-assets.ts package.json
git commit -m "test: define raster asset contract"
```

---

### Task 2: Generate and clean the five painted illustrations

**Files:**
- Create: `assets/illustrations/skull-king.png`
- Create: `assets/illustrations/compass.png`
- Create: `assets/illustrations/parrot.png`
- Create: `assets/illustrations/mermaid.png`
- Create: `assets/illustrations/treasure-chest.png`

- [ ] **Step 1: Generate the Skull King source**

Use the built-in image generator with:

```text
Use case: illustration-story
Asset type: transparent mobile-app hero emblem
Primary request: a frontal crowned pirate skull, regal and slightly menacing, with a tall irregular aged-gold crown and subtle crossed cutlasses behind it
Style/medium: original traditional gouache and ink illustration, engraved hatching, visible brush texture, antique nautical card-game art
Composition/framing: centered, compact vertical silhouette, entire crown and cutlass tips visible, generous padding, readable at 150px
Lighting/mood: warm theatrical light, mysterious and adventurous
Color palette: bone ivory, charcoal black, aged gold, copper shadows, restrained turquoise rim shadows
Constraints: no copied logo or composition; no text; no watermark; no cute or cartoon styling
Background: perfectly flat solid #ff00ff chroma-key, uniform with no shadow, gradient, texture, floor, or reflection; do not use #ff00ff in the subject
```

Copy the generated source into `assets/illustrations/_source-skull-king.png`, remove the chroma key with:

```bash
python "${CODEX_HOME:-$HOME/.codex}/skills/.system/imagegen/scripts/remove_chroma_key.py" \
  --input assets/illustrations/_source-skull-king.png \
  --out assets/illustrations/skull-king.png \
  --auto-key border \
  --soft-matte \
  --transparent-threshold 12 \
  --opaque-threshold 220 \
  --despill
```

Validate transparent corners and retry once with `--edge-contract 1` if a magenta fringe remains.

- [ ] **Step 2: Generate the compass source**

Use:

```text
Use case: illustration-story
Asset type: transparent decorative background motif
Primary request: an ornate antique compass rose engraved in aged brass, with long cardinal points, delicate nautical linework, and subtle hand-painted irregularity
Style/medium: original gouache, ink, and engraved hatching on metal; antique pirate card-game illustration
Composition/framing: perfectly centered circular motif, all points visible, generous square padding, still readable at low opacity behind another emblem
Lighting/mood: warm worn metal, restrained contrast
Color palette: aged gold, brass, copper, charcoal linework, very subtle turquoise oxidation
Constraints: no letters, no text, no watermark, no modern vector geometry
Background: perfectly flat solid #ff00ff chroma-key, uniform with no shadow, gradient, texture, floor, or reflection; do not use #ff00ff in the subject
```

Save and remove chroma key into `assets/illustrations/compass.png` using the same command pattern.

- [ ] **Step 3: Generate the parrot source**

Use:

```text
Use case: illustration-story
Asset type: transparent mobile-app character illustration
Primary request: an adult pirate parrot perched in a compact pose, alert and sly rather than cute, with expressive eye, layered feathers, and a small aged-gold leg ring
Style/medium: original traditional gouache and ink, engraved feather hatching, antique nautical card-game illustration
Composition/framing: centered full body, perch included, compact vertical silhouette, all tail feathers visible, readable at 96px
Lighting/mood: warm adventurous light, confident personality
Color palette: deep crimson, petrol blue, muted ochre, aged gold, charcoal, subtle turquoise edge shadows
Constraints: no hat, no text, no watermark, no mascot or chibi proportions
Background: perfectly flat solid #ff00ff chroma-key, uniform with no shadow, gradient, texture, floor, or reflection; do not use #ff00ff in the subject
```

Save and remove chroma key into `assets/illustrations/parrot.png`. Inspect feather edges closely; use one `--edge-contract 1` retry if necessary.

- [ ] **Step 4: Generate the mermaid source**

Use:

```text
Use case: illustration-story
Asset type: transparent mobile-app character illustration
Primary request: a mysterious adult mermaid from a pirate legend, elegant three-quarter pose, flowing dark auburn hair, scaled turquoise tail, aged-gold jewelry, poised and formidable rather than cute
Style/medium: original traditional gouache and ink, engraved hatching, antique nautical card-game illustration
Composition/framing: centered compact bust-and-tail silhouette, no cropped hair or fins, strong face readability at 38px
Lighting/mood: warm copper light with cool maritime shadows, alluring and dangerous
Color palette: turquoise, deep teal, copper, aged gold, warm skin, charcoal, restrained ivory highlights
Constraints: tasteful non-explicit clothing, no text, no watermark, no childlike or cartoon styling
Background: perfectly flat solid #ff00ff chroma-key, uniform with no shadow, gradient, texture, floor, or reflection; do not use #ff00ff in the subject
```

Save and remove chroma key into `assets/illustrations/mermaid.png`. Inspect hair and fin edges; use one `--edge-contract 1` retry if necessary.

- [ ] **Step 5: Generate the treasure chest source**

Use:

```text
Use case: illustration-story
Asset type: transparent mobile-app celebration illustration
Primary request: an open pirate treasure chest made of dark weathered wood and ornate aged-gold fittings, overflowing with coins and a few restrained colored gems
Style/medium: original traditional gouache and ink, engraved wood grain and metal hatching, antique nautical card-game illustration
Composition/framing: centered wide silhouette, entire lid and feet visible, compact enough for a 170px results illustration
Lighting/mood: warm celebratory glow emerging from the chest, dramatic but not neon
Color palette: dark walnut, burnt leather brown, aged gold, copper shadows, restrained turquoise and ruby accents
Constraints: no text, no watermark, no modern 3D render, no excessive sparkle effects
Background: perfectly flat solid #ff00ff chroma-key, uniform with no shadow, gradient, texture, floor, or reflection; do not use #ff00ff in the subject
```

Save and remove chroma key into `assets/illustrations/treasure-chest.png`.

- [ ] **Step 6: Remove discarded chroma-key sources**

After all transparent outputs pass visual inspection, delete only the `_source-*.png` files with `apply_patch` or an approved file removal operation. Preserve the five final PNG files.

- [ ] **Step 7: Run the asset test to confirm only integration checks remain**

Run:

```bash
npm run test:assets
```

Expected: illustration existence, minimum dimensions, and alpha checks PASS; SVG-consumer and dependency-removal checks still FAIL.

- [ ] **Step 8: Commit the illustration collection**

```bash
git add assets/illustrations
git commit -m "feat: add painted raster illustrations"
```

---

### Task 3: Generate the brand texture and derive Expo assets

**Files:**
- Create: `assets/brand/leather-map-texture.png`
- Create: `scripts/build-brand-assets.py`
- Modify: `assets/icon.png`
- Modify: `assets/adaptive-icon.png`
- Modify: `assets/splash-icon.png`
- Modify: `assets/favicon.png`

- [ ] **Step 1: Generate the opaque brand texture**

Use:

```text
Use case: stylized-concept
Asset type: square app-icon background texture
Primary request: an original antique burnt-leather nautical map surface, darkened edges, subtle compass engraving, faint ink hatching, worn copper undertones, no central subject
Style/medium: traditional painted game-box texture, tactile leather grain and ink wash
Composition/framing: seamless-feeling square, calm center reserved for a foreground emblem, darker vignette at edges
Color palette: black-brown, burnt leather, copper, ochre, restrained aged gold
Constraints: no text, no letters, no skull, no logo, no watermark, no bright hotspot
```

Save the opaque output as `assets/brand/leather-map-texture.png`.

- [ ] **Step 2: Write deterministic brand composition**

Create `scripts/build-brand-assets.py`:

```python
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SKULL = Image.open(ROOT / "assets/illustrations/skull-king.png").convert("RGBA")
TEXTURE = Image.open(ROOT / "assets/brand/leather-map-texture.png").convert("RGB")

def contain(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    copy = image.copy()
    copy.thumbnail(size, Image.Resampling.LANCZOS)
    return copy

def centered_paste(canvas: Image.Image, image: Image.Image, y_offset: int = 0) -> None:
    x = (canvas.width - image.width) // 2
    y = (canvas.height - image.height) // 2 + y_offset
    canvas.alpha_composite(image, (x, y))

texture = TEXTURE.resize((1024, 1024), Image.Resampling.LANCZOS)
texture = ImageEnhance.Contrast(texture).enhance(1.08)
texture = ImageEnhance.Color(texture).enhance(0.92)

icon = texture.convert("RGBA")
icon_skull = contain(SKULL, (690, 760))
shadow = Image.new("RGBA", icon.size, (0, 0, 0, 0))
shadow_subject = Image.new("RGBA", icon.size, (0, 0, 0, 0))
centered_paste(shadow_subject, icon_skull, 18)
shadow_alpha = shadow_subject.getchannel("A").filter(ImageFilter.GaussianBlur(18))
shadow.putalpha(shadow_alpha.point(lambda value: int(value * 0.55)))
icon.alpha_composite(shadow, (0, 28))
centered_paste(icon, icon_skull)
icon.convert("RGB").save(ROOT / "assets/icon.png", optimize=True)

adaptive = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
adaptive_skull = contain(SKULL, (540, 600))
centered_paste(adaptive, adaptive_skull)
adaptive.save(ROOT / "assets/adaptive-icon.png", optimize=True)

splash = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
splash_skull = contain(SKULL, (610, 680))
centered_paste(splash, splash_skull)
splash.save(ROOT / "assets/splash-icon.png", optimize=True)

favicon = icon.resize((48, 48), Image.Resampling.LANCZOS).convert("RGB")
favicon.save(ROOT / "assets/favicon.png", optimize=True)
```

- [ ] **Step 3: Run the brand builder**

Run:

```bash
python scripts/build-brand-assets.py
```

Expected: four PNG files are written at the dimensions required by `app.json`.

- [ ] **Step 4: Inspect brand assets at native and reduced size**

Open:

- `assets/icon.png`
- `assets/adaptive-icon.png`
- `assets/splash-icon.png`
- `assets/favicon.png`

Confirm the skull is centered, the adaptive icon remains inside the central safe zone, the splash has generous padding, and the favicon is recognizable at 48 × 48.

- [ ] **Step 5: Run the asset test**

Run:

```bash
npm run test:assets
```

Expected: all file, dimension, alpha, and Expo-reference checks PASS; SVG-consumer and dependency-removal checks still FAIL.

- [ ] **Step 6: Commit brand assets**

```bash
git add assets/brand assets/icon.png assets/adaptive-icon.png assets/splash-icon.png assets/favicon.png scripts/build-brand-assets.py
git commit -m "feat: rebuild raster brand assets"
```

---

### Task 4: Add the typed raster manifest and integrate the screens

**Files:**
- Create: `src/assets/illustrations.ts`
- Modify: `src/screens/HomeScreen.tsx:1-35,68-85`
- Modify: `src/screens/SetupScreen.tsx:1-18,70-77,157-175`
- Modify: `src/components/RulesModal.tsx:1-12,63-76,88-108`
- Modify: `src/screens/ResultsScreen.tsx:1-14,34-40,82-86`

- [ ] **Step 1: Add the typed asset manifest**

Create `src/assets/illustrations.ts`:

```ts
import { ImageSourcePropType } from "react-native";

export const illustrations = {
  skullKing: require("../../assets/illustrations/skull-king.png") as ImageSourcePropType,
  compass: require("../../assets/illustrations/compass.png") as ImageSourcePropType,
  parrot: require("../../assets/illustrations/parrot.png") as ImageSourcePropType,
  mermaid: require("../../assets/illustrations/mermaid.png") as ImageSourcePropType,
  treasureChest: require("../../assets/illustrations/treasure-chest.png") as ImageSourcePropType,
} as const;
```

- [ ] **Step 2: Replace the home SVG components**

In `src/screens/HomeScreen.tsx`:

```tsx
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { illustrations } from "../assets/illustrations";
```

Replace the emblem children with:

```tsx
<View style={styles.emblemBg} pointerEvents="none">
  <Image
    source={illustrations.compass}
    style={styles.compass}
    resizeMode="contain"
  />
</View>
<Image
  source={illustrations.skullKing}
  style={styles.skullKing}
  resizeMode="contain"
/>
```

Add:

```ts
compass: { width: 230, height: 230, opacity: 0.16 },
skullKing: { width: 170, height: 190 },
```

- [ ] **Step 3: Replace the setup parrot**

Import `Image` and `illustrations`, then replace `<Parrot size={96} />` with:

```tsx
<Image
  source={illustrations.parrot}
  style={styles.parrot}
  resizeMode="contain"
/>
```

Add:

```ts
parrot: { width: 104, height: 118 },
```

- [ ] **Step 4: Replace the rules mermaid**

Import `Image` and `illustrations`, then replace `<Mermaid size={38} />` with:

```tsx
<Image
  source={illustrations.mermaid}
  style={styles.mermaid}
  resizeMode="contain"
/>
```

Add:

```ts
mermaid: { width: 38, height: 48 },
```

- [ ] **Step 5: Replace the results chest**

Import `Image` and `illustrations`, then replace `<TreasureChest size={170} />` with:

```tsx
<Image
  source={illustrations.treasureChest}
  style={styles.treasureChest}
  resizeMode="contain"
/>
```

Add:

```ts
treasureChest: { width: 190, height: 165 },
```

- [ ] **Step 6: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 7: Commit raster integration**

```bash
git add src/assets/illustrations.ts src/screens/HomeScreen.tsx src/screens/SetupScreen.tsx src/components/RulesModal.tsx src/screens/ResultsScreen.tsx
git commit -m "feat: render raster artwork in app screens"
```

---

### Task 5: Remove SVG implementation and dependency

**Files:**
- Delete: `src/illustrations/SkullKing.tsx`
- Delete: `src/illustrations/Compass.tsx`
- Delete: `src/illustrations/Parrot.tsx`
- Delete: `src/illustrations/Mermaid.tsx`
- Delete: `src/illustrations/TreasureChest.tsx`
- Delete: `src/illustrations/index.ts`
- Modify: `package.json:13-20`
- Modify: `package-lock.json`

- [ ] **Step 1: Confirm no remaining SVG consumers**

Run:

```bash
rg -n "react-native-svg|../illustrations|SkullKing|TreasureChest|<Parrot|<Mermaid|<Compass" src
```

Expected: matches only inside `src/illustrations`, which is about to be removed.

- [ ] **Step 2: Delete the SVG illustration directory**

Delete the six files listed above with `apply_patch`.

- [ ] **Step 3: Remove the dependency**

Run:

```bash
npm uninstall react-native-svg
```

Expected: `react-native-svg` disappears from `package.json` and `package-lock.json`.

- [ ] **Step 4: Run the asset contract**

Run:

```bash
npm run test:assets
```

Expected: all checks PASS and summary reports `0 failed`.

- [ ] **Step 5: Run existing automated validation**

Run:

```bash
npm run typecheck
npm run test:scoring
```

Expected: typecheck PASS and scoring reports `29 passed, 0 failed`.

- [ ] **Step 6: Commit SVG removal**

```bash
git add package.json package-lock.json src/illustrations
git commit -m "refactor: remove SVG illustration stack"
```

---

### Task 6: Verify the rendered application

**Files:**
- Modify only if visual verification reveals sizing defects:
  - `src/screens/HomeScreen.tsx`
  - `src/screens/SetupScreen.tsx`
  - `src/components/RulesModal.tsx`
  - `src/screens/ResultsScreen.tsx`

- [ ] **Step 1: Start the Expo web build**

Run:

```bash
npm run web
```

Expected: Expo serves the application locally without asset-resolution errors.

- [ ] **Step 2: Verify the narrow mobile viewport**

Use a 390 × 844 browser viewport and verify:

- Home: compass stays secondary; Skull King is fully visible and not cropped.
- Setup: parrot does not push the player fields below an unreasonable fold.
- Rules: mermaid remains readable without enlarging the header.
- Results: chest is centered and does not collide with the title.

- [ ] **Step 3: Verify the wide mobile viewport**

Use a 430 × 932 browser viewport and repeat the four screen checks.

- [ ] **Step 4: Check transparency against the actual app background**

Inspect every illustration for magenta fringes, opaque corner pixels, accidental boxes, and weak contrast against `colors.bg`.

- [ ] **Step 5: Apply only measured sizing corrections**

If an asset is cropped or visually unbalanced, adjust only its width, height, or opacity style in the consuming screen. Do not change navigation, scoring, copy, or the global interface palette.

- [ ] **Step 6: Re-run the complete verification suite**

Run:

```bash
npm run test:assets
npm run typecheck
npm run test:scoring
```

Expected: every command exits successfully.

- [ ] **Step 7: Commit final visual adjustments**

If no corrections were needed, skip this commit. Otherwise:

```bash
git add src/screens/HomeScreen.tsx src/screens/SetupScreen.tsx src/components/RulesModal.tsx src/screens/ResultsScreen.tsx
git commit -m "fix: tune raster artwork sizing"
```
