import "./App.css";
import { CodeEntry } from "./components/CodeEntry";
import { LivePage } from "./components/LivePage";
import { ControlInviteAppOnlyScreen } from "./components/StatusScreens";
import { liveRoutePath } from "./routing/route";
import { useRoute } from "./routing/useRoute";

function App() {
  const { route, navigate } = useRoute();
  const goToCodeEntry = () => navigate("/live");

  switch (route.name) {
    case "root":
      return (
        <div className="code-entry">
          <div className="scoreboard-brand">SpinIt Track · Ao Vivo</div>
          <p>Acompanhe uma partida ao vivo.</p>
          <button type="button" onClick={goToCodeEntry}>
            Entrar com um código
          </button>
        </div>
      );
    case "codeEntry":
      return <CodeEntry onSubmitCode={(code) => navigate(liveRoutePath(code))} />;
    case "live":
      return <LivePage rawCode={route.rawCode} onBack={goToCodeEntry} />;
    case "controlInvite":
      // Spectator-only Web: recognize the route so the canonical link resolves, but never expose
      // control. The invite token in route.token is intentionally NOT rendered or logged.
      return <ControlInviteAppOnlyScreen onBack={goToCodeEntry} />;
  }
}

export default App;
