import { useEffect, useRef, useState } from 'react';
import { useAccessibility, FiltroDaltonismo, Tema } from '../context/AccessibilityContext';
import {
  AccessibilityIcon,
  PlusIcon,
  MinusIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
} from './icons';

// Matrices feColorMatrix estándar (Machado, Oliveira & Fernandes, 2009) para
// simular las tres formas comunes de daltonismo — de dominio público, usadas
// ampliamente en herramientas de accesibilidad.
function FiltrosSvg() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
      <defs>
        <filter id="greontrack-protanopia">
          <feColorMatrix
            type="matrix"
            values="0.567,0.433,0,0,0  0.558,0.442,0,0,0  0,0.242,0.758,0,0  0,0,0,1,0"
          />
        </filter>
        <filter id="greontrack-deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625,0.375,0,0,0  0.7,0.3,0,0,0  0,0.3,0.7,0,0  0,0,0,1,0"
          />
        </filter>
        <filter id="greontrack-tritanopia">
          <feColorMatrix
            type="matrix"
            values="0.95,0.05,0,0,0  0,0.433,0.567,0,0  0,0.475,0.525,0,0  0,0,0,1,0"
          />
        </filter>
      </defs>
    </svg>
  );
}

const OPCIONES_DALTONISMO: { value: FiltroDaltonismo; label: string }[] = [
  { value: 'none', label: 'Ninguno' },
  { value: 'protanopia', label: 'Protanopia' },
  { value: 'deuteranopia', label: 'Deuteranopia' },
  { value: 'tritanopia', label: 'Tritanopia' },
];

export function AccessibilityWidget() {
  const a11y = useAccessibility();
  const [abierto, setAbierto] = useState(false);
  const [leyendo, setLeyendo] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [abierto]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handleLeerPagina = () => {
    if (leyendo) {
      window.speechSynthesis.cancel();
      setLeyendo(false);
      return;
    }
    const contenido = document.querySelector('.content-body, .form-panel-inner');
    const texto = contenido?.textContent?.trim();
    if (!texto) return;

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-MX';
    utterance.onend = () => setLeyendo(false);
    utterance.onerror = () => setLeyendo(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setLeyendo(true);
  };

  const cambiarFuente = (delta: number) => {
    const nuevo = Math.min(140, Math.max(90, a11y.fontScale + delta));
    a11y.setFontScale(nuevo);
  };

  const cambiarEspaciado = (delta: number) => {
    const nuevo = Math.min(140, Math.max(100, a11y.letterSpacing + delta));
    a11y.setLetterSpacing(nuevo);
  };

  const TEMAS: { value: Tema; label: string; icon: typeof SunIcon }[] = [
    { value: 'light', label: 'Claro', icon: SunIcon },
    { value: 'dark', label: 'Oscuro', icon: MoonIcon },
    { value: 'system', label: 'Sistema', icon: MonitorIcon },
  ];

  return (
    <>
      <FiltrosSvg />
      <div className="a11y-widget" ref={panelRef}>
        {abierto && (
          <div className="a11y-panel" role="dialog" aria-label="Opciones de accesibilidad">
            <div className="a11y-panel-header">
              <span>Accesibilidad</span>
              <button className="link-button-dark" onClick={a11y.resetAll}>
                Restablecer
              </button>
            </div>

            <div className="a11y-row">
              <span>Tamaño de fuente</span>
              <div className="a11y-stepper">
                <button onClick={() => cambiarFuente(-10)} aria-label="Reducir fuente">
                  <MinusIcon />
                </button>
                <span>{a11y.fontScale}%</span>
                <button onClick={() => cambiarFuente(10)} aria-label="Aumentar fuente">
                  <PlusIcon />
                </button>
              </div>
            </div>

            <div className="a11y-row">
              <span>Espaciado</span>
              <div className="a11y-stepper">
                <button onClick={() => cambiarEspaciado(-10)} aria-label="Reducir espaciado">
                  <MinusIcon />
                </button>
                <span>{a11y.letterSpacing}%</span>
                <button onClick={() => cambiarEspaciado(10)} aria-label="Aumentar espaciado">
                  <PlusIcon />
                </button>
              </div>
            </div>

            <label className="a11y-toggle-row">
              <span>Fuente para dislexia</span>
              <input
                type="checkbox"
                checked={a11y.dyslexiaFont}
                onChange={(e) => a11y.setDyslexiaFont(e.target.checked)}
              />
            </label>

            <label className="a11y-toggle-row">
              <span>Alto contraste</span>
              <input
                type="checkbox"
                checked={a11y.highContrast}
                onChange={(e) => a11y.setHighContrast(e.target.checked)}
              />
            </label>

            <label className="a11y-toggle-row">
              <span>Resaltar enlaces y botones</span>
              <input
                type="checkbox"
                checked={a11y.highlightLinks}
                onChange={(e) => a11y.setHighlightLinks(e.target.checked)}
              />
            </label>

            <label className="a11y-toggle-row">
              <span>Pausar animaciones</span>
              <input
                type="checkbox"
                checked={a11y.reducedMotion}
                onChange={(e) => a11y.setReducedMotion(e.target.checked)}
              />
            </label>

            <div className="a11y-row a11y-row-col">
              <span>Filtro de daltonismo</span>
              <select
                value={a11y.colorblindFilter}
                onChange={(e) => a11y.setColorblindFilter(e.target.value as FiltroDaltonismo)}
                className="a11y-select"
              >
                {OPCIONES_DALTONISMO.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="a11y-row a11y-row-col">
              <span>Modo de color</span>
              <div className="a11y-theme-buttons">
                {TEMAS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    className={`a11y-theme-btn${a11y.theme === value ? ' active' : ''}`}
                    onClick={() => a11y.setTheme(value)}
                  >
                    <Icon /> {label}
                  </button>
                ))}
              </div>
            </div>

            <button className="a11y-read-btn" onClick={handleLeerPagina}>
              {leyendo ? 'Detener lectura' : 'Leer esta página'}
            </button>
          </div>
        )}

        <button
          className="a11y-fab"
          onClick={() => setAbierto((v) => !v)}
          aria-label="Opciones de accesibilidad"
          aria-expanded={abierto}
        >
          <AccessibilityIcon />
        </button>
      </div>
    </>
  );
}
