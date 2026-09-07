import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { EcoTipBanner } from '../components/EcoTipBanner';
import { StreakCard } from '../components/StreakCard';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import mascota from '../assets/mascota-greon-sm.png';
import {
  MonitorIcon,
  PlugIcon,
  ClockIcon,
  SparkChartIcon,
  LightbulbIcon,
  FileIcon,
  BoltIcon,
  LeafIcon,
} from '../components/icons';

function saludoPorHora(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

const ACCESOS_RAPIDOS = [
  {
    to: '/dispositivos',
    icon: PlugIcon,
    titulo: 'Dispositivos',
    descripcion: 'Da de alta, edita o elimina tus equipos electrónicos.',
  },
  {
    to: '/registrar-uso',
    icon: ClockIcon,
    titulo: 'Registrar uso',
    descripcion: 'Captura tus horas de uso diarias por dispositivo.',
  },
  {
    to: '/estadisticas',
    icon: SparkChartIcon,
    titulo: 'Estadísticas',
    descripcion: 'Consumo, costo y huella de carbono en gráficas.',
  },
  {
    to: '/huella-carbono',
    icon: LeafIcon,
    titulo: 'Huella de carbono',
    descripcion: 'Qué tanto CO₂ generas y con qué se compara.',
  },
  {
    to: '/recomendaciones',
    icon: LightbulbIcon,
    titulo: 'Recomendaciones',
    descripcion: 'Sugerencias automáticas para bajar tu consumo.',
  },
  {
    to: '/reportes',
    icon: FileIcon,
    titulo: 'Reportes',
    descripcion: 'Descarga un PDF completo con tu análisis de consumo.',
  },
];

export function Home() {
  const { perfil } = useAuth();
  const { datos, cargando: loading, racha } = useAppData();

  const primerNombre = perfil?.nombre?.split(' ')[0];

  return (
    <AppShell
      title={`${saludoPorHora()}${primerNombre ? `, ${primerNombre}` : ''} 👋`}
      subtitle="Este es el resumen de tu consumo energético reciente."
    >
      <EcoTipBanner />

      {!loading && datos && datos.dispositivos.length > 0 && (
        <section className="status-cards">
          <div className="status-card">
            <span className="status-card-icon">
              <SparkChartIcon />
            </span>
            <div>
              <span className="status-card-label">Consumo (30 días)</span>
              <span className="status-card-value">{datos.totales.kwh.toFixed(2)} kWh</span>
            </div>
          </div>
          <div className="status-card">
            <span className="status-card-icon">
              <BoltIcon />
            </span>
            <div>
              <span className="status-card-label">Costo (30 días)</span>
              <span className="status-card-value">${datos.totales.costo.toFixed(2)}</span>
            </div>
          </div>
          <div className="status-card">
            <span className="status-card-icon">
              <LeafIcon />
            </span>
            <div>
              <span className="status-card-label">CO₂ (30 días)</span>
              <span className="status-card-value">{datos.totales.co2.toFixed(2)} kg</span>
            </div>
          </div>
          <div className="status-card">
            <span className="status-card-icon">
              <MonitorIcon />
            </span>
            <div>
              <span className="status-card-label">Dispositivos registrados</span>
              <span className="status-card-value">{datos.dispositivos.length}</span>
            </div>
          </div>
        </section>
      )}

      {!loading && datos && datos.dispositivos.length > 0 && racha && (
        <StreakCard {...racha} />
      )}

      {!loading && datos && datos.dispositivos.length === 0 && (
        <div className="card mascot-empty-card" style={{ marginBottom: 20 }}>
          <img src={mascota} alt="" className="mascot-empty-img" />
          <div>
            <p className="device-empty-title" style={{ marginTop: 0 }}>
              Aún no tienes dispositivos registrados
            </p>
            <p className="muted">
              Agrega tu primer dispositivo para empezar a ver tu consumo, costo y huella de carbono.
            </p>
            <Link className="btn-add" to="/dispositivos/nuevo" style={{ marginTop: 14, display: 'inline-flex' }}>
              <PlugIcon /> Agregar dispositivo
            </Link>
          </div>
        </div>
      )}

      <section className="card roadmap-card">
        <h2>Accesos rápidos</h2>
        <p className="muted">Todo lo que necesitas para analizar y reducir tu consumo eléctrico.</p>

        <div className="quick-links">
          {ACCESOS_RAPIDOS.map(({ to, icon: Icon, titulo, descripcion }) => (
            <Link key={to} to={to} className="card quick-link-card">
              <span className="feature-icon">
                <Icon />
              </span>
              <div>
                <strong>{titulo}</strong>
                <p style={{ margin: '4px 0 0' }}>{descripcion}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
