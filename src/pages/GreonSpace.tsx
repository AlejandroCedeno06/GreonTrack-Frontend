import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { useAppData } from '../context/AppDataContext';
import { construirContextoGreon, preguntarAGreon } from '../lib/greonChat';
import mascota from '../assets/mascota-greon-sm.png';

interface Mensaje {
  id: string;
  autor: 'usuario' | 'greon';
  texto: string;
}

const SUGERENCIAS = [
  '¿Cómo bajo mi consumo?',
  '¿Qué dispositivo consume más?',
  '¿Cómo voy con mi huella de carbono?',
  '¿Cómo va mi racha?',
];

function idMensaje(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function GreonSpace() {
  const { datos, racha } = useAppData();
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: 'bienvenida',
      autor: 'greon',
      texto:
        '¡Hola! Soy Greon 👋 Pregúntame sobre tu consumo, tu huella de carbono, tus dispositivos o cómo ahorrar energía — solo hablo de eso.',
    },
  ]);
  const [input, setInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);

  const contexto = useMemo(() => construirContextoGreon(datos, racha), [datos, racha]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [mensajes, enviando]);

  const enviar = async (texto: string) => {
    const limpio = texto.trim();
    if (!limpio || enviando) return;

    setError(null);
    setMensajes((cur) => [...cur, { id: idMensaje(), autor: 'usuario', texto: limpio }]);
    setInput('');
    setEnviando(true);

    try {
      const respuesta = await preguntarAGreon(limpio, contexto);
      setMensajes((cur) => [...cur, { id: idMensaje(), autor: 'greon', texto: respuesta }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo salió mal. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    enviar(input);
  };

  return (
    <AppShell title="Espacio de Greon" subtitle="Pregúntale a Greon sobre tu consumo, tu huella y el medio ambiente.">
      <div className="greon-hero">
        <img src={mascota} alt="Greon, la mascota de GreonTrack" className="greon-hero-mascot" />
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>¡Hola, soy Greon! 👋</h2>
          <p style={{ margin: 0 }}>
            Pregúntame lo que quieras sobre tu consumo, tu huella de carbono o cómo ahorrar energía — solo
            hablo de eso, pero con tus datos reales.
          </p>
        </div>
      </div>

      <div className="greon-chat-card">
        <div className="greon-chat-messages">
          {mensajes.map((m) => (
            <div key={m.id} className={`greon-msg greon-msg-${m.autor}`}>
              {m.autor === 'greon' && <img src={mascota} alt="" className="greon-msg-avatar" />}
              <div className="greon-msg-bubble">{m.texto}</div>
            </div>
          ))}

          {enviando && (
            <div className="greon-msg greon-msg-greon">
              <img src={mascota} alt="" className="greon-msg-avatar" />
              <div className="greon-msg-bubble greon-msg-typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          <div ref={finRef} />
        </div>

        {error && (
          <div className="alert-error" style={{ margin: '0 20px 12px' }}>
            {error}
          </div>
        )}

        <div className="greon-chat-suggestions">
          {SUGERENCIAS.map((s) => (
            <button
              key={s}
              type="button"
              className="greon-suggestion-chip"
              onClick={() => enviar(s)}
              disabled={enviando}
            >
              {s}
            </button>
          ))}
        </div>

        <form className="greon-chat-input-row" onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregúntale a Greon sobre tu consumo o el medio ambiente…"
            disabled={enviando}
            maxLength={500}
          />
          <button type="submit" className="btn-add" disabled={enviando || !input.trim()}>
            Enviar
          </button>
        </form>
      </div>
    </AppShell>
  );
}
