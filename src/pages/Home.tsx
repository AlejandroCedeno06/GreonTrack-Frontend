import { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ShieldIcon, MonitorIcon, HomeIcon, PlugIcon, ClockIcon, SparkChartIcon, LightbulbIcon } from '../components/icons';

// Página placeholder del Bloque 1: confirma que la sesión y el acceso a las
// tablas de Supabase (protegidas por RLS) funcionan de punta a punta.
// Los módulos de dispositivos, registro de uso y dashboard con gráficas
// llegan en el Bloque 2 — el sidebar ya tiene su lugar reservado.
export function Home() {
  const { perfil, user } = useAuth();
  const [dispositivosCount, setDispositivosCount] = useState<number | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const checkDb = async () => {
      const { count, error } = await supabase
        .from('dispositivos')
        .select('*', { count: 'exact', head: true });

      if (error) {
        setDbError(error.message);
      } else {
        setDispositivosCount(count ?? 0);
      }
    };
    checkDb();
  }, []);

  const primerNombre = perfil?.nombre?.split(' ')[0];

  return (
    <AppShell
      title={`Hola${primerNombre ? `, ${primerNombre}` : ''} 👋`}
      subtitle="Esto es lo que sabemos de tu cuenta por ahora."
    >
      <section className="status-cards">
        <div className="status-card status-card-ok">
          <span className="status-card-icon">
            <ShieldIcon />
          </span>
          <div>
            <span className="status-card-label">Autenticación</span>
            <span className="status-card-value">{user?.email}</span>
          </div>
        </div>

        <div className="status-card status-card-ok">
          <span className="status-card-icon">
            <HomeIcon />
          </span>
          <div>
            <span className="status-card-label">Perfil</span>
            <span className="status-card-value">
              {perfil ? `${perfil.nombre} · ${perfil.role}` : 'Cargando…'}
            </span>
          </div>
        </div>

        <div className={`status-card ${dbError ? 'status-card-error' : 'status-card-ok'}`}>
          <span className="status-card-icon">
            <MonitorIcon />
          </span>
          <div>
            <span className="status-card-label">Base de datos</span>
            <span className="status-card-value">
              {dbError ? `Error: ${dbError}` : `${dispositivosCount} dispositivos registrados`}
            </span>
          </div>
        </div>
      </section>

      <section className="card roadmap-card">
        <h2>Lo que viene</h2>
        <p className="muted">
          El sidebar ya tiene su lugar reservado para cada módulo — se van a ir activando en este orden.
        </p>

        <ul className="roadmap-list">
          <li>
            <span className="feature-icon">
              <PlugIcon />
            </span>
            <div>
              <strong>Dispositivos</strong>
              <p>Alta, edición y borrado de tus aparatos electrónicos.</p>
            </div>
          </li>
          <li>
            <span className="feature-icon">
              <ClockIcon />
            </span>
            <div>
              <strong>Registrar uso</strong>
              <p>Captura tus horas de uso diarias por dispositivo.</p>
            </div>
            <span className="sidebar-badge">Pronto</span>
          </li>
          <li>
            <span className="feature-icon">
              <SparkChartIcon />
            </span>
            <div>
              <strong>Estadísticas</strong>
              <p>Consumo, costo y huella de carbono en gráficas.</p>
            </div>
            <span className="sidebar-badge">Pronto</span>
          </li>
          <li>
            <span className="feature-icon">
              <LightbulbIcon />
            </span>
            <div>
              <strong>Recomendaciones</strong>
              <p>Sugerencias automáticas para bajar tu consumo.</p>
            </div>
            <span className="sidebar-badge">Pronto</span>
          </li>
        </ul>
      </section>
    </AppShell>
  );
}
