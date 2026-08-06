# App Store screenshot production

This directory holds the final, upload-ready screenshots for Skull King Crew
Ledger 1.11.1 (iOS build 7). App Store Connect upload remains a deliberate
manual step and is outside this workflow.

## Output contract

The set contains eight screenshots in English and French for both accepted
device sizes:

- iPhone 6.9-inch: 1320 × 2868 px
- iPad 13-inch: 2064 × 2752 px

Final PNGs live below `en-US` and `fr-FR`, each with `iphone-6.9` and `ipad-13`
directories. Use these exact stems in every directory:

1. `01-score-every-round`
2. `02-follow-scores-live`
3. `03-crown-the-winner`
4. `04-crew-hall-of-fame`
5. `05-one-shared-ledger`
6. `06-classic-rascal-expansion`
7. `07-greybeards-ghost`
8. `08-offline-ad-free`

## Rebuild and seed

Only use disposable Simulators whose names start with
`Skull King Capture `. The seeder refuses every other name. Build and install
the current 1.11.1 app before seeding; the script also checks `package.json`,
`package-lock.json`, and `app.json` for version 1.11.1 and build 7.

Run the fixture contract first:

```bash
npm run test:app-store-screenshots
```

Seed one installed capture Simulator with all five required flags:

```bash
npm run screenshots:seed -- \
  --udid <SIMULATOR_UDID> \
  --simulator-name "Skull King Capture iPhone" \
  --locale en \
  --scenario active \
  --destination continueGame
```

Locales are `en` or `fr`; scenarios are `active`, `greybeard`, or
`featured-results`; destinations are `home`, `continueGame`, `statistics`, or
`newGame`.

Keep every raw capture under:

```text
/private/tmp/skullking-app-store-1.11.1/
```

## Figma composition

Source template:
[App Store Screenshot Template Community](https://www.figma.com/design/01BZRU2WcGi6MBGGC2UPhh/App-Store-Screenshot-Template--Community-?node-id=0-1&t=j3pfk5x0wcDkKCeg-1)

Build the production set on the page `Skull King 1.11.1 — App Store` with
these sections:

- `Components`
- `EN — iPhone 6.9`
- `FR — iPhone 6.9`
- `EN — iPad 13`
- `FR — iPad 13`

Use the approved restrained glassmorphism system and the exact stems above for
exports. Any live-session link, table invite, QR code, owner ID, writer key, or
other capability visible in a raw capture must be replaced or fully obscured
in the artwork. Never publish a working code from either fixture or production
data.

## Final gate

After exporting all 32 opaque PNGs, run:

```bash
npm run validate:app-store-screenshots
```

The validator checks the exact file tree, filenames, dimensions, PNG structure,
opacity, and byte-for-byte duplicate files. A valid set ends with:

```text
32 App Store screenshots valid
```
