# Changelog

All notable changes to **spinit-web** (the SpinIt Track browser Live spectator) are documented here.
This project adheres to [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`); the
version in `package.json` tracks the latest released entry below.

This is the Web surface only. The Android host (`spinit-track`) owns the Firestore
`live_matches/{shareCode}` contract; the Web reads it. When the Android contract changes, the
mirror in `src/contract/` and the fixtures in `src/testFixtures/` must be updated by hand.

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
  `JOÃO × PEDRO` row on tablet/desktop/TV via a container query on the content column. Long player
  names wrap/shrink gracefully (`overflow-wrap: anywhere`, `text-wrap: balance`) instead of breaking
  the layout. `src/components/PreMatchScreen.tsx` + `src/App.css` (`.prematch*`) only.
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
