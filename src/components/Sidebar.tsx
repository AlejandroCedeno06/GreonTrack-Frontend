import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';
import logoIcon from '../assets/logo-icon.png';
import logoWordmark from '../assets/logo-wordmark.png';
import mascotaMini from '../assets/mascota-greon-sm.png';
import {
  HomeIcon,
  PlugIcon,
  ClockIcon,
  SparkChartIcon,
  LeafIcon,
  LightbulbIcon,
  FileIcon,
  GearIcon,
  HelpIcon,
  LogoutIcon,
} from './icons';

function GreonNavIcon() {
  return <img src={mascotaMini} alt="" className="sidebar-link-mascot" />;
}

const NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: HomeIcon, enabled: true },
  { to: '/greon', label: 'Greon', icon: GreonNavIcon, enabled: true },
  { to: '/dispositivos', label: 'Dispositivos', icon: PlugIcon, enabled: true },
  { to: '/registrar-uso', label: 'Registrar uso', icon: ClockIcon, enabled: true },
  { to: '/estadisticas', label: 'Estadísticas', icon: SparkChartIcon, enabled: true },
  { to: '/huella-carbono', label: 'Huella de carbono', icon: LeafIcon, enabled: true },
  { to: '/recomendaciones', label: 'Recomendaciones', icon: LightbulbIcon, enabled: true },
  { to: '/reportes', label: 'Reportes', icon: FileIcon, enabled: true },
  { to: '/configuracion', label: 'Configuración', icon: GearIcon, enabled: true },
  { to: '/guia', label: 'Guía de uso', icon: HelpIcon, enabled: true },
];

export function Sidebar() {
  const { perfil, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-decor" aria-hidden="true" />

      <div className="sidebar-brand">
        <img src={logoIcon} alt="" className="sidebar-icon" />
        <img src={logoWordmark} alt="GreenTrack" className="sidebar-wordmark" />
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Menú</span>
        <ul>
          {NAV_ITEMS.map(({ to, label, icon: Icon, enabled }) => (
            <li key={to}>
              {enabled ? (
                <NavLink to={to} end className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                  <span className="sidebar-link-icon">
                    <Icon />
                  </span>
                  <span className="sidebar-link-label">{label}</span>
                </NavLink>
              ) : (
                <div className="sidebar-link disabled" aria-disabled="true">
                  <span className="sidebar-link-icon">
                    <Icon />
                  </span>
                  <span className="sidebar-link-label">{label}</span>
                  <span className="sidebar-badge">Pronto</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-user">
        <Avatar nombre={perfil?.nombre} email={user?.email} size={38} />
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{perfil?.nombre ?? 'Usuario'}</span>
          <span className="sidebar-user-email">{user?.email}</span>
        </div>
        <button className="sidebar-logout" onClick={handleSignOut} title="Cerrar sesión" aria-label="Cerrar sesión">
          <LogoutIcon />
        </button>
      </div>
    </aside>
  );
}
