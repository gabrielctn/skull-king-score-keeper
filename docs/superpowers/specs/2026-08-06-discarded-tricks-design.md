# Tricks Nobody Won (Kraken and Everything Else)

## Goal

A round must be scorable when one of its tricks ended with no winner, whatever
caused it.

The Kraken destroys the trick it lands in. The White Whale nullifies every
special card in its trick and hands it to the highest number card, so a trick
holding nothing but specials has no card left that can win it and is discarded.
The expansion adds rarer standoffs of the same kind. In every case the trick is
never dealt to a player, and the round's recorded tricks total fewer than the
cards dealt.

The ledger already stored a per-round count of tricks with no winner, but the
only control that wrote it was labelled "Trick discarded by Kraken" and toggled
between zero and one. A table whose whale ate a trick of specials had no
affordance to record it: the round stayed short of the cards dealt and the app
refused to score it. A round that lost tricks to two different causes could not
be represented at all.

## Persisted Model

`Game.discardedTricks[r - 1]` keeps its meaning: how many of round `r`'s tricks
ended with no winner, whatever the cause. It stays the total, so it remains the
number the round's trick check works from.

`Game.krakenTricks[r - 1]` is added alongside it: how many of those tricks the
Kraken took. One Kraken in the deck, so it is 0 or 1, and it can never exceed
the total. Everything else is deliberately anonymous. Naming causes would mean
enumerating them, and the expansion keeps adding ways for a trick to end
without a winner; the table knows why, and the ledger only needs how many.

This is schema v10. Saves predating the split could only record a discard
through the Kraken button, so their first discard in a round migrates to
`krakenTricks`, which keeps their history reading the way it was entered.

`roundDiscards(game, round)` is the single reader, returning `{kraken, other,
total}`. It floors both stored values, caps the Kraken at its one card, keeps
the total at least the Kraken count and at most the cards dealt, and derives
`other` from the two. Nothing else caps the total: with the expansion, two is
not a real ceiling.

## Interface

The Kraken keeps its own button, unchanged: one tap records its trick, the
button shows the count is in, and a second tap undoes it. It is the case a
table names out loud, and the one they look for.

Under it, a plain counter labelled "other discarded tricks" takes everything
else, no cause required, capped at the cards the round still has left. Both sit
in one card headed "tricks nobody won", directly above the "tricks recorded: x
/ y" line they explain, and a hint spells out the whale case since it is the
one players hit and do not expect.

The round's trick check counts players' tricks plus the total of the two, in
the two-player ghost variant as well: the Greybeard takes the leftover tricks,
never the discarded ones.

The in-app rules for the Kraken and the White Whale point at the same place, in
all six locales, so the reference and the controls agree.

## Verification

Automated tests must prove:

1. The Kraken keeps its own count while other discards stay anonymous.
2. The total is what the trick check and the ghost calculation read.
3. A round can discard more than two tricks, but never more than it dealt.
4. A stored Kraken count cannot exceed one card, nor the round's total.
5. A negative stored count reads as no discard.
6. A save predating the split reads its first discard back as the Kraken's.
7. Both counts survive persistence and a backup round trip.
8. Every locale labels both controls and the Kraken button's three states.

Manual verification drives the app: a three-player round of three cards with
two tricks recorded is blocked ("must equal cards dealt"), recording the trick
with either control makes it valid ("3 / 3 ✓") and the round scores, the counts
survive leaving and reopening the round, and both controls mirror correctly in
Arabic.
