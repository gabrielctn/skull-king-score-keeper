# Offline Snapshot Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove QR-encoded offline score snapshots so live `#live=` QR sessions are the only spectator workflow, then release the change as version 1.10.2.

**Architecture:** Delete the snapshot codec and static spectator branch, and move the three generally useful URL helpers into `src/appUrl.ts`. Keep the Supabase live-session manager and live spectator UI intact, while simplifying their callers to live-only types and copy.

**Tech Stack:** Expo 54, React Native 0.81, React 19, TypeScript 5.9, Supabase Realtime, source-level Node/tsx regression scripts.

## Global Constraints

- Keep only live QR score sharing; never generate or consume `#skl=` links.
- Preserve live session creation, copying, stopping, reconnecting, and spectator updates.
- Preserve internal snapshots used by live sync, cloud sync, and statistics.
- Keep historical files under `docs/superpowers/specs/` unchanged.
- Set the release to `1.10.2`, release date `2026-08-04`, and local iOS build number `5`.
- Update English, French, Spanish, German, Arabic, and Simplified Chinese together.
- Do not push, deploy, or submit a build as part of this task.

## File Map

- Create `src/appUrl.ts`: canonical PWA URL, current-page share base URL, and consumed-hash removal.
- Delete `src/shareLink.ts`: obsolete `#skl=` codec and snapshot session storage.
- Delete `scripts/test-sharelink.ts`: tests for the deleted codec.
- Modify `App.tsx`: live-only spectator routing.
- Modify `src/components/ShareLiveModal.tsx`: live-only QR sharing sheet.
- Modify `src/screens/GameScreen.tsx`: expose the Live action only when the backend is configured.
- Modify `src/screens/SpectatorScreen.tsx`: required live session ID and no static-game branch.
- Modify `src/liveSession.ts`, `src/liveConfig.ts`, `src/storage.ts`: neutral URL import and live-only comments.
- Modify `src/screens/SettingsScreen.tsx`, `src/shareRecap.ts`, `src/shareRecap.native.ts`: import neutral URL helpers.
- Modify `src/i18n/types.ts` and `src/i18n/{en,fr,es,de,ar,zh}.ts`: remove snapshot-only strings and add localized 1.10.2 release notes.
- Modify `README.md`: document live QR sharing only and replace the project-tree entry.
- Modify `scripts/test-livesession.ts`: verify that legacy snapshot hashes resolve to normal app mode.
- Modify `scripts/test-ux.ts`, `scripts/test-scoring.ts`: localized-release regression checks.
- Modify `package.json`, `package-lock.json`, `app.json`, `src/releases.ts`: remove the codec test command and align 1.10.2 metadata.

---

### Task 1: Remove the offline snapshot product path

**Files:**
- Add: `docs/superpowers/plans/2026-08-04-offline-snapshot-removal.md`
- Create: `src/appUrl.ts`
- Delete: `src/shareLink.ts`
- Delete: `scripts/test-sharelink.ts`
- Modify: `scripts/test-livesession.ts`
- Modify: `package.json`
- Modify: `App.tsx`
- Modify: `src/components/ShareLiveModal.tsx`
- Modify: `src/screens/GameScreen.tsx`
- Modify: `src/screens/SpectatorScreen.tsx`
- Modify: `src/liveSession.ts`
- Modify: `src/liveConfig.ts`
- Modify: `src/storage.ts`
- Modify: `src/screens/SettingsScreen.tsx`
- Modify: `src/shareRecap.ts`
- Modify: `src/shareRecap.native.ts`
- Modify: `src/i18n/types.ts`
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/es.ts`
- Modify: `src/i18n/de.ts`
- Modify: `src/i18n/ar.ts`
- Modify: `src/i18n/zh.ts`
- Modify: `README.md`

**Interfaces:**
- Produces: `DEPLOYED_PWA_BASE_URL: string`, `webShareBaseUrl(): string`, and `stripLocationHash(): void` from `src/appUrl.ts`.
- Produces: `resolveSpectatorLiveId(hash, storedLiveId): string | null` from `src/liveSession.ts`.
- Produces: `SpectatorScreen({ liveSessionId: string, onExit: () => void })` as a live-only screen.
- Consumes: existing `buildLiveUrl`, `consumeScannedLiveId`, `watchLiveGame`, and `liveConfigured` APIs unchanged.

- [ ] **Step 1: Add a failing legacy-routing regression check**

Add a namespace import and resolver type to `scripts/test-livesession.ts`:

```ts
import * as liveSessionModule from "../src/liveSession";

