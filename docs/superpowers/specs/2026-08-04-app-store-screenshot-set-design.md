# App Store Screenshot Set Design

Date: 2026-08-04  
Product: Skull King Crew Ledger 1.11.1  
Figma source: [App Store Screenshot Template (Community)](https://www.figma.com/design/01BZRU2WcGi6MBGGC2UPhh/App-Store-Screenshot-Template--Community-?node-id=0-1)

## Objective

Create a polished, editable App Store screenshot system that uses the mood and
rhythm of Figma frames 1288–1293 while presenting the current native iOS app,
not the obsolete marketing video or GIF. The set must foreground the app's
restrained glass treatment, remain readable as individual screenshots, and
accurately represent version 1.11.1.

## Deliverables

- Eight portrait screenshots for the English localization.
- The same eight screenshots for the French localization.
- A dedicated iPhone 6.9-inch set at 1320 × 2868 pixels.
- A dedicated iPad 13-inch set at 2064 × 2752 pixels.
- Thirty-two final opaque PNG files, numbered consistently across locale and
  device class.
- An editable page named `Skull King 1.11.1 — App Store` in the supplied Figma
  draft. The original Template page and frames 1288–1293 remain unchanged.
- A short repository README describing the export naming and regeneration
  workflow.
- A deterministic capture fixture and capture-only seeding workflow so the
  screenshots can be refreshed for later releases without rebuilding the demo
  history manually.

Final exports live under:

```text
marketing/app-store/screenshots/
  en-US/
    iphone-6.9/
    ipad-13/
  fr-FR/
    iphone-6.9/
    ipad-13/
```

Each directory uses the same numeric and semantic filenames, beginning with
`01-score-every-round.png` and ending with `08-offline-ad-free.png`.

## Visual System

### Foundation

- Use an opaque nautical gradient derived from `#0b1722`, `#13283a`, and
  `#173347`.
- Add the existing leather/map texture at approximately 7.5% opacity.
- Use restrained treasure-gold (`#e8b84b`) and cyan (`#2f9bd6`) light blooms to
  guide attention toward the app screen.
- Keep all promotional text outside the captured application UI.
- Use an unbranded, modern rounded screen frame. The old iPhone 13 hardware in
  the community template is not reused.

### Glass treatment

Glass appears in two complementary ways:

1. The real 1.11.1 captures visibly retain the app's `GlassSurface` headers,
   navigation controls, and temporary overlays.
2. Selected marketing callouts use the same visual recipe as the app:
   translucent `#13283a`, background blur, a cool low-opacity hairline border,
   and a faint top highlight.

Glass is limited to captions, small feature badges, and split-view separators.
It must not cover important scores, controls, QR descriptions, player names, or
statistics. Reduced Transparency is disabled on the dedicated capture
simulators so the iOS blur is rendered rather than the opaque accessibility
fallback.

### Composition

- Screenshots 1–3 form a cinematic opening triptych inspired by frames
  1288–1290, but each image still communicates a complete message when shown
  alone.
- Screenshots 4–8 use cleaner, mostly straight screen frames inspired by
  1291–1293.
- The iPad set uses native wide layouts and purposeful split compositions; it
  is not an enlarged copy of the iPhone set.
- English and French preserve the same hierarchy and artwork. French copy may
  wrap to an additional line instead of shrinking below the English type size.
- Marketing headings use a verified SF Pro display face when available. If the
  connected Figma runtime does not expose SF Pro, Inter is used for marketing
  copy only; embedded application UI is never recreated or re-typeset.

## Eight-Screenshot Story

| # | App state and composition | English headline | French headline |
|---|---|---|---|
| 1 | GameScreen, round 5 of 10, four players, recorded bids and tricks, visible bonuses, varied provisional scores, and the real glass game header. Use a dramatic right-edge crop inspired by frame 1288. | **Score every round. We do the math.** | **Notez chaque manche. On fait les calculs.** |
| 2 | Two-view composition: the live-sharing QR sheet beside read-only spectator standings. Use the two-device rhythm of frame 1289 and a small glass explanation card. The claim is explicitly online/live and is never paired with the offline claim. | **Everyone follows the scores live.** | **Tout l’équipage suit les scores en direct.** |
| 3 | ResultsScreen with a clear winner, settled podium, treasure chest, score evolution, and crew awards. Use the upper crop and lower headline rhythm of frame 1290. | **Crown the winner.** | **Couronnez le vainqueur.** |
| 4 | Populated StatsScreen with table name, crew summary, leaderboard, qualified rates, and records. Keep the native glass statistics header visible. | **Build your crew’s hall of fame.** | **Créez le palmarès de votre équipage.** |
| 5 | SettingsScreen showing a named shared table and the expanded invitation workflow. Show shared history/leaderboard context and a sanitized QR. Keep the native glass settings header and add one restrained glass callout. | **One crew. One shared ledger.** | **Un équipage. Un carnet partagé.** |
| 6 | SetupScreen with four players and visible choices for Classic, Rascal, expansion cards, Loot, and custom round structure. Do not imply that every possible house rule is implemented. | **Classic, Rascal and expansion cards.** | **Classique, Rascal et cartes d’extension.** |
| 7 | Dedicated two-player composition showing Alex and Camille plus Greybeard’s Ghost in setup and an in-game state that makes the ghost hand/turn order clear. The iPad version uses a setup/gameplay split; the iPhone version uses one primary device and a smaller glass inset. | **Two players? Summon Greybeard’s Ghost.** | **À deux ? Invoquez le fantôme Barbe Grise.** |
| 8 | HomeScreen with an active game, recent finished games, and the real glass top actions. Add three restrained glass badges supporting the claims, without showing cloud or live-sharing UI. | **Every round saved. Offline. Ad-free.** | **Chaque manche sauvegardée. Hors ligne. Sans pub.** |

## Canonical Fictional Data

- Recurring players: Alex, Camille, Morgan, and Sam.
- English shared table: `Friday Night Crew`.
- French shared table: `L’équipage du vendredi`.
- Twelve completed four-player games provide enough history for meaningful
  statistics, qualified zero-bid rates, streaks, and records.
- Camille leads the canonical history with five wins; the other seven wins are
  distributed across Alex, Morgan, and Sam.
- The active four-player game is in round 5 of 10 and contains valid, varied
  bids, tricks, capture bonuses, and at most one restrained Loot example.
- The featured finished game is non-tied and uses the same score history as the
  statistics screen.
- The Greybeard capture uses a separate valid two-player game with Alex and
  Camille. Greybeard never bids or scores.
- Exact round data is generated and normalized through the application's domain
  functions; totals are not invented independently of the scoring engine.

No real personal information, production table code, live capability, or
scannable production QR appears in an export. Any visible QR is a clearly
nonfunctional fixture graphic placed at the same size as the native QR.

## Capture Workflow

1. Confirm the clean source revision and version 1.11.1.
2. Run the repository validation suite.
3. Regenerate the ignored root iOS project from the tracked native sources so
   stale 1.10.x generated metadata cannot reach the screenshots.
4. Build the Release configuration for dedicated disposable iPhone and iPad
   simulators. Debug builds and Metro are not used.
5. Stop the app and seed the validated capture fixture into AsyncStorage using a
   capture-only script. Seed the locale, settings, table name, current game,
   finished history, and `seenRelease = 1.11.1` before first launch.
6. Force dark appearance, disable Reduce Transparency, and normalize the status
   bar to a clean presentation with no developer, VPN, or refresh indicators.
7. Navigate with accessibility identifiers/labels and capture each required raw
   state at native simulator resolution.
8. Repeat from the same fixture for French and for the iPad layout.
9. Replace any live or table QR with the deterministic nonfunctional fixture QR
   before composing the final assets.
10. Import raw captures into the new Figma page, compose the thirty-two frames,
    and export opaque PNG files at exactly 1× canvas size.

The capture fixture is isolated from the user's own simulator data and from
production shared tables. Cloud reconciliation is not allowed to alter the
fixture during capture.

## Figma Structure

The new page contains these sections in reading order:

1. `Components` — reusable background, glass caption, glass feature badge,
   iPhone screen frame, and iPad screen frame.
2. `EN — iPhone 6.9` — eight final export frames.
3. `FR — iPhone 6.9` — eight final export frames.
4. `EN — iPad 13` — eight final export frames.
5. `FR — iPad 13` — eight final export frames.

Repeated marketing treatments are component instances. App screenshots remain
image fills inside masks, so they can be replaced in later releases without
rebuilding the compositions.

## Validation and Acceptance Criteria

- Every raw capture comes from a regenerated 1.11.1 Release build.
- No obsolete `Score Keeper` branding, old statistics layout, debug banner,
  Metro indicator, support prompt, changelog, analytics banner, or personal data
  appears.
- All thirty-two exports exist, are opaque PNGs, and have exactly the required
  pixel dimensions.
- English and French sets have identical numbering, feature order, and visual
  hierarchy.
- French headlines and native UI do not clip, collide, or become materially
  smaller than English.
- The opening three images each remain understandable outside the triptych.
- The two-player image visibly communicates that a two-player game is possible
  and that Greybeard is a non-scoring ghost participant.
- Glass remains visibly translucent at full resolution, with enough contrast to
  pass a visual readability review.
- App UI is never stretched non-proportionally or recreated from primitives.
- QR codes and invite identifiers are nonfunctional.
- Each Figma frame is inspected at full resolution before export, and each final
  PNG is inspected after export rather than trusting the Figma preview alone.
- The original Figma Template page remains unchanged.

## Failure Handling

- If a preferred simulator model is unavailable, capture on the closest current
  iPhone/iPad simulator and retain the specified accepted final canvas sizes.
- If the generated project still reports 1.10.x after prebuild, stop and repair
  propagation before capturing anything.
- If blur falls back to an opaque surface, verify Reduce Transparency and
  recapture; do not imitate the missing in-app blur in Figma.
- If SF Pro is unavailable to the Figma runtime, use the documented Inter
  fallback for marketing copy and verify all line breaks again.
- If a live or table flow cannot be captured without exposing a functioning
  capability, capture the surrounding native UI and insert only the
  deterministic nonfunctional QR fixture.
- A failed or incomplete screenshot is corrected at the raw-capture or targeted
  Figma-node level; completed frames are not rebuilt wholesale.

## Non-Goals

- Updating or reusing the obsolete App Store preview video or marketing GIF.
- Uploading screenshots to App Store Connect in this scope.
- Producing localizations other than English and French.
- Rebranding the application or changing its production interface solely for
  the screenshots.
- Publishing real shared-table or live-session credentials.
