# Changelog

All notable changes to **spinit-web** (the SpinIt Track browser Live spectator) are documented here.
This project adheres to [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`); the
version in `package.json` tracks the latest released entry below.

This is the Web surface only. The Android host (`spinit-track`) owns the Firestore
`live_matches/{shareCode}` contract; the Web reads it. When the Android contract changes, the
mirror in `src/contract/` and the fixtures in `src/testFixtures/` must be updated by hand.

## [1.6.0] — Unified five-circle Momentum visual (shared with spinit-track)

### Changed
- **Momentum is now a fixed five-circle scale**, identical circle-for-circle to spinit-track's Live
  viewer, replacing the horizontal balance bar. All five positions exist from the start (neutral =
  center only, `○ ○ ● ○ ○`) — the component never grows, shrinks or shifts. There is one momentum
  value: it fills **outward from the always-active center** toward the leading player, returning
  through neutral before filling the other side (A and B never fill simultaneously). The active
  color is the single brand Neon yellow and means "momentum", not a player — **both player names now
  use the same neutral color**. The domain→visual mapping lives in a new shared contract
  `src/contract/momentumVisual.ts` (mirroring Android's `MomentumVisual.kt`), covered by lock-step
  tests so the platforms cannot diverge. Momentum semantics (`toSpectatorMomentum`, rolling last-5,
  range `[-5, +5]`) and the Firestore contract are untouched. `src/components/MomentumMeter.tsx`,
  `src/App.css`.

## [1.5.0] — 2026-09-09 — Match-info header above the score; tie-break is match context

### Added
- **Match-info header above the LIVE score.** Championship (when present), phase (when present) and
  match format now render in a neutral header above the scoreboard, since they describe the match
  itself. Reads new `state` fields from `live_matches/{shareCode}` — `matchType`, `matchTypeLabel`,
  `championshipName`, `phase` (published by the Android host); all tolerant of absence (legacy docs →
  header hidden). `src/contract/{types,mapper}.ts`, `src/components/ScoreBoard.tsx`, `src/App.css`.

### Changed
- **Momentum shows each player's persistent colored lane.** Player A's half of the Momentum bar is now
  a persistent faint-yellow rectangle (under A's yellow name) and Player B's half a faint grey one, so
  each player's side always carries their color — not only when they hold the momentum. The brighter
  leader fill still grows over the lane toward whoever leads. (Player A name/fill were already the
  brand yellow; this makes A's *side* visibly yellow at all times.)
- **Tie-break is now match context, not a tag below the score.** A tie-break-only match shows its
  format label in the header; a set tie-break (6–6 inside a normal match) shows a small "Tie-break" /
  "Super Tie-break" context tag in the header (deduped against the format label via `matchType`). The
  transient game state below the score keeps DEUCE / ADV but **never** shows a tie-break tag — which
  also removes the earlier "TIE-BREAK over a 0–0 board" confusion at the start of a tie-break match.

## [1.4.1] — 2026-09-09 — Fix TIE-BREAK label on the LIVE scoreboard

### Fixed
- **The LIVE scoreboard showed the `TIE-BREAK` label twice, and showed it over a 0–0 board at the
  start of a tie-break match.** The host publishes `state.statusLabel` as `"TIE-BREAK"` /
  `"SUPER TIE-BREAK"` during a tie-break, and the scoreboard rendered both that `statusLabel` **and** a
  separate derived tie-break label (the duplicate), and did so even at the very start (all-zero score)
  of a Tie-break / Super Tie-break match. The match-state label is now computed as a single value
  (host `statusLabel`, falling back to a derived label only for legacy docs that omit it — so it can
  never render twice), and the tie-break label is suppressed while the score is still all-zero, so it
  no longer appears over a fresh 0–0 board — it shows once the first point is scored. `DEUCE`/`ADV`
  and an in-set tie-break at 6–6 are unaffected. `src/components/ScoreBoard.tsx` only — no
  contract/logic change.

## [1.4.0] — 2026-09-09 — Visual identity aligned with spinit-track

### Changed
- **Shared visual identity with the Android app.** The web spectator now uses the same palette as
  spinit-track (`app/.../Theme.kt`): background `#090909` (BackgroundDark), surfaces `#1B1B1B`
  (CardSurface), text `#FFFFFF` (TextPrimary), dim `#8A8A8A` (TextSecondary), borders `#242424`
  (DividerDark). CSS-token change in `src/index.css` — no markup/logic change.
- **Winner banner is now the brand yellow.** `"<jogador> venceu a partida"` uses the new `--neon`
  token (`#FCCE43`, spinit-track's Neon accent) regardless of which player won — it reads as the
  match result, not a player-identity color (was green).
- **Player names are neutral white, like the app.** spinit-track uses a single accent: player names
  are white and yellow is only a highlight. Web player names (LIVE scoreboard + SCHEDULED pre-match)
  are now `--text` white (were green/blue); the serving indicator is the brand yellow dot; the A/B
  distinction comes from row position, the serving dot and the Momentum lanes.
- **Momentum colors match spinit-track's Live spectator:** Player A = brand yellow `#FCCE43`,
  Player B = neutral grey `#555555` (was blue — the blue `#29B6F6` is the app's *Training* accent, not
  a match-player color, so it was dropped).
- **Important moments (break/set/match point) are the brand yellow**, matching the app (never a
  per-player hue); the player is named in the banner text.
- Primary buttons (code entry / status screens) use the brand yellow on near-black text, matching the
  app's primary buttons. The paused-timer amber already matched spinit-track (`#FFB300`).
- No change to the Firestore contract, mapper, scoring, timer, Momentum, winner logic, or the
  snapshot subscription.

## [1.3.0] — 2026-09-09 — Responsive LIVE scoreboard (phone → TV)

### Changed
- **LIVE scoreboard optimized as a responsive public sports display.** Visual/responsive only — no
  change to the Firestore contract, mapper semantics, scoring, timer, Momentum, winner logic, or the
  snapshot subscription. Applies the same philosophy as the SCHEDULED pre-match board so
  `SCHEDULED → LIVE` feels continuous on a big screen.
  - **Container:** the scoreboard now fills the viewport and uses a wider bounded content column
    (`max-width: min(1000px, 94vw)`, was a fixed 720px card) with safe `vh/vw` padding, so it no
    longer floats as a narrow mobile card on a TV. `.code-entry`/`.status-screen` keep the 720px width.
  - **Hierarchy (fluid `clamp()` scaling):** current point score is now one of the largest elements
    (`clamp(1.5rem, 6.5vw, 4rem)`), player names are large and priority-1
    (`clamp(1.05rem, 3vw, 2.6rem)`), sets/games stay clearly visible but secondary
    (`clamp(1rem, 2.4vw, 1.9rem)`), and the timer/labels stay readable but subordinate. Readable from
    several meters on 1920×1080.
  - **Player names:** kept on one line with `min-width:0` + `nowrap` + ellipsis (graceful degradation,
    never an arbitrary mid-word character break); full name preserved in the DOM (`.name-text`
    wrapper) even when visually truncated. A/B rows are symmetric.
  - **Server indicator** scales with the name (`0.55em`) so it's obvious from a distance.
  - **Colors:** the generic match-state label (DEUCE / TIE-BREAK / ADV) is now a neutral theme color
    instead of the Player B blue — player identity colors are reserved for the player names/Momentum
    lanes. No new accent colors.
  - **Secondary info bounded:** Momentum and per-set history stay capped (`min(480px, 100%)`) so they
    never compete with the names/score on a large display.
  - `src/App.css` (`.scoreboard*`, `.player-*`, `.momentum`, `.set-history`, `.important-moment`) and
    one presentation-only DOM tweak in `src/components/ScoreBoard.tsx` (name wrapped in `.name-text`).

## [1.2.0] — 2026-09-08 — Scheduled (pre-match) view

### Added
- **Scheduled / pre-match view.** Opening a Live URL whose `live_matches/{shareCode}.state.status`
  is `"SCHEDULED"` now renders a dedicated pre-match page instead of the live scoreboard: it shows
  the championship (when present), phase/round (when present), Player A × Player B, the match format,
  the local scheduled date/time, a bold **PARTIDA AGENDADA** status, and a live one-second countdown
  (`Começa em 2d 04h 18min 32s`; days omitted under a day; `Horário previsto atingido` once reached —
  never a negative value). The countdown is informational only — the Web never decides whether the
  host may start (that rule lives on the Android host).
  - **SCHEDULED → LIVE with no reload.** The pre-match page reacts to the SAME parent snapshot
    subscription: when the host flips the existing document to `LIVE`, the page switches to the
    existing live scoreboard automatically, same URL, no new listener. `LIVE → FINISHED` is
    unchanged.
  - Reuses the existing visual language (scoreboard cards, spacing, per-player identity colors) —
    no redesign; mobile-first preserved.
  - Contract: reads `status`, `playerAName`/`playerBName`, `matchTypeLabel`, `championshipName`,
    `phase`, `scheduledAt` from `state` (mirrors Android `buildScheduledLiveState`); optional
    metadata absent → `null`, never fabricated.
  - `src/contract/types.ts` — new `ScheduledState`.
  - `src/contract/scheduledMapper.ts` — `toScheduledState()` (returns null for non-SCHEDULED docs, so
    LIVE/FINISHED/legacy fall through unchanged).
  - `src/contract/scheduledCountdown.ts` — pure `formatScheduledCountdown` / `formatScheduledDateTime`.
  - `src/components/PreMatchScreen.tsx` — the pre-match view + one-second ticking countdown.
  - `src/useLiveMatchViewer.ts` — new `scheduled` viewer state, checked before the live/finished
    mapper; `src/components/LivePage.tsx` renders it.
- **Legacy safety:** documents without scheduled fields behave exactly as before — no regression to
  LIVE/FINISHED, Momentum, important moments, the match clock, or the winner/final result.

#### Pre-match presentation redesigned as a responsive public sports display

The SCHEDULED screen is now a full-viewport, centered pre-match board that scales from a phone at
arm's length to a venue TV several meters away — not a stretched mobile card.
- **Responsive layout:** a bounded, centered content column (`max-width: min(1200px, 92vw)`) with
  fluid `clamp()` typography/spacing; players stack vertically on phones and switch to a horizontal
  `JOÃO × PEDRO` row on tablet/desktop/TV. `src/components/PreMatchScreen.tsx` + `src/App.css`
  (`.prematch*`) only.
- **Wide-screen player alignment:** the horizontal row is a symmetric
  `minmax(0,1fr) auto minmax(0,1fr)` grid; each player cell is its own query container and the name is
  sized in `cqi` (relative to its own column) with `overflow-wrap: normal`, so a normal name (≈≤10
  chars) always stays on ONE line and a single word is never split at an arbitrary character (fixes
  `GUSTAVO` breaking into `GUSTAV`/`O` at 1920×1080 while `ANDRÉ` stayed on one line). `align-items:
  center` keeps both names and the `×` on the same vertical center even if one name wraps; long
  multi-word names still wrap gracefully at spaces. The phone stacked layout is unchanged.
- **Hierarchy & color:** status → championship → phase → **players (main focus)** → format →
  date/time → countdown. Hierarchy comes from typography/size/weight/spacing/contrast; only the
  player names use the Player A/B identity colors — status, championship, phase, format, date/time
  and countdown are neutral theme colors (Player B blue is no longer used for generic UI).
- **Countdown:** seconds removed — `Começa em 2d 4h 18min` / `4h 18min` / `18min`, and
  `Horário previsto atingido` once reached (never negative). Re-renders at minute granularity (30 s)
  instead of every second. Date/time is now a compact `12 SET · 14:00`.
- Unchanged: Firestore contract, scheduled mapper, SCHEDULED → LIVE transition, and the active
  Live/FINISHED scoreboard.

## [1.1.0] — 2026-09-08 — Live match clock

### Added
- **Live match clock on the spectator scoreboard.** Shows the host-authoritative elapsed match
  time: it ticks locally from the published anchor while the match is live, freezes with a compact
  `· PAUSADO` marker during the host's inactivity auto-pause, and shows the final duration once the
  match finishes. No timer logic runs on the Web — the host is the sole authority; the Web renders
  the published value verbatim (same anchor model as the watch).
  - Contract: reads `timerStartedAtMs`, `timerRunning`, `timerPaused`, `timerElapsedMs` from
    `live_matches/{shareCode}.state` (mirrors Android `MatchTimerState`); absent on older
    documents → clock hidden, never fabricated.
  - `src/contract/types.ts` — new `MatchTimerView` + `SpectatorState.timer`.
  - `src/contract/mapper.ts` — `asTimer()` parses the four fields tolerantly.
  - `src/components/matchClockFormat.ts` — pure `formatMatchClock` / `displayElapsedMs` /
    `matchClockLabel` / `timerHasStarted` helpers.
  - `src/components/MatchClock.tsx` — renders the clock, ticking once per second only while running.
  - `src/components/ScoreBoard.tsx` — shows `<MatchClock/>` below the brand.
  - `src/App.css` — `.scoreboard-timer` (tabular digits) + amber `.scoreboard-timer-paused`.
  - Tests: mapper (running / frozen / absent / missing-field) and `MatchClock` (format, tick vs.
    frozen, running/paused render, null).

## [1.0.0] — 2026-09-07 — Initial browser Live spectator

Baseline: the first versioned release, corresponding to the browser Live spectator already in
production at `https://live.spinit.com.br` (FEATURE-007 / 007.1; spectator-only w.r.t. FEATURE-008).
Retroactively versioned — earlier work predates this changelog.

### Added
- Read-only live scoreboard for `live_matches/{shareCode}`: player names, labelled
  Pontos / Games / Sets columns, per-set history of concluded sets, current server, compact
  last-5-points Momentum, contextual Break / Set / Match Point indicators, and the final result.
- Contract mirror of Android's `SpectatorState`/mapper/Momentum in `src/contract/`, validated
  against manual copies of the canonical fixtures under `src/testFixtures/`.
- Manual two-route handler (`/live`, `/live/{shareCode}`) with a share-code parser; Firestore
  realtime snapshot adapter isolated behind `src/firebase/liveMatchReader.ts`.
- Firebase Hosting deploy target `live` (SPA rewrite) on the dedicated `spinit-live` site.
