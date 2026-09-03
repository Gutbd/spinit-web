import { describe, expect, it, vi } from "vitest";

vi.mock("firebase/firestore", () => ({
  doc: vi.fn((_db: unknown, _collection: string, id: string) => ({ __refId: id })),
  onSnapshot: vi.fn(),
}));

import { doc, onSnapshot, type Firestore } from "firebase/firestore";
import { createFirestoreSubscribe, type LiveMatchSnapshot } from "./liveMatchReader";

const mockedOnSnapshot = vi.mocked(onSnapshot);
const mockedDoc = vi.mocked(doc);
const fakeDb = {} as Firestore;

describe("createFirestoreSubscribe — adapter mapping (no real Firestore/emulator involved)", () => {
  it("maps an existing document to Exists, including fromCache", () => {
    mockedOnSnapshot.mockImplementation(((_ref: unknown, onNext: (s: unknown) => void) => {
      onNext({
        exists: () => true,
        data: () => ({ matchCode: "AB12CD34" }),
        metadata: { fromCache: true },
      });
      return vi.fn();
    }) as unknown as typeof onSnapshot);

    const results: LiveMatchSnapshot[] = [];
    createFirestoreSubscribe(fakeDb)("AB12CD34", (s) => results.push(s));

    expect(results).toEqual([{ type: "exists", data: { matchCode: "AB12CD34" }, fromCache: true }]);
    expect(mockedDoc).toHaveBeenCalledWith(fakeDb, "live_matches", "AB12CD34");
  });

  it("maps a missing document to Missing", () => {
    mockedOnSnapshot.mockImplementation(((_ref: unknown, onNext: (s: unknown) => void) => {
      onNext({ exists: () => false, metadata: { fromCache: false } });
      return vi.fn();
    }) as unknown as typeof onSnapshot);

    const results: LiveMatchSnapshot[] = [];
    createFirestoreSubscribe(fakeDb)("NOPE0000", (s) => results.push(s));

    expect(results).toEqual([{ type: "missing" }]);
  });

  it("maps a listener error to Error, never throwing", () => {
    const boom = new Error("boom");
    mockedOnSnapshot.mockImplementation(((
      _ref: unknown,
      _onNext: (s: unknown) => void,
      onError: (e: unknown) => void,
    ) => {
      onError(boom);
      return vi.fn();
    }) as unknown as typeof onSnapshot);

    const results: LiveMatchSnapshot[] = [];
    createFirestoreSubscribe(fakeDb)("AB12CD34", (s) => results.push(s));

    expect(results).toEqual([{ type: "error", error: boom }]);
  });

  it("returns the underlying Firestore unsubscribe function for cleanup", () => {
    const fakeUnsubscribe = vi.fn();
    mockedOnSnapshot.mockReturnValue(fakeUnsubscribe as unknown as ReturnType<typeof onSnapshot>);

    const unsubscribe = createFirestoreSubscribe(fakeDb)("AB12CD34", () => {});
    unsubscribe();

    expect(fakeUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
