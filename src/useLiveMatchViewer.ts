import { useEffect, useState } from "react";
import { toSpectatorState } from "./contract/mapper";
import { toScheduledState } from "./contract/scheduledMapper";
import type { ScheduledState, SpectatorState } from "./contract/types";
import type { SubscribeFn } from "./firebase/liveMatchReader";

/**
 * Presentation state machine for `/live/{shareCode}` — the web counterpart of Android's
 * `LiveViewerViewModel` states (Part 3 §6: Idle/Connecting/Watching-Live/Watching-Finished/
 * NotFound/Error). "Idle" itself lives only in the code-entry screen (§11 — "you may model Idle
 * separately only on /live"), so this hook starts at "connecting" the moment it's given a code.
 */
export type ViewerState =
  | { type: "connecting" }
  | { type: "scheduled"; scheduled: ScheduledState; fromCache: boolean }
  | { type: "live"; spectator: SpectatorState; fromCache: boolean }
  | { type: "finished"; spectator: SpectatorState; fromCache: boolean }
  | { type: "notFound" }
  | { type: "error" };

export function useLiveMatchViewer(subscribe: SubscribeFn, shareCode: string): ViewerState {
  const [state, setState] = useState<ViewerState>({ type: "connecting" });
  // Reset to "connecting" during render when the code changes (React's documented "adjusting
  // state on prop change" pattern) rather than via an effect's synchronous setState, which lint
  // flags as a cascading-render smell — the actual side effect (subscribing) still lives below.
  const [observedShareCode, setObservedShareCode] = useState(shareCode);
  if (shareCode !== observedShareCode) {
    setObservedShareCode(shareCode);
    setState({ type: "connecting" });
  }

  useEffect(() => {
    const unsubscribe = subscribe(shareCode, (snapshot) => {
      if (snapshot.type === "missing") {
        setState({ type: "notFound" });
        return;
      }
      if (snapshot.type === "error") {
        setState({ type: "error" });
        return;
      }

      // Pre-match: a SCHEDULED document has no score fields, so it maps to a distinct scheduled
      // state. Checked before the live/finished mapper (which would reject a SCHEDULED doc as
      // malformed). The SAME subscription drives SCHEDULED -> LIVE: once the host flips the doc to
      // LIVE, the next snapshot falls through to toSpectatorState below — no new listener.
      const scheduled = toScheduledState(snapshot.data, shareCode);
      if (scheduled !== null) {
        setState({ type: "scheduled", scheduled, fromCache: snapshot.fromCache });
        return;
      }

      const spectator = toSpectatorState(snapshot.data, shareCode);
      if (spectator === null) {
        setState({ type: "error" });
        return;
      }

      setState(
        spectator.status === "FINISHED"
          ? { type: "finished", spectator, fromCache: snapshot.fromCache }
          : { type: "live", spectator, fromCache: snapshot.fromCache },
      );
    });

    return unsubscribe;
  }, [subscribe, shareCode]);

  return state;
}
