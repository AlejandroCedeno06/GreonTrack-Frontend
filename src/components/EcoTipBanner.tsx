import { useEffect, useState } from 'react';
import { TreeIcon, PlugIcon, LightbulbIcon, LeafIcon, BoltIcon, ChevronDownIcon } from './icons';
import mascota from '../assets/mascota-greon-sm.png';

const INTERVALO_MS = 8000;

const TIPS: { icon: typeof LeafIcon; mensaje: string }[] = [
  {
    icon: TreeIcon,
    mensaje:
      'Plantar un árbol ayuda: uno maduro absorbe hasta 21 kg de CO₂ al año. Revisa tu Huella de carbono para ver a cuántos equivale la tuya.',
  },
  {
    icon: PlugIcon,
    mensaje: 'Desconecta cargadores y aparatos en modo de espera — el consumo fantasma suma al final del mes.',
  },
  {
    icon: LightbulbIcon,
    mensaje: 'Aprovecha la luz natural durante el día en vez de encender iluminación artificial.',
  },
  {
    icon: LeafIcon,
    mensaje: 'Revisa tus Recomendaciones: hay sugerencias con ahorro estimado en kWh, costo y CO₂ esperando por ti.',
  },
  {
    icon: BoltIcon,
    mensaje: 'Reducir 1 hora diaria de uso en tu dispositivo de mayor consumo puede notarse en tu próximo recibo.',
  },
  {
    icon: LeafIcon,
    mensaje: 'Cuidar el planeta empieza en casa: cada kWh que ahorras reduce tu huella de carbono.',
  },
  {
    icon: LeafIcon,
    mensaje: '¡Hola! Soy tu compañero en GreonTrack — dale clic a mis flechas o a mí para ver más tips.',
  },
];

export function EcoTipBanner() {
  const [indice, setIndice] = useState(0);
  const [saltando, setSaltando] = useState(false);

  // El temporizador se reinicia cada vez que cambia el índice (automático o
  // manual), así que si el usuario navega con las flechas no le "roba" el
  // tiempo de lectura del siguiente tip.
  useEffect(() => {
    const id = setTimeout(() => {
      setIndice((i) => (i + 1) % TIPS.length);
    }, INTERVALO_MS);
    return () => clearTimeout(id);
  }, [indice]);

  const anterior = () => setIndice((i) => (i - 1 + TIPS.length) % TIPS.length);
  const siguiente = () => setIndice((i) => (i + 1) % TIPS.length);

  const saludar = () => {
    setIndice((i) => (i + 1) % TIPS.length);
    setSaltando(true);
    setTimeout(() => setSaltando(false), 400);
  };

  const tip = TIPS[indice];

  return (
    <div className="eco-tip-banner">
      <button
        type="button"
        className={`eco-tip-mascot-btn${saltando ? ' bounce' : ''}`}
        onClick={saludar}
        aria-label="Ver otro consejo"
        title="Dale clic para otro consejo"
      >
        <img src={mascota} alt="" className="eco-tip-mascot" />
      </button>

      <div className="eco-tip-bubble">
        <span className="eco-tip-bubble-tail" aria-hidden="true" />
        <p className="eco-tip-text" key={`msg-${indice}`}>
          {tip.mensaje}
        </p>
        <div className="eco-tip-controls">
          <button type="button" className="eco-tip-nav" onClick={anterior} aria-label="Tip anterior">
            <ChevronDownIcon className="eco-tip-nav-icon-prev" />
          </button>
          <div className="eco-tip-dots" aria-hidden="true">
            {TIPS.map((_, i) => (
              <span key={i} className={`eco-tip-dot${i === indice ? ' active' : ''}`} />
            ))}
          </div>
          <button type="button" className="eco-tip-nav" onClick={siguiente} aria-label="Siguiente tip">
            <ChevronDownIcon className="eco-tip-nav-icon-next" />
          </button>
        </div>
      </div>
    </div>
  );
}
