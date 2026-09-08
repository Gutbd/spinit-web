import { useMemo } from "react";
import { normalizeShareCode } from "../contract/shareCode";
import { useLiveMatchViewer } from "../useLiveMatchViewer";
import { createFirestoreSubscribe } from "../firebase/liveMatchReader";
import { getDb } from "../firebase/config";
import { ScoreBoard } from "./ScoreBoard";
import { ConnectingScreen, ErrorScreen, InvalidCodeScreen, NotFoundScreen } from "./StatusScreens";

/** `/live/{shareCode}` — validates the code shape locally first (no Firestore query, and no
 * Firebase initialization at all, for a malformed code, per §10) before subscribing. */
export function LivePage({ rawCode, onBack }: { rawCode: string; onBack: () => void }) {
  const normalized = normalizeShareCode(rawCode);

  if (!normalized.valid) {
    return <InvalidCodeScreen onBack={onBack} />;
  }

  return <ConnectedLivePage shareCode={normalized.code} onBack={onBack} />;
}

function ConnectedLivePage({ shareCode, onBack }: { shareCode: string; onBack: () => void }) {
  const subscribe = useMemo(() => createFirestoreSubscribe(getDb()), []);
  const state = useLiveMatchViewer(subscribe, shareCode);

  // FEATURE-008 Phase 3 — the Web is spectator-ONLY. Remote scorekeeping is private, authenticated,
  // and App-only (invitation-based); the Web has no control path whatsoever.
  switch (state.type) {
    case "connecting":
      return <ConnectingScreen />;
    case "notFound":
      return <NotFoundScreen onBack={onBack} />;
    case "error":
      return <ErrorScreen onBack={onBack} />;
    case "live":
    case "finished":
      return (
        <>
          {state.fromCache && (
            <div className="stale-banner" role="status">
              Reconectando…
            </div>
          )}
          <ScoreBoard spectator={state.spectator} />
        </>
      );
  }
}
