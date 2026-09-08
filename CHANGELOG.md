# Changelog

All notable changes to **spinit-web** (the SpinIt Track browser Live spectator) are documented here.
This project adheres to [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`); the
version in `package.json` tracks the latest released entry below.

This is the Web surface only. The Android host (`spinit-track`) owns the Firestore
`live_matches/{shareCode}` contract; the Web reads it. When the Android contract changes, the
mirror in `src/contract/` and the fixtures in `src/testFixtures/` must be updated by hand.

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
