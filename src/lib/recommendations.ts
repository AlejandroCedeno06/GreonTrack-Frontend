import { supabase } from './supabase';
import type { ConsumptionData } from './consumption';

const UMBRAL_PCT_ALTO_CONSUMO = 40;
const UMBRAL_PCT_CONCENTRACION = 25;
const UMBRAL_HORAS_PROMEDIO_ALTO = 8;
const UMBRAL_CAMBIO_PCT = 10;

// Umbrales de referencia sobre el promedio diario de consumo (kWh/día),
// simples y ajustables — no son un estándar técnico, solo sirven para variar
// el tono de las recomendaciones según qué tan alto es el consumo del usuario.
const UMBRAL_PROMEDIO_DIARIO_BAJO = 1.5;
const UMBRAL_PROMEDIO_DIARIO_ALTO = 4;

export type NivelConsumo = 'bajo' | 'medio' | 'alto';

export interface AhorroEstimado {
  horasMenos: number;
  kwh: number;
  costo: number;
  co2: number;
}

export interface RecomendacionInput {
  dispositivo_id: string | null;
  mensaje: string;
  ahorroEstimado?: AhorroEstimado;
}

function calcularAhorro(
  wattsPromedio: number,
  horasMenosPorDia: number,
  tarifa: number,
  factorCo2: number
): AhorroEstimado {
  const kwh = (wattsPromedio * horasMenosPorDia * 30) / 1000;
  return {
    horasMenos: horasMenosPorDia,
    kwh,
    costo: kwh * tarifa,
    co2: kwh * factorCo2,
  };
}

const CONSEJOS_GENERALES_BAJO: string[] = [
  'Vas bien: sigue apagando dispositivos en vez de dejarlos en modo de espera (standby).',
  'Aprovecha la luz natural durante el día en vez de encender iluminación artificial.',
  'Revisa periódicamente tus dispositivos para mantener este nivel de consumo.',
];

const CONSEJOS_GENERALES_MEDIO: string[] = [
  'Desconecta cargadores y aparatos que no estés usando; el consumo fantasma suma al final del mes.',
  'Considera usar temporizadores o contactos inteligentes en los dispositivos que más usas.',
  'Revisa si hay horarios del día donde podrías repartir mejor el uso de tus aparatos de mayor consumo.',
];

const CONSEJOS_GENERALES_ALTO: string[] = [
  'Tu consumo es alto: prioriza reducir las horas de uso de tus dispositivos de mayor impacto.',
  'Evalúa si algún electrodoméstico de alto consumo (aire acondicionado, calefacción, lavadora) puede usarse menos horas al día.',
  'Un consumo alto sostenido incrementa tu costo y tu huella de carbono de forma significativa — revisa tus hábitos esta semana.',
];

function calcularNivelConsumo(promedioDiarioKwh: number): NivelConsumo {
  if (promedioDiarioKwh < UMBRAL_PROMEDIO_DIARIO_BAJO) return 'bajo';
  if (promedioDiarioKwh > UMBRAL_PROMEDIO_DIARIO_ALTO) return 'alto';
  return 'medio';
}

const MENSAJE_NIVEL: Record<NivelConsumo, (kwhDia: string) => string> = {
  bajo: (kwhDia) =>
    `Tu consumo promedio es bajo (${kwhDia} kWh/día). ¡Vas muy bien! Mantener este ritmo ayuda a conservar tu huella de carbono baja.`,
  medio: (kwhDia) =>
    `Tu consumo promedio es moderado (${kwhDia} kWh/día). Hay oportunidad de optimizar sin hacer grandes cambios.`,
  alto: (kwhDia) =>
    `Tu consumo promedio es alto (${kwhDia} kWh/día). Te conviene revisar tus dispositivos de mayor impacto pronto.`,
};

