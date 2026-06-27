# Two-Player Variant (Greybeard ghost) — Design

**Date:** 2026-06-27
**Status:** Approved-in-flight (goal-driven), implement against the test harness.

## Context

Skull-King is a **scorekeeping companion** (a digital scorepad), not a card-play
engine. Players play with physical cards; the app records each player's bid,
tricks won, and captured bonus cards, then computes the official score
("Les scores selon Skull King", Grandpa Beck's 2022 rulebook).

The 2022 rulebook adds an official **2-player variant** (p.21, "Règle 2 joueurs"):

> Deal **3 hands**. The two real players bid and play under the normal rules. A
> ghost, **Barbe Grise / Greybeard**, plays the third hand: he always plays
> second, ignores the led suit, and — crucially — **does not bid and does not
> score**. When Greybeard wins a trick he leads the next; otherwise he is always
> second. His Tigress always counts as an escape.

## The one scoring-relevant consequence

In a normal game, `Σ(player tricks) = cards dealt` each round (every trick has a
winner among the players). The app uses this as a soft consistency hint.

In the 2-player variant, **Greybeard also wins tricks**. With 3 hands of `r`
cards there are still `r` tricks per round, now split among player 1 + player 2 +
ghost. Therefore:

```
player1.tricks + player2.tricks + ghostTricks = cards     (cards = r)
=> Σ(player tricks) <= cards, and ghostTricks = cards - Σ(player tricks)
```

So the denominator (`cards`, the round number) is unchanged. Only the trick
consistency check changes: `Σ(player tricks) <= cards` is valid (ghost took the
rest); `> cards` remains impossible (a real error). **The point math
(`bidScore`, capture bonuses, the zero-bid ×cards multiplier, Loot, Rascal) is
identical for the two real players and is NOT touched.**

Bonus cards captured by the ghost are simply lost — nobody scores them. The
existing per-deck capture caps (≤3 colored 14s, ≤2 mermaids, …) are
physical-deck facts independent of player count, so they are unchanged.

## Design decisions

- **Explicit flag, not inferred from `players.length === 2`.** The validation
  change is intentional and should not silently apply to legacy 2-player saves.
  Add `twoPlayerGhost: boolean` to `Game`.
- **Toggle visibility:** shown only when exactly 2 players are configured;
  defaulted **on** (the ghost is the only official 2-player mode). With >2
  players the flag is forced `false`.
- **No ghost "player row."** The ghost never scores, so it gets no card in the
  game screen — only an informational line showing how many tricks it took this
  round.

## Touch list

1. **`src/types.ts`** — add `twoPlayerGhost: boolean` to `Game`; bump
   `GAME_SCHEMA_VERSION` 2 → 3.
2. **`src/scoring.ts`** — `createGame(players, totalRounds, advancedCards,
   twoPlayerGhost = false)` stores the flag (no math change). Add a pure helper:
   ```ts
   /** Tricks the Greybeard ghost captured this round (0 outside 2-player mode). */
   export function ghostTricks(game, playerTricksTotal, cards): number
   //   = twoPlayerGhost ? max(0, cards - playerTricksTotal) : 0
   ```
3. **`src/screens/SetupScreen.tsx`** — a toggle row "2-player mode (Greybeard
   ghost)" rendered only when `named.length === 2`, default on; pass the flag to
   `createGame`.
4. **`src/screens/GameScreen.tsx`** — use `ghostTricks`. In ghost mode the trick
   hint reads OK when `tricksTotal <= cards` and shows "Greybeard 👻 took N";
   `> cards` still warns. Normal mode keeps its current behaviour.
5. **`src/components/RulesModal.tsx`** — add a "2-player variant" section
   describing the Greybeard ghost (third hand, plays second, no bid, no score,
   takes tricks, Tigress = escape).
6. **`src/storage.ts`** — `normalizeGame` backfills `twoPlayerGhost: raw.twoPlayerGhost ?? false`
   so legacy (v2) saves load and keep the strict `== cards` behaviour.
7. **`scripts/test-scoring.ts`** — add cases for `ghostTricks` (ghost off → 0;
   ghost on with under-total → remainder; ghost on with exact total → 0) and a
   regression assert that `scoreRound` output is unchanged by the flag.

## Out of scope (YAGNI)

- No card-play engine / ghost AI — the app is a scorepad.
- No tracking of which bonus cards the ghost captured.
- No change to bid/trick caps, bonus editor, or results screen.

## Testing

Extend the existing `npm run test:scoring` harness (item 7). Manual check:
start a game with 2 players, ghost on, record a round where the two players win
fewer tricks than cards dealt → hint shows the ghost's tricks, no warning; total
scores match hand calculation.
