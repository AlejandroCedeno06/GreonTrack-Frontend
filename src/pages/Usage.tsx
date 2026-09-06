import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Configuracion, Dispositivo, RegistroUso } from '../types/database';
import { PlugIcon, WifiIcon, PlusIcon, SparkChartIcon, BoltIcon, LeafIcon } from '../components/icons';

function fechaHoyISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function Usage() {
  const { user } = useAuth();

  const [devices, setDevices] = useState<Dispositivo[]>([]);
  const [configuracion, setConfiguracion] = useState<Configuracion | null>(null);
  const [horas, setHoras] = useState<Record<string, number>>({});
  const [horasInicial, setHorasInicial] = useState<Record<string, number>>({});
  const [registroIdPorDispositivo, setRegistroIdPorDispositivo] = useState<Record<string, string>>({});
  // Suma de horas ya reportadas hoy por el Agente (puede haber muchas filas
  // pequeñas, una por cada reporte de ~60s); solo lectura, no se edita aquí.
  const [horasAgentePorDispositivo, setHorasAgentePorDispositivo] = useState<Record<string, number>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      const [dispositivosRes, configRes] = await Promise.all([
        supabase.from('dispositivos').select('*').eq('usuario_id', user.id).order('created_at', { ascending: false }),
        supabase.from('configuracion').select('*').single(),
      ]);

      if (dispositivosRes.error) {
        setError(dispositivosRes.error.message);
        setLoading(false);
        return;
      }
      if (configRes.error) {
        setError(configRes.error.message);
        setLoading(false);
        return;
      }

      const listaDispositivos = (dispositivosRes.data ?? []) as Dispositivo[];
      setDevices(listaDispositivos);
      setConfiguracion(configRes.data as Configuracion);

      const horasIniciales: Record<string, number> = {};
      const horasAgente: Record<string, number> = {};
      listaDispositivos.forEach((d) => {
        horasIniciales[d.id] = 0;
        horasAgente[d.id] = 0;
      });
      const registroIds: Record<string, string> = {};

      if (listaDispositivos.length > 0) {
        const { data: registros, error: registrosError } = await supabase
          .from('registros_uso')
          .select('*')
          .eq('fecha_uso', fechaHoyISO())
          .in(
            'dispositivo_id',
            listaDispositivos.map((d) => d.id)
          );

        if (registrosError) {
          setError(registrosError.message);
          setLoading(false);
          return;
        }

        (registros as RegistroUso[] | null)?.forEach((r) => {
          if (r.fuente === 'agente') {
            // El Agente reporta cada ~60s en incrementos pequeños, así que
            // puede haber muchas filas del mismo dispositivo hoy: se suman todas.
            // Number(...) por si Postgres devuelve horas_uso como string (columnas
            // "numeric" se serializan así en PostgREST para no perder precisión).
            horasAgente[r.dispositivo_id] = (horasAgente[r.dispositivo_id] ?? 0) + Number(r.horas_uso);
          } else {
            // Manual: por diseño hay a lo más una fila por dispositivo/día (ver handleGuardar).
            horasIniciales[r.dispositivo_id] = r.horas_uso;
            registroIds[r.dispositivo_id] = r.id;
          }
        });
      }

      setHoras(horasIniciales);
      setHorasInicial(horasIniciales);
      setRegistroIdPorDispositivo(registroIds);
      setHorasAgentePorDispositivo(horasAgente);
      setLoading(false);
    };

    loadData();
  }, [user]);

  const handleHorasChange = (id: string, valor: number) => {
    setHoras((prev) => ({ ...prev, [id]: valor }));
    setSuccess(null);
  };

  const calcularParaDispositivo = (device: Dispositivo) => {
    const h = device.origen === 'agente' ? horasAgentePorDispositivo[device.id] ?? 0 : horas[device.id] ?? 0;
    const kwh = (device.consumo_watts_promedio * h) / 1000;
    const costo = configuracion ? kwh * configuracion.tarifa_kwh : 0;
    const co2 = configuracion ? kwh * configuracion.factor_co2 : 0;
    return { kwh, costo, co2 };
  };

  const totales = devices.reduce(
    (acc, d) => {
      const { kwh, costo, co2 } = calcularParaDispositivo(d);
      acc.kwh += kwh;
      acc.costo += costo;
      acc.co2 += co2;
      return acc;
    },
    { kwh: 0, costo: 0, co2: 0 }
  );

  const hayCambios = devices.some((d) => d.origen === 'manual' && horas[d.id] !== horasInicial[d.id]);

  const handleGuardar = async () => {
    const cambios = devices.filter((d) => d.origen === 'manual' && horas[d.id] !== horasInicial[d.id]);
    if (cambios.length === 0) return;

    setError(null);
    setSuccess(null);
    setSaving(true);

    const hoy = fechaHoyISO();
    const resultados = await Promise.all(
      cambios.map((d) => {
        const registroId = registroIdPorDispositivo[d.id];
        if (registroId) {
          return supabase.from('registros_uso').update({ horas_uso: horas[d.id] }).eq('id', registroId);
        }
        return supabase
          .from('registros_uso')
          .insert({ dispositivo_id: d.id, horas_uso: horas[d.id], fuente: 'manual', fecha_uso: hoy })
          .select('id')
          .single();
      })
    );

    setSaving(false);

    const fallo = resultados.find((r) => r.error);
    if (fallo?.error) {
      setError(fallo.error.message);
      return;
    }

    const nuevosIds: Record<string, string> = {};
    cambios.forEach((d, i) => {
      if (!registroIdPorDispositivo[d.id]) {
        const fila = resultados[i].data as { id: string } | null;
        if (fila?.id) nuevosIds[d.id] = fila.id;
      }
    });
    if (Object.keys(nuevosIds).length > 0) {
      setRegistroIdPorDispositivo((prev) => ({ ...prev, ...nuevosIds }));
    }

    setHorasInicial((prev) => {
      const next = { ...prev };
      cambios.forEach((d) => {
        next[d.id] = horas[d.id];
      });
      return next;
    });

    setSuccess('Registro del día guardado.');
  };

  const fechaLegible = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AppShell title="Registrar uso" subtitle={`Ajusta las horas de uso de hoy, ${fechaLegible}.`}>
      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <p className="muted">Cargando dispositivos…</p>
      ) : devices.length === 0 ? (
        <div className="device-empty">
          <span className="device-empty-icon">
            <PlugIcon />
          </span>
          <div>
            <p className="device-empty-title">Aún no tienes dispositivos</p>
            <p className="muted">Agrega uno primero para poder registrar su uso diario.</p>
            <Link className="btn-add" to="/dispositivos/nuevo" style={{ marginTop: 14, display: 'inline-flex' }}>
              <PlusIcon /> Agregar dispositivo
            </Link>
          </div>
        </div>
      ) : (
        <>
          <section className="status-cards">
            <div className="status-card">
              <span className="status-card-icon">
                <SparkChartIcon />
              </span>
              <div>
                <span className="status-card-label">Consumo de hoy</span>
                <span className="status-card-value">{totales.kwh.toFixed(2)} kWh</span>
              </div>
            </div>
            <div className="status-card">
              <span className="status-card-icon">
                <BoltIcon />
              </span>
              <div>
                <span className="status-card-label">Costo de hoy</span>
                <span className="status-card-value">${totales.costo.toFixed(2)}</span>
              </div>
            </div>
            <div className="status-card">
              <span className="status-card-icon">
                <LeafIcon />
              </span>
              <div>
                <span className="status-card-label">CO₂ de hoy</span>
                <span className="status-card-value">{totales.co2.toFixed(2)} kg</span>
              </div>
            </div>
          </section>

          <div className="card usage-list">
            {devices.map((device) => {
              const isAgente = device.origen === 'agente';
              const { kwh, costo, co2 } = calcularParaDispositivo(device);

              return (
                <div key={device.id} className="usage-row">
                  <div className="usage-row-identity">
                    <span className="device-card-icon">
                      <PlugIcon />
                    </span>
                    <div className="device-card-text">
                      <p className="device-card-name">{device.nombre}</p>
                      <p className="device-card-type">{device.tipo}</p>
                    </div>
                  </div>

                  <div className="usage-row-control">
                    {isAgente ? (
                      <p className="usage-agente-note">
                        <WifiIcon /> Este dispositivo reporta uso automáticamente vía Agente
                      </p>
                    ) : (
                      <div className="usage-slider-group">
                        <input
                          type="range"
                          min="0"
                          max="24"
                          step="0.5"
                          value={horas[device.id] ?? 0}
                          disabled={saving}
                          onChange={(e) => handleHorasChange(device.id, Number(e.target.value))}
                          className="usage-slider"
                          aria-label={`Horas de uso de ${device.nombre}`}
                        />
                        <span className="usage-slider-value">{horas[device.id] ?? 0} h</span>
                      </div>
                    )}
                  </div>

                  <div className="usage-row-calc">
                    <div className="usage-calc-item">
                      <span className="usage-calc-value">{kwh.toFixed(2)}</span>
                      <span className="usage-calc-label">kWh</span>
                    </div>
                    <div className="usage-calc-item">
                      <span className="usage-calc-value">${costo.toFixed(2)}</span>
                      <span className="usage-calc-label">Costo</span>
                    </div>
                    <div className="usage-calc-item">
                      <span className="usage-calc-value">{co2.toFixed(2)}</span>
                      <span className="usage-calc-label">kg CO₂</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="usage-save-row">
            {success && <div className="alert-success">{success}</div>}
            <button className="btn-add" onClick={handleGuardar} disabled={saving || !hayCambios}>
              {saving ? 'Guardando…' : 'Guardar registro del día'}
            </button>
          </div>
        </>
      )}
    </AppShell>
  );
}
