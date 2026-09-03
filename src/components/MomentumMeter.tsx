import { toSpectatorMomentum } from "../contract/momentum";

/**
 * Compact V1 Momentum visual (Part 4 §15 / FEATURE-007.1) — a horizontal balance bar, not the full
 * growing FEATURE-005 chart. Semantics are unchanged (locked, D2): scorer 0 (A) = +1, scorer 1 (B)
 * = -1, folded over the last-5 `recentScorers`, range [-5, +5].
 *
 * Visual identity follows the PLAYER, not a fixed side of the bar. Player A owns the teal accent
 * (`--accent-a`) and the LEFT half of the track — under Player A's own label; Player B owns the
 * red accent (`--accent-b`) and the RIGHT half — under Player B's own label. So when A leads (positive)
 * the bar grows leftward toward A's name, and when B leads (negative) it grows rightward toward B's
 * name. The fill's `momentum-fill-{a,b}` class carries both the color and (via CSS) the correct
 * side; the FEATURE-007.1 fix corrected a prior inversion where A's fill grew toward B's label.
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
  const magnitudePct = (Math.abs(value) / 5) * 50;
  const leader = value === 0 ? null : value > 0 ? "a" : "b";

  // The fill grows from center toward the LEADING player's own label. Player A's label is on the
  // left, so A's fill anchors its right edge at center and grows left; Player B's label is on the
  // right, so B's fill anchors its left edge at center and grows right. Keeping the side here (not
  // split across two mirrored CSS rules) is what makes the direction unit-testable and is the
  // FEATURE-007.1 fix for the earlier inversion.
  const fillStyle =
    leader === "a"
      ? { right: "50%", width: `${magnitudePct}%` }
      : { left: "50%", width: `${magnitudePct}%` };

  return (
    <div
      className="momentum"
      role="img"
      aria-label={`Momentum, últimos 5 pontos: ${describeMomentum(value, playerAName, playerBName)}`}
    >
      <div className="momentum-title">Momentum — últimos 5 pontos</div>
      <div className="momentum-labels">
        <span className="momentum-label momentum-label-a">{playerAName}</span>
        <span className="momentum-label momentum-label-b">{playerBName}</span>
      </div>
      <div className="momentum-track">
        <div className="momentum-center" />
        {leader && (
          <div
            className={`momentum-fill momentum-fill-${leader}`}
            data-leader={leader}
            style={fillStyle}
          />
        )}
      </div>
    </div>
  );
}

function describeMomentum(value: number, playerAName: string, playerBName: string): string {
  if (value === 0) return "equilibrado";
  return value > 0 ? `${playerAName} +${value}` : `${playerBName} +${Math.abs(value)}`;
}
