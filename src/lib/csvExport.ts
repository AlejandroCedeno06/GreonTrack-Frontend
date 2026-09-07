import type { ConsumptionData } from './consumption';

function escaparCampoCSV(valor: string): string {
  if (/[",\n]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

function descargarCSV(nombre: string, filas: string[][]) {
  const contenido = filas.map((fila) => fila.map(escaparCampoCSV).join(',')).join('\r\n');
  // El BOM (﻿) evita que Excel muestre mal los acentos y símbolos (kWh, CO₂, $).
  const blob = new Blob(['﻿' + contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

export function exportarCSVDiario(datos: ConsumptionData): void {
  const filas: string[][] = [['Fecha', 'kWh', 'Costo', 'CO2 (kg)']];
  datos.porDia.forEach((p) => {
    filas.push([p.fecha, p.kwh.toFixed(3), p.costo.toFixed(2), p.co2.toFixed(3)]);
  });
  descargarCSV('greontrack-consumo-diario.csv', filas);
}

export function exportarCSVDispositivos(datos: ConsumptionData): void {
  const filas: string[][] = [
    [
      'Dispositivo',
      'Tipo',
      'Consumo (W)',
      'Horas totales (30 dias)',
      'kWh totales',
      'Costo total',
      'CO2 total (kg)',
      '% del consumo',
    ],
  ];
  datos.porDispositivo.forEach((d) => {
    filas.push([
      d.dispositivo.nombre,
      d.dispositivo.tipo,
      String(d.dispositivo.consumo_watts_promedio),
      d.horasTotal.toFixed(1),
      d.kwhTotal.toFixed(3),
      d.costoTotal.toFixed(2),
      d.co2Total.toFixed(3),
      d.pctDelTotal.toFixed(1),
    ]);
  });
  descargarCSV('greontrack-dispositivos.csv', filas);
}
