import { supabase } from './supabase';
import type { Configuracion, Dispositivo, RegistroUso } from '../types/database';

const DIAS_HISTORIAL = 30;
const DIAS_SEMANA = 7;

export interface PuntoDia {
  fecha: string; // YYYY-MM-DD
  kwh: number;
  costo: number;
  co2: number;
}

export interface ConsumoDispositivo {
  dispositivo: Dispositivo;
  horasTotal: number;
  horasPromedioDiaria: number;
  kwhTotal: number;
  costoTotal: number;
  co2Total: number;
  pctDelTotal: number;
}

export interface ConsumptionData {
  dispositivos: Dispositivo[];
  configuracion: Configuracion | null;
  porDia: PuntoDia[];
  porDispositivo: ConsumoDispositivo[];
  totales: { kwh: number; costo: number; co2: number };
  semanaActual: { kwh: number };
  semanaAnterior: { kwh: number };
  cambioPct: number;
}

function fechaISO(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function ultimosNDias(n: number): string[] {
  const dias: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dias.push(fechaISO(d));
  }
  return dias;
}

export async function fetchConsumptionData(userId: string): Promise<ConsumptionData> {
  const { data: dispositivosData, error: dispositivosError } = await supabase
    .from('dispositivos')
    .select('*')
    .eq('usuario_id', userId)
    .order('created_at', { ascending: false });

  if (dispositivosError) throw new Error(dispositivosError.message);
  const dispositivos = (dispositivosData ?? []) as Dispositivo[];

  const { data: configData, error: configError } = await supabase
    .from('configuracion')
    .select('*')
    .single();

  if (configError) throw new Error(configError.message);
  const configuracion = configData as Configuracion | null;

  const dias = ultimosNDias(DIAS_HISTORIAL);
  const fechaInicio = dias[0];

  let registros: RegistroUso[] = [];
  if (dispositivos.length > 0) {
    const { data: registrosData, error: registrosError } = await supabase
      .from('registros_uso')
      .select('*')
      .gte('fecha_uso', fechaInicio)
      .in(
        'dispositivo_id',
        dispositivos.map((d) => d.id)
      );

    if (registrosError) throw new Error(registrosError.message);
    registros = (registrosData ?? []) as RegistroUso[];
  }

  const dispositivoPorId = new Map(dispositivos.map((d) => [d.id, d]));
  const tarifa = configuracion?.tarifa_kwh ?? 0;
  const factorCo2 = configuracion?.factor_co2 ?? 0;

  const kwhPorDia = new Map<string, number>(dias.map((f) => [f, 0]));
  const horasPorDispositivo = new Map<string, number>();

  registros.forEach((r) => {
    const dispositivo = dispositivoPorId.get(r.dispositivo_id);
    if (!dispositivo) return;

    const horas = Number(r.horas_uso);
    const kwh = (dispositivo.consumo_watts_promedio * horas) / 1000;

    if (kwhPorDia.has(r.fecha_uso)) {
      kwhPorDia.set(r.fecha_uso, (kwhPorDia.get(r.fecha_uso) ?? 0) + kwh);
    }

    horasPorDispositivo.set(r.dispositivo_id, (horasPorDispositivo.get(r.dispositivo_id) ?? 0) + horas);
  });

  const porDia: PuntoDia[] = dias.map((fecha) => {
    const kwh = kwhPorDia.get(fecha) ?? 0;
    return { fecha, kwh, costo: kwh * tarifa, co2: kwh * factorCo2 };
  });

  const kwhTotalGeneral = porDia.reduce((sum, p) => sum + p.kwh, 0);

  const porDispositivo: ConsumoDispositivo[] = dispositivos
    .map((dispositivo) => {
      const horasTotal = horasPorDispositivo.get(dispositivo.id) ?? 0;
      const kwhTotal = (dispositivo.consumo_watts_promedio * horasTotal) / 1000;
      const costoTotal = kwhTotal * tarifa;
      const co2Total = kwhTotal * factorCo2;
      const horasPromedioDiaria = horasTotal / DIAS_HISTORIAL;
      const pctDelTotal = kwhTotalGeneral > 0 ? (kwhTotal / kwhTotalGeneral) * 100 : 0;

      return { dispositivo, horasTotal, horasPromedioDiaria, kwhTotal, costoTotal, co2Total, pctDelTotal };
    })
    .sort((a, b) => b.kwhTotal - a.kwhTotal);

  const totales = {
    kwh: kwhTotalGeneral,
    costo: kwhTotalGeneral * tarifa,
    co2: kwhTotalGeneral * factorCo2,
  };

  const diasSemanaActual = porDia.slice(-DIAS_SEMANA);
  const diasSemanaAnterior = porDia.slice(-DIAS_SEMANA * 2, -DIAS_SEMANA);

  const kwhSemanaActual = diasSemanaActual.reduce((sum, p) => sum + p.kwh, 0);
  const kwhSemanaAnterior = diasSemanaAnterior.reduce((sum, p) => sum + p.kwh, 0);

  const cambioPct =
    kwhSemanaAnterior > 0 ? ((kwhSemanaActual - kwhSemanaAnterior) / kwhSemanaAnterior) * 100 : 0;

  return {
    dispositivos,
    configuracion,
    porDia,
    porDispositivo,
    totales,
    semanaActual: { kwh: kwhSemanaActual },
    semanaAnterior: { kwh: kwhSemanaAnterior },
    cambioPct,
  };
}
