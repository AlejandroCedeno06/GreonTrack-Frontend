import { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Dispositivo } from '../types/database';
import { PlugIcon, WifiIcon, PencilIcon, TrashIcon, PlusIcon } from '../components/icons';

// Techo de referencia (W) usado solo para escalar la barra de consumo relativo;
// no hay horas de uso en esta tabla, así que no se puede calcular kWh/costo aquí
// (eso vive en registros_uso / calculos, fuera del alcance de esta pantalla).
const REFERENCIA_WATTS = 2000;

function nivelPotencia(watts: number): 'alto' | 'moderado' | 'eficiente' {
  if (watts > 1000) return 'alto';
  if (watts > 300) return 'moderado';
  return 'eficiente';
}

export function Devices() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Dispositivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDevices = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('dispositivos')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setDevices((data ?? []) as Dispositivo[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from('dispositivos').delete().eq('id', id);
    setDeletingId(null);

    if (error) {
      setError(error.message);
      return;
    }
    setConfirmId(null);
    setDevices((prev) => prev.filter((d) => d.id !== id));
  };

  const totalWatts = devices.reduce((sum, d) => sum + d.consumo_watts_promedio, 0);

  return (
    <AppShell
      title="Mis dispositivos"
      subtitle={
        devices.length > 0
          ? `${devices.length} ${devices.length === 1 ? 'dispositivo registrado' : 'dispositivos registrados'} · Potencia total ${totalWatts} W`
          : 'Registra los aparatos que quieres monitorear.'
      }
    >
      <div className="devices-toolbar">
        <p className="muted">Alta, edición y borrado de tus equipos electrónicos.</p>
        <button className="btn-add" disabled title="El formulario de alta llega en la siguiente actualización">
          <PlusIcon /> Agregar dispositivo <span className="badge-soon">Pronto</span>
        </button>
      </div>

      {error && (
        <div className="alert-error">
          {error}{' '}
          <button className="device-action-btn-ghost" onClick={loadDevices}>
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <p className="muted">Cargando dispositivos…</p>
      ) : devices.length === 0 ? (
        <div className="device-empty">
          <span className="device-empty-icon">
            <PlugIcon />
          </span>
          <div>
            <p className="device-empty-title">Aún no tienes dispositivos</p>
            <p className="muted">Cuando agregues uno, aparecerá aquí con su consumo y origen.</p>
          </div>
        </div>
      ) : (
        <div className="device-grid">
          {devices.map((device) => {
            const nivel = nivelPotencia(device.consumo_watts_promedio);
            const pct = Math.min(100, (device.consumo_watts_promedio / REFERENCIA_WATTS) * 100);
            const fecha = new Date(device.created_at).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const isAgente = device.origen === 'agente';

            return (
              <article key={device.id} className="card device-card">
                <div className="device-card-top">
                  <div className="device-card-identity">
                    <span className="device-card-icon">
                      <PlugIcon />
                    </span>
                    <div className="device-card-text">
                      <p className="device-card-name">{device.nombre}</p>
                      <p className="device-card-type">{device.tipo}</p>
                    </div>
                  </div>
                  <span className={`device-badge ${isAgente ? 'device-badge-agente' : 'device-badge-manual'}`}>
                    {isAgente && <WifiIcon />}
                    {isAgente ? 'Agente' : 'Manual'}
                  </span>
                </div>

                <div className="device-card-stats">
                  <div className="device-stat">
                    <span className="device-stat-value">{device.consumo_watts_promedio} W</span>
                    <span className="device-stat-label">Potencia</span>
                  </div>
                  <div className="device-stat">
                    <span className="device-stat-value">{fecha}</span>
                    <span className="device-stat-label">Registrado</span>
                  </div>
                </div>

                <div>
                  <div className="device-power-row">
                    <span>Consumo relativo</span>
                    <span>{Math.round(pct)}%</span>
                  </div>
                  <div className="device-power-bar">
                    <div className="device-power-bar-fill" data-level={nivel} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="device-card-actions">
                  <button className="device-action-btn" disabled title="La edición llega en la siguiente actualización">
                    <PencilIcon /> Editar
                  </button>

                  {confirmId === device.id ? (
                    <div className="device-confirm">
                      <button
                        className="device-action-btn-danger"
                        onClick={() => handleDelete(device.id)}
                        disabled={deletingId === device.id}
                      >
                        {deletingId === device.id ? 'Eliminando…' : 'Sí, eliminar'}
                      </button>
                      <button className="device-action-btn-ghost" onClick={() => setConfirmId(null)}>
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      className="device-action-btn device-action-btn-danger-outline"
                      onClick={() => setConfirmId(device.id)}
                    >
                      <TrashIcon /> Eliminar
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
