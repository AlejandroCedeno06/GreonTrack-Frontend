import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Configuracion, Dispositivo } from '../types/database';
import { LogoutIcon, ShieldIcon, PlugIcon, WifiIcon, BoltIcon } from '../components/icons';
import { PasswordStrength } from '../components/PasswordStrength';
import { evaluarFortaleza } from '../lib/passwordStrength';

export function Settings() {
  const { perfil, user, signOut, refreshPerfil } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState(perfil?.nombre ?? '');
  const [guardandoNombre, setGuardandoNombre] = useState(false);
  const [errorNombre, setErrorNombre] = useState<string | null>(null);
  const [exitoNombre, setExitoNombre] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [exitoPassword, setExitoPassword] = useState<string | null>(null);

  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [cargandoExtras, setCargandoExtras] = useState(true);

  useEffect(() => {
    const cargarExtras = async () => {
      if (!user) return;
      setCargandoExtras(true);

      const [dispositivosRes, configRes] = await Promise.all([
        supabase
          .from('dispositivos')
          .select('*')
          .eq('usuario_id', user.id)
          .order('created_at', { ascending: false }),
        supabase.from('configuracion').select('*').single(),
      ]);

      if (!dispositivosRes.error) setDispositivos((dispositivosRes.data ?? []) as Dispositivo[]);
      if (!configRes.error) setConfiguracion(configRes.data as Configuracion);

      setCargandoExtras(false);
    };

    cargarExtras();
  }, [user]);

  const handleGuardarNombre = async (e: FormEvent) => {
    e.preventDefault();
    setErrorNombre(null);
    setExitoNombre(null);

    if (!nombre.trim() || !user) return;

    setGuardandoNombre(true);
    const { error } = await supabase.from('perfiles').update({ nombre: nombre.trim() }).eq('id', user.id);
    setGuardandoNombre(false);

    if (error) {
      setErrorNombre(error.message);
      return;
    }

    await refreshPerfil();
    setExitoNombre('Nombre actualizado.');
  };

  const handleCambiarPassword = async (e: FormEvent) => {
    e.preventDefault();
    setErrorPassword(null);
    setExitoPassword(null);

    if (!evaluarFortaleza(password).esValida) {
      setErrorPassword('Tu contraseña no cumple con todos los requisitos de seguridad.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorPassword('Las contraseñas no coinciden.');
      return;
    }

    setGuardandoPassword(true);
    const { error } = await supabase.auth.updateUser({ password });
    setGuardandoPassword(false);

    if (error) {
      setErrorPassword(error.message);
      return;
    }

    setPassword('');
    setConfirmPassword('');
    setExitoPassword('Contraseña actualizada.');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <AppShell title="Configuración" subtitle="Datos de tu cuenta, dispositivos vinculados y ajustes básicos.">
      <div className="settings-grid">
        <div className="settings-column">
          <div className="card device-form-card">
            <h2 style={{ marginTop: 0 }}>Datos de la cuenta</h2>
            <div className="status-cards">
              <div className="status-card">
                <span className="status-card-icon">
                  <ShieldIcon />
                </span>
                <div>
                  <span className="status-card-label">Correo</span>
                  <span className="status-card-value">{user?.email}</span>
                </div>
              </div>
              <div className="status-card">
                <span className="status-card-icon">
                  <ShieldIcon />
                </span>
                <div>
                  <span className="status-card-label">Rol</span>
                  <span className="status-card-value">{perfil?.role ?? '—'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card device-form-card" style={{ marginTop: 20 }}>
            <h2 style={{ marginTop: 0 }}>Editar nombre</h2>
            <form className="device-form-fields" onSubmit={handleGuardarNombre} noValidate>
              <div className="device-form-field">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  className="device-form-input"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>

              {errorNombre && <div className="alert-error">{errorNombre}</div>}
              {exitoNombre && <div className="alert-success">{exitoNombre}</div>}

              <div className="device-form-actions">
                <button type="submit" className="device-form-submit" disabled={guardandoNombre || !nombre.trim()}>
                  {guardandoNombre ? 'Guardando…' : 'Guardar nombre'}
                </button>
              </div>
            </form>
          </div>

          <div className="card device-form-card" style={{ marginTop: 20 }}>
            <h2 style={{ marginTop: 0 }}>Cambiar contraseña</h2>
            <form className="device-form-fields" onSubmit={handleCambiarPassword} noValidate>
              <div className="device-form-field">
                <label htmlFor="password">Nueva contraseña</label>
                <input
                  id="password"
                  type="password"
                  className="device-form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres, con mayúscula, número y símbolo"
                />
                <PasswordStrength password={password} />
              </div>

              <div className="device-form-field">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="device-form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                />
              </div>

              {errorPassword && <div className="alert-error">{errorPassword}</div>}
              {exitoPassword && <div className="alert-success">{exitoPassword}</div>}

              <div className="device-form-actions">
                <button
                  type="submit"
                  className="device-form-submit"
                  disabled={
                    guardandoPassword ||
                    !evaluarFortaleza(password).esValida ||
                    password !== confirmPassword
                  }
                >
                  {guardandoPassword ? 'Guardando…' : 'Cambiar contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="settings-column">
          <div className="card device-form-card">
            <div className="devices-toolbar" style={{ marginBottom: 8 }}>
              <h2 style={{ margin: 0 }}>Dispositivos vinculados</h2>
              <Link className="device-action-btn-ghost" to="/dispositivos">
                Ver todos →
              </Link>
            </div>

            {cargandoExtras ? (
              <p className="muted">Cargando dispositivos…</p>
            ) : dispositivos.length === 0 ? (
              <p className="muted">Aún no tienes dispositivos registrados.</p>
            ) : (
              <ul className="settings-device-list">
                {dispositivos.map((d) => (
                  <li key={d.id} className="settings-device-item">
                    <span className="device-card-icon">
                      <PlugIcon />
                    </span>
                    <div className="device-card-text" style={{ flex: 1 }}>
                      <p className="device-card-name">{d.nombre}</p>
                      <p className="device-card-type">{d.tipo}</p>
                    </div>
                    <span className={`device-badge ${d.origen === 'agente' ? 'device-badge-agente' : 'device-badge-manual'}`}>
                      {d.origen === 'agente' && <WifiIcon />}
                      {d.origen === 'agente' ? 'Agente' : 'Manual'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card device-form-card" style={{ marginTop: 20 }}>
            <h2 style={{ marginTop: 0 }}>Tarifa eléctrica vigente</h2>
            <p className="muted">
              Estos valores los usa todo el sistema para calcular costo y huella de carbono; son
              globales, no se pueden editar desde tu cuenta.
            </p>
            {cargandoExtras ? (
              <p className="muted">Cargando…</p>
            ) : configuracion ? (
              <div className="status-cards">
                <div className="status-card">
                  <span className="status-card-icon">
                    <BoltIcon />
                  </span>
                  <div>
                    <span className="status-card-label">Tarifa por kWh</span>
                    <span className="status-card-value">${configuracion.tarifa_kwh.toFixed(2)}</span>
                  </div>
                </div>
                <div className="status-card">
                  <span className="status-card-icon">
                    <ShieldIcon />
                  </span>
                  <div>
                    <span className="status-card-label">Factor de CO₂</span>
                    <span className="status-card-value">{configuracion.factor_co2} kg/kWh</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="muted">No se pudo cargar la configuración.</p>
            )}
          </div>

          <div className="card session-card" style={{ marginTop: 20 }}>
            <div className="session-card-icon">
              <LogoutIcon />
            </div>
            <div className="session-card-text">
              <h2>Cerrar sesión</h2>
              <p className="muted">
                Terminarás tu sesión como <strong>{user?.email}</strong> en este dispositivo. Podrás
                volver a entrar cuando quieras.
              </p>
            </div>
            <button
              className="device-action-btn device-action-btn-danger-outline session-card-btn"
              onClick={handleSignOut}
            >
              <LogoutIcon /> Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
