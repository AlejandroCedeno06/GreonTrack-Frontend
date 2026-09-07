import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from 'recharts';
import type { ConsumoDispositivo, ConsumptionData } from '../lib/consumption';

interface ConsumptionChartsProps {
  datos: ConsumptionData;
}

function formatFechaCorta(fechaISO: string): string {
  const [, mes, dia] = fechaISO.split('-');
  return `${dia}/${mes}`;
}

function topPorCampo(
  porDispositivo: ConsumoDispositivo[],
  campo: 'kwhTotal' | 'costoTotal' | 'co2Total',
  n: number
) {
  return [...porDispositivo]
    .sort((a, b) => b[campo] - a[campo])
    .slice(0, n)
    .map((d) => ({ nombre: d.dispositivo.nombre, valor: Number(d[campo].toFixed(2)) }));
}

export function ConsumptionCharts({ datos }: ConsumptionChartsProps) {
  const topKwh = topPorCampo(datos.porDispositivo, 'kwhTotal', 5);
  const topCosto = topPorCampo(datos.porDispositivo, 'costoTotal', 5);
  const topCo2 = topPorCampo(datos.porDispositivo, 'co2Total', 5);

  const serieDiaria = datos.porDia.map((p) => ({
    fecha: formatFechaCorta(p.fecha),
    kwh: Number(p.kwh.toFixed(2)),
  }));

  const sinDatosDeUso = datos.porDispositivo.every((d) => d.kwhTotal === 0);

  if (sinDatosDeUso) {
    return <p className="muted">Aún no hay horas de uso registradas.</p>;
  }

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Consumo por dispositivo (kWh)</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={topKwh} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="nombre" width={140} />
          <Tooltip formatter={(value: number) => [`${value} kWh`, 'Consumo']} />
          <Bar dataKey="valor" fill="#2e7d32" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <h2>Costo por dispositivo ($)</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={topCosto} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="nombre" width={140} />
          <Tooltip formatter={(value: number) => [`$${value}`, 'Costo']} />
          <Bar dataKey="valor" fill="#66bb6a" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <h2>Huella de carbono por dispositivo (kg CO₂)</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={topCo2} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="nombre" width={140} />
          <Tooltip formatter={(value: number) => [`${value} kg`, 'CO₂']} />
          <Bar dataKey="valor" fill="#0f3d2e" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <h2>Consumo diario (últimos 30 días)</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={serieDiaria}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" interval={4} />
          <YAxis />
          <Tooltip formatter={(value: number) => [`${value} kWh`, 'Consumo']} />
          <Line type="monotone" dataKey="kwh" stroke="#2e7d32" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
