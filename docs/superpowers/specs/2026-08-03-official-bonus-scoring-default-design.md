# Official Bonus Scoring Default

## Goal

New games using classic Skull King scoring must follow the official rule:
capture bonuses are awarded only when the player makes their bid exactly.
Players may opt into the house rule that awards capture bonuses even after a
missed bid. Existing games must keep their recorded rule and therefore retain
the same scores, history, and leaderboard totals.

The Rascal scoring mode is unchanged. It continues to award capture bonuses in
full on a direct hit, at half value on a glancing blow, and not at all on a
complete miss.

## Persisted Model and Compatibility

Keep the existing `Game.bonusesRequireBid` field and its serialized meaning:

- `true`: classic capture bonuses require an exact bid;
- `false`: classic capture bonuses count regardless of bid accuracy.

Do not rewrite or reinterpret the field on loaded games. Saves created before
the field existed continue to normalize to `false`, preserving the scores they
had under the previous app behavior. Backups, share links, live sessions, and
cloud tables retain the same stored representation, so no schema or wire-format
migration is required.

New classic games set `bonusesRequireBid` to `true`. Rascal games continue to
normalize it to `false` because their bonus scaling is represented by the
scoring mode itself.

## Scoring and Interface

The default values of the classic scoring helpers and `createGame` change to
require an exact bid. Passing `false` explicitly remains the escape hatch for
the house rule.

In setup and the in-game rules editor, expose the choice in the direction of
the exception: "Count capture bonuses even when the bid is missed." The switch
is off for a new classic game and maps inversely to the stored field. For an
old game whose stored value is `false`, the switch is on, making its preserved
behavior visible and editable.

The active-rules summary should mention the exception only when unconditional
bonuses are enabled. The bonus editor's explanatory warning should continue to
appear only when a missed bid actually voids recorded capture bonuses.

Update all six locales and the rules help so they state that exact-bid bonus
eligibility is official and unconditional capture bonuses are the optional
variant. This option covers the existing capture-bonus group: colored and
black 14s, Mermaid/Pirate/Skull King captures, Davy Jones's Locker, and the
Second. Loot, the special expansion 7/8 cards, and Rascal wagers keep their own
existing conditions.

## Verification

Automated tests must prove:

1. A missed classic bid receives no capture bonus by default, including a
   failed zero bid.
2. A successful classic bid still receives every recorded capture bonus.
3. Passing the house-rule value explicitly awards capture bonuses after a
   missed bid.
4. `createGame` uses the official default for a new classic game and still
   clears the flag for Rascal scoring.
5. Existing and pre-field saves retain `false`, while an existing `true` value
   remains `true`.
6. The setup and in-game switches map inversely to `bonusesRequireBid`, and the
   active-rule copy describes only the exceptional unconditional behavior.
7. Locale structure remains synchronized across English, French, Spanish,
   German, Arabic, and Chinese.

Run the focused scoring, storage, and UX checks first, followed by the full
test suite, TypeScript validation, and the production web build.
