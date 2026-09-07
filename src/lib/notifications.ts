import type { ConsumptionData } from './consumption';
import { generarRecomendaciones, calcularNivelConsumoDatos } from './recommendations';
import { calcularRacha } from './streak';

export type TonoNotificacion = 'alerta' | 'exito' | 'info';

export interface NotificacionItem {
  id: string;
  tono: TonoNotificacion;
  mensaje: string;
  to: string;
}

const UMBRAL_CAMBIO_PCT_NOTIF = 10;

// Las notificaciones se derivan en vivo de los mismos datos que ya se
// calculan para Estadísticas/Recomendaciones/Huella de carbono — no hay
// tabla de notificaciones en Supabase, así que no hay estado de
// "leído/no leído" que persista entre sesiones, solo la campana refleja
// el estado actual del consumo cada vez que se abre.
export function generarNotificaciones(datos: ConsumptionData): NotificacionItem[] {
  const notificaciones: NotificacionItem[] = [];

  if (datos.dispositivos.length === 0) {
    notificaciones.push({
      id: 'sin-dispositivos',
      tono: 'info',
      mensaje: 'Aún no tienes dispositivos registrados. Agrega el primero para empezar a ver tus datos.',
      to: '/dispositivos/nuevo',
    });
    return notificaciones;
  }

  const hayDatosPrevios = datos.semanaAnterior.kwh > 0;

  if (hayDatosPrevios && datos.cambioPct > UMBRAL_CAMBIO_PCT_NOTIF) {
    notificaciones.push({
      id: 'consumo-subio',
      tono: 'alerta',
      mensaje: `Tu consumo subió ${Math.round(datos.cambioPct)}% esta semana respecto a la anterior.`,
      to: '/huella-carbono',
    });
  } else if (hayDatosPrevios && datos.cambioPct < -UMBRAL_CAMBIO_PCT_NOTIF) {
    notificaciones.push({
      id: 'consumo-bajo',
      tono: 'exito',
      mensaje: `¡Bien! Bajaste tu consumo ${Math.abs(Math.round(datos.cambioPct))}% esta semana respecto a la anterior.`,
      to: '/huella-carbono',
    });
  }

  if (calcularNivelConsumoDatos(datos) === 'alto') {
    notificaciones.push({
      id: 'nivel-alto',
      tono: 'alerta',
      mensaje: 'Tu consumo promedio diario es alto. Revisa tus dispositivos de mayor impacto.',
      to: '/recomendaciones',
    });
  }

  const racha = calcularRacha(datos.porDia);
  if (!racha.activaHoy && racha.dias >= 2) {
    notificaciones.push({
      id: 'racha-en-riesgo',
      tono: 'alerta',
      mensaje: `Tu racha de ${racha.dias} días está en riesgo — registra tu uso de hoy para mantenerla.`,
      to: '/registrar-uso',
    });
  }

  const accionables = generarRecomendaciones(datos).filter((r) => r.ahorroEstimado);
  if (accionables.length > 0) {
    notificaciones.push({
      id: 'recomendaciones-disponibles',
      tono: 'info',
      mensaje: `Tienes ${accionables.length} recomendación${accionables.length > 1 ? 'es' : ''} con ahorro estimado disponible${accionables.length > 1 ? 's' : ''}.`,
      to: '/recomendaciones',
    });
  }

  return notificaciones;
}
