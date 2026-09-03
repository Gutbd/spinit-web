/** Simple, non-technical Brazilian Portuguese copy for every non-live state (Part 4 §18) — never
 * exposes raw Firebase/SDK error details. */

export function ConnectingScreen() {
  return (
    <div className="status-screen" role="status">
      <p>Conectando à partida…</p>
    </div>
  );
}

export function NotFoundScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="status-screen">
      <p>Partida não encontrada.</p>
      <p className="status-screen-hint">Verifique o código ou peça um novo link para quem está compartilhando.</p>
      <button type="button" onClick={onBack}>
        Tentar outro código
      </button>
    </div>
  );
}

export function InvalidCodeScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="status-screen">
      <p>Código inválido.</p>
      <p className="status-screen-hint">O código de uma partida tem 8 caracteres (letras e números).</p>
      <button type="button" onClick={onBack}>
        Tentar outro código
      </button>
    </div>
  );
}

export function ErrorScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="status-screen">
      <p>Não foi possível carregar a partida agora.</p>
      <p className="status-screen-hint">Verifique sua conexão e tente novamente.</p>
      <button type="button" onClick={onBack}>
        Tentar outro código
      </button>
    </div>
  );
}
