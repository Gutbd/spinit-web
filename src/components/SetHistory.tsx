import type { CompletedSetView } from "../contract/types";
import { formatSetScore } from "./setFormat";

/**
 * Complementary per-set history (FEATURE-007.1) — shows the score of each CONCLUDED set, oldest
 * first. It never shows the in-progress set (that lives on the main scoreboard's Games column); it
 * renders nothing when there are no concluded sets yet, so an older doc (no `completedSets`) or a
 * brand-new match simply omits this block. Score formatting lives in `./setFormat`.
 */
export function SetHistory({ completedSets }: { completedSets: CompletedSetView[] }) {
  if (completedSets.length === 0) return null;

  return (
    <div className="set-history">
      <div className="set-history-title">Sets</div>
      <ol className="set-history-list">
        {completedSets.map((set, index) => (
          <li key={index} className="set-history-row">
            <span className="set-history-label">{index + 1}º set</span>
            <span className="set-history-score">{formatSetScore(set)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
