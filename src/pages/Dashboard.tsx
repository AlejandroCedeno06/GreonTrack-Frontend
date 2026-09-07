import { useEffect, useRef, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { ConsumptionCharts } from '../components/ConsumptionCharts';
import { useAuth } from '../context/AuthContext';
import { fetchConsumptionData, ConsumptionData } from '../lib/consumption';
import { generarRecomendaciones } from '../lib/recommendations';
import { generarReportePDF } from '../lib/pdfReport';
import { SparkChartIcon, BoltIcon, LeafIcon, FileIcon, PlugIcon, MonitorIcon } from '../components/icons';

export function Dashboard() {
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
        setError(e instanceof Error ? e.message : 'No se pudieron cargar las estadísticas.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user]);

  const handleDescargarPDF = async () => {
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

  const mayorConsumo = datos?.porDispositivo[0];

  return (
    <AppShell title="Estadísticas" subtitle="Consumo, costo y huella de carbono de los últimos 30 días.">
      <div className="devices-toolbar">
        <p className="muted">Resumen de tu consumo energético reciente.</p>
        <button className="btn-add" onClick={handleDescargarPDF} disabled={generando || loading || !datos}>
          <FileIcon /> {generando ? 'Generando…' : 'Descargar reporte PDF'}
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {pdfError && <div className="alert-error">{pdfError}</div>}

      {loading ? (
        <p className="muted">Cargando estadísticas…</p>
      ) : datos && datos.dispositivos.length === 0 ? (
        <div className="device-empty">
          <div>
            <p className="device-empty-title">Aún no hay datos para mostrar</p>
            <p className="muted">Registra dispositivos y horas de uso para ver tus estadísticas aquí.</p>
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
              <div className="status-card">
                <span className="status-card-icon">
                  <MonitorIcon />
                </span>
                <div>
                  <span className="status-card-label">Dispositivos registrados</span>
                  <span className="status-card-value">{datos.dispositivos.length}</span>
                </div>
              </div>
              <div className="status-card">
                <span className="status-card-icon">
                  <PlugIcon />
                </span>
                <div>
                  <span className="status-card-label">Mayor consumo</span>
                  <span className="status-card-value">
                    {mayorConsumo && mayorConsumo.kwhTotal > 0
                      ? `${mayorConsumo.dispositivo.nombre} (${mayorConsumo.kwhTotal.toFixed(2)} kWh)`
                      : '—'}
                  </span>
                </div>
              </div>
            </section>

            <div ref={chartsRef} className="card" style={{ padding: 20 }}>
              <ConsumptionCharts datos={datos} />
            </div>
          </>
        )
      )}
    </AppShell>
  );
}
