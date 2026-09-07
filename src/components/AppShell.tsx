import { ReactNode, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Avatar } from './Avatar';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import {
  BellIcon,
  ChevronDownIcon,
  GearIcon,
  LogoutIcon,
  TrendUpIcon,
  TrendDownIcon,
  LightbulbIcon,
  CheckIcon,
  FireIcon,
} from './icons';

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const { perfil, user, signOut } = useAuth();
  const { notificaciones, racha, quitarNotificacion } = useAppData();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [notifAbierto, setNotifAbierto] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuAbierto && !notifAbierto) return;

    const handleClickFuera = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, [menuAbierto, notifAbierto]);

  const irAConfiguracion = () => {
    setMenuAbierto(false);
    navigate('/configuracion');
  };

  const handleSignOut = async () => {
    setMenuAbierto(false);
    await signOut();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="content">
        <div className="content-decor" aria-hidden="true" />

        <header className="content-header">
          <div>
            <h1 className="content-title">{title}</h1>
            {subtitle && <p className="content-subtitle">{subtitle}</p>}
          </div>

          <div className="content-header-actions">
            {racha && (racha.dias > 0 || racha.activaHoy) && (
              <Link to="/" className="streak-chip" title="Tu racha de constancia">
                <FireIcon />
                {racha.dias}
              </Link>
            )}

            <div className="notif-menu-wrapper" ref={notifRef}>
              <button
                type="button"
                className="icon-btn"
                aria-label="Notificaciones"
                title="Notificaciones"
                aria-haspopup="menu"
                aria-expanded={notifAbierto}
                onClick={() => {
                  setNotifAbierto((v) => !v);
                  setMenuAbierto(false);
                }}
              >
                <BellIcon />
                {notificaciones.length > 0 && <span className="icon-btn-badge" aria-hidden="true" />}
              </button>

              {notifAbierto && (
                <>
                  <span className="notif-menu-caret" aria-hidden="true" />
                  <div className="notif-menu" role="menu">
                    <div className="notif-menu-header">Notificaciones</div>
                    {notificaciones.length === 0 ? (
                      <div className="notif-menu-empty">
                        <span className="notif-menu-empty-icon">
                          <CheckIcon />
                        </span>
                        <p className="muted" style={{ margin: 0 }}>
                          Todo tranquilo por ahora.
                        </p>
                      </div>
                    ) : (
                      notificaciones.map((n) => (
                        <div key={n.id} className={`notif-item notif-item-${n.tono}`}>
                          <Link
                            to={n.to}
                            className="notif-item-link"
                            role="menuitem"
                            onClick={() => setNotifAbierto(false)}
                          >
                            <span className="notif-item-icon">
                              {n.tono === 'alerta' ? (
                                <TrendUpIcon />
                              ) : n.tono === 'exito' ? (
                                <TrendDownIcon />
                              ) : (
                                <LightbulbIcon />
                              )}
                            </span>
                            <span>{n.mensaje}</span>
                          </Link>
                          <button
                            type="button"
                            className="notif-item-dismiss"
                            aria-label="Marcar como visto"
                            title="Marcar como visto"
                            onClick={() => quitarNotificacion(n.id)}
                          >
                            <CheckIcon />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="profile-menu-wrapper" ref={menuRef}>
              <button
                type="button"
                className="profile-chip"
                onClick={() => {
                  setMenuAbierto((v) => !v);
                  setNotifAbierto(false);
                }}
                aria-haspopup="menu"
                aria-expanded={menuAbierto}
              >
                <Avatar nombre={perfil?.nombre} email={user?.email} size={34} />
                <span>{perfil?.nombre ?? 'Usuario'}</span>
                <ChevronDownIcon className={`profile-chip-chevron${menuAbierto ? ' open' : ''}`} />
              </button>

              {menuAbierto && (
                <div className="profile-menu" role="menu">
                  <div className="profile-menu-header">
                    <span className="profile-menu-name">{perfil?.nombre ?? 'Usuario'}</span>
                    <span className="profile-menu-email">{user?.email}</span>
                  </div>
                  <button className="profile-menu-item" role="menuitem" onClick={irAConfiguracion}>
                    <GearIcon /> Configuración
                  </button>
                  <button className="profile-menu-item profile-menu-item-danger" role="menuitem" onClick={handleSignOut}>
                    <LogoutIcon /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-body">{children}</div>
      </div>
    </div>
  );
}
