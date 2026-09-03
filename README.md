# spinit-web — SpinIt Track Live Spectator

Read-only browser spectator for a SpinIt Track live match. Part of FEATURE-007 (Live Match
Sharing / Spectator) — see `spinit-track`'s `FEATURE_007_PLANNING_PART1_...md` and
`FEATURE_007_PLANNING_PART2_...md` for the full architecture and rationale. This repo is the
**Web** surface only: the Android app remains the sole scoring authority and the sole writer of
the Firestore `live_matches/{shareCode}` document; this project only reads it.

## Purpose

Given a match's 8-character share code (or a pasted spectator link), show a live scoreboard —
player names, labelled Pontos / Games / Sets columns, a per-set history of concluded sets, the
current server, a compact last-5-points Momentum indicator, contextual Break / Set / Match Point
indicators (FEATURE-007.1), and the final result when the match finishes. Nothing else: no
analytics the host didn't publish, no controls, no way to affect the match — every value is
computed by the Android host and only rendered here.

## Local development

```
npm install
cp .env.example .env.local   # then fill in real Firebase Web config, see below
npm run dev
```

## Environment variables

Firebase Web config, read from Vite env vars (see `.env.example` for the exact names). These are
**not secrets** — the Firebase Web API key is scoped by Firestore Security Rules, not by hiding
it — but real values aren't committed; use `.env.local` (gitignored by the Vite template's
`*.local` pattern).

To obtain/refresh real values for the `spinit-ddc64` project's registered Web app
("SpinIt Live Spectator"):

```
firebase apps:sdkconfig WEB 1:706525956576:web:f21ca164a3723f9b410385 --project spinit-ddc64
```

If this Web app registration doesn't exist yet in a given environment, create it first with
`firebase apps:create web "SpinIt Live Spectator" --project spinit-ddc64` — this only registers a
new Web app in the **existing** `spinit-ddc64` project (the same one the Android app writes to);
it does not create a new Firebase project and does not touch Firestore data or rules.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm test` | Vitest (contract mapper, Momentum, share-code, routing, Firestore adapter, component smoke tests) |
| `npm run typecheck` | `tsc -b --noEmit`, strict mode |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run lint` | oxlint |

## Routes

- `/` — minimal landing, routes to `/live` (no root-site redesign in scope).
- `/live` — manual share-code entry (accepts a bare code or a pasted spectator URL).
- `/live/{shareCode}` — connects to `live_matches/{shareCode}` and renders the live scoreboard.

No `react-router` — only two real routes, handled by a ~20-line manual parser
(`src/routing/route.ts`) plus a thin History-API hook (`src/routing/useRoute.ts`).

## Canonical contract

The Firestore document shape this project reads is **not owned here**. It's defined by the
Android host (`spinit-track`'s `MatchStateFirestoreSerializer.kt`) and documented canonically at
`spinit-track/docs/live-match-contract-fixtures/`. This project's mapper tests consume a **manual
copy** of those same fixture files under `src/testFixtures/` — see the README there for why, and
for the re-sync obligation: **if the Android contract changes, these fixtures and
`src/contract/mapper.ts` must be updated by hand.** Nothing currently automates this across the
two repositories.

`src/contract/` mirrors Android's `SpectatorState`/mapper/Momentum logic field-for-field (see
FEATURE-007 Implementation Part 4's cross-surface parity table for the verified comparison).
FEATURE-007.1 extended the published `state` with `completedSets` (per-set history),
`importantMoment` (`"BREAK_POINT"`/`"SET_POINT"`/`"MATCH_POINT"`) and `pressureMomentPlayer`
(`0`/`1`); the mapper defaults all three safely when absent, so older documents still render.

## Hosting

**Chosen canonical host: `live.spinit.com.br`** (a dedicated subdomain), not the `spinit.com.br`
root. `spinit.com.br` already resolves to live, non-parked infrastructure (see the Part 4
implementation report's domain-safety findings) — Firebase Hosting cannot serve only a subpath of
an existing domain, so claiming the whole root would risk whatever the root currently serves.
`live.spinit.com.br` currently has no DNS record at all, so it's free to claim without touching
anything else. Firebase Hosting is used because Firestore already owns the live transport, static
Vite output is a natural fit, and it avoids introducing a second hosting provider for one
Firebase-centric surface.

`firebase.json` configures a `dist`-published Hosting **target** named `live` with a full SPA
rewrite (`**` → `/index.html`, so refreshing `/live/{code}` doesn't 404). Firebase Hosting serves
an entire site/domain, not a subpath, so this target points at its **own dedicated Hosting site**
`spinit-live` (not the project's default site), which is mapped to the `live.spinit.com.br`
subdomain via a CNAME to `spinit-live.web.app`.

**This is now live in production at `https://live.spinit.com.br`.** The one-time setup — creating
the `spinit-live` site, applying the `live` target, adding the custom domain, and the DNS record —
has already been done. Routine redeploys are just:

```
npm run build
firebase deploy --only hosting:live --project spinit-ddc64
```

The initial site/target setup, for reference, was:

```
firebase hosting:sites:create spinit-live --project spinit-ddc64
firebase target:apply hosting live spinit-live --project spinit-ddc64
```

## Security posture

- **Read-only.** No `setDoc`/`updateDoc`/`addDoc`/`deleteDoc` anywhere in this project's source.
- **No Firebase Auth.** The spectator never signs in — matches Firestore's current
  `live_matches` rule (`allow read: if true`).
- **No `commands/` subcollection**, no remote-scoring UI, no scorekeeper concept. FEATURE-008 is
  out of scope for FEATURE-007 entirely (documentation-only elsewhere; nothing here at all).
- **Public possession-of-code access**, same as Android: anyone with an 8-character share code (or
  a shared link) can view that match. `live_matches` documents currently have no TTL/expiry
  (accepted V1 residual risk, tracked in the FEATURE-007 planning docs — not re-litigated here).
- The Firebase Web `apiKey` in `.env.local`/deployed config is public by design, not a secret.
