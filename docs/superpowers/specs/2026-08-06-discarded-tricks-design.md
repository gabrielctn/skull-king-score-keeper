# Tricks Nobody Won (Kraken and White Whale)

## Goal

A round must be scorable when one of its tricks ended with no winner, whichever
card caused it.

Two cards do that. The Kraken destroys the trick it lands in. The White Whale
nullifies every special card in its trick and hands it to the highest number
card, so when the trick contains nothing but special cards there is no card
left that can win it and the trick is discarded. In both cases the trick is
never dealt to a player, and the round's recorded tricks total fewer than the
cards dealt.

The ledger already stored a per-round count of tricks with no winner, but the
only control that wrote it was labelled "Trick discarded by Kraken" and toggled
between zero and one. A table whose whale ate a trick of specials had no
affordance to record it: the round stayed one trick short of the cards dealt
and the app refused to score it. A round that lost a trick to each card could
not be represented at all.

## Persisted Model

`Game.discardedTricks[r - 1]` keeps its meaning and its numeric wire format: how
many of round `r`'s tricks ended with no winner. No schema bump, no migration,
and backups, share links, live sessions and cloud tables stay readable by app
versions on both sides of this change.

The cause is deliberately not persisted. Both cards produce the same ledger
fact, the scoring is identical either way, and nothing in the app reads back
which leviathan was responsible.

`MAX_DISCARDED_TRICKS = 2` bounds the count: the deck holds one Kraken and one
White Whale. When both land in the same trick only the last one played takes
effect, which still discards a single trick, so two is the ceiling for a round.

`discardedTricksForRound(game, round)` is the single reader. It floors the
stored value and clamps it to `[0, min(cards dealt, MAX_DISCARDED_TRICKS)]`, so
a hand-edited save or a save from a future variant can never describe an
impossible round.

## Interface

The Kraken button becomes a counter titled "tricks nobody won", sitting where
the button was, directly above the "tricks recorded: x / y" line it explains.
A stepper records zero, one or two, capped at the cards dealt for short rounds,
and a hint names both causes: the Kraken destroys its trick, the White Whale
discards its own when only special cards were played. The card takes the same
positive accent as the old button once the count is above zero.

Recording a discard stays one tap, and the round's tricks check keeps counting
players' tricks plus discards against the cards dealt, in the two-player ghost
variant too: the Greybeard takes the leftover tricks, never the discarded ones.

The in-app rules for both cards now say where the trick gets recorded, in all
six locales, so the reference and the control agree.

## Verification

Automated tests must prove:

1. Both leviathans can discard a trick in the same round.
2. The count stops at two and never exceeds the cards dealt.
3. A negative or fractional stored count reads as no discard.
4. A round with a discarded trick scores exactly like any other round.
5. Every locale names the control and says which cards discard a trick.
6. The game screen counts tricks nobody won rather than Kraken tricks only.

Manual verification drives the app: a three-player round of three cards with
two tricks recorded is blocked ("must equal cards dealt"), recording the whale
trick makes it valid ("3 / 3 ✓") and the round scores, the count survives
leaving and reopening the round, and the control mirrors correctly in Arabic.
