import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { AppShell } from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import { fetchConsumptionData, ConsumptionData } from '../lib/consumption';
import { cargarMetaKwh, guardarMetaKwh } from '../lib/goal';
import { LeafIcon, SparkChartIcon, TreeIcon, CarIcon, TrendUpIcon, TrendDownIcon } from '../components/icons';

// Estimaciones generales de referencia (no una medición exacta):
// un árbol maduro absorbe en promedio ~21 kg de CO2 al año, y un auto
// compacto promedio emite ~0.15 kg de CO2 por kilómetro recorrido.
const KG_CO2_POR_ARBOL_AL_ANIO = 21;
const KG_CO2_POR_KM_AUTO = 0.15;

// Consumo residencial promedio de referencia en México (~250 kWh/mes,
// cifra aproximada — varía por región, clima y tarifa de CFE). Se usa el
// factor_co2 configurado en la cuenta para mantener la misma metodología
// que el resto de esta página.
const KWH_HOGAR_PROMEDIO_MX_MES = 250;

function formatFechaCorta(fechaISO: string): string {
  const [, mes, dia] = fechaISO.split('-');
  return `${dia}/${mes}`;
}

export function CarbonFootprint() {
  const { user } = useAuth();
  const [datos, setDatos] = useState<ConsumptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const resultado = await fetchConsumptionData(user.id);
        setDatos(resultado);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo cargar tu huella de carbono.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user]);

  return (
    <AppShell
      title="Huella de carbono"
      subtitle="Cuánto CO₂ genera tu consumo eléctrico y qué tanto significa eso."
    >
      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <p className="muted">Cargando tu huella de carbono…</p>
      ) : datos && datos.dispositivos.length === 0 ? (
        <div className="device-empty">
          <div>
            <p className="device-empty-title">Aún no hay datos para mostrar</p>
            <p className="muted">
              Registra dispositivos y horas de uso para calcular tu huella de carbono.
            </p>
          </div>
        </div>
      ) : (
        datos && user && <ContenidoHuella datos={datos} userId={user.id} />
      )}
    </AppShell>
  );
}