type SpectatorResolver = (
  hash: string | null | undefined,
  storedLiveId: string | null
) => string | null;
const resolveSpectatorLiveId = (
  liveSessionModule as unknown as {
    resolveSpectatorLiveId?: SpectatorResolver;
  }
).resolveSpectatorLiveId;
```

Add this check in the `URL and hash helpers` section:

```ts
check(
  "legacy snapshot hashes open the normal app",
  typeof resolveSpectatorLiveId === "function" &&
    resolveSpectatorLiveId(`#skl=${SAMPLE_UUID}`, SAMPLE_UUID) === null
);
```

- [ ] **Step 2: Run the focused test and confirm the expected red state**

Run: `npm run test:livesession`

Expected: FAIL only at `legacy snapshot hashes open the normal app`, because `resolveSpectatorLiveId` does not exist yet.

- [ ] **Step 3: Extract neutral URL helpers**

Create `src/appUrl.ts`:

```ts
/** Public web destination opened by links created in the native app. */
export const DEPLOYED_PWA_BASE_URL =
  "https://gabrielctn.github.io/skull-king-crew-ledger/";

/** Current web page without query or hash, or the deployed PWA on native. */
export function webShareBaseUrl(): string {
  if (typeof window === "undefined" || !window.location) {
    return DEPLOYED_PWA_BASE_URL;
  }
  return `${window.location.origin}${window.location.pathname}`;
}

