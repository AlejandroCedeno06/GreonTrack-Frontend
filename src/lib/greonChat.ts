import { supabase } from './supabase';
import type { ConsumptionData } from './consumption';
import type { RachaInfo } from './streak';
import { hitoAlcanzado } from './streak';
import { generarRecomendaciones } from './recommendations';

// Arma un resumen compacto y legible de los datos reales del usuario para
// que Greon (el modelo de IA) responda con cifras reales, no inventadas.
export function construirContextoGreon(datos: ConsumptionData | null, racha: RachaInfo | null): string {
  if (!datos || datos.dispositivos.length === 0) {
    return 'El usuario todavía no tiene dispositivos ni uso registrado en GreonTrack.';
  }

  const lineas: string[] = [];
  lineas.push(`Dispositivos registrados: ${datos.dispositivos.length}.`);
  lineas.push(
    `Consumo últimos 30 días: ${datos.totales.kwh.toFixed(1)} kWh, costo $${datos.totales.costo.toFixed(2)}, huella ${datos.totales.co2.toFixed(1)} kg CO2.`
  );

  const top = datos.porDispositivo[0];
  if (top && top.kwhTotal > 0) {
    lineas.push(
      `Dispositivo de mayor consumo: ${top.dispositivo.nombre} (${Math.round(top.pctDelTotal)}% del total, ${top.kwhTotal.toFixed(1)} kWh).`
    );
  }

  if (datos.semanaAnterior.kwh > 0) {
    lineas.push(`Cambio de consumo esta semana vs. la anterior: ${datos.cambioPct.toFixed(0)}%.`);
  }

  if (racha) {
    const hito = hitoAlcanzado(racha.dias);
    lineas.push(
      `Racha de registro: ${racha.dias} día(s) seguidos${hito ? `, nivel "${hito.titulo}"` : ''}${racha.activaHoy ? ' (ya registró hoy)' : ' (todavía no registra hoy)'}.`
    );
  }

  const accionables = generarRecomendaciones(datos).filter((r) => r.ahorroEstimado);
  if (accionables.length > 0) {
    const r = accionables[0];
    lineas.push(
      `Recomendación principal disponible: ${r.mensaje} (ahorro estimado ${r.ahorroEstimado!.kwh.toFixed(1)} kWh, $${r.ahorroEstimado!.costo.toFixed(2)}, ${r.ahorroEstimado!.co2.toFixed(2)} kg CO2 al mes).`
    );
  }

  return lineas.join('\n');
}

export async function preguntarAGreon(pregunta: string, contexto: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('greon-chat', {
    body: { pregunta, contexto },
  });

  if (error) {
    throw new Error('No pude conectarme con mi cerebro de IA. Intenta de nuevo en un momento.');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.respuesta ?? 'No supe qué responder a eso.';
}
