import { ReactNode, useState } from 'react';
import logoIcon from '../assets/logo-icon.png';
import logoWordmark from '../assets/logo-wordmark.png';
import mascota from '../assets/mascota-greon.png';
import { MonitorIcon, BoltIcon, LeafIcon, SparkChartIcon } from './icons';

const FEATURES = [
  { icon: MonitorIcon, title: 'Monitorea', text: 'el uso real de tus dispositivos' },
  { icon: BoltIcon, title: 'Calcula', text: 'el consumo y costo eléctrico' },
  { icon: SparkChartIcon, title: 'Recibe', text: 'recomendaciones inteligentes' },
  { icon: LeafIcon, title: 'Reduce', text: 'tu huella de carbono' },
];

const SALUDOS = [
  '¡Hola! Soy Greon 🌱',
  'Juntos cuidamos el planeta, un watt a la vez.',
  '¡Qué gusto verte por aquí!',
  'Pequeñas acciones, grandes cambios 💚',
];

interface AuthLayoutProps {
  eyebrow: string;
  children: ReactNode;
}

export function AuthLayout({ eyebrow, children }: AuthLayoutProps) {
  const [saludo, setSaludo] = useState<string | null>(null);
  const [saltando, setSaltando] = useState(false);

  const saludar = () => {
    setSaludo((actual) => {
      const opciones = SALUDOS.filter((s) => s !== actual);
      return opciones[Math.floor(Math.random() * opciones.length)];
    });
    setSaltando(true);
    setTimeout(() => setSaltando(false), 400);
  };

  return (
    <div className="auth-shell">
      <aside className="brand-panel">
        <div className="brand-panel-decor" aria-hidden="true" />
        <div className="brand-panel-inner">
          <div className="brand-lockup">
            <img src={logoIcon} alt="" className="brand-icon" />
            <img src={logoWordmark} alt="GreenTrack" className="brand-wordmark" />
          </div>

          <div className="brand-hero">
            <div className="brand-mascot-wrap">
              {saludo && (
                <div className="brand-mascot-bubble">
                  <span className="brand-mascot-bubble-tail" aria-hidden="true" />
                  {saludo}
                </div>
              )}
              <button
                type="button"
                className={`brand-mascot-btn${saltando ? ' bounce' : ''}`}
                onClick={saludar}
                aria-label="Greon, la mascota de GreonTrack — dale clic para un saludo"
              >
                <img src={mascota} alt="Greon, la mascota de GreonTrack: un planeta sonriente" className="brand-mascot" />
              </button>
            </div>

            <div className="brand-hero-text">
              <h2 className="brand-headline">
                Cada watt cuenta.
                <br />
                Ahora puedes verlo.
              </h2>
              <p className="brand-subline">
                La plataforma que traduce el uso de tus dispositivos en dinero ahorrado y carbono
                evitado — con datos claros, no conjeturas.
              </p>
            </div>
          </div>

          <ul className="feature-list">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="feature-icon">
                  <Icon />
                </span>
                <span>
                  <strong>{title}</strong> {text}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="brand-footer">Tecnología hoy. Un mañana mejor.</p>
      </aside>

      <main className="form-panel">
        <div className="form-panel-decor" aria-hidden="true" />
        <div className="form-panel-inner">
          <span className="form-eyebrow">{eyebrow}</span>
          {children}
        </div>
      </main>
    </div>
  );
}
