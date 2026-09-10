import { toSpectatorMomentum } from "../contract/momentum";
import { momentumCircles, momentumContextCopy } from "../contract/momentumVisual";

/**
 * Unified five-circle Momentum visual — identical, circle-for-circle, to spinit-track's Live
 * viewer (`CompactMomentumCard`). Momentum semantics are unchanged (locked, D2): scorer 0 (A) =
 * +1, scorer 1 (B) = -1, folded over the last-5 `recentScorers`, range [-5, +5]. The domain →
 * five-state mapping lives in the shared `momentumCircles` contract (momentumVisual.ts), so
 * Android and Web can never silently diverge.
 *
 * Exactly five fixed circles exist from match start (neutral = center only). There is ONE momentum
 * value: it fills OUTWARD from the always-active center toward the leading player. The active color
 * is the brand Neon yellow and means "momentum" — NOT a player. Direction is communicated purely by
 * which side of the center fills; both player names are the SAME neutral color.
 */
export function MomentumMeter({
  recentScorers,
  playerAName,
  playerBName,
}: {
  recentScorers: number[];
  playerAName: string;
  playerBName: string;
}) {
  const value = toSpectatorMomentum(recentScorers);
  const circles = momentumCircles(value);

  return (
    <div
      className="momentum"
      role="img"
      aria-label={`Momentum, últimos 5 pontos: ${describeMomentum(value, playerAName, playerBName)}`}
    >
      <div className="momentum-title">Momentum — últimos 5 pontos</div>
      <div className="momentum-row">
        <span className="momentum-label">{playerAName}</span>
        <div className="momentum-circles">
          {circles.map((active, i) => (
            <span
              key={i}
              className={`momentum-dot${active ? " momentum-dot-active" : ""}`}
              data-active={active}
            />
          ))}
        </div>
        <span className="momentum-label">{playerBName}</span>
      </div>
      {/* Secondary context sentence — derived from the SAME visual state as the circles. */}
      <div className="momentum-context">{momentumContextCopy(value, playerAName, playerBName)}</div>
    </div>
  );
}

function describeMomentum(value: number, playerAName: string, playerBName: string): string {
  if (value === 0) return "equilibrado";
  return value > 0 ? `${playerAName} +${value}` : `${playerBName} +${Math.abs(value)}`;
}
