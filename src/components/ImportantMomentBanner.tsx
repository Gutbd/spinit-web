import type { ImportantMomentKind } from "../contract/types";

const MOMENT_LABEL: Record<ImportantMomentKind, string> = {
  BREAK_POINT: "Break Point",
  SET_POINT: "Set Point",
  MATCH_POINT: "Match Point",
};

/**
 * Contextual pressure-moment banner (FEATURE-007.1). Shows ONLY when the authoritative domain says
 * there is an important moment — it renders nothing otherwise, so it never permanently occupies
 * space. The moment kind and the player who owns it both come straight from the contract
 * (`importantMoment` / `pressureMomentPlayer`); the Web never derives them from the score. The
 * highlighted player carries the same color identity used on the scoreboard and Momentum meter.
 */
export function ImportantMomentBanner({
  moment,
  pressurePlayer,
  playerAName,
  playerBName,
}: {
  moment: ImportantMomentKind | null;
  pressurePlayer: number | null;
  playerAName: string;
  playerBName: string;
}) {
  if (moment === null || (pressurePlayer !== 0 && pressurePlayer !== 1)) return null;

  const identity = pressurePlayer === 0 ? "a" : "b";
  const playerName = pressurePlayer === 0 ? playerAName : playerBName;

  return (
    <div className={`important-moment important-moment-${identity}`} role="status">
      <span className="important-moment-kind">{MOMENT_LABEL[moment]}</span>
      <span className="important-moment-sep" aria-hidden="true">
        ·
      </span>
      <span className="important-moment-player">{playerName}</span>
    </div>
  );
}
