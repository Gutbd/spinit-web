# Live match contract fixtures (Web copy)

**CANONICAL SOURCE:** `spinit-track/docs/live-match-contract-fixtures/`

These four JSON files are byte-identical copies of the Android repository's canonical
`live_matches/{shareCode}` contract fixtures. They exist here only because this project's mapper
tests need to import them directly (`resolveJsonModule`).

**This copy is manual, not automated.** If the Android canonical fixtures change (new/renamed/
removed field in `MatchStateFirestoreSerializer.kt`), these files — and this project's
`src/contract/mapper.ts` — must be re-synced by hand. Nothing in either repository currently
enforces this automatically; this is the primary cross-repo drift risk called out in FEATURE-007
Planning Part 2 §18/§23 and Part 4 §4.

| Fixture | Exercises |
|---|---|
| `live.json` | Mid-match snapshot, mixed `recentScorers`, no `matchWinner`. |
| `finished.json` | `status: "FINISHED"`, `matchWinner` present, `isMatchOver: true`. |
| `after_undo.json` | Snapshot immediately after an undo-triggered host update — readers need no undo-awareness of their own. |
| `minimal_legacy.json` | No `matchWinner`, no `statusLabel`, `recentScorers` absent entirely — proves this mapper defaults missing optional fields safely instead of failing or fabricating data. |
