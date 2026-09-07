import { useEffect, useRef, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { ConsumptionCharts } from '../components/ConsumptionCharts';
import { useAuth } from '../context/AuthContext';
import { fetchConsumptionData, ConsumptionData } from '../lib/consumption';
import { generarRecomendaciones } from '../lib/recommendations';
import { generarReportePDF } from '../lib/pdfReport';
import { exportarCSVDiario, exportarCSVDispositivos } from '../lib/csvExport';
import { SparkChartIcon, BoltIcon, LeafIcon, FileIcon } from '../components/icons';

export function Reports() {
  const { perfil, user } = useAuth();
  const [datos, setDatos] = useState<ConsumptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const chartsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cargar = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const resultado = await fetchConsumptionData(user.id);
        setDatos(resultado);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudieron cargar los datos del reporte.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user]);

  const handleGenerarPDF = async () => {
    if (!datos) return;
    setPdfError(null);
    setGenerando(true);

    try {
      let chartImageDataUrl: string | null = null;
      let chartImageWidth: number | undefined;
      let chartImageHeight: number | undefined;

      if (chartsRef.current) {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(chartsRef.current, { backgroundColor: '#ffffff', scale: 2 });
        chartImageDataUrl = canvas.toDataURL('image/png');
        chartImageWidth = canvas.width;
        chartImageHeight = canvas.height;
      }

      const recomendaciones = generarRecomendaciones(datos);

      generarReportePDF({
        perfil,
        user,
        datos,
        recomendaciones,
        chartImageDataUrl,
        chartImageWidth,
        chartImageHeight,
      });
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : 'No se pudo generar el PDF.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <AppShell
      title="Reportes"
      subtitle="Genera un PDF con el resumen completo de tu consumo, costos y recomendaciones."
    >
      {error && <div className="alert-error">{error}</div>}
      {pdfError && <div className="alert-error">{pdfError}</div>}

      {loading ? (
        <p className="muted">Cargando datos del reporte…</p>
      ) : datos && datos.dispositivos.length === 0 ? (
        <div className="device-empty">
          <div>
            <p className="device-empty-title">Aún no hay datos para generar un reporte</p>
            <p className="muted">Registra dispositivos y horas de uso primero.</p>
          </div>
        </div>
      ) : (
        datos && (
          <>
            <section className="status-cards">
              <div className="status-card">
                <span className="status-card-icon">
                  <SparkChartIcon />
                </span>
                <div>
                  <span className="status-card-label">Consumo (30 días)</span>
                  <span className="status-card-value">{datos.totales.kwh.toFixed(2)} kWh</span>
                </div>
              </div>
              <div className="status-card">
                <span className="status-card-icon">
                  <BoltIcon />
                </span>
                <div>
                  <span className="status-card-label">Costo (30 días)</span>
                  <span className="status-card-value">${datos.totales.costo.toFixed(2)}</span>
                </div>
              </div>
              <div className="status-card">
                <span className="status-card-icon">
                  <LeafIcon />
                </span>
                <div>
                  <span className="status-card-label">CO₂ (30 días)</span>
                  <span className="status-card-value">{datos.totales.co2.toFixed(2)} kg</span>
                </div>
              </div>
            </section>

            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <h2 style={{ marginTop: 0 }}>Reporte completo en PDF</h2>
              <p className="muted">
                Incluye tus datos, dispositivos, horas de uso, consumo, costo, huella de carbono,
                gráficas y recomendaciones de ahorro.
              </p>
              <button className="btn-add" onClick={handleGenerarPDF} disabled={generando} style={{ margin: '0 auto' }}>
                <FileIcon /> {generando ? 'Generando…' : 'Generar reporte PDF'}
              </button>
            </div>

            <div className="card" style={{ padding: 24, textAlign: 'center', marginTop: 20 }}>
              <h2 style={{ marginTop: 0 }}>Exportar datos en CSV</h2>
              <p className="muted">
                Para meter tus datos a Excel o a tu propio análisis, sin pasar por el PDF.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn-add btn-add-outline"
                  onClick={() => datos && exportarCSVDiario(datos)}
                >
                  <FileIcon /> Consumo diario (CSV)
                </button>
                <button
                  className="btn-add btn-add-outline"
                  onClick={() => datos && exportarCSVDispositivos(datos)}
                >
                  <FileIcon /> Por dispositivo (CSV)
                </button>
              </div>
            </div>

            <div ref={chartsRef} className="card" style={{ padding: 20, marginTop: 20 }}>
              <ConsumptionCharts datos={datos} />
            </div>
          </>
        )
      )}
    </AppShell>
  );
}
