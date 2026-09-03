/**
 * Minimal manual path parser — no react-router per Part 4 §2 (only two real routes: `/live` and
 * `/live/{shareCode}`, doesn't earn the dependency). `/` is a thin redirect-to-`/live` per §10
 * ("if `/` exists only because Vite needs an entry, keep it minimal and route users toward /live").
 * Any other unknown path is treated the same as `/live` rather than a dedicated 404 page — no
 * root-site redesign in scope.
 */
export type Route = { name: "root" } | { name: "codeEntry" } | { name: "live"; rawCode: string };

export function parseRoute(pathname: string): Route {
  if (pathname === "/") return { name: "root" };

  const liveMatch = pathname.match(/^\/live\/([^/]+)\/?$/);
  if (liveMatch) {
    return { name: "live", rawCode: decodeURIComponent(liveMatch[1] ?? "") };
  }

  return { name: "codeEntry" };
}

export function liveRoutePath(shareCode: string): string {
  return `/live/${shareCode}`;
}
