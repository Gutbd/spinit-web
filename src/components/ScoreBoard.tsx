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
 * FEATURE-007.1: adds explicit column headers (Pontos | Games | Sets) so the three numeric columns
 * are self-explanatory, and a per-player color identity (green = A, blue = B) shared with the
 * Momentum meter — the same accent marks each player's name, serving dot, and Momentum lane.
 */
export function ScoreBoard({ spectator }: { spectator: SpectatorState }) {
  const finished = spectator.status === "FINISHED";

  return (
    <section className="scoreboard" aria-live="polite">
      <div className="scoreboard-brand">SpinIt Track · Ao Vivo</div>

      <MatchClock timer={spectator.timer} />

      {finished && spectator.matchWinner !== null && (
        <div className="scoreboard-winner">
          {spectator.matchWinner === 0 ? spectator.playerAName : spectator.playerBName} venceu a partida
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

      {spectator.statusLabel && !finished && (
        <div className="scoreboard-status-label">{spectator.statusLabel}</div>
      )}

      {(spectator.isTieBreak || spectator.isSuperTieBreak) && !finished && (
        <div className="scoreboard-status-label">
          {spectator.isSuperTieBreak ? "Super Tie-Break" : "Tie-Break"}
        </div>
      )}

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
