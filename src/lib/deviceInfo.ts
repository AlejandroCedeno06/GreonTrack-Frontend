export interface InfoRegistroDispositivo {
  origen: 'manual' | 'sniffer';
  fecha: string; // ISO
  // Alta manual: datos del equipo/navegador que hizo el registro.
  ipPublicaRegistro?: string | null;
  sistemaOperativo?: string;
  navegador?: string;
  nucleosCpu?: number | null;
  memoriaAproxGB?: number | null;
  resolucionPantalla?: string;
  // Del dispositivo en sí: lo llena el sniffer automáticamente, o el
  // usuario a mano si quiere (ambos casos opcionales).
  ipDispositivo?: string | null;
  mac?: string | null;
  vendor?: string | null;
}

function detectarSistemaOperativo(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS')) return 'macOS';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  if (userAgent.includes('Linux')) return 'Linux';
  return 'Desconocido';
}

function detectarNavegador(userAgent: string): string {
  if (userAgent.includes('Edg/')) return 'Edge';
  if (userAgent.includes('Chrome/')) return 'Chrome';
  if (userAgent.includes('Firefox/')) return 'Firefox';
  if (userAgent.includes('Safari/')) return 'Safari';
  return 'Desconocido';
}

async function obtenerIpPublica(): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json()) as { ip?: string };
    return data.ip ?? null;
  } catch {
    // Sin red o el servicio no respondió a tiempo: no bloquea el registro del dispositivo.
    return null;
  }
}

interface DatosManualesOpcionales {
  ipDispositivo?: string;
  vendor?: string;
}

export async function capturarInfoDispositivo(
  opcionales: DatosManualesOpcionales = {}
): Promise<InfoRegistroDispositivo> {
  const userAgent = navigator.userAgent;
  // deviceMemory es una extensión no estándar (solo Chrome/Edge); en Safari/Firefox queda null.
  const memoriaAproxGB = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null;

  return {
    origen: 'manual',
    fecha: new Date().toISOString(),
    ipPublicaRegistro: await obtenerIpPublica(),
    sistemaOperativo: detectarSistemaOperativo(userAgent),
    navegador: detectarNavegador(userAgent),
    nucleosCpu: navigator.hardwareConcurrency ?? null,
    memoriaAproxGB,
    resolucionPantalla: `${screen.width} x ${screen.height}`,
    ipDispositivo: opcionales.ipDispositivo?.trim() || null,
    vendor: opcionales.vendor?.trim() || null,
  };
}