export function generarRecomendaciones(datos: ConsumptionData): RecomendacionInput[] {
  const recomendaciones: RecomendacionInput[] = [];
  const tarifa = datos.configuracion?.tarifa_kwh ?? 0;
  const factorCo2 = datos.configuracion?.factor_co2 ?? 0;

  const promedioDiarioKwh = datos.totales.kwh / 30;
  const nivel = calcularNivelConsumo(promedioDiarioKwh);

  recomendaciones.push({
    dispositivo_id: null,
    mensaje: MENSAJE_NIVEL[nivel](promedioDiarioKwh.toFixed(2)),
  });

  datos.porDispositivo.forEach(({ dispositivo, pctDelTotal }) => {
    if (pctDelTotal >= UMBRAL_PCT_ALTO_CONSUMO) {
      recomendaciones.push({
        dispositivo_id: dispositivo.id,
        mensaje: `${dispositivo.nombre} representa el ${Math.round(pctDelTotal)}% de tu consumo total. Es tu dispositivo de mayor impacto — considera reducir sus horas de uso.`,
        ahorroEstimado: calcularAhorro(dispositivo.consumo_watts_promedio, 1, tarifa, factorCo2),
      });
    }
  });

  const concentrados = datos.porDispositivo.filter((d) => d.pctDelTotal >= UMBRAL_PCT_CONCENTRACION);
  if (concentrados.length >= 2) {
    const nombres = concentrados.map((d) => d.dispositivo.nombre).join(' y ');
    recomendaciones.push({
      dispositivo_id: null,
      mensaje: `${nombres} concentran juntos una parte importante de tu consumo total. Revisar ambos en conjunto puede tener más impacto que optimizar uno solo.`,
    });
  }

  datos.porDispositivo.forEach(({ dispositivo, horasPromedioDiaria }) => {
    if (horasPromedioDiaria > UMBRAL_HORAS_PROMEDIO_ALTO) {
      recomendaciones.push({
        dispositivo_id: dispositivo.id,
        mensaje: `${dispositivo.nombre} promedia ${horasPromedioDiaria.toFixed(1)} horas de uso al día. Reducir su tiempo de uso bajaría tu consumo de forma directa.`,
        ahorroEstimado: calcularAhorro(dispositivo.consumo_watts_promedio, 2, tarifa, factorCo2),
      });
    }
  });

  if (datos.cambioPct > UMBRAL_CAMBIO_PCT) {
    const magnitud = datos.cambioPct > 30 ? 'considerablemente' : 'de forma notable';
    recomendaciones.push({
      dispositivo_id: null,
      mensaje: `Tu consumo de esta semana subió ${magnitud} (${Math.round(datos.cambioPct)}%) respecto a la semana pasada. Revisa tus hábitos de uso recientes.`,
    });
  }

  const consejosPorNivel = {
    bajo: CONSEJOS_GENERALES_BAJO,
    medio: CONSEJOS_GENERALES_MEDIO,
    alto: CONSEJOS_GENERALES_ALTO,
  }[nivel];

  consejosPorNivel.forEach((mensaje) => {
    recomendaciones.push({ dispositivo_id: null, mensaje });
  });

  // Las recomendaciones con ahorro cuantificado (accionables sobre un
  // dispositivo específico) van primero — son las que más impacto tienen.
  return recomendaciones
    .map((r, i) => ({ r, i }))
    .sort((a, b) => {
      const aConAhorro = a.r.ahorroEstimado ? 0 : 1;
      const bConAhorro = b.r.ahorroEstimado ? 0 : 1;
      return aConAhorro - bConAhorro || a.i - b.i;
    })
    .map(({ r }) => r);
}

export function calcularNivelConsumoDatos(datos: ConsumptionData): NivelConsumo {
  return calcularNivelConsumo(datos.totales.kwh / 30);
}

function fechaHoyISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export async function guardarRecomendaciones(
  userId: string,
  recomendaciones: RecomendacionInput[]
): Promise<void> {
  const hoy = fechaHoyISO();

  const { error: deleteError } = await supabase
    .from('recomendaciones')
    .delete()
    .eq('usuario_id', userId)
    .eq('fecha', hoy);

  if (deleteError) throw new Error(deleteError.message);

  if (recomendaciones.length === 0) return;

  const { error: insertError } = await supabase.from('recomendaciones').insert(
    recomendaciones.map((r) => ({
      usuario_id: userId,
      dispositivo_id: r.dispositivo_id,
      mensaje: r.mensaje,
      fecha: hoy,
    }))
  );

  if (insertError) throw new Error(insertError.message);
}
