import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import mascota from '../assets/mascota-greon-sm.png';

const FRASES = [
  '¡Hola! Soy Greon 🌍 — cada dato que registras ayuda a cuidar el planeta.',
  '¿Sabías que reducir 1 hora de uso al día en tu dispositivo de mayor consumo sí se nota al mes?',
  'Desconecta los cargadores que no estés usando — el consumo fantasma suma al final del mes.',
  'Revisa tu Huella de carbono para ver a cuántos árboles equivale tu ahorro.',
  '¡Pequeñas acciones, grandes cambios! Así cuidamos el planeta juntos.',
  'No necesitas cambios drásticos: la constancia registrando tu uso es lo que más ayuda.',
  '¿Ya viste tus Recomendaciones? Hay ahorro estimado esperando por ti.',
];

export function MascotWidget() {
  const [abierto, setAbierto] = useState(false);
  const [frase, setFrase] = useState(FRASES[0]);
  const [saltando, setSaltando] = useState(false);

  const handleClick = () => {
    setFrase((actual) => {
      const opciones = FRASES.filter((f) => f !== actual);
      return opciones[Math.floor(Math.random() * opciones.length)];
    });
    setAbierto((v) => !v);
    setSaltando(true);
    setTimeout(() => setSaltando(false), 400);
  };

  useEffect(() => {
    if (!abierto) return;
    const t = setTimeout(() => setAbierto(false), 7000);
    return () => clearTimeout(t);
  }, [abierto, frase]);

  return (
    <div className="mascot-widget">
      {abierto && (
        <div className="mascot-widget-bubble" role="status">
          <span className="mascot-widget-bubble-tail" aria-hidden="true" />
          <span>{frase}</span>
          <Link to="/greon" className="mascot-widget-bubble-link" onClick={() => setAbierto(false)}>
            Ir con Greon →
          </Link>
        </div>
      )}
      <button
        type="button"
        className={`mascot-widget-btn${saltando ? ' bounce' : ''}`}
        onClick={handleClick}
        aria-label="Greon, la mascota de GreonTrack — dale clic para un consejo"
        title="¡Salúdame!"
      >
        <img src={mascota} alt="" className="mascot-widget-img" />
      </button>
    </div>
  );
}
