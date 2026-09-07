// La meta personal de consumo es una preferencia local del usuario, igual
// que las opciones de accesibilidad: vive en localStorage, no en Supabase,
// así que no se sincroniza entre dispositivos.
const STORAGE_PREFIX = 'greontrack-meta-kwh-';

export function cargarMetaKwh(userId: string): number | null {
  try {
    const guardado = localStorage.getItem(STORAGE_PREFIX + userId);
    if (guardado == null) return null;
    const valor = Number(guardado);
    return Number.isFinite(valor) && valor > 0 ? valor : null;
  } catch {
    return null;
  }
}

export function guardarMetaKwh(userId: string, kwh: number): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + userId, String(kwh));
  } catch {
    // localStorage puede fallar (privado, cuota); la meta simplemente no persiste esta vez.
  }
}