function ContenidoHuella({ datos, userId }: { datos: ConsumptionData; userId: string }) {
  const promedioDiario = datos.totales.co2 / 30;
  const hayDatosPrevios = datos.semanaAnterior.kwh > 0;
  const subiendo = hayDatosPrevios && datos.cambioPct > 0.5;
  const bajando = hayDatosPrevios && datos.cambioPct < -0.5;

  const arboles = datos.totales.co2 / KG_CO2_POR_ARBOL_AL_ANIO;
  const kmAuto = datos.totales.co2 / KG_CO2_POR_KM_AUTO;

  const factorCo2 = datos.configuracion?.factor_co2 ?? 0;
  const co2HogarPromedioMx = KWH_HOGAR_PROMEDIO_MX_MES * factorCo2;
  const diferenciaPct =
    co2HogarPromedioMx > 0 ? ((datos.totales.co2 - co2HogarPromedioMx) / co2HogarPromedioMx) * 100 : 0;
  const maxBarra = Math.max(datos.totales.co2, co2HogarPromedioMx, 1);

  const serieDiaria = datos.porDia.map((p) => ({
    fecha: formatFechaCorta(p.fecha),
    co2: Number(p.co2.toFixed(3)),
  }));

  const topCo2 = [...datos.porDispositivo]
    .sort((a, b) => b.co2Total - a.co2Total)
    .slice(0, 5)
    .map((d) => ({ nombre: d.dispositivo.nombre, valor: Number(d.co2Total.toFixed(2)) }));

  const sinUso = datos.porDispositivo.every((d) => d.co2Total === 0);

  return (
    <>
      <section className="status-cards">
        <div className="status-card">
          <span className="status-card-icon">
            <LeafIcon />
          </span>
          <div>
            <span className="status-card-label">Huella total (30 días)</span>
            <span className="status-card-value">{datos.totales.co2.toFixed(2)} kg CO₂</span>
          </div>
        </div>
        <div className="status-card">
          <span className="status-card-icon">
            <SparkChartIcon />
          </span>
          <div>
            <span className="status-card-label">Promedio diario</span>
            <span className="status-card-value">{promedioDiario.toFixed(2)} kg CO₂</span>
          </div>
        </div>
        <div className="status-card">
          <span className="status-card-icon">
            {!hayDatosPrevios ? <SparkChartIcon /> : subiendo ? <TrendUpIcon /> : <TrendDownIcon />}
          </span>
          <div>
            <span className="status-card-label">Vs. semana anterior</span>
            <span className="status-card-value">
              {hayDatosPrevios
                ? `${datos.cambioPct > 0 ? '+' : ''}${datos.cambioPct.toFixed(1)}%`
                : 'Sin datos previos'}
            </span>
          </div>
        </div>
      </section>

      <div className={subiendo ? 'alert-error' : 'alert-success'} style={{ marginTop: 20 }}>
        {!hayDatosPrevios &&
          'Aún no tenemos una semana anterior completa para comparar — sigue registrando tu uso para ver tu tendencia aquí.'}
        {hayDatosPrevios &&
          subiendo &&
          `Tu huella de carbono subió ${datos.cambioPct.toFixed(1)}% esta semana. Revisa tus dispositivos de mayor consumo en la gráfica de abajo para reducirla.`}
        {hayDatosPrevios &&
          bajando &&
          `Vas por buen camino: redujiste tu huella de carbono ${Math.abs(datos.cambioPct).toFixed(1)}% esta semana respecto a la anterior. Estás cuidando el planeta.`}
        {hayDatosPrevios &&
          !subiendo &&
          !bajando &&
          'Tu huella de carbono se mantuvo estable esta semana respecto a la anterior.'}
      </div>

      <h2>¿Con qué se compara tu huella?</h2>
      <section className="equivalence-grid">
        <div className="equivalence-card">
          <span className="equivalence-icon">
            <TreeIcon />
          </span>
          <span className="equivalence-value">{arboles < 0.1 ? '< 0.1' : arboles.toFixed(1)}</span>
          <span className="equivalence-label">
            árboles trabajando un año para absorber el CO₂ que generaste en 30 días
          </span>
        </div>
        <div className="equivalence-card">
          <span className="equivalence-icon">
            <CarIcon />
          </span>
          <span className="equivalence-value">{kmAuto.toFixed(0)} km</span>
          <span className="equivalence-label">recorridos en auto para emitir la misma cantidad de CO₂</span>
        </div>
      </section>
      <p className="muted" style={{ fontSize: '0.78rem', marginTop: 10 }}>
        Estimaciones de referencia (~21 kg CO₂/año por árbol, ~0.15 kg CO₂/km en auto promedio); no
        sustituyen una medición certificada.
      </p>

      {co2HogarPromedioMx > 0 && (
        <div className="card" style={{ padding: 24, marginTop: 20 }}>
          <h2 style={{ marginTop: 0 }}>¿Cómo te comparas con un hogar promedio en México?</h2>
          <div className="benchmark-row">
            <span className="benchmark-label">Tú (30 días)</span>
            <div className="benchmark-track">
              <div
                className="benchmark-fill benchmark-fill-tu"
                style={{ width: `${(datos.totales.co2 / maxBarra) * 100}%` }}
              />
            </div>
            <span className="benchmark-value">{datos.totales.co2.toFixed(1)} kg</span>
          </div>
          <div className="benchmark-row">
            <span className="benchmark-label">Promedio en México</span>
            <div className="benchmark-track">
              <div
                className="benchmark-fill benchmark-fill-promedio"
                style={{ width: `${(co2HogarPromedioMx / maxBarra) * 100}%` }}
              />
            </div>
            <span className="benchmark-value">{co2HogarPromedioMx.toFixed(1)} kg</span>
          </div>
          <p className="muted" style={{ fontSize: '0.85rem', marginTop: 14, marginBottom: 0 }}>
            {diferenciaPct <= 0
              ? `Tu huella está ${Math.abs(diferenciaPct).toFixed(0)}% por debajo del promedio estimado de un hogar mexicano (~${KWH_HOGAR_PROMEDIO_MX_MES} kWh/mes) — vas mejor que el promedio.`
              : `Tu huella está ${diferenciaPct.toFixed(0)}% por arriba del promedio estimado de un hogar mexicano (~${KWH_HOGAR_PROMEDIO_MX_MES} kWh/mes).`}
          </p>
          <p className="muted" style={{ fontSize: '0.72rem', marginTop: 6, marginBottom: 0 }}>
            Promedio de referencia aproximado; el consumo real varía mucho por región, clima y tamaño del
            hogar.
          </p>
        </div>
      )}

      <MetaMensualCard userId={userId} consumoActualKwh={datos.totales.kwh} />

      <div className="card" style={{ padding: 20, marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>CO₂ diario (últimos 30 días)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={serieDiaria}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" interval={4} />
            <YAxis />
            <Tooltip formatter={(value: number) => [`${value} kg`, 'CO₂']} />
            <Line type="monotone" dataKey="co2" stroke="#0f3d2e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>

        {!sinUso && (
          <>
            <h2>Huella por dispositivo (kg CO₂)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topCo2} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="nombre" width={140} />
                <Tooltip formatter={(value: number) => [`${value} kg`, 'CO₂']} />
                <Bar dataKey="valor" fill="#0f3d2e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </>
  );
}

function MetaMensualCard({ userId, consumoActualKwh }: { userId: string; consumoActualKwh: number }) {
  const [meta, setMeta] = useState<number | null>(null);
  const [editando, setEditando] = useState(false);
  const [inputValor, setInputValor] = useState('');

  useEffect(() => {
    setMeta(cargarMetaKwh(userId));
  }, [userId]);

  const guardar = () => {
    const valor = Number(inputValor);
    if (!Number.isFinite(valor) || valor <= 0) return;
    guardarMetaKwh(userId, valor);
    setMeta(valor);
    setEditando(false);
    setInputValor('');
  };

  if (meta == null || editando) {
    return (
      <div className="card" style={{ padding: 24, marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>Tu meta de este mes</h2>
        <p className="muted">
          Ponte un límite de consumo (en kWh) para los próximos 30 días y dale seguimiento aquí.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="number"
            min={1}
            step="1"
            placeholder="Ej. 150"
            value={inputValor}
            onChange={(e) => setInputValor(e.target.value)}
            className="device-form-input"
            style={{ maxWidth: 160 }}
          />
          <button className="btn-add" onClick={guardar} disabled={!inputValor}>
            Guardar meta
          </button>
          {editando && (
            <button
              type="button"
              className="link-button-dark"
              onClick={() => {
                setEditando(false);
                setInputValor('');
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    );
  }

  const pct = meta > 0 ? (consumoActualKwh / meta) * 100 : 0;
  const excedido = consumoActualKwh > meta;

  return (
    <div className="card" style={{ padding: 24, marginTop: 20 }}>
      <h2 style={{ marginTop: 0 }}>Tu meta de este mes</h2>
      <div className="benchmark-row" style={{ marginTop: 4 }}>
        <span className="benchmark-label">Consumo actual</span>
        <div className="benchmark-track">
          <div
            className={`benchmark-fill ${excedido ? 'benchmark-fill-over' : 'benchmark-fill-tu'}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <span className="benchmark-value">{consumoActualKwh.toFixed(1)} kWh</span>
      </div>
      <p className="muted" style={{ fontSize: '0.85rem', marginTop: 14, marginBottom: 0 }}>
        {excedido
          ? `Superaste tu meta de ${meta} kWh por ${(consumoActualKwh - meta).toFixed(1)} kWh este periodo. Revisa tus Recomendaciones para ajustar.`
          : `Vas en ${pct.toFixed(0)}% de tu meta de ${meta} kWh — te faltan ${(meta - consumoActualKwh).toFixed(1)} kWh para llegar al límite.`}
      </p>
      <button
        type="button"
        className="link-button-dark"
        style={{ marginTop: 10 }}
        onClick={() => {
          setInputValor(String(meta));
          setEditando(true);
        }}
      >
        Cambiar meta
      </button>
    </div>
  );
}
