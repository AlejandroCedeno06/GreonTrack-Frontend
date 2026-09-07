import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { User } from '@supabase/supabase-js';
import type { Perfil } from '../types/database';
import type { ConsumptionData } from './consumption';
import type { RecomendacionInput } from './recommendations';

interface ReportePDFOptions {
  perfil: Perfil | null;
  user: User | null;
  datos: ConsumptionData;
  recomendaciones: RecomendacionInput[];
  chartImageDataUrl?: string | null;
  chartImageWidth?: number;
  chartImageHeight?: number;
}

const MARGEN = 14;
const ANCHO_PAGINA = 210;
const ALTO_PAGINA = 297;
const ANCHO_CONTENIDO = ANCHO_PAGINA - MARGEN * 2;

// Dibuja una imagen respetando su proporción real; si es más alta de lo que
// cabe en una página, la reparte en tantas páginas como haga falta (offset Y
// negativo: jsPDF recorta lo que cae fuera de los límites de la página).
function agregarImagenPaginada(
  doc: jsPDF,
  dataUrl: string,
  anchoOriginal: number,
  altoOriginal: number,
  startY: number
): void {
  const anchoDestino = ANCHO_CONTENIDO;
  const altoDestino = anchoDestino * (altoOriginal / anchoOriginal);
  const altoDisponibleAqui = ALTO_PAGINA - MARGEN - startY;

  if (altoDestino <= altoDisponibleAqui) {
    doc.addImage(dataUrl, 'PNG', MARGEN, startY, anchoDestino, altoDestino);
    return;
  }

  const altoMaxPorPagina = ALTO_PAGINA - MARGEN * 2;
  let restante = altoDestino;
  let offset = 0;
  let primera = true;

  while (restante > 0) {
    if (!primera) {
      doc.addPage();
    }
    const y = primera ? startY : MARGEN;
    doc.addImage(dataUrl, 'PNG', MARGEN, y - offset, anchoDestino, altoDestino);
    const alturaUsadaAqui = primera ? altoDisponibleAqui : altoMaxPorPagina;
    offset += alturaUsadaAqui;
    restante -= alturaUsadaAqui;
    primera = false;
  }
}

function dibujarBarChartNativo(doc: jsPDF, datos: ConsumptionData, startY: number): number {
  const top5 = datos.porDispositivo.slice(0, 5);
  if (top5.length === 0) return startY;

  const anchoDisponible = 210 - MARGEN * 2;
  const altoBarra = 8;
  const espacio = 4;
  const maxKwh = Math.max(...top5.map((d) => d.kwhTotal), 0.0001);
  const anchoEtiqueta = 45;
  const anchoMaxBarra = anchoDisponible - anchoEtiqueta - 25;

  let y = startY;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Dispositivos con mayor consumo (kWh, últimos 30 días)', MARGEN, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  top5.forEach((d) => {
    const anchoBarra = Math.max(2, (d.kwhTotal / maxKwh) * anchoMaxBarra);
    const nombre = d.dispositivo.nombre.length > 22 ? `${d.dispositivo.nombre.slice(0, 20)}…` : d.dispositivo.nombre;

    doc.text(nombre, MARGEN, y + altoBarra / 2 + 2);
    doc.setFillColor(46, 125, 50);
    doc.rect(MARGEN + anchoEtiqueta, y, anchoBarra, altoBarra, 'F');
    doc.text(`${d.kwhTotal.toFixed(2)} kWh`, MARGEN + anchoEtiqueta + anchoBarra + 2, y + altoBarra / 2 + 2);

    y += altoBarra + espacio;
  });

  return y + 4;
}

export function generarReportePDF({
  perfil,
  user,
  datos,
  recomendaciones,
  chartImageDataUrl,
  chartImageWidth,
  chartImageHeight,
}: ReportePDFOptions) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const fechaGeneracion = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  doc.setFillColor(15, 61, 46);
  doc.rect(0, 0, 210, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('GreonTrack — Reporte de consumo energético', MARGEN, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el ${fechaGeneracion}`, MARGEN, 19);

  doc.setTextColor(18, 36, 28);
  let y = 34;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos del usuario', MARGEN, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${perfil?.nombre ?? '—'}`, MARGEN, y);
  y += 5;
  doc.text(`Correo: ${user?.email ?? '—'}`, MARGEN, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen del período (últimos 30 días)', MARGEN, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Consumo total: ${datos.totales.kwh.toFixed(2)} kWh`, MARGEN, y);
  y += 5;
  doc.text(`Costo estimado: $${datos.totales.costo.toFixed(2)}`, MARGEN, y);
  y += 5;
  doc.text(`Huella de carbono: ${datos.totales.co2.toFixed(2)} kg CO₂`, MARGEN, y);
  y += 5;

  const mayorConsumo = datos.porDispositivo[0];
  if (mayorConsumo && mayorConsumo.kwhTotal > 0) {
    doc.text(
      `Dispositivo con mayor consumo: ${mayorConsumo.dispositivo.nombre} (${mayorConsumo.kwhTotal.toFixed(2)} kWh)`,
      MARGEN,
      y
    );
    y += 5;
  }
  y += 5;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Dispositivos registrados', MARGEN, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: MARGEN, right: MARGEN },
    head: [['Nombre', 'Tipo', 'Watts', 'Origen', 'Horas de uso', 'kWh', 'Costo', 'CO₂ (kg)']],
    body: datos.porDispositivo.map(({ dispositivo, horasTotal, kwhTotal, costoTotal, co2Total }) => [
      dispositivo.nombre,
      dispositivo.tipo,
      String(dispositivo.consumo_watts_promedio),
      dispositivo.origen === 'agente' ? 'Agente' : 'Manual',
      horasTotal.toFixed(1),
      kwhTotal.toFixed(2),
      `$${costoTotal.toFixed(2)}`,
      co2Total.toFixed(2),
    ]),
    headStyles: { fillColor: [46, 125, 50] },
    styles: { fontSize: 9 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  if (chartImageDataUrl && chartImageWidth && chartImageHeight) {
    doc.addPage();
    y = MARGEN;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Gráficas de consumo', MARGEN, y);
    y += 6;

    agregarImagenPaginada(doc, chartImageDataUrl, chartImageWidth, chartImageHeight, y);

    // Las recomendaciones empiezan en su propia página — con una imagen que
    // puede haberse repartido en varias páginas, no vale la pena calcular la
    // posición exacta donde "terminó"; así queda limpio siempre.
    doc.addPage();
    y = MARGEN;
  } else {
    if (y + 60 > 280) {
      doc.addPage();
      y = 20;
    }
    y = dibujarBarChartNativo(doc, datos, y);
  }

  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Recomendaciones de ahorro', MARGEN, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  recomendaciones.forEach((r) => {
    const lineas = doc.splitTextToSize(`•  ${r.mensaje}`, 210 - MARGEN * 2);
    if (y + lineas.length * 5 > 285) {
      doc.addPage();
      y = 20;
    }
    doc.text(lineas, MARGEN, y);
    y += lineas.length * 5 + 3;
  });

  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Página ${i} de ${totalPaginas}`, 210 - MARGEN, 292, { align: 'right' });
  }

  const fechaArchivo = new Date().toISOString().slice(0, 10);
  doc.save(`greontrack-reporte-${fechaArchivo}.pdf`);
}
