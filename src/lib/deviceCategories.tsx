import type { ComponentType } from 'react';
import type { TipoDetectado } from '../types/database';
import {
  LaptopIcon,
  MonitorIcon,
  PhoneIcon,
  TvIcon,
  GameConsoleIcon,
  FridgeIcon,
  AcIcon,
  WashingMachineIcon,
  MicrowaveIcon,
  LightbulbIcon,
  IotIcon,
  PrinterIcon,
  PlugIcon,
} from '../components/icons';

export const CATEGORIAS = ['Todos', 'Cómputo', 'Móviles', 'Entretenimiento', 'Hogar', 'Otro'] as const;
export type Categoria = (typeof CATEGORIAS)[number];

const CATEGORIA_POR_TIPO: Record<string, Categoria> = {
  Laptop: 'Cómputo',
  'Computadora de escritorio': 'Cómputo',
  'Celular (carga)': 'Móviles',
  'Televisión (LED)': 'Entretenimiento',
  'Consola de videojuegos': 'Entretenimiento',
  Refrigerador: 'Hogar',
  'Aire acondicionado': 'Hogar',
  Lavadora: 'Hogar',
  Microondas: 'Hogar',
  'Foco / iluminación': 'Hogar',
  'Dispositivo IoT': 'Hogar',
  Impresora: 'Cómputo',
};

export function categoriaDe(tipo: string): Categoria {
  return CATEGORIA_POR_TIPO[tipo] ?? 'Otro';
}

const ICONO_POR_TIPO: Record<string, ComponentType<{ className?: string }>> = {
  Laptop: LaptopIcon,
  'Computadora de escritorio': MonitorIcon,
  'Celular (carga)': PhoneIcon,
  'Televisión (LED)': TvIcon,
  'Consola de videojuegos': GameConsoleIcon,
  Refrigerador: FridgeIcon,
  'Aire acondicionado': AcIcon,
  Lavadora: WashingMachineIcon,
  Microondas: MicrowaveIcon,
  'Foco / iluminación': LightbulbIcon,
  'Dispositivo IoT': IotIcon,
  Impresora: PrinterIcon,
};

export function iconoDeTipo(tipo: string): ComponentType<{ className?: string }> {
  return ICONO_POR_TIPO[tipo] ?? PlugIcon;
}

// ── Sugerencias de red (tipo_detectado del sniffer) ─────────────────────────

const ICONO_POR_TIPO_DETECTADO: Record<TipoDetectado, ComponentType<{ className?: string }>> = {
  phone: PhoneIcon,
  laptop: LaptopIcon,
  desktop: MonitorIcon,
  tv: TvIcon,
  gaming: GameConsoleIcon,
  iot: IotIcon,
  printer: PrinterIcon,
  unknown: PlugIcon,
};

export function iconoDeTipoDetectado(tipo: TipoDetectado): ComponentType<{ className?: string }> {
  return ICONO_POR_TIPO_DETECTADO[tipo] ?? PlugIcon;
}

// Tipo real de GreonTrack (uno de TIPOS_DISPOSITIVO) al confirmar una sugerencia.
const TIPO_REAL_POR_DETECTADO: Record<TipoDetectado, string> = {
  phone: 'Celular (carga)',
  laptop: 'Laptop',
  desktop: 'Computadora de escritorio',
  tv: 'Televisión (LED)',
  gaming: 'Consola de videojuegos',
  iot: 'Dispositivo IoT',
  printer: 'Impresora',
  unknown: 'Otro',
};

export function tipoRealDeDetectado(tipo: TipoDetectado): string {
  return TIPO_REAL_POR_DETECTADO[tipo] ?? 'Otro';
}
