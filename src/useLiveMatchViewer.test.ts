import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useLiveMatchViewer } from "./useLiveMatchViewer";
import type { LiveMatchSnapshot, SubscribeFn } from "./firebase/liveMatchReader";
import liveFixture from "./testFixtures/live.json";
import finishedFixture from "./testFixtures/finished.json";
import scheduledFixture from "./testFixtures/scheduled.json";

function fakeSubscribe(emit: (onResult: (s: LiveMatchSnapshot) => void) => void): {
  subscribe: SubscribeFn;
  unsubscribe: ReturnType<typeof vi.fn>;
} {
  const unsubscribe = vi.fn();
  const subscribe: SubscribeFn = (_shareCode, onResult) => {
    emit(onResult);
    return unsubscribe;
  };
  return { subscribe, unsubscribe };
}

describe("useLiveMatchViewer", () => {
  it("starts connecting, then transitions to live on an existing LIVE snapshot", async () => {
    const { subscribe } = fakeSubscribe((onResult) =>
      onResult({ type: "exists", data: liveFixture, fromCache: false }),
    );
    const { result } = renderHook(() => useLiveMatchViewer(subscribe, "AB12CD34"));

    await waitFor(() => expect(result.current.type).toBe("live"));
    expect(result.current).toMatchObject({ type: "live", fromCache: false });
  });

  it("transitions to finished on an existing FINISHED snapshot", async () => {
    const { subscribe } = fakeSubscribe((onResult) =>
      onResult({ type: "exists", data: finishedFixture, fromCache: false }),
    );
    const { result } = renderHook(() => useLiveMatchViewer(subscribe, "AB12CD34"));

    await waitFor(() => expect(result.current.type).toBe("finished"));
  });

  it("transitions to scheduled on an existing SCHEDULED snapshot", async () => {
    const { subscribe } = fakeSubscribe((onResult) =>
      onResult({ type: "exists", data: scheduledFixture, fromCache: false }),
    );
    const { result } = renderHook(() => useLiveMatchViewer(subscribe, "SC12CD34"));

    await waitFor(() => expect(result.current.type).toBe("scheduled"));
    expect(result.current).toMatchObject({
      type: "scheduled",
      scheduled: { playerAName: "João", playerBName: "Pedro" },
    });
  });

  it("scheduled snapshot later becoming LIVE transitions scheduled -> live (same subscription)", async () => {
    let deliver: ((s: LiveMatchSnapshot) => void) | undefined;
    const subscribe: SubscribeFn = (_code, onResult) => {
      deliver = onResult;
      onResult({ type: "exists", data: scheduledFixture, fromCache: false });
      return vi.fn();
    };
    const { result } = renderHook(() => useLiveMatchViewer(subscribe, "SC12CD34"));

    await waitFor(() => expect(result.current.type).toBe("scheduled"));
    // Android flips the SAME document to LIVE — the next snapshot drives the switch, no new listener.
    deliver?.({ type: "exists", data: liveFixture, fromCache: false });
    await waitFor(() => expect(result.current.type).toBe("live"));
  });

  it("transitions to notFound on a Missing snapshot", async () => {
    const { subscribe } = fakeSubscribe((onResult) => onResult({ type: "missing" }));
    const { result } = renderHook(() => useLiveMatchViewer(subscribe, "NOPE0000"));

    await waitFor(() => expect(result.current.type).toBe("notFound"));
  });

  it("transitions to error on a listener error", async () => {
    const { subscribe } = fakeSubscribe((onResult) => onResult({ type: "error", error: new Error("x") }));
    const { result } = renderHook(() => useLiveMatchViewer(subscribe, "AB12CD34"));

    await waitFor(() => expect(result.current.type).toBe("error"));
  });

  it("transitions to error on a malformed document (fails the mapper)", async () => {
    const { subscribe } = fakeSubscribe((onResult) =>
      onResult({ type: "exists", data: { state: { status: "LIVE" } }, fromCache: false }),
    );
    const { result } = renderHook(() => useLiveMatchViewer(subscribe, "AB12CD34"));

    await waitFor(() => expect(result.current.type).toBe("error"));
  });

  it("live snapshot later becoming FINISHED transitions live -> finished", async () => {
    let deliver: ((s: LiveMatchSnapshot) => void) | undefined;
    const subscribe: SubscribeFn = (_code, onResult) => {
      deliver = onResult;
      onResult({ type: "exists", data: liveFixture, fromCache: false });
      return vi.fn();
    };
    const { result } = renderHook(() => useLiveMatchViewer(subscribe, "AB12CD34"));

    await waitFor(() => expect(result.current.type).toBe("live"));
    deliver?.({ type: "exists", data: finishedFixture, fromCache: false });
    await waitFor(() => expect(result.current.type).toBe("finished"));
  });

  it("unsubscribes the previous listener when the share code changes", () => {
    const unsubscribeA = vi.fn();
    const subscribe: SubscribeFn = vi.fn().mockReturnValueOnce(unsubscribeA).mockReturnValueOnce(vi.fn());

    const { rerender } = renderHook(({ code }) => useLiveMatchViewer(subscribe, code), {
      initialProps: { code: "AAAAAAAA" },
    });
    rerender({ code: "BBBBBBBB" });

    expect(unsubscribeA).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes on unmount", () => {
    const unsubscribe = vi.fn();
    const subscribe: SubscribeFn = vi.fn().mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useLiveMatchViewer(subscribe, "AB12CD34"));
    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
