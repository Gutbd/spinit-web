import { useCallback, useEffect, useState } from "react";
import { parseRoute, type Route } from "./route";

/** Tiny History-API-backed router hook — the only client-side navigation this app needs. */
export function useRoute(): { route: Route; navigate: (path: string) => void } {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setRoute(parseRoute(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, "", path);
    setRoute(parseRoute(path));
  }, []);

  return { route, navigate };
}
