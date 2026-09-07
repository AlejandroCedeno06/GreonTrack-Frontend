import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import type { DispositivoSugerido, SnifferEstado } from '../types/database';
import { CheckIcon, TrashIcon, ArrowLeftIcon, RefreshIcon } from '../components/icons';
import { CATEGORIAS, categoriaDe, iconoDeTipoDetectado, tipoRealDeDetectado, Categoria } from '../lib/deviceCategories';
import {
  fetchSugerenciasPendientes,
  confirmarSugerencia,
  descartarSugerencia,
  fetchEstadoSniffer,
  snifferActivo,
} from '../lib/deviceSuggestions';

const POLL_ESTADO_SNIFFER_MS = 15_000;

export function DeviceSniffer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sugerencias, setSugerencias] = useState<DispositivoSugerido[]>([]);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [estadoSniffer, setEstadoSniffer] = useState<SnifferEstado | null>(null);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>('Todos');

  const loadSugerencias = async () => {
    if (!user) return;
    try {
      setSugerencias(await fetchSugerenciasPendientes(user.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las sugerencias.');
    }
  };

  const loadEstadoSniffer = async () => {
    if (!user) return;
    setEstadoSniffer(await fetchEstadoSniffer(user.id));
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadEstadoSniffer(), loadSugerencias()]);
      setLoading(false);
    })();

    const interval = setInterval(() => {
      loadEstadoSniffer();
      loadSugerencias();
    }, POLL_ESTADO_SNIFFER_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleActualizar = async () => {
    setActualizando(true);
    setError(null);
    await Promise.all([loadEstadoSniffer(), loadSugerencias()]);
    setActualizando(false);
  };

  const handleConfirmar = async (sugerencia: DispositivoSugerido) => {
    if (!user) return;
    setProcesandoId(sugerencia.id);
    setError(null);
    try {
      await confirmarSugerencia(sugerencia, user.id);
      setSugerencias((prev) => prev.filter((s) => s.id !== sugerencia.id));
      setSuccess(`${sugerencia.nombre_sugerido} se agregó a Mis dispositivos.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo agregar el dispositivo sugerido.');
    } finally {
      setProcesandoId(null);
    }
  };

  const handleDescartar = async (id: string) => {
    setProcesandoId(id);
    setError(null);
    try {
      await descartarSugerencia(id);
      setSugerencias((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo descartar la sugerencia.');
    } finally {
      setProcesandoId(null);
    }
  };

  const activo = snifferActivo(estadoSniffer);
  const sugerenciasFiltradas =
    categoriaActiva === 'Todos'
      ? sugerencias
      : sugerencias.filter((s) => categoriaDe(tipoRealDeDetectado(s.tipo_detectado)) === categoriaActiva);

  return (
    <AppShell
      title="Detectar en mi red"
      subtitle="El GreonTrack Sniffer escanea tu red local y te sugiere dispositivos para agregar."
    >
      <div className="devices-toolbar">
        <button
          type="button"
          className="icon-btn"
          onClick={() => navigate('/dispositivos')}
          aria-label="Volver a dispositivos"
          title="Volver"
        >
          <ArrowLeftIcon />
        </button>
        <button className="btn-add btn-add-outline" onClick={handleActualizar} disabled={actualizando}>
          <RefreshIcon /> {actualizando ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      <div className={`sniffer-status ${activo ? 'activo' : 'inactivo'}`}>
        <span className="sniffer-status-dot" />
        {activo ? (
          <span>
            Analizando tu red… última pasada a las{' '}
            {new Date(estadoSniffer!.ultimo_sondeo).toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        ) : (
          <span>Análisis de red desactivado — corre GreonTrack Sniffer para detectar dispositivos.</span>
        )}
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {!loading && sugerencias.length > 0 && (
        <div className="category-filter">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              className={`category-chip${categoriaActiva === cat ? ' active' : ''}`}
              onClick={() => setCategoriaActiva(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="muted">Cargando sugerencias…</p>
      ) : sugerencias.length === 0 ? (
        <div className="device-empty">
          <div>
            <p className="device-empty-title">Sin sugerencias por ahora</p>
            <p className="muted">
              {activo
                ? 'El sniffer está corriendo — en cuanto detecte algo nuevo, aparecerá aquí.'
                : 'Corre GreonTrack Sniffer en tu computadora para empezar a detectar dispositivos.'}
            </p>
          </div>
        </div>
      ) : sugerenciasFiltradas.length === 0 ? (
        <div className="device-empty">
          <div>
            <p className="device-empty-title">Nada en "{categoriaActiva}"</p>
            <p className="muted">No hay sugerencias detectadas en esta categoría.</p>
          </div>
        </div>
      ) : (
        <div className="card suggestions-card">
          <h2 style={{ marginTop: 0 }}>Sugerencias detectadas en tu red</h2>
          <p className="muted">Revísalas y agrégalas con un clic, o descártalas si no quieres monitorearlas.</p>
          <ul className="suggestions-list">
            {sugerenciasFiltradas.map((s) => {
              const IconoSugerido = iconoDeTipoDetectado(s.tipo_detectado);
              const procesando = procesandoId === s.id;
              return (
                <li key={s.id} className="suggestion-row">
                  <span className="suggestion-row-icon">
                    <IconoSugerido />
                  </span>
                  <div className="suggestion-row-text">
                    <p className="suggestion-row-name">{s.nombre_sugerido}</p>
                    <p className="suggestion-row-meta">
                      {s.ip} {s.vendor ? `· ${s.vendor}` : ''}
                    </p>
                  </div>
                  <span className="suggestion-row-watts">~{s.watts_estimados} W</span>
                  <div className="suggestion-row-actions">
                    <button
                      className="device-action-btn"
                      onClick={() => handleConfirmar(s)}
                      disabled={procesando}
                    >
                      <CheckIcon /> {procesando ? 'Agregando…' : 'Agregar'}
                    </button>
                    <button
                      className="device-action-btn device-action-btn-danger-outline"
                      onClick={() => handleDescartar(s.id)}
                      disabled={procesando}
                    >
                      <TrashIcon /> Descartar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </AppShell>
  );
}
