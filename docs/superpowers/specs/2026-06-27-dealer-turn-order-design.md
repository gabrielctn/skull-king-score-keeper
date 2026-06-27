# Dealer & Turn Order (indicative) — Design

**Date:** 2026-06-27
**Status:** Approved by user; implement with the turn-order tests.

## Context

The Skull-King scorepad records bids/tricks/bonuses but says nothing about the
table. Two facts matter at the table each round and are easy to lose track of:

- **Who deals** the cards.
- **Who leads** the first trick (the player after the dealer).

This feature surfaces both, purely as an **indicator** — no "X played" buttons,
no per-trick tracking. The seating order is given once (the order players are
entered = how they sit, clockwise) and the app derives dealer + play order for
every round.

## Rules basis

- Rulebook p.13: the dealer role passes clockwise each round
  ("Le rôle de donneur passe au joueur suivant dans le sens horaire"), and the
  player to the dealer's left leads the first trick
  ("le joueur à la gauche du donneur lance le premier pli").
- Rulebook p.21 (2-player): the two real players start alternately each round,
  and Greybeard always plays his card in **second** position.

## Model (pure derivation — no schema change)

Everything is computed from data already persisted: `game.players` (order =
clockwise seating) and the round number. **No new `Game` field, no migration,
no schema bump.** `N = game.players.length` counts only the real players (the
ghost is never in the array). First dealer = `players[0]` (a convention; enter
your real first dealer first if it matters).

For 1-based round `r` over `N` real players:

```
dealerIndex(r) = (r - 1) mod N
leaderIndex(r) = (dealerIndex(r) + 1) mod N
```

`playOrder(game, r)` returns the ordered display list, leader first, dealer
last:

```
realOrder = [players[leaderIndex], players[leaderIndex+1], …, players[dealerIndex]]   (wrapping)
if game.twoPlayerGhost: insert the Greybeard ghost marker at display index 1
```

- N=2 + ghost, r=1: dealer P0, leader P1 → realOrder [P1, P0] → with ghost
  `[P1, 👻, P0]`. Ghost is slot 2, dealer (P0) plays last. ✓
- N=2 alternation: dealers P0,P1,P0… → leaders P1,P0,P1… (the required
  alternation falls out of the normal rotation). ✓
- N=3, r=1: `[P1, P2, P0]`; r=2: `[P2, P0, P1]` (clockwise wrap-around). ✓

Direction note: the `+1` (clockwise) mapping is only correct when seating is
entered clockwise — hence the setup hint. Irrelevant for N=2.

## Touch list

1. **`src/turnOrder.ts`** (new, pure):
   - `dealerIndex(game, round): number`
   - `leaderIndex(game, round): number`
   - `PlaySlot = { kind: "player"; player: Player } | { kind: "ghost" }`
   - `playOrder(game, round): PlaySlot[]` — leader-first, dealer-last, ghost at
     display index 1 in 2-player mode.
2. **`scripts/test-scoring.ts`** — add N=3 wrap-around, N=2 alternation, and
   ghost-insertion cases for the three functions.
3. **`src/screens/GameScreen.tsx`** — a thin banner below the header, driven by
   `displayRound` (so reviewing a past round shows that round's dealer): a
   "Dealer: {name}" badge and the play order as chips (leader highlighted,
   `👻 Greybeard` chip styled as the ghost). English UI to match the app.
4. **`src/screens/SetupScreen.tsx`** — a one-line hint ("Enter players
   clockwise; player 1 deals first") and up/down arrows to reorder players so
   seating is easy to set without retyping.

## Out of scope (YAGNI)

- No first-dealer picker / no `firstDealerIndex` field (user: "just the order,
  once").
- No per-trick turn tracking; the banner shows the first-trick order only.
- No change to scoring.

## Testing

Pure functions tested in the existing `npm run test:scoring` harness. Manual:
start N=3 and confirm the banner rotates the dealer/leader across rounds; start
2-player ghost mode and confirm `[leader, 👻, other]` with the leader
alternating each round; reorder players in setup and confirm round 1 reflects
the new order.
