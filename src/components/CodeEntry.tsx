import { useState, type FormEvent } from "react";
import { normalizeShareCode } from "../contract/shareCode";

/** `/live` — manual code entry, accepts a bare code or a pasted spectator URL (Part 4 §9/§10). */
export function CodeEntry({ onSubmitCode }: { onSubmitCode: (code: string) => void }) {
  const [input, setInput] = useState("");
  const [showInvalid, setShowInvalid] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const result = normalizeShareCode(input);
    if (result.valid) {
      setShowInvalid(false);
      onSubmitCode(result.code);
    } else {
      setShowInvalid(true);
    }
  }

  return (
    <div className="code-entry">
      <div className="scoreboard-brand">SpinIt Track · Ao Vivo</div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="share-code-input">Código da partida</label>
        <input
          id="share-code-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="AB12CD34 ou link de compartilhamento"
          autoComplete="off"
          autoCapitalize="characters"
        />
        <button type="submit">Assistir</button>
      </form>
      {showInvalid && <p className="status-screen-hint">Código inválido — verifique e tente novamente.</p>}
    </div>
  );
}
