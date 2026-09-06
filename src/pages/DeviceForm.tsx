import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { TIPOS_DISPOSITIVO } from '../types/database';
import { ArrowLeftIcon } from '../components/icons';

export function DeviceForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState(TIPOS_DISPOSITIVO[0].tipo);
  const [watts, setWatts] = useState(String(TIPOS_DISPOSITIVO[0].wattsPromedio));

  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const redirectTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!isEdit || !id) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    supabase
      .from('dispositivos')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setLoadError(error.message);
        } else if (data) {
          setNombre(data.nombre);
          setTipo(data.tipo);
          setWatts(String(data.consumo_watts_promedio));
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  useEffect(() => {
    return () => {
      if (redirectTimeout.current) clearTimeout(redirectTimeout.current);
    };
  }, []);

  const wattsNumber = Number(watts);
  const nombreValido = nombre.trim().length > 0;
  const wattsValido = watts.trim() !== '' && Number.isFinite(wattsNumber) && wattsNumber > 0;

  const handleTipoChange = (nuevoTipo: string) => {
    setTipo(nuevoTipo);
    const sugerido = TIPOS_DISPOSITIVO.find((t) => t.tipo === nuevoTipo);
    if (sugerido) setWatts(String(sugerido.wattsPromedio));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError(null);
    setSuccess(null);

    if (!nombreValido || !wattsValido) return;
    if (!user) {
      setError('No hay una sesión activa.');
      return;
    }

    setSaving(true);

    const payload = {
      nombre: nombre.trim(),
      tipo,
      consumo_watts_promedio: wattsNumber,
    };

    const { error } =
      isEdit && id
        ? await supabase.from('dispositivos').update(payload).eq('id', id)
        : await supabase.from('dispositivos').insert({ ...payload, usuario_id: user.id, origen: 'manual' });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(isEdit ? 'Dispositivo actualizado.' : 'Dispositivo agregado.');
    redirectTimeout.current = setTimeout(() => navigate('/dispositivos'), 800);
  };

  const wattsSugeridos = TIPOS_DISPOSITIVO.find((t) => t.tipo === tipo)?.wattsPromedio;

  return (
    <AppShell
      title={isEdit ? 'Editar dispositivo' : 'Nuevo dispositivo'}
      subtitle={isEdit ? 'Actualiza los datos de este equipo.' : 'Registra un nuevo equipo para monitorear.'}
    >
      <button
        type="button"
        className="icon-btn device-form-back"
        onClick={() => navigate('/dispositivos')}
        aria-label="Volver a dispositivos"
        title="Volver"
      >
        <ArrowLeftIcon />
      </button>

      {loading ? (
        <p className="muted">Cargando dispositivo…</p>
      ) : loadError ? (
        <div className="alert-error">{loadError}</div>
      ) : (
        <div className="card device-form-card">
          <form className="device-form-fields" onSubmit={handleSubmit} noValidate>
            <div className="device-form-field">
              <label htmlFor="nombre">Nombre del dispositivo</label>
              <input
                id="nombre"
                type="text"
                className={`device-form-input${touched && !nombreValido ? ' device-form-input-error' : ''}`}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Laptop de trabajo"
              />
              {touched && !nombreValido && <span className="device-form-error-text">Escribe un nombre.</span>}
            </div>

            <div className="device-form-field">
              <label htmlFor="tipo">Tipo de dispositivo</label>
              <select
                id="tipo"
                className="device-form-select"
                value={tipo}
                onChange={(e) => handleTipoChange(e.target.value)}
              >
                {TIPOS_DISPOSITIVO.map((t) => (
                  <option key={t.tipo} value={t.tipo}>
                    {t.tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="device-form-field">
              <label htmlFor="watts">Consumo promedio (Watts)</label>
              <input
                id="watts"
                type="number"
                min="0"
                step="1"
                className={`device-form-input${touched && !wattsValido ? ' device-form-input-error' : ''}`}
                value={watts}
                onChange={(e) => setWatts(e.target.value)}
                placeholder="65"
              />
              {wattsSugeridos !== undefined && (
                <span className="device-form-hint">
                  Sugerido para {tipo}: {wattsSugeridos} W
                </span>
              )}
              {touched && !wattsValido && (
                <span className="device-form-error-text">Ingresa un número mayor a 0.</span>
              )}
            </div>

            {error && <div className="alert-error">{error}</div>}
            {success && <div className="alert-success">{success}</div>}

            <div className="device-form-actions">
              <button
                type="button"
                className="device-form-cancel"
                onClick={() => navigate('/dispositivos')}
                disabled={saving}
              >
                Cancelar
              </button>
              <button type="submit" className="device-form-submit" disabled={saving || !!success}>
                {saving ? 'Guardando…' : isEdit ? 'Actualizar dispositivo' : 'Guardar dispositivo'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
