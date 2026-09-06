import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Dispositivo } from '../types/database';
import { PlugIcon, WifiIcon, PencilIcon, TrashIcon, PlusIcon, CopyIcon } from '../components/icons';

// Techo de referencia (W) usado solo para escalar la barra de consumo relativo;
// no hay horas de uso en esta tabla, así que no se puede calcular kWh/costo aquí
// (eso vive en registros_uso / calculos, fuera del alcance de esta pantalla).
const REFERENCIA_WATTS = 2000;

// El Agente GreonTrack solo sabe monitorear laptops; ver TIPOS_DISPOSITIVO
// en types/database.ts, donde este tipo se guarda tal cual (capitalizado).
const TIPO_LAPTOP = 'Laptop';

function nivelPotencia(watts: number): 'alto' | 'moderado' | 'eficiente' {
  if (watts > 1000) return 'alto';
  if (watts > 300) return 'moderado';
  return 'eficiente';
}

interface AgentModalProps {
  device: Dispositivo;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
}

function AgentModal({ device, copied, onCopy, onClose }: AgentModalProps) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="agent-modal-title">
      <div className="modal-panel">
        <h2 id="agent-modal-title" className="modal-title">
          Vincula el Agente GreonTrack
        </h2>
        <p className="modal-subtitle">
          Usa este código para emparejar <strong>{device.nombre}</strong> con el agente.
        </p>

        <div className="modal-code-box">
          <span className="modal-code-text">{device.device_token}</span>
        </div>
        <button className="modal-copy-btn" onClick={onCopy}>
          <CopyIcon /> {copied ? '¡Copiado!' : 'Copiar código'}
        </button>

        <ol className="modal-instructions">
          <li className="modal-instruction-step">
            <span className="modal-instruction-number">1</span>
            <span>Descarga e instala el Agente GreonTrack en esta laptop.</span>
          </li>
          <li className="modal-instruction-step">
            <span className="modal-instruction-number">2</span>
            <span>
              Corre <code>npm start</code> en una terminal.
            </span>
          </li>
          <li className="modal-instruction-step">
            <span className="modal-instruction-number">3</span>
            <span>Cuando te pida el código de vinculación, pega este código.</span>
          </li>
        </ol>

        <button className="modal-close-btn" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
}

export function Devices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Dispositivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [modalDevice, setModalDevice] = useState<Dispositivo | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleLinkAgent = async (device: Dispositivo) => {
    setLinkingId(device.id);
    setError(null);

    const nuevoToken = crypto.randomUUID();
    const { error } = await supabase
      .from('dispositivos')
      .update({ device_token: nuevoToken, origen: 'agente' })
      .eq('id', device.id);

    setLinkingId(null);

    if (error) {
      setError(error.message);
      return;
    }

    const actualizado: Dispositivo = { ...device, device_token: nuevoToken, origen: 'agente' };
    setDevices((prev) => prev.map((d) => (d.id === device.id ? actualizado : d)));
    setModalDevice(actualizado);
  };

  const handleCopy = async () => {
    if (!modalDevice?.device_token) return;
    try {
      await navigator.clipboard.writeText(modalDevice.device_token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // el portapapeles puede no estar disponible; el código sigue visible para copiar a mano
    }
  };

  const closeModal = () => {
    setModalDevice(null);
    setCopied(false);
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
        <button className="btn-add" onClick={() => navigate('/dispositivos/nuevo')}>
          <PlusIcon /> Agregar dispositivo
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
            const puedeVincularAgente =
              device.tipo === TIPO_LAPTOP && device.origen === 'manual' && !device.device_token;

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
                  <div className="device-card-top-actions">
                    <span className={`device-badge ${isAgente ? 'device-badge-agente' : 'device-badge-manual'}`}>
                      {isAgente && <WifiIcon />}
                      {isAgente ? 'Agente' : 'Manual'}
                    </span>
                    {isAgente && device.device_token && (
                      <button className="device-view-code-btn" onClick={() => setModalDevice(device)}>
                        Ver código
                      </button>
                    )}
                  </div>
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

                {puedeVincularAgente && (
                  <button
                    className="device-link-btn"
                    onClick={() => handleLinkAgent(device)}
                    disabled={linkingId === device.id}
                  >
                    <WifiIcon /> {linkingId === device.id ? 'Vinculando…' : 'Vincular Agente'}
                  </button>
                )}

                <div className="device-card-actions">
                  <button
                    className="device-action-btn"
                    onClick={() => navigate(`/dispositivos/${device.id}/editar`)}
                  >
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

      {modalDevice && (
        <AgentModal device={modalDevice} copied={copied} onCopy={handleCopy} onClose={closeModal} />
      )}
    </AppShell>
  );
}
