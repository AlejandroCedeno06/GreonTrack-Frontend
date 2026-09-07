import type { PuntoDia } from './consumption';

export interface RachaInfo {
  dias: number;
  activaHoy: boolean;
}

// Cuenta días consecutivos con uso registrado (kwh > 0), terminando hoy si
// ya registraste algo, o ayer si todavía no lo has hecho hoy — así la
// racha no se resetea a 0 apenas cambia el día, solo si de plano se rompe
// la cadena.
export function calcularRacha(porDia: PuntoDia[]): RachaInfo {
  if (porDia.length === 0) return { dias: 0, activaHoy: false };

  const activaHoy = porDia[porDia.length - 1].kwh > 0;
  const inicio = activaHoy ? porDia.length - 1 : porDia.length - 2;

  let dias = 0;
  for (let i = inicio; i >= 0; i--) {
    if (porDia[i].kwh > 0) {
      dias++;
    } else {
      break;
    }
  }

  return { dias, activaHoy };
}

export interface HitoRacha {
  dias: number;
  titulo: string;
  emoji: string;
}

// Los días son los que pediste (5, 10, y así) más un par de escalones
// extra para que la primera insignia llegue rápido (3) y para dar algo a
// quien de plano se vuelve constante (20, 30, 50, 100).
export const HITOS_RACHA: HitoRacha[] = [
  { dias: 3, titulo: 'Vas arrancando', emoji: '🔥' },
  { dias: 5, titulo: 'Constante', emoji: '🔥' },
  { dias: 10, titulo: 'Racha real', emoji: '⭐' },
  { dias: 15, titulo: 'Imparable', emoji: '⭐' },
  { dias: 20, titulo: 'Casi un mes', emoji: '🏅' },
  { dias: 30, titulo: 'Mes completo', emoji: '🏆' },
  { dias: 50, titulo: 'Leyenda', emoji: '🏆' },
  { dias: 100, titulo: 'Centenario', emoji: '👑' },
];

export function hitoAlcanzado(dias: number): HitoRacha | null {
  let alcanzado: HitoRacha | null = null;
  for (const hito of HITOS_RACHA) {
    if (dias >= hito.dias) alcanzado = hito;
    else break;
  }
  return alcanzado;
}

export function siguienteHito(dias: number): HitoRacha | null {
  return HITOS_RACHA.find((hito) => hito.dias > dias) ?? null;
}
