import { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import { fetchConsumptionData } from '../lib/consumption';
import {
  generarRecomendaciones,
  guardarRecomendaciones,
  calcularNivelConsumoDatos,
  RecomendacionInput,
  NivelConsumo,
} from '../lib/recommendations';
import type { Dispositivo } from '../types/database';
import { LightbulbIcon, PlugIcon } from '../components/icons';
import mascota from '../assets/mascota-greon-sm.png';

const ETIQUETA_NIVEL: Record<NivelConsumo, string> = {
  bajo: 'Consumo bajo',
  medio: 'Consumo moderado',
  alto: 'Consumo alto',
};

export function Recommendations() {
  const { user } = useAuth();
  const [recomendaciones, setRecomendaciones] = useState<RecomendacionInput[]>([]);
  const [dispositivosPorId, setDispositivosPorId] = useState<Map<string, Dispositivo>>(new Map());
  const [nivel, setNivel] = useState<NivelConsumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        const datos = await fetchConsumptionData(user.id);
        const generadas = generarRecomendaciones(datos);
        setRecomendaciones(generadas);
        setDispositivosPorId(new Map(datos.dispositivos.map((d) => [d.id, d])));
        setNivel(calcularNivelConsumoDatos(datos));

        try {
          await guardarRecomendaciones(user.id, generadas);
        } catch {
          // El guardado en Supabase es un plus (historial); si falla, igual
          // mostramos las recomendaciones calculadas al usuario.
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudieron generar las recomendaciones.');
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [user]);

  return (
    <AppShell title="Recomendaciones" subtitle="Sugerencias automáticas para bajar tu consumo y tu costo eléctrico.">
      {error && <div className="alert-error">{error}</div>}

      {nivel && (
        <div style={{ marginBottom: 16 }}>
          <span className={`consumo-nivel-badge consumo-nivel-${nivel}`}>{ETIQUETA_NIVEL[nivel]}</span>
        </div>
      )}

      {loading ? (
        <p className="muted">Analizando tu consumo…</p>
      ) : recomendaciones.length === 0 ? (
        <div className="device-empty">
          <img src={mascota} alt="" className="device-empty-mascot" />
          <div>
            <p className="device-empty-title">Aún no hay suficientes datos</p>
            <p className="muted">Registra dispositivos y horas de uso para recibir recomendaciones.</p>
          </div>
        </div>
      ) : (
        <div className="device-grid">
          {recomendaciones.map((r, i) => {
            const dispositivo = r.dispositivo_id ? dispositivosPorId.get(r.dispositivo_id) : null;
            return (
              <article key={i} className="card device-card">
                <div className="device-card-top">
                  <div className="device-card-identity">
                    <span className="device-card-icon">
                      {dispositivo ? <PlugIcon /> : <LightbulbIcon />}
                    </span>
                    <div className="device-card-text">
                      <p className="device-card-name">{dispositivo ? dispositivo.nombre : 'Consejo general'}</p>
                    </div>
                  </div>
                  {r.ahorroEstimado && <span className="device-badge device-badge-agente">Ahorro estimado</span>}
                </div>
                <p className="muted" style={{ margin: 0 }}>
                  {r.mensaje}
                </p>
                {r.ahorroEstimado && (
                  <div className="device-card-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="device-stat">
                      <span className="device-stat-value">{r.ahorroEstimado.kwh.toFixed(1)} kWh</span>
                      <span className="device-stat-label">Al mes</span>
                    </div>
                    <div className="device-stat">
                      <span className="device-stat-value">${r.ahorroEstimado.costo.toFixed(2)}</span>
                      <span className="device-stat-label">Al mes</span>
                    </div>
                    <div className="device-stat">
                      <span className="device-stat-value">{r.ahorroEstimado.co2.toFixed(2)} kg</span>
                      <span className="device-stat-label">CO₂ al mes</span>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
