// Tipos que reflejan las tablas de supabase/schema.sql

import type { InfoRegistroDispositivo } from '../lib/deviceInfo';

export type Role = 'general' | 'analitico' | 'admin';
export type Origen = 'manual' | 'agente';

export interface Perfil {
  id: string;
  nombre: string;
  role: Role;
  created_at: string;
}

export interface Dispositivo {
  id: string;
  usuario_id: string;
  nombre: string;
  tipo: string;
  consumo_watts_promedio: number;
  origen: Origen;
  device_token: string | null;
  created_at: string;
  info_registro?: InfoRegistroDispositivo | null;
}

export interface RegistroUso {
  id: string;
  dispositivo_id: string;
  horas_uso: number;
  fuente: Origen;
  fecha_uso: string; // date (YYYY-MM-DD)
  created_at: string;
}

export interface Calculo {
  id: string;
  usuario_id: string;
  dispositivo_id: string;
  registro_uso_id: string | null;
  kwh: number;
  costo: number;
  co2: number;
  fecha: string;
}

export interface Recomendacion {
  id: string;
  usuario_id: string;
  dispositivo_id: string | null;
  mensaje: string;
  fecha: string;
}

// Fila única con los valores vigentes de tarifa eléctrica y factor de emisión.
export interface Configuracion {
  id: string;
  tarifa_kwh: number;
  factor_co2: number;
}

// Tipos de dispositivo comunes, usados en el formulario de alta.
// consumo_watts_promedio es un valor sugerido; el usuario puede ajustarlo.
export const TIPOS_DISPOSITIVO: { tipo: string; wattsPromedio: number }[] = [
  { tipo: 'Laptop', wattsPromedio: 65 },
  { tipo: 'Computadora de escritorio', wattsPromedio: 200 },
  { tipo: 'Televisión (LED)', wattsPromedio: 100 },
  { tipo: 'Refrigerador', wattsPromedio: 150 },
  { tipo: 'Aire acondicionado', wattsPromedio: 1200 },
  { tipo: 'Celular (carga)', wattsPromedio: 10 },
  { tipo: 'Consola de videojuegos', wattsPromedio: 150 },
  { tipo: 'Lavadora', wattsPromedio: 500 },
  { tipo: 'Microondas', wattsPromedio: 1000 },
  { tipo: 'Foco / iluminación', wattsPromedio: 15 },
  { tipo: 'Dispositivo IoT', wattsPromedio: 15 },
  { tipo: 'Impresora', wattsPromedio: 30 },
  { tipo: 'Otro', wattsPromedio: 50 },
];

// ── Sugerencias de red (GreonTrack Sniffer) ─────────────────────────────────
// Tipos detectados por el script de escaneo (GreonTrack-Sniffer/scan_red.py).
export type TipoDetectado =
  | 'phone'
  | 'laptop'
  | 'desktop'
  | 'tv'
  | 'gaming'
  | 'iot'
  | 'printer'
  | 'unknown';

export type EstadoSugerencia = 'pendiente' | 'agregado' | 'descartado';

export interface DispositivoSugerido {
  id: string;
  usuario_id: string;
  ip: string;
  mac: string;
  vendor: string | null;
  tipo_detectado: TipoDetectado;
  nombre_sugerido: string;
  watts_estimados: number;
  estado: EstadoSugerencia;
  fecha_deteccion: string;
}

export interface SnifferEstado {
  usuario_id: string;
  ultimo_sondeo: string;
  dispositivos_detectados: number;
}
