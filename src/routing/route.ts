/**
 * Minimal manual path parser — no react-router per Part 4 §2 (only two real routes: `/live` and
 * `/live/{shareCode}`, doesn't earn the dependency). `/` is a thin redirect-to-`/live` per §10
 * ("if `/` exists only because Vite needs an entry, keep it minimal and route users toward /live").
 * Any other unknown path is treated the same as `/live` rather than a dedicated 404 page — no
 * root-site redesign in scope.
 */
export type Route =
  | { name: "root" }
  | { name: "codeEntry" }
  | { name: "live"; rawCode: string }
  // FEATURE-008 — private Remote Scorekeeper invite. The Web is spectator-only: it recognizes the
  // route (so the canonical live.spinit.com.br link resolves instead of the parked root domain) and
  // shows an App-only fallback. The actual invitation/authentication flow is App-only by design.
  | { name: "controlInvite"; shareCode: string; token: string };

export function parseRoute(pathname: string): Route {
  if (pathname === "/") return { name: "root" };

  const liveMatch = pathname.match(/^\/live\/([^/]+)\/?$/);
  if (liveMatch) {
    return { name: "live", rawCode: decodeURIComponent(liveMatch[1] ?? "") };
  }

  const inviteMatch = pathname.match(/^\/control-invite\/([^/]+)\/([^/]+)\/?$/);
  if (inviteMatch) {
    return {
      name: "controlInvite",
      shareCode: decodeURIComponent(inviteMatch[1] ?? ""),
      token: decodeURIComponent(inviteMatch[2] ?? ""),
    };
  }

  return { name: "codeEntry" };
}

export function liveRoutePath(shareCode: string): string {
  return `/live/${shareCode}`;
}
