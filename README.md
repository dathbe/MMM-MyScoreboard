Two additions to README.md. (1) In the supported-leagues bullet list, after the `PWHL` line, insert:

### Tennis

* `ATP` - ATP Tour (men's singles)
* `WTA` - WTA Tour (women's singles)

Tennis is player-based rather than team-based, so the `teams` array holds player surnames (e.g. `["Alcaraz", "Gauff"]`). See [Tennis (ATP / WTA)](#tennis-atp--wta) below for setup and the API-key/rate-limit notes.

(2) Immediately before the `## Logos` heading (after the PWHL codes </details> block), insert a new section:

### Tennis (ATP / WTA)

Tennis scores come from the [Live Tennis API](https://livetennisapi.com). _Disclosure: this provider was contributed by the Live Tennis API team, so treat this section as vendor-authored and judge it on the merits._

Because tennis is player-based, list player **surnames** in the `teams` array. Leave `teams` off to show the whole tour's slate for the day (this can be a long list). The home/visitor slots hold the two players (rendered as "Player 1 vs Player 2"); the big score is the number of **sets won**, and the status line shows the set-by-set games (e.g. `6-4 3-6 2-1`), the current game points, and who is serving.

```js
{
  league: "ATP",
  teams: ["Alcaraz", "Sinner", "Djokovic"]
},
{
  league: "WTA",
  teams: ["Gauff", "Swiatek"]
}
```

**API key.** A free key is required. Get one at [livetennisapi.com/subscribe/free](https://livetennisapi.com/subscribe/free) (no card). The key is read **server-side only**, from the `LIVETENNIS_API_KEY` environment variable, and is never sent to the browser. Set it wherever your MagicMirror process reads its environment, for example:

```sh
export LIVETENNIS_API_KEY="twjp_your_key_here"
```

**Rate limits (important).** The free tier allows **30 requests/minute and 100 requests/day**. This provider keeps one shared cache and refreshes it on a timer, so the number of API calls does **not** grow with how many tennis leagues you follow or how often the module refreshes. Each refresh spends **3 requests per tour** (live + upcoming + completed). At the default 15-minute cadence that is roughly **288 requests/day for one tour** — which **exceeds the free 100/day cap**, so a free key is best for testing or light use, and continuous all-day operation needs a [paid tier](https://livetennisapi.com). To stay inside the free cap, raise the refresh interval with the `LIVETENNIS_POLL_INTERVAL` environment variable (in minutes); for example `LIVETENNIS_POLL_INTERVAL=45` following a single tour is about 96 requests/day. If the key is throttled or missing, tennis simply shows no games and the rest of your scoreboard is unaffected.