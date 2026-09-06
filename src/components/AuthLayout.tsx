import { ReactNode } from 'react';
import logoIcon from '../assets/logo-icon.png';
import logoWordmark from '../assets/logo-wordmark.png';
import { MonitorIcon, BoltIcon, LeafIcon, SparkChartIcon } from './icons';

const FEATURES = [
  { icon: MonitorIcon, title: 'Monitorea', text: 'el uso real de tus dispositivos' },
  { icon: BoltIcon, title: 'Calcula', text: 'el consumo y costo eléctrico' },
  { icon: SparkChartIcon, title: 'Recibe', text: 'recomendaciones inteligentes' },
  { icon: LeafIcon, title: 'Reduce', text: 'tu huella de carbono' },
];

interface AuthLayoutProps {
  eyebrow: string;
  children: ReactNode;
}

export function AuthLayout({ eyebrow, children }: AuthLayoutProps) {
  return (
    <div className="auth-shell">
      <aside className="brand-panel">
        <div className="brand-panel-decor" aria-hidden="true" />
        <div className="brand-panel-inner">
          <div className="brand-lockup">
            <img src={logoIcon} alt="" className="brand-icon" />
            <img src={logoWordmark} alt="GreenTrack" className="brand-wordmark" />
          </div>

          <h2 className="brand-headline">
            Cada watt cuenta.
            <br />
            Ahora puedes verlo.
          </h2>
          <p className="brand-subline">
            La plataforma que traduce el uso de tus dispositivos en dinero ahorrado y carbono
            evitado — con datos claros, no conjeturas.
          </p>

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