/** Remove a consumed capability hash before analytics or history can retain it. */
export function stripLocationHash(): void {
  if (typeof window === "undefined" || !window.history?.replaceState) return;
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${window.location.search}`
  );
}
```

Update imports:

```ts
// src/liveSession.ts
import { stripLocationHash } from "./appUrl";

// src/shareRecap.ts and src/shareRecap.native.ts
import { DEPLOYED_PWA_BASE_URL } from "./appUrl";

// src/screens/SettingsScreen.tsx
import { webShareBaseUrl } from "../appUrl";

// src/components/ShareLiveModal.tsx
import { webShareBaseUrl } from "../appUrl";
```

Replace the one `stripShareHashFromLocation()` call with `stripLocationHash()`.

Add the live-only resolver to `src/liveSession.ts`:

```ts
export function resolveSpectatorLiveId(
  hash: string | null | undefined,
  storedLiveId: string | null
): string | null {
  const scanned = extractLiveSessionId(hash);
  if (scanned) return scanned;
  return hash ? null : storedLiveId;
}
```

- [ ] **Step 4: Make app routing live-only**

In `App.tsx`, remove every `shareLink` import and reduce spectator state and boot logic to:

```ts
type SpectatorMode =
  | { kind: "live"; sessionId: string }
  | { kind: "none" };

function readSpectatorMode(): SpectatorMode {
  const hash =
    typeof window === "undefined" || !window.location
      ? ""
      : window.location.hash;
  const scannedLive = consumeScannedLiveId();
  if (scannedLive) return { kind: "live", sessionId: scannedLive };
  const storedLive = resolveSpectatorLiveId(hash, loadSpectatorLiveId());
  return storedLive
    ? { kind: "live", sessionId: storedLive }
    : NO_SPECTATOR;
}
```

The `hashchange` handler consumes join links first and live links second, with no third snapshot branch. `handleExitSpectator` clears only the live ID. Render the screen as:

```tsx
{spectator.kind === "live" && (
  <SpectatorScreen
    liveSessionId={spectator.sessionId}
    onExit={handleExitSpectator}
  />
)}
```

- [ ] **Step 5: Make the sharing sheet and game action live-only**

In `ShareLiveModal.tsx`, remove `buildShareUrl`, `snapshotOpen`, the snapshot `useMemo`, the fallback JSX, and snapshot-only styles. Keep the current live card, live QR, copy feedback, and stop/start controls. Since `GameScreen` gates access, remove the `liveConfigured()` conditional and create the manager directly:

```ts
const manager = useMemo(() => liveSessionManager(), []);
const [liveState, setLiveState] = useState<MasterLiveState>(() =>
  manager.getState()
);
```

In `GameScreen.tsx`, evaluate configuration once and render both the header pill and modal only when true:

```ts
const liveAvailable = liveConfigured();
```

```tsx
{liveAvailable ? (
  <TouchableOpacity
    style={[styles.livePill, liveActive && styles.livePillActive]}
    onPress={() => setShareOpen(true)}
    accessibilityRole="button"
    accessibilityLabel={t.liveShare.open}
    accessibilityState={{ selected: liveActive }}
  >
    <Text
      style={[
        styles.livePillText,
        liveActive && styles.livePillTextActive,
      ]}
    >
      📡 {t.liveShare.badge}
    </Text>
  </TouchableOpacity>
) : null}

{liveAvailable ? (
  <ShareLiveModal
    visible={shareOpen}
    game={game}
    onClose={() => setShareOpen(false)}
  />
) : null}
```

- [ ] **Step 6: Make `SpectatorScreen` live-only**

Replace its props and state selection with:

```ts
interface Props {
  liveSessionId: string;
  onExit: () => void;
}

export default function SpectatorScreen({ liveSessionId, onExit }: Props) {
  const { t, lang } = useI18n();
  const { width } = useWindowDimensions();
  const layout = getResponsiveLayout(width);
  const [scorePlayerId, setScorePlayerId] = useState<string | null>(null);
  const [rememberedId, setRememberedId] = useState<string | null>(null);
  const [sort, setSort] = useState<SpectatorSort>(DEFAULT_SPECTATOR_SORT);
  const [identityResolved, setIdentityResolved] = useState(false);
  const [liveGame, setLiveGame] = useState<Game | null>(null);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState(0);
  const [liveStatus, setLiveStatus] =
    useState<SpectatorLiveStatus>("connecting");
  const activeGame = liveGame;
```

Always start `watchLiveGame(liveSessionId, ...)` in the effect. Remove `isLive`, the static `game` prop, the static failure expression, the snapshot/rescan rendering branches, and the snapshot-only styles. Rename `formatSnapshotTime` and `styles.snapshotLine` to `formatUpdatedTime` and `styles.updatedLine`; always render `t.spectator.liveUpdatedAt(...)` when a valid update timestamp exists.

- [ ] **Step 7: Remove snapshot-only localization and comments**

Delete these `liveShare` keys from `src/i18n/types.ts` and every locale:

```ts
snapshotTitle
snapshotToggleShow
snapshotToggleHide
scanHint
updateHint
networkHint
qrError
```

Delete these `spectator` keys from the type and every locale:

```ts
eyebrow
snapshotAt
refreshHint
```

Keep `liveEyebrow`, `liveUpdatedAt`, `invalidTitle`, and `invalidBody`. Update comments in `src/liveSession.ts`, `src/liveConfig.ts`, and `src/storage.ts` to describe live sessions only.

- [ ] **Step 8: Delete the codec and update active documentation/configuration**

Delete `src/shareLink.ts` and `scripts/test-sharelink.ts`. Remove `test:sharelink` from both the aggregate `test` command and the scripts object in `package.json`.

In `README.md`:

- describe live score follow as one Supabase-backed, automatically updating QR workflow;
- state that a fork without a live backend does not expose score sharing;
- replace the project-tree `shareLink.ts` entry with `appUrl.ts`;
- preserve the app's separate offline-first scorekeeping description.

- [ ] **Step 9: Verify the focused green state**

Run: `npm run test:livesession`

Expected: PASS, including `legacy snapshot hashes open the normal app`.

Run: `npm run typecheck`

Expected: PASS with no stale snapshot props, imports, or translation keys.

- [ ] **Step 10: Commit the removal**

Stage only the files listed in Task 1 and commit:

```bash
git commit -m "Remove offline score snapshots"
```

---

### Task 2: Bump and localize release 1.10.2

**Files:**
- Modify: `scripts/test-ux.ts`
- Modify: `scripts/test-scoring.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app.json`
- Modify: `src/releases.ts`
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/es.ts`
- Modify: `src/i18n/de.ts`
- Modify: `src/i18n/ar.ts`
- Modify: `src/i18n/zh.ts`

**Interfaces:**
- Produces: `CURRENT_RELEASE === "1.10.2"` and `CURRENT_RELEASE_DATE === "2026-08-04"`.
- Produces: seven aligned entries in every `whatsNew.items` array, with the new live-only QR note first.

- [ ] **Step 1: Update release-note count checks first**

Change the hard-coded release-note length from `6` to `7` in `scripts/test-ux.ts` and `scripts/test-scoring.ts`.

- [ ] **Step 2: Run the focused tests and confirm the red state**

Run: `npm run test:scoring && npm run test:ux`

Expected: FAIL on the English and per-locale release-note counts because every locale still has six items.

- [ ] **Step 3: Add the localized live-only release note**

Prepend exactly one note to each locale's `whatsNew.items`:

```ts
// en
"Score sharing now uses live QR sessions only, so every player sees updates in real time."

// fr
"Le partage des scores utilise désormais uniquement des sessions QR en direct, afin que chaque joueur voie les mises à jour en temps réel."

// es
"Ahora los puntos se comparten únicamente mediante sesiones QR en directo, para que todos los jugadores vean las actualizaciones en tiempo real."

// de
"Die Punkte werden jetzt ausschließlich über Live-QR-Sitzungen geteilt, damit alle Spieler Aktualisierungen in Echtzeit sehen."

// ar
"تُشارك النقاط الآن عبر جلسات QR مباشرة فقط، ليشاهد جميع اللاعبين التحديثات في الوقت الفعلي."

// zh
"比分分享现在仅使用实时二维码会话，让每位玩家都能实时看到更新。"
```

- [ ] **Step 4: Align version and build metadata**

Run: `npm version 1.10.2 --no-git-tag-version`

Then set:

```ts
// src/releases.ts
export const CURRENT_RELEASE = "1.10.2";
export const CURRENT_RELEASE_DATE = "2026-08-04";
```

Set these values in `app.json`:

```json
"version": "1.10.2",
"buildNumber": "5"
```

- [ ] **Step 5: Verify release metadata and translations**

Run: `npm run test:scoring && npm run test:ux`

Expected: PASS; versions align with `CURRENT_RELEASE`, build number is a positive integer, and all six locales contain seven release notes.

Run: `npx expo config --type public`

Expected: output reports Expo version `1.10.2` and iOS build number `5`.

- [ ] **Step 6: Commit the release bump**

Stage only the files listed in Task 2 and commit:

```bash
git commit -m "Release 1.10.2"
```

---

### Task 3: Full verification and cleanup audit

**Files:**
- Verify only; fix only files already in Task 1 or Task 2 if a check exposes a regression.

**Interfaces:**
- Consumes: the live-only UI and 1.10.2 metadata from Tasks 1 and 2.
- Produces: fresh verification evidence for tests, web export, source absence, and repository cleanliness.

- [ ] **Step 1: Run the complete automated audit**

Run: `npm test`

Expected: exit 0 with every test group passing.

- [ ] **Step 2: Build the production PWA**

Run: `npm run build:web`

Expected: exit 0 and a completed Expo web export/PWA build.

- [ ] **Step 3: Audit active files for removed feature markers**

Run:

```bash
rg -n -i "#skl=|offline snapshot|offline QR snapshot|snapshot-only|shareLink" \
  App.tsx README.md package.json scripts src
```

Expected: the only `#skl=` matches are the two live-session regression-test
lines proving legacy hashes are rejected. No production, README, package, or
other script match remains.

- [ ] **Step 4: Inspect the final diff and status**

Run: `git diff --check HEAD~2..HEAD`

Expected: no whitespace errors.

Run: `git status --short`

Expected: only the implementation-plan document remains uncommitted, unless it was included explicitly in the first implementation commit.

- [ ] **Step 5: Report the result without publishing**

Report the live-only behavior, version `1.10.2` / build `5`, verification commands, and commits. Do not push `main`, deploy the PWA, or submit iOS/TestFlight.
