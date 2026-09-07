// Las notificaciones no viven en Supabase (se calculan en vivo, ver
// notifications.ts), así que "descartar" una se guarda en localStorage,
// ligado al día de hoy: si la descartas, no vuelve a aparecer hoy, pero si
// la condición sigue siendo cierta mañana, reaparece — no es un "nunca más".
const STORAGE_PREFIX = 'greontrack-notif-dismiss-';

function hoyISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function cargarDescartadas(userId: string): Record<string, string> {
  try {
    const guardado = localStorage.getItem(STORAGE_PREFIX + userId);
    return guardado ? JSON.parse(guardado) : {};
  } catch {
    return {};
  }
}

export function estaDescartadaHoy(userId: string, notifId: string): boolean {
  return cargarDescartadas(userId)[notifId] === hoyISO();
}

export function descartarNotificacion(userId: string, notifId: string): void {
  try {
    const mapa = cargarDescartadas(userId);
    mapa[notifId] = hoyISO();
    localStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(mapa));
  } catch {
    // localStorage puede fallar (privado, cuota); en ese caso el descarte
    // solo dura lo que dure el estado en memoria de esta sesión.
  }
}
