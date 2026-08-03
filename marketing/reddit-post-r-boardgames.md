# Reddit post — r/boardgames

## Title

Every Skull King score app I tried was missing something, so I built my own. Free, works offline, no ads, nothing paywalled

## Body

Scoring is the only part of Skull King I don't love. Someone captures two mermaids plus the Skull King, two other players had a Loot alliance and one of them blew their bid, and now the whole table is waiting while I do arithmetic on a napkin.

I tried a bunch of score apps and each one was missing something. The good features were usually locked behind a paid version, or there was no Rascal scoring, or the newest expansion cards weren't in there at all. So I ended up building my own. It's a free web app and everything is included.

The stuff I'm most proud of:

- Instead of typing bonus points you just tap what actually happened, like "mermaid took the Skull King", and it gives the points to the right player. It also knows the weird details, like standard capture bonuses counting even when you miss your bid, while the new 7s and 8s only pay out on an exact bid.
- Loot alliances are tracked properly. You log the alliance when the card gets played, and at the end of the round it checks that both players hit their exact bids before handing out the +20s.
- Rascal scoring is in there (the alternate system from the rulebook), including the optional Buckshot and Cannonball declarations each round.
- The new expansion works too: the conditional 7s and 8s, Davy Jones' Locker, the Second, Leviathans. Kraken tricks are handled correctly, so it won't yell at you when a round ends up with fewer tricks than cards dealt.
- It keeps stats for your group across games. Win rate, exact bid rate, zero bid success, streaks, a score chart, all-time records. My friends check this way more than I expected.
- It works completely offline once you add it to your home screen. We sometimes play places with zero reception, which is honestly half the reason I built it. Everything autosaves, you can go back and fix an earlier round, and you can export your whole history as a backup file and load it on another device.

There's also a small rules reference built in for every special card, for the inevitable "wait, what does the White Whale do again" argument. The UI is in English, French, German, Arabic and Chinese.

No account, no ads, no tracking, nothing paywalled. I even unit tested the scoring against the worked examples in the rulebook because I didn't trust myself.

Link: https://gabrielctn.github.io/skull-king-crew-ledger/ (open it on your phone and hit "Add to Home Screen", after that it behaves like a normal app)

Obligatory disclaimer: this is a fan project, not affiliated with Grandpa Beck's in any way. I just added Rascal scoring, so at this point it covers everything my group plays. If your table has house rules I missed or something scores wrong, there's a feedback button in the settings and I actually read what comes in.

## Posting notes (don't paste these)

- **Personal placeholder lines**: swap these for your real experience before posting: the napkin scene in the intro, "we sometimes play places with zero reception", and "my friends check this way more than I expected". Everything else is factual about the app.
- **Visual**: post as a text post, then add `marketing/skull-king-crew-ledger-demo.gif` in a top comment (or link it in the body). Posts with a demo visual get far more traction than bare links.
- **Rules**: r/boardgames follows Reddit's ~10% self-promotion guideline and expects makers to engage in comments — plan to answer questions the first day. Pick the self-promotion/project flair if one is offered.
- **Deliberate claim framing**: some paid apps *do* offer Rascal scoring and alliance tracking in their unlockable "full versions" — so the post never claims those features are unique, only that here everything is free, offline and included. Keep that framing if you edit.
