import { supabase } from './supabase';
import type { DispositivoSugerido, SnifferEstado } from '../types/database';
import { tipoRealDeDetectado } from './deviceCategories';

// El sniffer sondea cada ~120s por defecto; se tolera un ciclo perdido antes
// de mostrarlo como desactivado, para no parpadear entre estados.
const TOLERANCIA_SEGUNDOS = 120 * 2.5;

export async function fetchEstadoSniffer(userId: string): Promise<SnifferEstado | null> {
  const { data, error } = await supabase
    .from('sniffer_estado')
    .select('*')
    .eq('usuario_id', userId)
    .maybeSingle();

  if (error) return null;
  return data as SnifferEstado | null;
}

export function snifferActivo(estado: SnifferEstado | null): boolean {
  if (!estado) return false;
  const segundosDesde = (Date.now() - new Date(estado.ultimo_sondeo).getTime()) / 1000;
  return segundosDesde < TOLERANCIA_SEGUNDOS;
}

export async function fetchSugerenciasPendientes(userId: string): Promise<DispositivoSugerido[]> {
  const { data, error } = await supabase
    .from('dispositivos_sugeridos')
    .select('*')
    .eq('usuario_id', userId)
    .eq('estado', 'pendiente')
    .order('fecha_deteccion', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as DispositivoSugerido[];
}

export async function confirmarSugerencia(sugerencia: DispositivoSugerido, userId: string): Promise<void> {
  const { error: insertError } = await supabase.from('dispositivos').insert({
    usuario_id: userId,
    nombre: sugerencia.nombre_sugerido,
    tipo: tipoRealDeDetectado(sugerencia.tipo_detectado),
    consumo_watts_promedio: sugerencia.watts_estimados,
    origen: 'manual',
    info_registro: {
      origen: 'sniffer',
      fecha: sugerencia.fecha_deteccion,
      ipDispositivo: sugerencia.ip,
      mac: sugerencia.mac,
      vendor: sugerencia.vendor,
    },
  });

  if (insertError) throw new Error(insertError.message);

  const { error: updateError } = await supabase
    .from('dispositivos_sugeridos')
    .update({ estado: 'agregado' })
    .eq('id', sugerencia.id);

  if (updateError) throw new Error(updateError.message);
}

export async function descartarSugerencia(id: string): Promise<void> {
  const { error } = await supabase.from('dispositivos_sugeridos').update({ estado: 'descartado' }).eq('id', id);
  if (error) throw new Error(error.message);
}
