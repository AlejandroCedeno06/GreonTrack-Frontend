import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Avatar } from './Avatar';
import { useAuth } from '../context/AuthContext';
import { BellIcon } from './icons';

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const { perfil, user } = useAuth();

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
            <button className="icon-btn" aria-label="Notificaciones" title="Notificaciones">
              <BellIcon />
            </button>
            <div className="profile-chip">
              <Avatar nombre={perfil?.nombre} email={user?.email} size={34} />
              <span>{perfil?.nombre ?? 'Usuario'}</span>
            </div>
          </div>
        </header>

        <div className="content-body">{children}</div>
      </div>
    </div>
  );
}
