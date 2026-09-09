import type { SpectatorState } from "../contract/types";
import { MatchClock } from "./MatchClock";
import { MomentumMeter } from "./MomentumMeter";
import { SetHistory } from "./SetHistory";
import { ImportantMomentBanner } from "./ImportantMomentBanner";

/**
 * The live scoreboard — primarily a scoreboard, not an analytics dashboard (Part 4 §12). Shows only
 * fields present in the canonical contract: no per-set history (not in the Firestore `state` map
 * today — see FEATURE-007.1 impact analysis), no service/return/break-point stats. The one time
 * field it does show is the host-authoritative match clock (`state.timer*`), rendered verbatim.
 *
 * Match info (championship / phase / format, and a set tie-break context tag) sits ABOVE the score as
 * a header, since it describes the match itself; the transient game state (DEUCE / ADV) stays below,
 * and a tie-break is never shown below (it belongs in the header). Player names are neutral; the
 * server dot and the Momentum lanes carry the yellow/grey identity (matching spinit-track).
 */
export function ScoreBoard({ spectator }: { spectator: SpectatorState }) {
  const finished = spectator.status === "FINISHED";

  const tieBreakActive = spectator.isTieBreak || spectator.isSuperTieBreak;

  // A tie-break is the match MODE for a tie-break-only match (the format label already says so), but
  // just the current situation for a set tie-break inside a normal match. So the tie-break context tag
  // in the header is shown ONLY for a set tie-break (normal match); a tie-break-only match relies on
  // its format label instead, avoiding a duplicate. (Legacy docs without matchType fall back to
  // showing the tag whenever a tie-break is active.)
  const isTieBreakOnlyMatch =
    spectator.matchType === "TIE_BREAK_ONLY" || spectator.matchType === "SUPER_TIE_BREAK_ONLY";
  const tieBreakTag =
    tieBreakActive && !finished && !isTieBreakOnlyMatch
      ? spectator.isSuperTieBreak
        ? "Super Tie-break"
        : "Tie-break"
      : null;

  const hasMatchInfo = Boolean(
    spectator.championshipName || spectator.phase || spectator.matchTypeLabel || tieBreakTag,
  );

  // Below-the-score label keeps the transient game state (DEUCE / ADV) — but NEVER a tie-break tag:
  // when a tie-break is being played the format/tie-break context lives in the header above the score.
  const belowStatusLabel =
    !finished && !tieBreakActive ? spectator.statusLabel : null;

  return (
    <section className="scoreboard" aria-live="polite">
      <div className="scoreboard-brand">SpinIt Track · Ao Vivo</div>

      <MatchClock timer={spectator.timer} />

      {finished && spectator.matchWinner !== null && (
        <div className="scoreboard-winner">
          {spectator.matchWinner === 0 ? spectator.playerAName : spectator.playerBName} venceu a partida
        </div>
      )}

      {/* Match info — championship / phase / format (and a set tie-break context tag) — above the
          score, since these describe the match itself rather than a momentary state. */}
      {hasMatchInfo && (
        <div className="scoreboard-info">
          {spectator.championshipName && (
            <span className="scoreboard-championship">{spectator.championshipName}</span>
          )}
          <div className="scoreboard-info-sub">
            {spectator.phase && <span className="scoreboard-phase">{spectator.phase}</span>}
            {spectator.matchTypeLabel && (
              <span className="scoreboard-format">{spectator.matchTypeLabel}</span>
            )}
            {tieBreakTag && <span className="scoreboard-tiebreak">{tieBreakTag}</span>}
          </div>
        </div>
      )}

      <div className="scoreboard-players">
        <div className="scoreboard-header">
          <span className="col-name" />
          <span className="col-stat">Pontos</span>
          <span className="col-stat">Games</span>
          <span className="col-stat">Sets</span>
        </div>
        <PlayerRow
          identity="a"
          name={spectator.playerAName}
          serving={spectator.currentServer === 0 && !finished}
          points={spectator.pointsA}
          games={spectator.gamesA}
          sets={spectator.setsA}
        />
        <PlayerRow
          identity="b"
          name={spectator.playerBName}
          serving={spectator.currentServer === 1 && !finished}
          points={spectator.pointsB}
          games={spectator.gamesB}
          sets={spectator.setsB}
        />
      </div>

      {!finished && (
        <ImportantMomentBanner
          moment={spectator.importantMoment}
          pressurePlayer={spectator.pressureMomentPlayer}
          playerAName={spectator.playerAName}
          playerBName={spectator.playerBName}
        />
      )}

      {belowStatusLabel && <div className="scoreboard-status-label">{belowStatusLabel}</div>}

      <SetHistory completedSets={spectator.completedSets} />

      <MomentumMeter
        recentScorers={spectator.recentScorers}
        playerAName={spectator.playerAName}
        playerBName={spectator.playerBName}
      />
    </section>
  );
}

function PlayerRow({
  identity,
  name,
  serving,
  points,
  games,
  sets,
}: {
  identity: "a" | "b";
  name: string;
  serving: boolean;
  points: string;
  games: number;
  sets: number;
}) {
  return (
    <div className={`player-row player-row-${identity}`}>
      <span className={`player-name col-name identity-${identity}`}>
        {serving && <span className="serving-dot" aria-label="Sacando" />}
        <span className="name-text">{name}</span>
      </span>
      <span className="player-points col-stat">{points}</span>
      <span className="player-games col-stat">{games}</span>
      <span className="player-sets col-stat">{sets}</span>
    </div>
  );
}
