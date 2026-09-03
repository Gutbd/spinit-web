import { doc, onSnapshot, type Firestore } from "firebase/firestore";
import type { RawLiveMatchDoc } from "../contract/types";

/**
 * Firestore-independent result of observing `live_matches/{shareCode}` — the web counterpart of
 * Android's `LiveMatchSnapshot` sealed interface (`Exists`/`Missing`). No `DocumentSnapshot` (or
 * any Firestore SDK type) crosses this boundary into React components; a listener failure is its
 * own explicit variant rather than a thrown exception.
 */
export type LiveMatchSnapshot =
  | { type: "exists"; data: RawLiveMatchDoc; fromCache: boolean }
  | { type: "missing" }
  | { type: "error"; error: unknown };

export type Unsubscribe = () => void;

/** Injectable subscribe function — real Firestore in production, a fake in tests. This is the
 * adapter seam called for by Part 4 §24 ("isolate Firestore behind a small adapter so most tests
 * do not require Firebase"). */
export type SubscribeFn = (
  shareCode: string,
  onResult: (snapshot: LiveMatchSnapshot) => void,
) => Unsubscribe;

/** Real Firestore-backed implementation of {@link SubscribeFn}. Realtime only — no polling, no
 * writes, no Auth, no `events/` subcollection listener (locked: Momentum comes from `recentScorers`
 * in the state doc, never from event reconstruction). */
export function createFirestoreSubscribe(db: Firestore): SubscribeFn {
  return (shareCode, onResult) => {
    const ref = doc(db, "live_matches", shareCode);
    return onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          onResult({ type: "exists", data: snapshot.data(), fromCache: snapshot.metadata.fromCache });
        } else {
          onResult({ type: "missing" });
        }
      },
      (error) => onResult({ type: "error", error }),
    );
  };
}
